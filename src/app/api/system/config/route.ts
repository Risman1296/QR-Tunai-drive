import { NextRequest, NextResponse } from 'next/server'
import {
  SystemConfig,
  getCurrentConfig,
  setCurrentConfig,
  isValidConfig,
  applyConfiguration,
} from '@/lib/system-config'

// Force static export untuk Cloudflare Pages
export const dynamic = 'force-static';
export const revalidate = 0;

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      config: getCurrentConfig(),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error getting system configuration:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get configuration' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const incoming = (await request.json()) as SystemConfig

    if (!isValidConfig(incoming)) {
      return NextResponse.json(
        { success: false, error: 'Invalid configuration data' },
        { status: 400 },
      )
    }

    const updated: SystemConfig = {
      ...getCurrentConfig(),
      ...incoming,
    }

    if (updated.productionMode) {
      updated.demoMode = false
      updated.simulationEnabled = false
      updated.debugMode = false
      updated.logLevel = updated.logLevel === 'debug' ? 'info' : updated.logLevel
    }

    setCurrentConfig(updated)
    await applyConfiguration(updated)

    console.log('System configuration updated:', {
      productionMode: updated.productionMode,
      demoMode: updated.demoMode,
      simulationEnabled: updated.simulationEnabled,
      qrSize: updated.qrSize,
      displayMode: updated.displayMode,
    })

    return NextResponse.json({
      success: true,
      message: 'Configuration updated successfully',
      config: updated,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error updating system configuration:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update configuration' },
      { status: 500 },
    )
  }
}
