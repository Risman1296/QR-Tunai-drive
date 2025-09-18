/**
 * Router Status API
 * Monitors Orbit H2 router health and connectivity
 */

import { NextResponse } from 'next/server';
import { OrbitH2Controller } from '@/lib/orbit-h2-controller';

export async function GET() {
  try {
    // Check router status
    const statusCheck = await OrbitH2Controller.checkStatus();
    
    // Get connected devices
    const deviceCheck = await OrbitH2Controller.getConnectedDevices();
    
    // Perform health check
    const healthCheck = await OrbitH2Controller.performHealthCheck();
    
    return NextResponse.json({
      success: true,
      data: {
        router: {
          online: statusCheck.success,
          lastChecked: statusCheck.timestamp,
          responseTime: statusCheck.result?.responseTime || 0,
          error: statusCheck.error
        },
        devices: {
          total: deviceCheck.result?.totalDevices || 0,
          guest: deviceCheck.result?.guestDevices || 0,
          list: deviceCheck.result?.devices || []
        },
        health: {
          healthy: healthCheck.healthy,
          issues: healthCheck.issues,
          actions: healthCheck.actions
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Router status check failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Router status check failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}