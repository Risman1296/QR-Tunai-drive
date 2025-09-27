# 🚀 QR-Tunai Deployment Guide

Panduan lengkap untuk deployment aplikasi QR-Tunai ke server production.

## 📋 Prerequisites

### Server Requirements
- Ubuntu Server 24.04 LTS
- Node.js 20 LTS
- PM2 process manager
- Nginx (optional, for reverse proxy)
- Git
- SSH access

### Local Requirements (Windows)
- Git Bash or PowerShell
- Node.js 20 LTS
- SSH client (OpenSSH atau PuTTY)
- Git configured dengan repository access

## 🛠️ Initial Server Setup

Jika belum setup server, jalankan script deployment awal:

```bash
# Di server Ubuntu
wget https://raw.githubusercontent.com/Risman1296/QR-Tunai-drive/main/deploy.sh
chmod +x deploy.sh
sudo ./deploy.sh
```

## 🔄 Update Deployment (Recommended Method)

### Method 1: Automated PowerShell Script (Windows)

```powershell
# Build dan deploy otomatis
.\deploy-from-windows.ps1 -ServerIP "your-server-ip" -Username "qrt"

# Atau build saja tanpa deploy
.\deploy-from-windows.ps1 -BuildOnly
```

### Method 2: Manual Update (Server)

```bash
# Di server, login sebagai user qrt
sudo su - qrt

# Jalankan update script
./update-server.sh
```

### Method 3: Manual Step-by-Step

```bash
# 1. Local: Build dan push
npm run build
git add .
git commit -m "Deploy: $(date)"
git push origin copilot/vscode1758013875916

# 2. Server: Pull dan update
ssh qrt@your-server-ip
cd /home/qrt/QR-Tunai-drive
git pull origin copilot/vscode1758013875916
npm install --production
npm run build
pm2 reload qr-tunai
```

## 📊 Monitoring dan Maintenance

### PM2 Commands
```bash
# Status aplikasi
pm2 status qr-tunai

# Logs real-time
pm2 logs qr-tunai

# Monitor resources
pm2 monit

# Restart service
pm2 restart qr-tunai

# Stop service
pm2 stop qr-tunai

# Start service
pm2 start qr-tunai
```

### Log Locations
```
Application logs: /var/log/qr-tunai-drive/
PM2 logs: ~/.pm2/logs/
Nginx logs: /var/log/nginx/
System logs: /var/log/syslog
```

## 🔧 Configuration Files

### Environment Variables (.env.local)
```env
NODE_ENV=production
PORT=4000
JWT_SECRET=your-super-secure-jwt-secret
DB_HOST=localhost
DB_USER=qrt_user
DB_PASS=secure_password
DB_NAME=qrtunai
```

### PM2 Configuration (ecosystem.config.js)
```javascript
module.exports = {
  apps: [{
    name: 'qr-tunai',
    script: 'npm',
    args: 'start',
    cwd: '/home/qrt/QR-Tunai-drive',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    }
  }]
}
```

## 🌐 Domain dan SSL Setup

### Cloudflare Tunnel (Recommended)
```bash
# Install cloudflared
sudo apt install cloudflared

# Setup tunnel
cloudflared tunnel create qr-tunai
cloudflared tunnel route dns qr-tunai your-domain.com

# Configure tunnel
nano ~/.cloudflared/config.yml
```

### Nginx Reverse Proxy (Alternative)
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔒 Security Checklist

- [ ] Firewall configured (UFW)
- [ ] SSH key authentication enabled
- [ ] Regular security updates
- [ ] Strong passwords for all accounts
- [ ] SSL/TLS certificates installed
- [ ] Database secured with proper credentials
- [ ] Environment variables properly configured
- [ ] Backup strategy implemented

## 📁 Backup Strategy

### Automated Backup (Cron Job)
```bash
# Add to crontab (crontab -e)
0 2 * * * /home/qrt/backup-qr-tunai.sh

# Backup script example
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf /home/qrt/backups/qr-tunai-$DATE.tar.gz /home/qrt/QR-Tunai-drive
find /home/qrt/backups -name "qr-tunai-*.tar.gz" -mtime +7 -delete
```

## 🚨 Troubleshooting

### Common Issues

**Application won't start**
```bash
pm2 logs qr-tunai
npm run build
pm2 restart qr-tunai
```

**Port already in use**
```bash
sudo lsof -i :4000
sudo kill -9 <PID>
pm2 restart qr-tunai
```

**Database connection failed**
```bash
mysql -u qrt_user -p qrtunai
# Check connection and credentials
```

**Out of memory**
```bash
free -h
pm2 restart qr-tunai
# Consider upgrading server resources
```

### Health Checks
```bash
# Application health
curl http://localhost:4000

# Database health
mysql -u qrt_user -p -e "SELECT 1"

# Process health
pm2 status

# System health
df -h
free -h
top
```

## 📞 Support

Jika mengalami masalah deployment:

1. Check logs di `/var/log/qr-tunai-drive/`
2. Verify PM2 status: `pm2 status`
3. Check system resources: `htop` atau `top`
4. Review configuration files
5. Check network connectivity
6. Verify database connection

## 🎯 Performance Optimization

### Server Level
- Enable Nginx gzip compression
- Configure PM2 clustering for high traffic
- Setup Redis for session storage
- Optimize database queries
- Monitor with APM tools

### Application Level  
- Enable Next.js static optimization
- Implement proper caching strategies
- Optimize images and assets
- Use CDN for static content
- Monitor bundle sizes

## 📈 Production Checklist

- [ ] Domain configured and accessible
- [ ] SSL certificate installed and valid
- [ ] Database properly configured and secured
- [ ] All environment variables set
- [ ] PM2 configured for auto-restart
- [ ] Nginx/reverse proxy configured
- [ ] Firewall rules configured
- [ ] Backup strategy implemented
- [ ] Monitoring configured
- [ ] Log rotation configured
- [ ] Health checks implemented
- [ ] Load testing completed
- [ ] Security audit completed

---

*Last updated: $(Get-Date -Format 'yyyy-MM-dd')*
*QR-Tunai Drive v1.0 Production Deployment*