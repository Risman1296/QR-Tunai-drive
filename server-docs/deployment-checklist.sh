#!/bin/bash

# QR-Tunai Drive - Production Deployment Checklist
# Run this script to verify deployment readiness

echo "🚀 QR-Tunai Drive - Production Deployment Checklist"
echo "=================================================="

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Status tracking
PASSED=0
FAILED=0
WARNINGS=0

check_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $2"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: $2"
        ((FAILED++))
    fi
}

check_warning() {
    echo -e "${YELLOW}⚠️  WARN${NC}: $1"
    ((WARNINGS++))
}

echo ""
echo "📋 Pre-deployment Checks"
echo "========================"

# 1. Check Node.js version
echo "🔍 Checking Node.js version..."
NODE_VERSION=$(node -v 2>/dev/null)
if [[ $NODE_VERSION =~ ^v2[0-9] ]] || [[ $NODE_VERSION =~ ^v1[89] ]]; then
    check_status 0 "Node.js version: $NODE_VERSION"
else
    check_status 1 "Node.js version: $NODE_VERSION (Required: v18+ or v20+)"
fi

# 2. Check npm packages
echo "🔍 Checking npm packages..."
if npm list --depth=0 &>/dev/null; then
    check_status 0 "npm packages are properly installed"
else
    check_status 1 "npm packages have issues - run 'npm install'"
fi

# 3. Check TypeScript compilation
echo "🔍 Checking TypeScript compilation..."
if npx tsc --noEmit &>/dev/null; then
    check_status 0 "TypeScript compilation successful"
else
    check_status 1 "TypeScript compilation errors found"
fi

# 4. Check build process
echo "🔍 Testing build process..."
if npm run build &>/dev/null; then
    check_status 0 "Next.js build successful"
else
    check_status 1 "Next.js build failed"
fi

# 5. Check environment files
echo "🔍 Checking environment configuration..."
if [ -f ".env.local" ]; then
    check_status 0 ".env.local exists"
else
    check_status 1 ".env.local file missing"
fi

if [ -f ".env.production" ]; then
    check_status 0 ".env.production exists"
else
    check_status 1 ".env.production file missing"
fi

# 6. Check essential environment variables
echo "🔍 Checking essential environment variables..."
if grep -q "JWT_SECRET" .env.production 2>/dev/null; then
    check_status 0 "JWT_SECRET configured"
else
    check_status 1 "JWT_SECRET not found in .env.production"
fi

if grep -q "DOMAIN" .env.production 2>/dev/null; then
    check_status 0 "DOMAIN configured"
else
    check_status 1 "DOMAIN not found in .env.production"
fi

