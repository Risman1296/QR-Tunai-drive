/**
 * WiFi Automation Startup Script
 * Initializes WiFi automation when the application starts
 */

// Initialize WiFi automation on app startup (lazy import to avoid bundling node-cron on edge/Pages)
if (typeof window === 'undefined' && process.env.ENABLE_WIFI_AUTOMATION === 'true') {
  (async () => {
    console.log('?? Initializing WiFi automation...');

    // Start scheduler in production or development with explicit flag
    if (process.env.NODE_ENV === 'production' || process.env.START_WIFI_AUTOMATION === 'true') {
      try {
        const mod = await import('@/lib/wifi-scheduler');
        mod.default.startAutomation();
        console.log('? WiFi automation started successfully');
      } catch (error) {
        console.error('? Failed to start WiFi automation:', error);
      }
    } else {
      console.log('?? WiFi automation is disabled in development mode');
      console.log('   Set START_WIFI_AUTOMATION=true to enable');
    }
  })();
}

export {};

