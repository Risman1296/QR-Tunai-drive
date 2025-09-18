# Manual Deployment Commands untuk Server
# Jalankan perintah ini satu per satu di SSH terminal Anda:

# 1. Create directory and clone from GitHub (fresh installation)
sudo mkdir -p /var/www/qr-tunai
sudo chown -R $USER:$USER /var/www/qr-tunai
cd /var/www
git clone https://github.com/Risman1296/QR-Tunai-drive.git qr-tunai
cd /var/www/qr-tunai

# 2. Switch to main branch
git checkout main

# 3. Install dependencies
npm install

# 4. Build production
npm run build

# 5. Restart aplikasi dengan PM2
pm2 restart ecosystem.config.js || pm2 start ecosystem.config.js

# 6. Save PM2 configuration
pm2 save

# 7. Check status
pm2 list

# 8. Optional: Setup PM2 auto-startup (jalankan sekali saja)
pm2 startup

echo "✅ Deployment selesai! QR-Tunai dengan WiFi system sudah running!"