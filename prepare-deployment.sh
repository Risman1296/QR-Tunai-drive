#!/bin/bash

# Local preparation script for QR-Tunai deployment

echo "🔧 Preparing QR-Tunai for production deployment..."

# Build the application locally to check for errors
echo "📦 Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please fix errors before deployment."
    exit 1
fi

# Create deployment package
echo "📁 Creating deployment package..."
tar --exclude='.git' \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='*.log' \
    --exclude='.env.local' \
    --exclude='deploy-local.sh' \
    -czf qr-tunai-deployment.tar.gz .

echo "📦 Deployment package created: qr-tunai-deployment.tar.gz"

# Instructions for server deployment
echo ""
echo "🚀 Next steps:"
echo "1. Transfer the package to server:"
echo "   scp qr-tunai-deployment.tar.gz qrt@192.168.8.139:~/"
echo ""
echo "2. Connect to server and extract:"
echo "   ssh qrt@192.168.8.139"
echo "   tar -xzf qr-tunai-deployment.tar.gz -C QR-Tunai-drive"
echo "   cd QR-Tunai-drive"
echo ""
echo "3. Run deployment script:"
echo "   chmod +x deploy.sh"
echo "   ./deploy.sh"
echo ""
echo "📝 Don't forget to configure:"
echo "   - MySQL database credentials"
echo "   - JWT secret in .env.production"
echo "   - Domain settings"