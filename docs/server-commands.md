# 🔧 Server Management Commands - QR Tunai WiFi System

## 🚀 Quick Deployment (One Command)
```bash
# Download dan jalankan deployment script
curl -sSL https://raw.githubusercontent.com/Risman1296/QR-Tunai-drive/copilot/vscode1758013875916/deploy-server.sh | bash
```

## 📊 Status Check Commands
```bash
# Check semua status
pm2 status && sudo systemctl status nginx && curl -s http://localhost:3000/health

# Status aplikasi
pm2 list | grep qr-tunai

# Status sistem
htop
df -h
free -h
```

## 📝 Log Monitoring
```bash
# Live logs aplikasi
pm2 logs qr-tunai-wifi --lines 50

# Error logs only  
pm2 logs qr-tunai-wifi --err --lines 20

# Health check logs
tail -f /var/log/qr-tunai/health-check.log

# Nginx access logs
sudo tail -f /var/log/nginx/access.log
```

## 🔄 Application Management
```bash
# Restart aplikasi (zero downtime)
pm2 reload qr-tunai-wifi

# Hard restart
pm2 restart qr-tunai-wifi

# Stop aplikasi
pm2 stop qr-tunai-wifi

# Start aplikasi
pm2 start qr-tunai-wifi

# Delete aplikasi dari PM2
pm2 delete qr-tunai-wifi
```

## 📥 Update & Deploy
```bash
# Update dari GitHub
cd /opt/qr-tunai
git pull origin copilot/vscode1758013875916
npm install
npm run build
pm2 reload qr-tunai-wifi

# Check update berhasil
pm2 logs qr-tunai-wifi --lines 10
```

## 🌐 Nginx Management
```bash
# Test konfigurasi Nginx
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# Status Nginx
sudo systemctl status nginx

# View Nginx config
cat /etc/nginx/sites-available/qr-tunai
```

## 🔒 SSL Setup (Let's Encrypt)
```bash
# Install certbot
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# Get SSL certificate (replace your-domain.com)
sudo certbot --nginx -d your-domain.com

# Auto renewal test
sudo certbot renew --dry-run

# Check certificates
sudo certbot certificates
```

## 🛰️ WiFi System Commands
```bash
# Test WiFi API
curl http://localhost:3000/api/wifi/status

# Test router connectivity
ping 192.168.8.1

# Check WiFi automation logs
grep "WiFi" /var/log/qr-tunai/combined.log

# Manual trigger WiFi password update
curl -X POST http://localhost:3000/api/wifi -H "Content-Type: application/json"
```

## 📊 Performance Monitoring
```bash
# Resource usage
pm2 monit

# Application metrics
curl -s http://localhost:3000/api/wifi/analytics | jq

# System performance
iostat 1 5
vmstat 1 5

# Network connections
netstat -tlnp | grep 3000
```

## 🚨 Troubleshooting
```bash
# If app won't start
pm2 logs qr-tunai-wifi --err --lines 50
pm2 restart qr-tunai-wifi

# If high memory usage
pm2 restart qr-tunai-wifi

# If port 3000 in use
sudo lsof -i :3000
# Kill process: sudo kill -9 <PID>

# If router not responding
ping 192.168.8.1
telnet 192.168.8.1 80

# Reset everything
pm2 kill
cd /opt/qr-tunai
pm2 start ecosystem.config.js
```

## 💾 Backup Commands
```bash
# Backup configuration
mkdir -p ~/backups
cp /opt/qr-tunai/.env.production ~/backups/env_$(date +%Y%m%d).backup
cp /opt/qr-tunai/payment-configuration.json ~/backups/config_$(date +%Y%m%d).backup

# Backup logs
sudo cp -r /var/log/qr-tunai ~/backups/logs_$(date +%Y%m%d)

# Database backup (if using)
# mysqldump -u user -p database > ~/backups/db_$(date +%Y%m%d).sql
```

## 🔧 Environment Configuration
```bash
# Edit production environment
nano /opt/qr-tunai/.env.production

# Required environment variables:
ORBIT_H2_IP=192.168.8.1              # Router IP
ORBIT_H2_USERNAME=admin               # Router username  
ORBIT_H2_PASSWORD=QaWsEdRf1@          # Router password
ENABLE_WIFI_AUTOMATION=true           # Enable WiFi automation
NEXT_PUBLIC_BASE_URL=https://your-domain.com  # Your domain
```

## 🎯 Production Checklist
```bash
# ✅ Check list deployment:

# 1. System status
systemctl status nginx
pm2 status

# 2. Application health
curl http://localhost:3000/health
curl http://localhost:3000/api/wifi/status

# 3. SSL certificate
sudo certbot certificates

# 4. Router connectivity
ping 192.168.8.1

# 5. WiFi automation
grep "automation" /var/log/qr-tunai/combined.log | tail -5

# 6. Cron jobs
crontab -l

# 7. Logs rotation
ls -la /var/log/qr-tunai/

# 8. Resource usage
free -h && df -h
```

## 📱 Remote Management
```bash
# SSH with key-based authentication
ssh -i ~/.ssh/your-key user@your-server

# Screen/tmux for persistent sessions
screen -S qr-tunai
# atau
tmux new -s qr-tunai

# File transfer
scp file.txt user@server:/opt/qr-tunai/
rsync -avz /local/path/ user@server:/opt/qr-tunai/
```

## 🚀 Quick Actions
```bash
# Shortcut aliases (add to ~/.bashrc)
alias qr-logs='pm2 logs qr-tunai-wifi'
alias qr-status='pm2 status && systemctl status nginx'
alias qr-restart='pm2 reload qr-tunai-wifi'
alias qr-health='curl -s http://localhost:3000/health'

# Load aliases
source ~/.bashrc
```

## 📞 Emergency Procedures
```bash
# IF EVERYTHING IS DOWN:
1. Check system resources: htop, df -h
2. Restart services: sudo systemctl restart nginx && pm2 restart all
3. Check logs: pm2 logs --lines 100
4. If needed, reboot server: sudo reboot

# IF ROUTER NOT RESPONDING:
1. ping 192.168.8.1
2. Check router power and network cables
3. Access router web interface: http://192.168.8.1
4. Reset router if necessary

# IF HIGH TRAFFIC:
1. Scale PM2 instances: pm2 scale qr-tunai-wifi +2
2. Monitor resources: pm2 monit
3. Consider load balancing or CDN
```

---
**💡 Simpan perintah ini sebagai referensi cepat untuk manajemen server!**