==============================================================================
🚀 PANDUAN UPDATE SERVER QR-TUNAI DRIVE
==============================================================================
📅 Terakhir Diperbarui: ${new Date().toLocaleDateString('id-ID')}
🎯 Tujuan: Panduan lengkap untuk melakukan update aplikasi ke server Ubuntu
📝 Teknologi: Next.js 15.5.3, PM2, Nginx, Ubuntu 24.04 LTS

==============================================================================
📋 DAFTAR ISI
==============================================================================
1. PERSIAPAN UPDATE
2. PROSES UPDATE MANUAL  
3. PROSES UPDATE OTOMATIS
4. TROUBLESHOOTING
5. ROLLBACK & RECOVERY
6. MONITORING & VERIFIKASI

==============================================================================
🔧 1. PERSIAPAN UPDATE
==============================================================================

📌 LANGKAH A: CEK STATUS SERVER
----------------------------------------------
1. SSH ke server:
   ssh root@yourserver.com

2. Cek status aplikasi:
   pm2 status
   pm2 logs qr-tunai-drive --lines 20

3. Cek disk space:
   df -h

4. Backup database (jika ada):
   # Untuk SQLite
   cp /path/to/your/database.sqlite /backup/database_$(date +%Y%m%d_%H%M%S).sqlite

📌 LANGKAH B: PERSIAPAN DEVELOPMENT
----------------------------------------------
1. Pastikan semua perubahan sudah commit:
   git status
   git add .
   git commit -m "Update: Tambah shift management system"

2. Test build lokal:
   npm run build
   npm start

3. Push ke repository:
   git push origin main

==============================================================================
⚡ 2. PROSES UPDATE MANUAL
==============================================================================

📌 LANGKAH A: UPDATE SOURCE CODE
----------------------------------------------
1. SSH ke server:
   ssh root@yourserver.com

2. Navigate ke direktori aplikasi:
   cd /var/www/qr-tunai-drive

3. Backup konfigurasi penting:
   cp .env.local /backup/.env.local_$(date +%Y%m%d_%H%M%S)
   cp package.json /backup/package.json_$(date +%Y%m%d_%H%M%S)

4. Stop aplikasi:
   pm2 stop qr-tunai-drive

5. Pull latest changes:
   git pull origin main

6. Install dependencies baru (jika ada):
   npm install

7. Update packages (opsional):
   npm update

📌 LANGKAH B: BUILD & DEPLOY
----------------------------------------------
1. Build aplikasi:
   npm run build

2. Test konfigurasi:
   npm run start --dry-run

3. Start aplikasi:
   pm2 start qr-tunai-drive
   
4. Reload PM2 (jika butuh restart total):
   pm2 reload qr-tunai-drive

5. Save PM2 configuration:
   pm2 save

📌 LANGKAH C: VERIFIKASI UPDATE
----------------------------------------------
1. Cek status aplikasi:
   pm2 status
   pm2 logs qr-tunai-drive --lines 50

2. Test aplikasi via curl:
   curl -I http://localhost:3000
   
3. Test fitur baru:
   curl -X GET http://localhost:3000/dashboard/shifts

4. Cek Nginx access logs:
   tail -f /var/log/nginx/access.log

==============================================================================
🤖 3. PROSES UPDATE OTOMATIS 
==============================================================================

📌 SCRIPT UPDATE OTOMATIS
----------------------------------------------
Buat file: /root/scripts/update-qr-tunai.sh

#!/bin/bash
set -e

# Variables
APP_DIR="/var/www/qr-tunai-drive"
BACKUP_DIR="/backup"
LOG_FILE="/var/log/qr-tunai-update.log"
DATE=$(date +%Y%m%d_%H%M%S)

echo "🚀 Starting QR-Tunai Update Process at $(date)" | tee -a $LOG_FILE

# Create backup directory
mkdir -p $BACKUP_DIR

# Function untuk logging
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a $LOG_FILE
}

# Function untuk error handling  
error_exit() {
    log "❌ ERROR: $1"
    exit 1
}

# Step 1: Backup important files
log "📦 Creating backup..."
cp $APP_DIR/.env.local $BACKUP_DIR/.env.local_$DATE || error_exit "Failed to backup .env.local"
cp $APP_DIR/package.json $BACKUP_DIR/package.json_$DATE || error_exit "Failed to backup package.json"

# Step 2: Stop application
log "🛑 Stopping application..."
pm2 stop qr-tunai-drive || error_exit "Failed to stop application"

# Step 3: Update source code
log "📥 Pulling latest changes..."
cd $APP_DIR
git pull origin main || error_exit "Failed to pull changes"

# Step 4: Install dependencies
log "📦 Installing dependencies..."
npm ci --production || error_exit "Failed to install dependencies"

# Step 5: Build application
log "🔨 Building application..."
npm run build || error_exit "Failed to build application"

# Step 6: Start application
log "▶️ Starting application..."
pm2 start qr-tunai-drive || error_exit "Failed to start application"

# Step 7: Health check
log "🔍 Running health check..."
sleep 10
curl -f http://localhost:3000 > /dev/null || error_exit "Health check failed"

log "✅ Update completed successfully!"

# Cleanup old backups (keep last 5)
find $BACKUP_DIR -name "*.env.local_*" -type f | head -n -5 | xargs rm -f
find $BACKUP_DIR -name "package.json_*" -type f | head -n -5 | xargs rm -f

log "🧹 Cleanup completed"

📌 PENGGUNAAN SCRIPT
----------------------------------------------
1. Buat script executable:
   chmod +x /root/scripts/update-qr-tunai.sh

