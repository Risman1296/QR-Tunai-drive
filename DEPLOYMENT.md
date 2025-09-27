# QR-Tunai Production Deployment

## Prerequisites
- Ubuntu Server 24.04
- User: qrt@QRTunai
- Domain: qr-drive.uk
- App Domain: app.qr-drive.uk
- Cloudflare Tunnel ID: 2c225e53-b004-4d1c-8b58-db803ae3245f

## Deployment Steps

### 1. Prepare the Server
```bash
# Connect to the server
ssh qrt@192.168.8.139

# Clone the repository
git clone https://github.com/Risman1296/QR-Tunai-drive.git
cd QR-Tunai-drive
```

### 2. Run Deployment Script
```bash
# Make script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### 3. Manual Configuration (if needed)

#### MySQL Database Setup
```sql
sudo mysql -u root -p

CREATE DATABASE qrtunai;
CREATE USER 'qrt_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON qrtunai.* TO 'qrt_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Environment Variables
Update `.env.production` with actual values:
- JWT_SECRET: Generate strong secret
- DB_URL: Update with actual MySQL credentials
- Domain configurations

### 4. Service Management

#### PM2 Commands
```bash
# Check application status
pm2 status

# View logs
pm2 logs qr-tunai

# Restart application
pm2 restart qr-tunai

# Stop application
pm2 stop qr-tunai
```

#### Cloudflare Tunnel Commands
```bash
# Check tunnel status
sudo systemctl status cloudflared

# View tunnel logs
sudo journalctl -u cloudflared -f

# Restart tunnel
sudo systemctl restart cloudflared
```

### 5. Domain Configuration

#### Cloudflare DNS Settings
- qr-drive.uk → CNAME → 2c225e53-b004-4d1c-8b58-db803ae3245f.cfargotunnel.com
- app.qr-drive.uk → CNAME → 2c225e53-b004-4d1c-8b58-db803ae3245f.cfargotunnel.com

#### Tunnel Configuration
Both domains route to http://localhost:4000

### 6. Security Checklist
- [x] Firewall configured (UFW)
- [x] Security headers in Nginx
- [x] HTTPS enforced via Cloudflare
- [x] Database user with limited privileges
- [x] Strong JWT secret
- [x] Process isolation with PM2

### 7. Monitoring
- Application logs: `/var/log/qr-tunai/`
- PM2 dashboard: `pm2 monit`
- System logs: `journalctl -f`

### 8. Troubleshooting

#### Common Issues
1. **Port 4000 in use**: `sudo lsof -i :4000`
2. **Cloudflare tunnel not connecting**: Check token and internet connectivity
3. **Database connection failed**: Verify MySQL credentials and service status
4. **Application not building**: Check Node.js version and dependencies

#### Health Checks
```bash
# Check if application is running
curl http://localhost:4000

# Check database connection
mysql -u qrt_user -p qrtunai

# Check Cloudflare tunnel
curl -I https://qr-drive.uk
```

## Post-Deployment Testing
1. Access https://qr-drive.uk
2. Test login functionality
3. Verify QR code generation
4. Test dashboard features
5. Check logout redirect to homepage
6. Verify mobile responsiveness