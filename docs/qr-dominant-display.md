# QR Dominant Display - Landscape Mode

## 🎯 **Tampilan Barcode Dominan - Layout Landscape**

Tampilan QR code yang dioptimalkan untuk **monitor/TV besar** dengan layout **landscape** dan **QR code dominan** berukuran **400x400px**.

### ✅ **Fitur Utama:**

## **🖥️ LAYOUT LANDSCAPE OPTIMIZED**

### **3-Column Grid Layout:**
```
[Bank Info]    [DOMINANT QR]    [Instructions]
   Left            Center            Right
```

### **1. Left Column - Bank Information**
- **Logo Bank Terdepan** (24x24 px) dalam container putih
- **Judul**: BANK TERDEPAN + subtitle
- **Service Status Indicators**:
  - 🟢 WiFi Connected (animated pulse)
  - 🟢 System Secure (animated pulse) 
  - 🟢 Service Active (animated pulse)
- **Access Counter**: Display akses pelanggan dengan format 02, 03, dst
- **Statistics**: Total akses + timestamp terakhir

### **2. Center Column - Dominant QR Code**
- **QR Code Size**: **400x400px** (Super Besar!)
- **Container**: White background dengan padding 48-64px
- **Logo Overlay**: Bank Terdepan logo di tengah QR (20x20px)
- **Status Overlay**: Green "SEDANG DIPROSES" ketika diakses
- **Status Badge**: "SCAN QR CODE" / "Pelanggan Mengakses Form"
- **Animations**: Scale + opacity transitions

### **3. Right Column - Instructions & Actions**
- **Step-by-step Instructions** (1-3 dengan numbered badges)
- **QR Info Panel**: Status, ID, Size informasi
- **Action Button**: "QR Baru" untuk manual refresh
- **Right-aligned text** untuk balance

## **📱 RESPONSIVE FEATURES:**

### **Desktop/TV (Landscape):**
- 3-column grid layout
- QR 400x400px dominan di tengah
- Full landscape optimization
- Text left/right aligned for balance

### **Mobile/Tablet (Portrait):**  
- Single column stacked layout
- QR tetap 400x400px (tapi centered)
- All content centered for mobile

## **🎨 VISUAL DESIGN:**

### **Color Scheme:**
- **Background**: Blue gradient (from-blue-900 via-blue-800 to-blue-900)
- **QR Container**: Pure white dengan shadow-2xl
- **Status Active**: Green-500 overlay
- **Status Ready**: Blue-500 badge
- **Text**: White dengan blue-200/blue-300 variants

### **Typography:**
- **Headings**: 3xl-4xl font-bold (responsive)
- **Body**: lg-xl responsive text
- **Counter**: 5xl-6xl mono font untuk emphasis
- **Monospace**: Transaction IDs untuk technical feel

### **Animations:**
- **Pulse**: Service status indicators
- **Scale Transitions**: QR container saat accessed
- **Spin**: Refresh button loading state
- **Smooth**: All transitions 300-500ms

## **🔧 TECHNICAL SPECS:**

### **QR Code:**
```typescript
<QRCodeSVG
  value={qrValue}
  size={400}        // Super large size
  bgColor="transparent"
  fgColor="#1e40af"  // Blue-600
  level="H"         // High error correction
  includeMargin={true}
  className="drop-shadow-2xl"
/>
```

### **Container:**
```css
.qr-container {
  padding: 48px-64px;   /* Large padding */
  background: white;
  border-radius: 24px;  /* Rounded-3xl */
  box-shadow: 2xl;      /* Heavy shadow */
  transform-scale: 0.95-1.0; /* Animation */
}
```

### **Grid Layout:**
```css
.landscape-grid {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr; /* Left-Center-Right */
  gap: 32px-48px;  /* Large gaps */
  align-items: center;
  min-height: 80vh; /* Near full height */
}
```

## **⚙️ PROPS & CONFIGURATION:**

### **Component Props:**
```typescript
interface QRDominantDisplayProps {
  qrValue: string;           // QR code URL
  onRefresh?: () => void;    // Manual refresh callback
  onQRAccessed?: () => void; // Access event callback  
  isQRAccessed?: boolean;    // Current access status
  transactionId?: string;    // For monitoring
  onSettingsClick?: () => void; // Settings callback
}
```

### **Features:**
- ✅ **Event-driven refresh** (bukan time-based)
- ✅ **Real-time access monitoring** (2-second interval)
- ✅ **Auto-refresh after access** (5-second delay)
- ✅ **Professional branding** (Bank Terdepan)
- ✅ **Responsive design** (landscape optimized)
- ✅ **Visual feedback** (animations + status)

## **📍 USAGE:**

### **Default Mode:**
```typescript
// QR Dominant adalah default mode di /qr-display
<QRDominantDisplay
  qrValue="http://localhost:3000/t/abc123/form"
  onRefresh={handleRefresh}
  onQRAccessed={handleAccessed}
  transactionId="abc123"
  onSettingsClick={() => goToDashboard()}
/>
```

### **Access URLs:**
- **Dashboard**: `http://localhost:3000/qr-display` (default to dominant)
- **Direct Dominant**: Click "QR Dominan (Landscape)" button
- **Classic Mode**: Click "Mode Klasik" untuk vertical layout

## **🎯 USE CASES:**

### **🚗 Drive-Thru Banking:**
- Monitor/TV horizontal (landscape) mounting
- Customer di mobil dapat scan QR dengan mudah
- Jarak pandang optimal untuk QR size 400px
- Status real-time untuk operator

### **🏢 Branch Display:**
- Wall-mounted horizontal displays
- Lobby area dengan TV landscape
- Counter display untuk teller
- Public area QR sharing

### **📺 Large Screen Optimization:**
- 32"+ monitors/TVs
- 1920x1080+ resolution optimal
- Landscape orientation preferred
- High contrast untuk outdoor visibility

## **🔄 WORKFLOW:**

### **1. Initial Display:**
```
[Bank Logo] + [LARGE QR 400px] + [Instructions]
Status: "SCAN QR CODE" (Blue)
Counter: "00 - Menunggu Scan"
```

### **2. Customer Scans:**
```  
[Service Status] + [QR + Green Overlay] + [QR Info]
Status: "Pelanggan Mengakses Form" (Green)
Counter: "01 - Total Akses"
```

### **3. Auto Refresh:**
```
After 5 seconds → New QR generated
Counter reset → Back to waiting state
Event-driven cycle repeats
```

## **📊 COMPARISON:**

### **QR Dominant vs Classic:**

| Feature | QR Dominant | Classic |
|---------|-------------|---------|
| **QR Size** | 400x400px | 280x280px |
| **Layout** | Landscape (3-col) | Portrait (single) |
| **Target** | TV/Monitor | Mobile/Desktop |
| **Info Density** | High (split columns) | Medium (stacked) |
| **Use Case** | Drive-thru/Branch | General purpose |

### **Benefits QR Dominant:**
- ✅ **Larger QR** = easier scanning from distance
- ✅ **Landscape** = optimal for mounted displays  
- ✅ **More info** = comprehensive status display
- ✅ **Professional** = banking-grade appearance
- ✅ **Engaging** = better customer experience

## **🎉 RESULT:**

**Tampilan barcode yang benar-benar dominan dengan layout landscape yang optimal untuk monitor/TV besar di drive-thru Bank Terdepan!** 

QR Code **400x400px** menjadi focal point utama dengan informasi lengkap di kiri-kanan, memberikan pengalaman visual yang profesional dan user-friendly untuk customer dan operator. 🏆