#!/bin/bash

# QR-Tunai Server Diagnosis Script
# Run this on your server to diagnose QR code generation issues

echo "🔍 QR-Tunai Server Diagnosis Started..."
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_section() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as correct user
print_section "USER CHECK"
if [ "$USER" = "qrt" ]; then
    print_success "Running as qrt user"
else
    print_warning "Not running as qrt user (current: $USER)"
fi

# Check project directory
print_section "PROJECT DIRECTORY"
PROJECT_DIR="/home/qrt/QR-Tunai-drive"
if [ -d "$PROJECT_DIR" ]; then
    print_success "Project directory exists: $PROJECT_DIR"
    cd "$PROJECT_DIR"
else
    print_error "Project directory not found: $PROJECT_DIR"
    exit 1
fi

# Check environment files
print_section "ENVIRONMENT FILES"
if [ -f ".env.production" ]; then
    print_success ".env.production exists"
    echo "Environment variables:"
    cat .env.production | grep -E '^[^#]' | while read line; do
        key=$(echo $line | cut -d'=' -f1)
        if [ "$key" = "JWT_SECRET" ]; then
            echo "  $key=***HIDDEN***"
        else
            echo "  $line"
        fi
    done
else
    print_error ".env.production not found"
fi

# Check dependencies
print_section "DEPENDENCIES"
if [ -f "package.json" ]; then
    print_success "package.json found"
    if npm list qrcode &>/dev/null; then
        print_success "qrcode package installed"
    else
        print_error "qrcode package not found in node_modules"
        echo "Running npm install..."
        npm install
    fi
else
    print_error "package.json not found"
fi

# Check if build exists
print_section "BUILD STATUS"
if [ -d ".next" ]; then
    print_success ".next build directory exists"
else
    print_warning ".next build directory not found"
    echo "Building application..."
    npm run build
fi

# Check PM2 status
print_section "PM2 STATUS"
if command -v pm2 >/dev/null 2>&1; then
    print_success "PM2 is installed"
    echo "PM2 processes:"
    pm2 status
else
    print_error "PM2 not found"
fi

# Test QR API
print_section "API TEST"
echo "Starting temporary server for testing..."
timeout 30s npm run start:prod &
SERVER_PID=$!
sleep 10

# Test API endpoint
echo "Testing QR API..."
curl -s -X POST http://localhost:4000/api/qr \
  -H "Content-Type: application/json" \
  -d '{"amount": 50000, "description": "Test QR"}' > /tmp/qr_test.json

if [ $? -eq 0 ]; then
    if grep -q "qrCodeDataUrl" /tmp/qr_test.json; then
        print_success "QR API working correctly"
        echo "Response preview:"
        cat /tmp/qr_test.json | jq '.id, .debugInfo' 2>/dev/null || cat /tmp/qr_test.json
    else
        print_error "QR API returned invalid response"
        echo "Response:"
        cat /tmp/qr_test.json
    fi
else
    print_error "QR API request failed"
fi

# Test debug endpoint
echo "Testing debug endpoint..."
curl -s http://localhost:4000/api/debug/qr > /tmp/debug_test.json 2>/dev/null

if [ $? -eq 0 ]; then
    print_success "Debug API accessible"
    echo "Debug info:"
    cat /tmp/debug_test.json | jq '.qr_construction, .environment' 2>/dev/null || cat /tmp/debug_test.json
else
    print_error "Debug API request failed"
fi

# Kill test server
kill $SERVER_PID 2>/dev/null

# Check logs
print_section "LOG CHECK"
if [ -f "/var/log/qr-tunai/error.log" ]; then
    print_success "Error log found"
    echo "Recent errors:"
    tail -10 /var/log/qr-tunai/error.log
else
    print_warning "Error log not found at /var/log/qr-tunai/error.log"
fi

# Network test
print_section "NETWORK TEST"
NETWORK_IP=$(grep NETWORK_IP .env.production 2>/dev/null | cut -d'=' -f2)
if [ ! -z "$NETWORK_IP" ]; then
    echo "Testing network connectivity to $NETWORK_IP..."
    if ping -c 1 "$NETWORK_IP" >/dev/null 2>&1; then
        print_success "Network IP $NETWORK_IP is reachable"
    else
        print_warning "Network IP $NETWORK_IP is not reachable"
    fi
else
    print_warning "NETWORK_IP not set in .env.production"
fi

print_section "DIAGNOSIS COMPLETE"
echo "Check the results above to identify QR code issues."
echo "Common solutions:"
echo "1. Ensure NETWORK_IP is set correctly in .env.production"
echo "2. Run 'npm install' if qrcode package is missing"
echo "3. Run 'npm run build' if .next directory is missing"
echo "4. Check PM2 logs: pm2 logs qr-tunai"
echo "5. Restart PM2: pm2 restart qr-tunai"
echo ""
echo "For real-time debugging, visit: http://your-domain/api/debug/qr"

# Cleanup
rm -f /tmp/qr_test.json /tmp/debug_test.json