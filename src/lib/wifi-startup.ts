/**
 * WiFi Automation Startup Script
 * Initializes WiFi automation when the application starts
 */

import WiFiScheduler from '@/lib/wifi-scheduler';

// Initialize WiFi automation on app startup
if (typeof window === 'undefined' && process.env.ENABLE_WIFI_AUTOMATION === 'true') {
  console.log('🚀 Initializing WiFi automation...');
  
  // Start scheduler in production or development with explicit flag
  if (process.env.NODE_ENV === 'production' || process.env.START_WIFI_AUTOMATION === 'true') {
    try {
      WiFiScheduler.startAutomation();
      console.log('✅ WiFi automation started successfully');
    } catch (error) {
      console.error('❌ Failed to start WiFi automation:', error);
    }
  } else {
    console.log('ℹ️ WiFi automation is disabled in development mode');
    console.log('   Set START_WIFI_AUTOMATION=true to enable');
  }
}

export { WiFiScheduler };