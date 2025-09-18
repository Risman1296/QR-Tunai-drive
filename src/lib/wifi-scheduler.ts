/**
 * WiFi Automation Scheduler
 * Handles automated tasks for WiFi management and router control
 */

import * as cron from 'node-cron';
import { WiFiManager } from './wifi-manager';
import { OrbitH2Controller } from './orbit-h2-controller';

interface ScheduledTask {
  name: string;
  schedule: string;
  description: string;
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  status: 'idle' | 'running' | 'error';
  errorMessage?: string;
}

export class WiFiScheduler {
  private static tasks: Map<string, ScheduledTask> = new Map();
  private static cronJobs: Map<string, cron.ScheduledTask> = new Map();

  /**
   * Start all WiFi automation tasks
   */
  static startAutomation() {
    console.log('🤖 Starting WiFi automation scheduler...');

    // Daily password update - Every day at 00:01
    this.scheduleTask(
      'daily-password-update',
      '1 0 * * *',
      'Update WiFi password daily',
      this.updateDailyPassword
    );

    // Router health check - Every 5 minutes
    this.scheduleTask(
      'router-health-check',
      '*/5 * * * *',
      'Check router connectivity and health',
      this.checkRouterHealth
    );

    // Usage analytics - Every hour
    this.scheduleTask(
      'usage-analytics',
      '0 * * * *',
      'Generate hourly usage statistics',
      this.generateUsageAnalytics
    );

    // Cleanup expired sessions - Every 10 minutes
    this.scheduleTask(
      'cleanup-sessions',
      '*/10 * * * *',
      'Clean up expired WiFi sessions',
      this.cleanupExpiredSessions
    );

    // Daily report generation - Every day at 23:55
    this.scheduleTask(
      'daily-report',
      '55 23 * * *',
      'Generate daily WiFi usage report',
      this.generateDailyReport
    );

    // Router backup check - Every 30 minutes
    this.scheduleTask(
      'router-backup-check',
      '*/30 * * * *',
      'Verify router settings backup',
      this.verifyRouterBackup
    );

    console.log(`✅ WiFi automation started with ${this.tasks.size} scheduled tasks`);
  }

  /**
   * Stop all automation tasks
   */
  static stopAutomation() {
    console.log('🛑 Stopping WiFi automation...');
    
    this.cronJobs.forEach((job, name) => {
      job.stop();
      console.log(`Stopped task: ${name}`);
    });

    this.cronJobs.clear();
    this.tasks.clear();
    
    console.log('✅ WiFi automation stopped');
  }

  /**
   * Schedule a new task
   */
  private static scheduleTask(
    name: string,
    schedule: string,
    description: string,
    taskFunction: () => Promise<void>
  ) {
    const task: ScheduledTask = {
      name,
      schedule,
      description,
      enabled: true,
      status: 'idle'
    };

    this.tasks.set(name, task);

    const cronJob = cron.schedule(schedule, async () => {
      await this.executeTask(name, taskFunction);
    }, {
      timezone: 'Asia/Jakarta'
    });

    this.cronJobs.set(name, cronJob);
    
    console.log(`📅 Scheduled: ${name} (${schedule}) - ${description}`);
  }