2. Jalankan update:
   /root/scripts/update-qr-tunai.sh

3. Cek log:
   tail -f /var/log/qr-tunai-update.log

==============================================================================
🔧 4. TROUBLESHOOTING
==============================================================================

❌ MASALAH UMUM & SOLUSI
----------------------------------------------
1. BUILD FAILURE:
   Problem: npm run build gagal
   Solution:
   - Cek error messages: npm run build 2>&1 | tee build.log
   - Clear cache: npm run clean && rm -rf .next
   - Reinstall: rm -rf node_modules && npm install

2. PM2 TIDAK START:
   Problem: pm2 start gagal
   Solution:
   - Cek PM2 logs: pm2 logs qr-tunai-drive
   - Restart PM2 daemon: pm2 kill && pm2 resurrect
   - Check port availability: netstat -tulpn | grep :3000

3. DATABASE/DEPENDENCY ISSUES:
   Problem: Dependensi baru tidak terinstall
   Solution:
   - Force reinstall: npm ci --force
   - Clear npm cache: npm cache clean --force
   - Check package-lock.json: git status

4. NGINX CONNECTION ISSUES:
   Problem: 502 Bad Gateway
   Solution:
   - Test upstream: curl http://localhost:3000
   - Reload Nginx: systemctl reload nginx
   - Check Nginx config: nginx -t

5. DISK SPACE FULL:
   Problem: No space left on device
   Solution:
   - Clean logs: truncate -s 0 /var/log/nginx/*.log
   - Clean PM2 logs: pm2 flush
   - Clean old builds: rm -rf .next/cache

==============================================================================
⏮️ 5. ROLLBACK & RECOVERY  
==============================================================================

📌 ROLLBACK KE VERSI SEBELUMNYA
----------------------------------------------
1. Stop aplikasi:
   pm2 stop qr-tunai-drive

2. Rollback Git:
   cd /var/www/qr-tunai-drive
   git log --oneline -10  # Cari commit sebelumnya
   git reset --hard <commit-hash>

3. Restore backup (jika perlu):
   cp /backup/.env.local_YYYYMMDD_HHMMSS .env.local
   cp /backup/package.json_YYYYMMDD_HHMMSS package.json

4. Reinstall dependencies:
   npm ci --production

5. Rebuild:
   npm run build

6. Start aplikasi:
   pm2 start qr-tunai-drive

📌 EMERGENCY RECOVERY
----------------------------------------------
Jika server down total:

1. Cek sistem:
   systemctl status nginx
   systemctl status pm2-root

2. Restart semua services:
   systemctl restart nginx
   pm2 kill
   pm2 resurrect

3. Manual start jika PM2 gagal:
   cd /var/www/qr-tunai-drive
   npm start &

==============================================================================
📊 6. MONITORING & VERIFIKASI
==============================================================================

📌 HEALTH CHECKS POST-UPDATE
----------------------------------------------
1. Application Status:
   pm2 status
   pm2 monit

2. System Resources:
   htop
   df -h
   free -h

3. Application Tests:
   # Test homepage
   curl -I http://localhost:3000
   
   # Test dashboard  
   curl -I http://localhost:3000/dashboard
   
   # Test API endpoints
   curl -X GET http://localhost:3000/api/transactions

4. Log Monitoring:
   # Application logs
   pm2 logs qr-tunai-drive --lines 50
   
   # Nginx logs
   tail -f /var/log/nginx/access.log
   tail -f /var/log/nginx/error.log
   
   # System logs
   journalctl -u nginx -f

📌 PERFORMANCE MONITORING
----------------------------------------------
1. Response Time Test:
   curl -o /dev/null -s -w "Time: %{time_total}s\n" http://localhost:3000

2. Load Testing (gunakan dengan hati-hati):
   ab -n 100 -c 10 http://localhost:3000/

3. Database Performance:
   # Jika menggunakan database, monitor query performance

📌 SCHEDULED MONITORING
----------------------------------------------
Tambahkan ke crontab untuk monitoring otomatis:

# Edit crontab
crontab -e

# Add monitoring jobs
# Check app status every 5 minutes
*/5 * * * * /root/scripts/health-check.sh

# Daily log rotation
0 2 * * * /root/scripts/log-rotate.sh

# Weekly backup
0 3 * * 0 /root/scripts/weekly-backup.sh

==============================================================================
📞 SUPPORT & KONTAK
==============================================================================

🆘 EMERGENCY CONTACTS:
- Developer: [Your Contact]
- Server Admin: [Server Admin Contact]  
- Hosting Support: [Hosting Support]

📚 DOKUMENTASI LENGKAP:
- Server Setup: /docs/server-setup.md
- Application Docs: /docs/README.md
- API Documentation: /docs/api.md

🔗 USEFUL LINKS:
- PM2 Documentation: https://pm2.keymetrics.io/docs/
- Nginx Configuration: https://nginx.org/en/docs/
- Next.js Deployment: https://nextjs.org/docs/deployment

==============================================================================
📅 LOG UPDATE TERAKHIR
==============================================================================
${new Date().toLocaleDateString('id-ID', { 
  day: '2-digit', 
  month: 'long', 
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})} - Tambah sistem manajemen shift kerja dan dokumentasi update server

==============================================================================
✅ CHECKLIST UPDATE SELESAI
==============================================================================
[ ] Source code updated
[ ] Dependencies installed  
[ ] Application built successfully
[ ] PM2 restarted
[ ] Health check passed
[ ] Logs checked
[ ] Performance verified
[ ] Backup created
[ ] Documentation updated

==============================================================================
🎯 END OF DOCUMENTATION
==============================================================================