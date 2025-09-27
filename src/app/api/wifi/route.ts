/**
 * WiFi Management API Routes
 * Handles WiFi credentials, router status, and automation
 */

import { NextRequest, NextResponse } from 'next/server';
import { WiFiManager } from '@/lib/wifi-manager';
import { OrbitH2Controller } from '@/lib/orbit-h2-controller';

/**
 * GET /api/wifi/credentials - Get current WiFi credentials
 */
export async function GET() {
  try {
    const credentials = WiFiManager.getCurrentCredentials();
    const formattedCredentials = WiFiManager.formatCredentialsForDisplay(credentials);
    
    return NextResponse.json({
      success: true,
      data: {
        credentials: formattedCredentials,
        raw: credentials,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Failed to get WiFi credentials:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get WiFi credentials',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/wifi/update-password - Update router password
 */
export async function POST(request: NextRequest) {
  try {
    const { password, force } = await request.json();
    
    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      );
    }

    // Update router password
    const result = await OrbitH2Controller.updateGuestPassword(password);
    
    if (result.success || force) {
      // Log the successful update
      console.log(`WiFi password updated to: ${password}`);
      
      return NextResponse.json({
        success: true,
        data: {
          password,
          updatedAt: new Date().toISOString(),
          method: result.result?.method || 'manual',
          routerResponse: result
        }
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update router password',
          details: result.error,
          suggestion: 'Try manual update or check router connectivity'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('WiFi password update failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Password update failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}