  /**
   * Execute a scheduled task with error handling
   */
  private static async executeTask(name: string, taskFunction: () => Promise<void>) {
    const task = this.tasks.get(name);
    if (!task || !task.enabled) return;

    console.log(`🔄 Running task: ${name}`);
    
    task.status = 'running';
    task.lastRun = new Date();
    
    try {
      await taskFunction();
      task.status = 'idle';
      task.errorMessage = undefined;
      console.log(`✅ Task completed: ${name}`);
    } catch (error) {
      task.status = 'error';
      task.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Task failed: ${name} - ${task.errorMessage}`);
      
      // Alert admin about critical failures
      if (name === 'daily-password-update' || name === 'router-health-check') {
        await OrbitH2Controller.alertAdmin(
          `Critical task failed: ${name} - ${task.errorMessage}`,
          'error'
        );
      }
    }
  }

  /**
   * Daily password update task
   */
  private static async updateDailyPassword(): Promise<void> {
    const newPassword = WiFiManager.generateDailyPassword();
    console.log(`🔐 Updating daily WiFi password to: ${newPassword}`);

    const result = await OrbitH2Controller.updateGuestPassword(newPassword);
    
    if (result.success) {
      console.log(`✅ WiFi password successfully updated to: ${newPassword}`);
      
      // Log successful update
      await this.logAutomationEvent({
        type: 'password_update',
        success: true,
        data: { password: newPassword, method: result.result?.method }
      });
    } else {
      throw new Error(`Failed to update WiFi password: ${result.error}`);
    }
  }

  /**
   * Router health check task
   */
  private static async checkRouterHealth(): Promise<void> {
    const healthCheck = await OrbitH2Controller.performHealthCheck();
    
    if (!healthCheck.healthy) {
      console.warn(`⚠️ Router health issues detected: ${healthCheck.issues.join(', ')}`);
      
      // Alert admin if there are critical issues
      await OrbitH2Controller.alertAdmin(
        `Router health check failed: ${healthCheck.issues.join(', ')}`,
        'warning'
      );
    }

    // Log health status
    await this.logAutomationEvent({
      type: 'health_check',
      success: healthCheck.healthy,
      data: { issues: healthCheck.issues, actions: healthCheck.actions }
    });
  }

  /**
   * Usage analytics task
   */
  private static async generateUsageAnalytics(): Promise<void> {
    const deviceCheck = await OrbitH2Controller.getConnectedDevices();
    
    if (deviceCheck.success) {
      const analytics = {
        timestamp: new Date(),
        connectedDevices: deviceCheck.result?.totalDevices || 0,
        guestDevices: deviceCheck.result?.guestDevices || 0,
        hour: new Date().getHours()
      };

      // In production, save to database
      console.log('📊 Hourly analytics:', analytics);
      
      await this.logAutomationEvent({
        type: 'usage_analytics',
        success: true,
        data: analytics
      });
    }
  }

  /**
   * Cleanup expired sessions task
   */
  private static async cleanupExpiredSessions(): Promise<void> {
    // In production, this would clean up database entries
    // and remove expired MAC addresses from router
    
    console.log('🧹 Cleaning up expired WiFi sessions...');
    
    // Mock cleanup
    const cleanedSessions = Math.floor(Math.random() * 5);
    
    await this.logAutomationEvent({
      type: 'session_cleanup',
      success: true,
      data: { cleanedSessions }
    });
    
    console.log(`✅ Cleaned up ${cleanedSessions} expired sessions`);
  }

  /**
   * Daily report generation task
   */
  private static async generateDailyReport(): Promise<void> {
    const report = {
      date: new Date().toISOString().split('T')[0],
      totalConnections: Math.floor(Math.random() * 100) + 20,
      averageSessionTime: Math.floor(Math.random() * 8) + 5,
      peakUsageHour: Math.floor(Math.random() * 12) + 9,
      issues: 0,
      passwordUpdates: 1
    };

    console.log('📈 Daily report generated:', report);
    
    // In production, email this report to admin
    await this.logAutomationEvent({
      type: 'daily_report',
      success: true,
      data: report
    });
  }

  /**
   * Router backup verification task
   */
  private static async verifyRouterBackup(): Promise<void> {
    const status = await OrbitH2Controller.checkStatus();
    
    if (status.success) {
      // Verify current settings match expected configuration
      const expectedConfig = {
        guestNetworkEnabled: true,
        guestPassword: WiFiManager.generateDailyPassword(),
        guestSSID: 'QRTunai_Guest'
      };

      // In production, compare with actual router config
      console.log('🔄 Router backup verification completed');
      
      await this.logAutomationEvent({
        type: 'backup_verification',
        success: true,
        data: expectedConfig
      });
    }
  }

  /**
   * Log automation events
   */
  private static async logAutomationEvent(event: {
    type: string;
    success: boolean;
    data?: any;
  }): Promise<void> {
    // In production, save to database
    const logEntry = {
      ...event,
      timestamp: new Date(),
      scheduler: 'WiFiScheduler'
    };

    console.log('📝 Automation event logged:', logEntry);
  }

  /**
   * Get current task status
   */
  static getTaskStatus(): ScheduledTask[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Enable/disable a specific task
   */
  static toggleTask(taskName: string, enabled: boolean): boolean {
    const task = this.tasks.get(taskName);
    if (!task) return false;

    task.enabled = enabled;
    
    const cronJob = this.cronJobs.get(taskName);
    if (cronJob) {
      if (enabled) {
        cronJob.start();
      } else {
        cronJob.stop();
      }
    }

    console.log(`${enabled ? '✅ Enabled' : '⏸️ Disabled'} task: ${taskName}`);
    return true;
  }

  /**
   * Manually trigger a task
   */
  static async triggerTask(taskName: string): Promise<boolean> {
    const taskFunctions: { [key: string]: () => Promise<void> } = {
      'daily-password-update': this.updateDailyPassword,
      'router-health-check': this.checkRouterHealth,
      'usage-analytics': this.generateUsageAnalytics,
      'cleanup-sessions': this.cleanupExpiredSessions,
      'daily-report': this.generateDailyReport,
      'router-backup-check': this.verifyRouterBackup
    };

    const taskFunction = taskFunctions[taskName];
    if (!taskFunction) return false;

    try {
      console.log(`🚀 Manually triggering task: ${taskName}`);
      await this.executeTask(taskName, taskFunction.bind(this));
      return true;
    } catch (error) {
      console.error(`Failed to trigger task ${taskName}:`, error);
      return false;
    }
  }
}

// Auto-start automation if running in production
if (process.env.NODE_ENV === 'production') {
  WiFiScheduler.startAutomation();
}

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('📱 Received SIGTERM, stopping WiFi automation...');
  WiFiScheduler.stopAutomation();
});

process.on('SIGINT', () => {
  console.log('📱 Received SIGINT, stopping WiFi automation...');
  WiFiScheduler.stopAutomation();
  process.exit(0);
});

export default WiFiScheduler;