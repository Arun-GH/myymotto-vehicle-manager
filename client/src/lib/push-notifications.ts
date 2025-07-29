import { PushNotifications } from '@capacitor/push-notifications';
import { Device } from '@capacitor/device';
import { apiRequest } from './queryClient';

export interface NotificationPayload {
  title: string;
  body: string;
  data?: any;
}

export class PushNotificationService {
  private static instance: PushNotificationService;
  private isInitialized = false;
  private pushToken: string | null = null;

  public static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Check if device supports push notifications
      const deviceInfo = await Device.getInfo();
      if (deviceInfo.platform === 'web') {
        console.log('Push notifications not supported on web platform');
        return;
      }

      // Request permission for push notifications
      const permission = await PushNotifications.requestPermissions();
      
      if (permission.receive === 'granted') {
        // Register for push notifications
        await PushNotifications.register();
        
        // Listen for registration events
        PushNotifications.addListener('registration', async (token) => {
          console.log('Push registration success, token: ' + token.value);
          this.pushToken = token.value;
          
          // Send token to server for subscription management
          await this.registerTokenWithServer(token.value);
        });

        // Listen for registration errors
        PushNotifications.addListener('registrationError', (error) => {
          console.error('Error on registration: ' + JSON.stringify(error));
        });

        // Listen for push notification received
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Push notification received: ', notification);
          this.handleNotificationReceived(notification);
        });

        // Listen for push notification tapped
        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          console.log('Push notification action performed: ', notification);
          this.handleNotificationTapped(notification);
        });

        this.isInitialized = true;
      } else {
        console.log('Push notification permission denied');
      }
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  }

  private async registerTokenWithServer(token: string): Promise<void> {
    try {
      await apiRequest('POST', '/api/push/register-token', {
        token,
        userId: 1, // Current user ID
        platform: 'mobile'
      });
    } catch (error) {
      console.error('Failed to register push token with server:', error);
    }
  }

  private handleNotificationReceived(notification: any): void {
    // Handle notification received while app is in foreground
    const { title, body, data } = notification;
    
    // Show local notification or update UI
    this.showLocalNotification(title, body, data);
  }

  private handleNotificationTapped(notification: any): void {
    // Handle notification tapped (app opened from notification)
    const { data } = notification.notification;
    
    if (data?.type === 'subscription_expiry') {
      // Navigate to account management page
      window.location.href = '/account-management';
    } else if (data?.type === 'subscription_expired') {
      // Navigate to subscription renewal page
      window.location.href = '/account-management';
    }
  }

  private showLocalNotification(title: string, body: string, data?: any): void {
    // Create a visual notification for foreground notifications
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        data
      });

      notification.onclick = () => {
        if (data?.type === 'subscription_expiry' || data?.type === 'subscription_expired') {
          window.location.href = '/account-management';
        }
        notification.close();
      };
    }
  }

  async scheduleLocalNotification(payload: NotificationPayload, delayInMs: number): Promise<void> {
    // Schedule a local notification for testing
    setTimeout(() => {
      this.showLocalNotification(payload.title, payload.body, payload.data);
    }, delayInMs);
  }

  async sendTestNotification(): Promise<void> {
    // Send a test notification for subscription renewal
    const testPayload = {
      title: 'MyyMotto Subscription Reminder',
      body: 'Your premium subscription expires in 30 days. Renew now to continue enjoying all features!',
      data: {
        type: 'subscription_expiry',
        daysUntilExpiry: 30
      }
    };

    // For testing, show immediately
    this.showLocalNotification(testPayload.title, testPayload.body, testPayload.data);
    
    // Also schedule for 5 seconds from now
    this.scheduleLocalNotification(testPayload, 5000);
  }

  getPushToken(): string | null {
    return this.pushToken;
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}

// Subscription renewal notification templates
export const SUBSCRIPTION_NOTIFICATION_TEMPLATES = {
  EXPIRY_30_DAYS: {
    title: 'MyyMotto Subscription Reminder',
    body: 'Your premium subscription expires in 30 days. Renew now to avoid service interruption!',
    data: { type: 'subscription_expiry', daysUntilExpiry: 30 }
  },
  EXPIRY_23_DAYS: {
    title: 'MyyMotto Subscription Alert',
    body: 'Only 23 days left on your premium subscription. Secure your renewal today!',
    data: { type: 'subscription_expiry', daysUntilExpiry: 23 }
  },
  EXPIRY_16_DAYS: {
    title: 'MyyMotto Renewal Urgent',
    body: 'Your subscription expires in 16 days. Don\'t lose access to premium features!',
    data: { type: 'subscription_expiry', daysUntilExpiry: 16 }
  },
  EXPIRY_9_DAYS: {
    title: 'MyyMotto Final Notice',
    body: 'Last chance! Your subscription expires in 9 days. Renew immediately!',
    data: { type: 'subscription_expiry', daysUntilExpiry: 9 }
  },
  EXPIRY_2_DAYS: {
    title: 'MyyMotto Critical Alert',
    body: 'URGENT: Your subscription expires in 2 days! Renew now to avoid service loss.',
    data: { type: 'subscription_expiry', daysUntilExpiry: 2 }
  },
  EXPIRED: {
    title: 'MyyMotto Subscription Expired',
    body: 'Your premium subscription has expired. Renew now to restore full access!',
    data: { type: 'subscription_expired', daysUntilExpiry: 0 }
  }
};

// Export singleton instance
export const pushNotificationService = PushNotificationService.getInstance();