# 7. Check critical files
echo "🔍 Checking critical application files..."
CRITICAL_FILES=(
    "src/app/api/auth/login/route.ts"
    "src/app/api/transactions/route.ts"
    "src/app/api/analytics/metrics/route.ts"
    "src/app/dashboard/page.tsx"
    "src/components/analytics/AnalyticsDashboard.tsx"
    "src/lib/transaction-store.ts"
    "src/lib/analytics-store.ts"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        check_status 0 "Critical file exists: $file"
    else
        check_status 1 "Critical file missing: $file"
    fi
done

# 8. Check deployment script
echo "🔍 Checking deployment script..."
if [ -f "deploy.sh" ]; then
    if [ -x "deploy.sh" ]; then
        check_status 0 "deploy.sh exists and is executable"
    else
        check_warning "deploy.sh exists but not executable - run 'chmod +x deploy.sh'"
    fi
else
    check_status 1 "deploy.sh deployment script missing"
fi

# 9. Security checks
echo "🔍 Running security checks..."
if npm audit --audit-level=high &>/dev/null; then
    check_status 0 "No high-severity security vulnerabilities"
else
    check_warning "High-severity security vulnerabilities found - run 'npm audit fix'"
fi

# 10. Check package.json scripts
echo "🔍 Checking package.json scripts..."
REQUIRED_SCRIPTS=("dev" "build" "start")
for script in "${REQUIRED_SCRIPTS[@]}"; do
    if npm run "$script" --silent -- --help &>/dev/null; then
        check_status 0 "Script '$script' available"
    else
        check_status 1 "Script '$script' missing or broken"
    fi
done

echo ""
echo "🌐 Server Requirements Check"
echo "============================"

# 11. Check server connectivity (if IP is configured)
if grep -q "NETWORK_IP" .env.production 2>/dev/null; then
    NETWORK_IP=$(grep "NETWORK_IP" .env.production | cut -d '=' -f2)
    echo "🔍 Testing network connectivity to $NETWORK_IP..."
    if ping -c 1 "$NETWORK_IP" &>/dev/null; then
        check_status 0 "Network connectivity to $NETWORK_IP"
    else
        check_warning "Cannot reach $NETWORK_IP - ensure server is accessible"
    fi
fi

# 12. Check port availability
echo "🔍 Checking target port availability..."
TARGET_PORT=$(grep "PORT" .env.production | cut -d '=' -f2 || echo "4000")
if command -v netstat &>/dev/null; then
    if netstat -tuln | grep ":$TARGET_PORT " &>/dev/null; then
        check_warning "Port $TARGET_PORT is already in use - ensure it's available on production server"
    else
        check_status 0 "Port $TARGET_PORT appears available"
    fi
fi

echo ""
echo "📊 Analytics System Check"
echo "========================="

# 13. Check analytics implementation
echo "🔍 Checking analytics system..."
if [ -f "src/lib/analytics-store.ts" ] && [ -f "src/hooks/useAnalytics.ts" ]; then
    check_status 0 "Analytics system files present"
else
    check_status 1 "Analytics system files missing"
fi

if grep -q "recharts" package.json; then
    check_status 0 "Chart library (recharts) installed"
else
    check_status 1 "Chart library (recharts) not installed"
fi

echo ""
echo "🗃️ Database & Storage Check"
echo "============================"

# 14. Check data stores
echo "🔍 Checking data storage systems..."
if [ -f "src/lib/transaction-store.ts" ]; then
    check_status 0 "Transaction store implemented"
else
    check_status 1 "Transaction store missing"
fi

# 15. Check backup systems
echo "🔍 Checking backup capabilities..."
if grep -q "backup" package.json || [ -f "backup.sh" ]; then
    check_status 0 "Backup system available"
else
    check_warning "No backup system configured - consider adding database backup"
fi

echo ""
echo "🔐 Security & Authentication Check"
echo "================================="

# 16. Check authentication system
echo "🔍 Checking authentication system..."
if [ -f "src/app/api/auth/login/route.ts" ] && [ -f "middleware.ts" ]; then
    check_status 0 "Authentication system implemented"
else
    check_status 1 "Authentication system incomplete"
fi

# 17. Check JWT configuration
echo "🔍 Checking JWT configuration..."
if [ -f "middleware.ts" ]; then
    if grep -q "JWT" middleware.ts; then
        check_status 0 "JWT authentication configured"
    else
        check_status 1 "JWT not found in middleware"
    fi
fi

echo ""
echo "📱 Mobile & QR System Check"
echo "==========================="

# 18. Check QR system
echo "🔍 Checking QR code system..."
if [ -f "src/app/api/qr/route.ts" ]; then
    check_status 0 "QR generation API implemented"
else
    check_status 1 "QR generation API missing"
fi

if grep -q "qrcode" package.json; then
    check_status 0 "QR code library installed"
else
    check_status 1 "QR code library not installed"
fi

# 19. Check mobile-responsive design
echo "🔍 Checking mobile responsiveness..."
if grep -q "responsive" src/components/analytics/AnalyticsDashboard.tsx 2>/dev/null; then
    check_status 0 "Mobile-responsive components detected"
else
    check_warning "Mobile responsiveness should be verified manually"
fi

echo ""
echo "🎯 Performance Check"
echo "==================="

# 20. Check bundle size
echo "🔍 Checking bundle size..."
if [ -d ".next" ]; then
    BUNDLE_SIZE=$(du -sh .next 2>/dev/null | cut -f1)
    check_status 0 "Bundle size: $BUNDLE_SIZE"
    
    # Check if bundle is too large (> 50MB)
    if [ -n "$BUNDLE_SIZE" ]; then
        SIZE_MB=$(echo "$BUNDLE_SIZE" | grep -o '[0-9]*')
        if [ "$SIZE_MB" -gt 50 ] 2>/dev/null; then
            check_warning "Bundle size ($BUNDLE_SIZE) is quite large - consider optimization"
        fi
    fi
fi

echo ""
echo "📋 DEPLOYMENT CHECKLIST SUMMARY"
echo "================================"
echo -e "✅ Passed: ${GREEN}$PASSED${NC}"
echo -e "❌ Failed: ${RED}$FAILED${NC}"  
echo -e "⚠️  Warnings: ${YELLOW}$WARNINGS${NC}"
echo ""

# Final recommendation
if [ $FAILED -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}🎉 READY FOR DEPLOYMENT!${NC}"
        echo "All checks passed. Your application is ready for production deployment."
    else
        echo -e "${YELLOW}⚠️  DEPLOYMENT POSSIBLE WITH WARNINGS${NC}"
        echo "Application can be deployed but please address the warnings above."
    fi
    echo ""
    echo "Next steps:"
    echo "1. Transfer files to production server"
    echo "2. Run: chmod +x deploy.sh"
    echo "3. Run: ./deploy.sh"
    echo "4. Configure Cloudflare tunnel"
    echo "5. Test production environment"
else
    echo -e "${RED}❌ NOT READY FOR DEPLOYMENT${NC}"
    echo "Please fix the failed checks before deploying to production."
    echo ""
    echo "Common fixes:"
    echo "• npm install"
    echo "• npm run build"
    echo "• Create missing .env files"
    echo "• Fix TypeScript errors"
fi

echo ""
echo "📞 Support:"
echo "If you encounter issues, refer to:"
echo "• DEVELOPMENT-GUIDE.md"
echo "• ANALYTICS-IMPLEMENTATION.md"
echo "• deployment logs in /var/log/qr-tunai/"

exit $FAILED