# 🚀 QR-Tunai Drive Development Guide

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Current Architecture](#current-architecture)
- [Analytics System Implementation](#analytics-system-implementation)
- [Enterprise Features Roadmap](#enterprise-features-roadmap)
- [Development Workflow](#development-workflow)
- [Deployment Guide](#deployment-guide)

## 🎯 Project Overview

**QR-Tunai Drive** adalah sistem QR Code untuk transaksi drive-thru yang telah dikembangkan dengan fitur:

### ✅ **Current Features (Production Ready):**
- 🔐 **Authentication System** - JWT-based login dengan role management
- 💳 **Transaction Management** - Multi-method transaction processing
- 📊 **Analytics Dashboard** - Real-time metrics dan business intelligence
- 🖥️ **Admin Dashboard** - Full management interface
- 📱 **Mobile-First QR System** - 1 Token 1 Customer principle
- 🏦 **Multi-Bank Support** - BCA, BNI, BRI, BTN, MANDIRI
- 🔄 **Real-time Updates** - Auto-refresh dan live data

### 🌟 **Target Features (Enterprise Phase):**
- 📊 Advanced Analytics dengan forecasting
- 💳 Payment Gateway Integration (Midtrans, Xendit)
- 🔐 Enterprise Security (2FA, Audit Logging)
- 📈 Business Intelligence & Custom Reports

---

## 🏗️ Current Architecture

### **Tech Stack:**
```
Frontend: Next.js 15 + TypeScript + Tailwind CSS
Backend: Next.js API Routes + Edge Runtime
Database: In-Memory (Ready for PostgreSQL/MySQL)
Authentication: JWT + HTTP-Only Cookies
Charts: Recharts + Lucide Icons
State: React Hooks + Custom Stores
Deployment: Ubuntu 24.04 + PM2 + Nginx + Cloudflare
```

### **Project Structure:**
```
QR-Tunai-drive/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── analytics/     # Analytics API
│   │   │   ├── transactions/  # Transaction management
│   │   │   └── qr/           # QR generation
│   │   ├── dashboard/        # Admin dashboard pages
│   │   │   ├── analytics/    # Analytics dashboard
│   │   │   ├── history/      # Transaction history
│   │   │   ├── manual/       # Manual transaction form
│   │   │   ├── settings/     # Admin settings
│   │   │   └── qr/          # QR generator
│   │   ├── login/           # Login page
│   │   └── t/[id]/form/     # Customer transaction form
│   ├── components/          # Reusable UI components
│   │   ├── analytics/       # Analytics components
│   │   ├── ui/             # Base UI components
│   │   └── transaction-form.tsx
│   ├── lib/                # Business logic & utilities
│   │   ├── analytics-store.ts
│   │   ├── transaction-store.ts
│   │   ├── bank-config.ts
│   │   └── utils.ts
│   ├── hooks/              # Custom React hooks
│   │   └── useAnalytics.ts
│   └── types/              # TypeScript definitions
├── public/                 # Static assets
├── .env.local             # Development environment
├── .env.production        # Production environment
└── deploy.sh             # Deployment script
```

---

## 📊 Analytics System Implementation

### **Architecture Overview:**

#### **1. Event Tracking System:**
```typescript
interface AnalyticsEvent {
  id: string;
  userId?: string;
  eventType: 'transaction' | 'login' | 'qr_scan' | 'form_access';
  data: any;
  timestamp: Date;
  ip?: string;
  userAgent?: string;
}
```

#### **2. Metrics Calculation:**
```typescript
interface AnalyticsMetrics {
  totalRevenue: number;
  totalTransactions: number;
  averageTransaction: number;
  conversionRate: number;
  topBanks: { bank: string; count: number; revenue: number }[];
  hourlyData: { hour: number; count: number; revenue: number }[];
  dailyData: { date: string; count: number; revenue: number }[];
  methodBreakdown: { method: string; count: number; percentage: number }[];
}
```

#### **3. API Endpoints:**
- **POST** `/api/analytics/events` - Record new event
- **GET** `/api/analytics/events` - Fetch events with filters
- **GET** `/api/analytics/metrics` - Get calculated metrics

#### **4. Real-time Charts:**
- **Daily Revenue Chart** - Line chart dengan data 7 hari terakhir
- **Hourly Activity** - Bar chart untuk peak hours analysis
- **Method Breakdown** - Pie chart distribusi metode transaksi
- **Top Banks** - Ranking performance bank partners

#### **5. Business Intelligence Features:**
- **Peak Hours Detection** - Identifikasi jam sibuk otomatis
- **Conversion Rate Analysis** - QR scan → Transaction completion
- **Bank Performance Metrics** - Revenue dan volume per bank
- **Trend Analysis** - Growth patterns dan recommendations

### **Implementation Files:**

#### **Core Analytics Store:**
```bash
src/lib/analytics-store.ts     # Event storage & metrics calculation
```

#### **API Layer:**
```bash
src/app/api/analytics/events/route.ts   # Event recording API
src/app/api/analytics/metrics/route.ts  # Metrics calculation API
```

#### **Frontend Components:**
```bash
src/components/analytics/AnalyticsDashboard.tsx  # Main dashboard
src/hooks/useAnalytics.ts                        # Custom React hook
src/app/dashboard/analytics/page.tsx             # Analytics page
```

### **Usage Examples:**

#### **Track Event:**
```typescript
const { trackEvent } = useAnalytics();

// Track transaction completion
await trackEvent('transaction', {
  amount: 50000,
  type: 'Setor Tunai',
  bank: 'Bank Central Asia',
  method: 'Transfer Outlet'
}, userId);
```

#### **Get Metrics:**
```typescript
const { metrics, loading, error } = useAnalytics(startDate, endDate);

if (metrics) {
  console.log('Total Revenue:', metrics.totalRevenue);
  console.log('Conversion Rate:', metrics.conversionRate);
  console.log('Top Bank:', metrics.topBanks[0]);
}
```

---

## 🚀 Enterprise Features Roadmap

### **Phase 1: Advanced Analytics (Week 1-2)**

#### **Features to Add:**
- **Revenue Forecasting** dengan machine learning predictions
- **Customer Behavior Analysis** - Session tracking, user journey
- **A/B Testing Framework** - QR design, form layouts
- **Custom Date Ranges** - Flexible time period selection
- **Export Functionality** - Excel, PDF, CSV reports

#### **Dependencies:**
```bash
npm install ml-regression date-fns-tz chart.js
npm install xlsx jspdf html2canvas
```

#### **Implementation Priority:**
1. ✅ **Basic Analytics** (COMPLETED)
2. 🔄 **Revenue Forecasting** (NEXT)
3. 🔄 **Export Reports** (NEXT)
4. 🔄 **Advanced Filters** (NEXT)

### **Phase 2: Payment Integration (Week 3-4)**

#### **Payment Gateways:**
- **Midtrans** - Credit card, e-wallet, bank transfer
- **Xendit** - Virtual accounts, retail outlets
- **DOKU** - Local payment methods

#### **Features:**
- **Real-time Payment Status** - Webhook integration
- **Automatic Reconciliation** - Match payments with transactions
- **Failed Payment Recovery** - Retry mechanisms
- **Multi-currency Support** - IDR primary, others optional

#### **Database Schema Extension:**
```typescript
interface Transaction {
  // Existing fields...
  paymentGateway?: 'midtrans' | 'xendit' | 'doku';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'expired';
  paymentId?: string;
  paymentUrl?: string;
  webhookData?: object;
  paidAt?: Date;
  paymentMethod?: string;
}
```

### **Phase 3: Enterprise Security (Week 5-6)**

#### **Security Enhancements:**
- **Two-Factor Authentication (2FA)** - TOTP with Google Authenticator
- **Advanced Role Management** - Granular permissions
- **Audit Logging** - Complete action history
- **IP Whitelisting** - Restrict admin access
- **Session Management** - Force logout, concurrent session limits

#### **Audit System:**
```typescript
interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  oldValue?: any;
  newValue?: any;
  ip: string;
  userAgent: string;
  timestamp: Date;
  success: boolean;
}
```

### **Phase 4: Business Intelligence (Week 7-8)**

#### **Advanced Reporting:**
- **Custom Report Builder** - Drag-and-drop interface
- **Scheduled Reports** - Email delivery, automated generation
- **Data Warehouse Integration** - Connect external BI tools
- **API for Third-party** - Webhook for external systems

#### **Machine Learning Features:**
- **Fraud Detection** - Anomaly detection for suspicious transactions
- **Demand Forecasting** - Predict peak hours, staffing needs
- **Customer Segmentation** - Behavioral analysis and targeting

---

## 🛠️ Development Workflow

### **Environment Setup:**

#### **Development:**
```bash
# Clone repository
git clone https://github.com/Risman1296/QR-Tunai-drive.git
cd QR-Tunai-drive

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your settings

# Run development server
npm run dev
```

#### **Environment Variables:**
```bash
# .env.local (Development)
NODE_ENV=development
PORT=3000
NETWORK_IP=192.168.8.103
NEXT_PUBLIC_BASE_URL=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key-here
DB_URL=postgresql://user:pass@localhost:5432/qrtunai

# .env.production (Production)
NODE_ENV=production
PORT=4000
DOMAIN=qr-drive.uk
NEXT_PUBLIC_BASE_URL=https://qr-drive.uk
JWT_SECRET=production-jwt-secret-here
DB_URL=postgresql://user:pass@localhost:5432/qrtunai_prod
```

### **Development Commands:**
```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # ESLint checking
npm run type-check   # TypeScript checking

# Database (when implemented)
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed initial data
npm run db:reset     # Reset database

# Testing (future)
npm run test         # Unit tests
npm run test:e2e     # End-to-end tests
npm run test:coverage # Coverage report
```

### **Git Workflow:**
```bash
# Create feature branch
git checkout -b feature/analytics-forecasting

# Commit changes
git add .
git commit -m "feat: add revenue forecasting to analytics"

# Push feature branch
git push origin feature/analytics-forecasting

# Merge to main (after review)
git checkout main
git pull origin main
git merge feature/analytics-forecasting
git push origin main
```

### **Code Standards:**

#### **TypeScript:**
- ✅ **Strict mode enabled** - Type safety enforced
- ✅ **Interface over type** - Consistent data modeling
- ✅ **Proper error handling** - Try-catch with typed errors
- ✅ **JSDoc comments** - Document complex functions

#### **React:**
- ✅ **Functional components** - Hooks over class components
- ✅ **Custom hooks** - Reusable logic extraction
- ✅ **Proper cleanup** - useEffect dependencies
- ✅ **Loading states** - UX feedback for async operations

#### **API Design:**
- ✅ **RESTful endpoints** - Standard HTTP methods
- ✅ **Consistent response** - Uniform JSON structure
- ✅ **Error handling** - Proper HTTP status codes
- ✅ **Validation** - Input sanitization and validation

---

## 🚀 Deployment Guide

### **Production Server Setup:**

#### **Server Specifications:**
```
OS: Ubuntu 24.04 LTS
User: qrt@QRTunai
Domain: qr-drive.uk, app.qr-drive.uk
Server: Oracle VM (Local Network)
Cloudflare Tunnel ID: 2c225e53-b004-4d1c-8b58-db803ae3245f
```

#### **Automated Deployment:**
```bash
# Run deployment script
chmod +x deploy.sh
./deploy.sh

# Manual deployment steps (if needed)
# 1. Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Install PM2
sudo npm install -g pm2

# 3. Setup database (PostgreSQL)
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo -u postgres createdb qrtunai_prod

# 4. Configure Nginx
sudo apt install nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# 5. Setup Cloudflare Tunnel
curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null
echo 'deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared any main' | sudo tee /etc/apt/sources.list.d/cloudflared.list
sudo apt-get update && sudo apt-get install cloudflared

# Run tunnel
cloudflared tunnel run --token eyJhIjoiM2E3MjAyYzkxMTJkYzM2YTA0YWMzN2IyNDg4ZWY4Y2EiLCJ0IjoiMmMyMjVlNTMtYjAwNC00ZDFjLThiNTgtZGI4MDNhZTMyNDVmIiwicyI6IlltVXpNR0V4WVRndE5EZzNaUzAwTUdRMkxXSmlOMkV0TUdaak1EbGtORGt6TVRoayJ9
```

#### **Domain Configuration:**
```
qr-drive.uk → http://localhost:4000
app.qr-drive.uk → http://localhost:4000
```

#### **PM2 Configuration:**
```json
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'qr-tunai-drive',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '512M',
    error_file: '/var/log/qr-tunai/error.log',
    out_file: '/var/log/qr-tunai/access.log',
    log_file: '/var/log/qr-tunai/app.log',
    time: true
  }]
};
```

### **Monitoring & Maintenance:**

#### **Health Checks:**
```bash
# Check application status
pm2 status
pm2 logs qr-tunai-drive

# Check server resources
htop
df -h
free -h

# Check database
sudo -u postgres psql -c "\l"
sudo -u postgres psql qrtunai_prod -c "\dt"
```

#### **Backup Strategy:**
```bash
# Database backup
sudo -u postgres pg_dump qrtunai_prod > backup_$(date +%Y%m%d).sql

# Application backup
tar -czf qr-tunai-backup-$(date +%Y%m%d).tar.gz /home/qrt/QR-Tunai-drive

# Automated backup (crontab)
0 2 * * * /home/qrt/backup-script.sh
```

---

## 📚 API Documentation

### **Authentication API:**

#### **POST** `/api/auth/login`
```json
// Request
{
  "username": "owner",
  "password": "admin123"
}

// Response
{
  "success": true,
  "user": {
    "id": "1",
    "username": "owner",
    "role": "Owner",
    "active": true
  },
  "message": "Login berhasil"
}
```

#### **POST** `/api/auth/logout`
```json
// Response
{
  "success": true,
  "message": "Logout berhasil"
}
```

### **Analytics API:**

#### **GET** `/api/analytics/metrics`
```json
// Query Parameters
?startDate=2024-01-01&endDate=2024-01-31

// Response
{
  "metrics": {
    "totalRevenue": 5000000,
    "totalTransactions": 45,
    "averageTransaction": 111111,
    "conversionRate": 78.5,
    "topBanks": [
      {
        "bank": "Bank Central Asia",
        "count": 15,
        "revenue": 2500000
      }
    ],
    "hourlyData": [...],
    "dailyData": [...],
    "methodBreakdown": [...]
  }
}
```

#### **POST** `/api/analytics/events`
```json
// Request
{
  "eventType": "transaction",
  "data": {
    "amount": 50000,
    "type": "Setor Tunai",
    "bank": "Bank Central Asia"
  },
  "userId": "user123"
}

// Response
{
  "success": true,
  "eventId": "evt_123456789"
}
```

### **Transaction API:**

#### **POST** `/api/transactions`
```json
// Request
{
  "type": "Setor Tunai",
  "bank": "Bank Central Asia",
  "accountNumber": "1234567890",
  "customerName": "John Doe",
  "amount": 100000,
  "method": "Transfer Outlet",
  "outletBank": "Bank Central Asia",
  "verification": true
}

// Response
{
  "success": true,
  "transaction": {
    "id": "txn_123456789",
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## 🔧 Troubleshooting Guide

### **Common Issues:**

#### **Build Errors:**
```bash
# Clear cache and reinstall
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

#### **Database Connection:**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
sudo -u postgres psql -c "SELECT version();"
```

#### **Port Conflicts:**
```bash
# Find process using port
sudo lsof -i :4000

# Kill process
sudo kill -9 <PID>
```

#### **PM2 Issues:**
```bash
# Restart application
pm2 restart qr-tunai-drive

# View logs
pm2 logs qr-tunai-drive --lines 100

# Reset PM2
pm2 delete all
pm2 start ecosystem.config.js
```

### **Performance Optimization:**

#### **Frontend:**
- ✅ **Code Splitting** - Dynamic imports for heavy components
- ✅ **Image Optimization** - Next.js Image component
- ✅ **Caching Strategy** - Browser and CDN caching
- ✅ **Bundle Analysis** - Regular bundle size monitoring

#### **Backend:**
- ✅ **Database Indexing** - Optimize query performance
- ✅ **Connection Pooling** - Efficient database connections
- ✅ **Caching Layer** - Redis for frequently accessed data
- ✅ **Rate Limiting** - Prevent API abuse

---

## 📖 Learning Resources

### **Next.js 15:**
- [Official Documentation](https://nextjs.org/docs)
- [App Router Migration](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)

### **TypeScript:**
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

### **Analytics & BI:**
- [Recharts Documentation](https://recharts.org/en-US/)
- [Data Visualization Best Practices](https://www.tableau.com/learn/articles/data-visualization)

---

## 📞 Support & Contact

### **Development Team:**
- **Lead Developer:** Available for architecture decisions
- **DevOps:** Server management and deployment
- **Analytics:** Business intelligence and reporting

### **Documentation Updates:**
File ini akan diupdate seiring dengan pengembangan fitur baru. Pastikan untuk selalu merujuk ke versi terbaru.

---

**Last Updated:** 2025-01-17
**Version:** 1.0.0  
**Status:** Production Ready ✅

---

*Dokumentasi ini dibuat sebagai panduan lengkap untuk pengembangan QR-Tunai Drive. Simpan file ini di server sebagai referensi utama untuk semua pengembangan future.*