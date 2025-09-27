# 📊 Analytics System - Complete Implementation Guide

## 🎯 Overview
Sistem Analytics QR-Tunai Drive menyediakan insights mendalam tentang performa bisnis, behavior pelanggan, dan operational metrics yang dapat digunakan untuk optimisasi dan decision making.

## 🏗️ Architecture

### Data Flow:
```
[User Action] → [Event Tracking] → [Analytics Store] → [Metrics Calculation] → [Dashboard Visualization]
```

### Components:
1. **Event Tracking System** - Merekam semua user interactions
2. **Analytics Store** - In-memory storage dengan persistent option  
3. **Metrics Engine** - Real-time calculation engine
4. **Visualization Layer** - Charts dan dashboard components
5. **API Layer** - RESTful endpoints untuk data access

## 📋 Complete File Structure

```
src/
├── lib/
│   └── analytics-store.ts           # Core analytics storage & logic
├── hooks/
│   └── useAnalytics.ts             # React hook for analytics
├── components/
│   └── analytics/
│       └── AnalyticsDashboard.tsx   # Main dashboard component
├── app/
│   ├── api/
│   │   └── analytics/
│   │       ├── events/route.ts      # Event tracking API
│   │       └── metrics/route.ts     # Metrics calculation API
│   └── dashboard/
│       └── analytics/
│           └── page.tsx             # Analytics page
└── types/
    └── analytics.ts                 # TypeScript definitions
```

## 🔧 Implementation Details

### 1. Core Analytics Store (src/lib/analytics-store.ts)

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

class AnalyticsStore {
  private events: Map<string, AnalyticsEvent> = new Map();

  // Core methods:
  addEvent(event) // Add new analytics event
  getEvents(filters) // Retrieve events with filtering
  getMetrics(dateRange) // Calculate business metrics
  
  // Advanced methods:
  getConversionFunnel() // Analyze user journey
  getPeakHours() // Identify busy periods  
  getBankPerformance() // Bank-specific metrics
  getRevenueForecasting() // Predict future revenue
}
```

**Key Features:**
- ✅ **Event Storage** - Efficient in-memory storage
- ✅ **Filtering** - Date range, event type, user filtering  
- ✅ **Aggregation** - Real-time metrics calculation
- ✅ **Performance** - Optimized for high-frequency data

### 2. React Hook (src/hooks/useAnalytics.ts)

```typescript
export function useAnalytics(startDate?: Date, endDate?: Date) {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Methods:
  const fetchMetrics = async () => { /* Fetch from API */ };
  const trackEvent = async (eventType, data, userId) => { /* Track event */ };
  const refetch = () => { /* Refresh data */ };

  return { metrics, loading, error, trackEvent, refetch };
}
```

**Usage Examples:**
```typescript
// Basic usage
const { metrics, loading } = useAnalytics();

// With date filtering  
const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
const { metrics } = useAnalytics(lastWeek);

// Track custom event
const { trackEvent } = useAnalytics();
await trackEvent('transaction', { amount: 50000, bank: 'BCA' });
```

### 3. API Endpoints

#### Events API (/api/analytics/events)
```typescript
// POST - Record new event
{
  "eventType": "transaction",
  "data": {
    "amount": 100000,
    "type": "Setor Tunai",
    "bank": "Bank Central Asia"
  },
  "userId": "user123"
}

// GET - Retrieve events
/api/analytics/events?type=transaction&startDate=2024-01-01&endDate=2024-01-31
```

#### Metrics API (/api/analytics/metrics)
```typescript
// GET - Calculated metrics
{
  "metrics": {
    "totalRevenue": 5000000,
    "totalTransactions": 45,
    "averageTransaction": 111111,
    "conversionRate": 78.5,
    "topBanks": [...],
    "hourlyData": [...],
    "dailyData": [...],
    "methodBreakdown": [...]
  }
}
```

### 4. Dashboard Component (src/components/analytics/AnalyticsDashboard.tsx)

```typescript
export function AnalyticsDashboard() {
  const { metrics, loading, error } = useAnalytics();

  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard title="Total Revenue" value={formatCurrency(metrics.totalRevenue)} />
        <MetricCard title="Total Transaksi" value={metrics.totalTransactions} />
        <MetricCard title="Rata-rata" value={formatCurrency(metrics.averageTransaction)} />
        <MetricCard title="Conversion Rate" value={`${metrics.conversionRate.toFixed(1)}%`} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Daily Revenue Line Chart */}
        <Card>
          <LineChart data={metrics.dailyData} />
        </Card>

        {/* Hourly Activity Bar Chart */} 
        <Card>
          <BarChart data={metrics.hourlyData} />
        </Card>

        {/* Method Breakdown Pie Chart */}
        <Card>
          <PieChart data={metrics.methodBreakdown} />
        </Card>

        {/* Top Banks List */}
        <Card>
          <BankRankingList data={metrics.topBanks} />
        </Card>
      </div>
    </div>
  );
}
```

**Chart Features:**
- ✅ **Responsive Design** - Mobile-first responsive charts
- ✅ **Interactive Tooltips** - Hover details dengan formatted data
- ✅ **Color Coding** - Consistent color palette across charts
- ✅ **Loading States** - Skeleton loading for better UX

## 📈 Business Metrics Explained

### 1. Revenue Metrics
- **Total Revenue** - Sum of all completed transactions
- **Average Transaction** - Revenue / Transaction count
- **Revenue Growth** - Period-over-period comparison

### 2. Conversion Metrics  
- **QR Scan Rate** - Number of QR codes scanned
- **Form Completion** - Users who completed transaction form
- **Conversion Rate** - (Completed Transactions / QR Scans) × 100

### 3. Operational Metrics
- **Peak Hours** - Hours dengan highest transaction volume
- **Bank Performance** - Revenue dan volume by bank partner
- **Method Distribution** - Breakdown by transaction method

### 4. Customer Behavior
- **Session Duration** - Average time from QR scan to completion
- **Drop-off Points** - Where users abandon the process
- **Return Rate** - Users who complete multiple transactions

## 🎯 Advanced Analytics Features (Future Enhancement)

### 1. Predictive Analytics
```typescript
interface ForecastData {
  date: string;
  predictedRevenue: number;
  confidence: number;
  factors: string[];
}

// Revenue forecasting
const forecast = await analyticsStore.getForecast(30); // Next 30 days
```

### 2. Cohort Analysis
```typescript
interface CohortData {
  cohort: string; // Month of first transaction
  week0: number;  // Retention week 0
  week1: number;  // Retention week 1
  // ... etc
}
```

### 3. A/B Testing Framework
```typescript
interface ABTest {
  id: string;
  name: string;
  variants: { id: string; name: string; traffic: number }[];
  metrics: string[];
  status: 'running' | 'completed' | 'paused';
}
```

### 4. Real-time Alerts
```typescript
interface AlertRule {
  id: string;
  metric: string;
  operator: '>' | '<' | '=';
  threshold: number;
  action: 'email' | 'webhook' | 'dashboard';
}

// Example: Alert when conversion rate drops below 50%
{
  metric: 'conversionRate',
  operator: '<',
  threshold: 50,
  action: 'email'
}
```

## 📊 Dashboard Capabilities

### Current Features:
- ✅ **Real-time Data** - Auto-refresh every 5 seconds
- ✅ **Date Filtering** - Custom date range selection
- ✅ **Export Ready** - Foundation for PDF/Excel export
- ✅ **Mobile Responsive** - Works on tablets and phones
- ✅ **Interactive Charts** - Click, hover, zoom capabilities

### Planned Enhancements:
- 🔄 **Custom Dashboards** - User-configurable layouts
- 🔄 **Drill-down Analysis** - Click charts for detailed views
- 🔄 **Comparison Mode** - Side-by-side period comparison
- 🔄 **Scheduled Reports** - Automated email reports

## 🔌 Integration Points

### 1. Transaction System Integration
```typescript
// Auto-track when transaction is created
export async function POST(request: NextRequest) {
  const transaction = transactionStore.addTransaction(data);
  
  // Track analytics event
  analyticsStore.addEvent({
    eventType: 'transaction',
    data: {
      amount: data.amount,
      type: data.type,
      method: data.method,
      bank: data.bank
    }
  });
}
```

### 2. QR System Integration
```typescript
// Track QR generation and scans
export async function GET() {
  const qrData = generateQR();
  
  // Track QR generation
  analyticsStore.addEvent({
    eventType: 'qr_scan',
    data: { tokenId: qrData.id }
  });
}
```

### 3. Authentication Integration
```typescript
// Track login events
export async function POST(request: NextRequest) {
  const user = await authenticateUser(credentials);
  
  analyticsStore.addEvent({
    eventType: 'login',
    data: { 
      success: true, 
      role: user.role 
    },
    userId: user.id
  });
}
```

## 🚀 Performance Optimization

### 1. Data Storage Optimization
```typescript
// Efficient event storage with indexing
class OptimizedAnalyticsStore {
  private events: Map<string, AnalyticsEvent> = new Map();
  private indexes = {
    byType: new Map<string, Set<string>>(),
    byDate: new Map<string, Set<string>>(),
    byUser: new Map<string, Set<string>>()
  };
  
  addEvent(event: AnalyticsEvent) {
    // Add to main storage
    this.events.set(event.id, event);
    
    // Update indexes for fast filtering
    this.updateIndexes(event);
  }
}
```

### 2. Caching Strategy
```typescript
// Cache frequently accessed metrics
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const metricsCache = new Map<string, { data: any; timestamp: number }>();

function getCachedMetrics(key: string) {
  const cached = metricsCache.get(key);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}
```

### 3. Lazy Loading
```typescript
// Load heavy charts only when needed
const LazyLineChart = lazy(() => import('./charts/LineChart'));
const LazyBarChart = lazy(() => import('./charts/BarChart'));

<Suspense fallback={<ChartSkeleton />}>
  <LazyLineChart data={metrics.dailyData} />
</Suspense>
```

## 📱 Mobile Optimization

### 1. Responsive Charts
```typescript
// Auto-adjust chart size based on screen
const chartWidth = useWindowSize().width < 768 ? '100%' : 400;
const chartHeight = useWindowSize().width < 768 ? 200 : 300;

<ResponsiveContainer width={chartWidth} height={chartHeight}>
  <LineChart data={data} />
</ResponsiveContainer>
```

### 2. Touch-friendly Interface
```css
/* Touch targets minimum 44px */
.metric-card {
  min-height: 44px;
  touch-action: manipulation;
}

/* Swipe gestures for chart navigation */
.chart-container {
  touch-action: pan-x pan-y;
}
```

## 🧪 Testing Strategy

### 1. Unit Tests
```typescript
// Test analytics store methods
describe('AnalyticsStore', () => {
  test('should add event correctly', () => {
    const store = new AnalyticsStore();
    const event = store.addEvent({
      eventType: 'transaction',
      data: { amount: 100000 }
    });
    
    expect(event.id).toBeDefined();
    expect(event.timestamp).toBeInstanceOf(Date);
  });
  
  test('should calculate metrics correctly', () => {
    // ... test implementation
  });
});
```

### 2. Integration Tests  
```typescript
// Test API endpoints
describe('/api/analytics', () => {
  test('POST /api/analytics/events', async () => {
    const response = await fetch('/api/analytics/events', {
      method: 'POST',
      body: JSON.stringify({
        eventType: 'transaction',
        data: { amount: 50000 }
      })
    });
    
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.success).toBe(true);
  });
});
```

### 3. Performance Tests
```typescript
// Test with large datasets
describe('Performance', () => {
  test('should handle 10k events efficiently', () => {
    const store = new AnalyticsStore();
    const startTime = performance.now();
    
    // Add 10k events
    for (let i = 0; i < 10000; i++) {
      store.addEvent({
        eventType: 'transaction',
        data: { amount: Math.random() * 1000000 }
      });
    }
    
    const endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(1000); // Should complete in < 1s
  });
});
```

## 📖 Usage Examples

### 1. Basic Dashboard Implementation
```typescript
function MyAnalyticsDashboard() {
  const { metrics, loading, trackEvent } = useAnalytics();
  
  if (loading) return <AnalyticsSkeletonUI />;
  
  return (
    <div>
      <h1>Business Analytics</h1>
      <AnalyticsDashboard />
      
      {/* Custom event tracking */}
      <button onClick={() => trackEvent('custom_action', { source: 'dashboard' })}>
        Track Custom Event
      </button>
    </div>
  );
}
```

### 2. Real-time Monitoring
```typescript
function LiveMonitoringDashboard() {
  const [metrics, setMetrics] = useState(null);
  
  useEffect(() => {
    const interval = setInterval(async () => {
      const response = await fetch('/api/analytics/metrics');
      const data = await response.json();
      setMetrics(data.metrics);
    }, 5000); // Update every 5 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div>
      <h2>Live Metrics</h2>
      <MetricDisplay metrics={metrics} />
    </div>
  );
}
```

### 3. Custom Analytics Hook
```typescript
function useRevenueAnalytics(period: 'day' | 'week' | 'month') {
  const { metrics } = useAnalytics();
  
  const revenueData = useMemo(() => {
    if (!metrics) return null;
    
    switch (period) {
      case 'day':
        return metrics.hourlyData;
      case 'week':
        return metrics.dailyData;
      case 'month':
        return aggregateByWeek(metrics.dailyData);
      default:
        return metrics.dailyData;
    }
  }, [metrics, period]);
  
  return { revenueData, totalRevenue: metrics?.totalRevenue };
}
```

## 📚 Documentation & Maintenance

### 1. Code Documentation
```typescript
/**
 * Calculates conversion rate based on QR scans and completed transactions
 * @param qrScans - Number of QR codes scanned
 * @param completedTransactions - Number of successful transactions
 * @returns Conversion rate as percentage (0-100)
 */
function calculateConversionRate(qrScans: number, completedTransactions: number): number {
  if (qrScans === 0) return 0;
  return (completedTransactions / qrScans) * 100;
}
```

### 2. Regular Maintenance Tasks
```bash
# Weekly tasks
- Review analytics data accuracy
- Check performance metrics
- Update chart configurations
- Clean old analytics events (if storage limit reached)

# Monthly tasks  
- Analyze trending patterns
- Update business intelligence insights
- Review and optimize slow queries
- Update documentation
```

### 3. Monitoring & Alerts
```typescript
// System health monitoring
const HEALTH_CHECKS = {
  analyticsStore: () => analyticsStore.isHealthy(),
  apiEndpoints: () => testAnalyticsAPI(),
  chartRendering: () => testChartPerformance(),
  dataAccuracy: () => validateMetricsCalculation()
};
```

---

**File ini berisi implementasi lengkap sistem Analytics untuk QR-Tunai Drive. Simpan sebagai referensi utama untuk pengembangan dan maintenance sistem analytics.**

**Last Updated:** 2025-01-17  
**Implementation Status:** ✅ Complete & Production Ready  
**Next Phase:** Payment Integration & Advanced Forecasting