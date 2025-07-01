// 🔹 NOTIFICATION MODULE
// This file handles showing popup notifications to users (R4)
// Think of it as the "messenger" that tells users what the extension is doing

import { NotificationData } from './types';

/*
 * 🔸 NOTIFICATION MANAGER CLASS
 * This class handles all notification operations for the extension
 * Like a personal assistant who gives you updates on what's happening
 */
export class NotificationManager {
  // 🔹 NOTIFICATION COUNTER
  // This keeps track of how many notifications we've created
  // Like a receipt number system for notifications
  private static notificationCounter = 0;

  /*
   * 🔸 SHOW INFO NOTIFICATION METHOD
   * This method displays a regular informational message (R4)
   * Like a gentle tap on the shoulder to tell you something
   */
  static async showInfo(message: string, title: string = 'AutoApply'): Promise<void> {
    // 🔹 STEP 1: Create notification data with info styling
    const notificationData: NotificationData = {
      id: this.generateId(),
      title: `🤖 ${title}`,
      message: message,
      type: 'info',
      duration: 1000, // Show for 1 second as required (R4)
      iconUrl: 'icons/icon48.png',
      silent: true // Don't make noise to avoid disturbing user
    };

    // 🔹 STEP 2: Display the notification
    await this.displayNotification(notificationData);
    
    /*
     * WHY THIS MATTERS:
     * Non-tech readers: Every time the extension does something important
     * (like clicking a button or filling a form), you'll see a small
     * message appear briefly to confirm it worked.
     * 
     * Future changes: We could add sound effects, different colors,
     * or longer messages for more complex actions.
     */
  }

  /*
   * 🔸 SHOW SUCCESS NOTIFICATION METHOD
   * This method displays a success message with green styling
   * Like a congratulations message when something goes well
   */
  static async showSuccess(message: string, title: string = 'Success!'): Promise<void> {
    const notificationData: NotificationData = {
      id: this.generateId(),
      title: `✅ ${title}`,
      message: message,
      type: 'success',
      duration: 1000,
      iconUrl: 'icons/icon48.png',
      silent: true
    };

    await this.displayNotification(notificationData);
  }

  /*
   * 🔸 SHOW WARNING NOTIFICATION METHOD
   * This method displays a warning message with yellow styling
   * Like a caution sign when something might need attention
   */
  static async showWarning(message: string, title: string = 'Warning'): Promise<void> {
    const notificationData: NotificationData = {
      id: this.generateId(),
      title: `⚠️ ${title}`,
      message: message,
      type: 'warning',
      duration: 3000, // Show warnings a bit longer
      iconUrl: 'icons/icon48.png',
      silent: true
    };

    await this.displayNotification(notificationData);
  }

  /*
   * 🔸 SHOW ERROR NOTIFICATION METHOD (R8)
   * This method displays error messages with red styling
   * Like an alert when something goes wrong and needs fixing
   */
  static async showError(message: string, title: string = 'Error', context?: string[]): Promise<void> {
    // 🔹 STEP 1: Create detailed error message
    let fullMessage = message;
    if (context && context.length > 0) {
      // Add context information (last 5 steps as required by R8)
      fullMessage += `\n\nLast actions: ${context.slice(-5).join(' → ')}`;
    }

    const notificationData: NotificationData = {
      id: this.generateId(),
      title: `❌ ${title}`,
      message: fullMessage,
      type: 'error',
      duration: 5000, // Show errors longer so user can read them
      iconUrl: 'icons/icon48.png',
      silent: false // Errors should make a sound to get attention
    };

    await this.displayNotification(notificationData);
    
    /*
     * WHY ERROR NOTIFICATIONS MATTER:
     * Non-tech readers: When something goes wrong (like a button not
     * being found), you'll get a detailed message explaining what
     * happened and what steps led to the problem.
     * 
     * Future changes: We could add "retry" buttons or automatic
     * error recovery suggestions.
     */
  }

  /*
   * 🔸 SHOW CAPTCHA NOTIFICATION METHOD (R9)
   * This method displays a special notification when captcha is detected
   * Like a pause button that asks you to solve a puzzle
   */
  static async showCaptchaDetected(): Promise<void> {
    const notificationData: NotificationData = {
      id: this.generateId(),
      title: '🔐 Captcha Detected',
      message: 'Please solve the captcha and click the extension to continue',
      type: 'warning',
      duration: 10000, // Show longer since user needs to take action
      iconUrl: 'icons/icon48.png',
      silent: false // Make sound to get user's attention
    };

    await this.displayNotification(notificationData);
  }

  /*
   * 🔸 SHOW STEP NOTIFICATION METHOD
   * This method displays notifications for each recorded/replayed step
   * Like a running commentary of what the extension is doing
   */
  static async showStep(stepDescription: string, stepNumber: number, totalSteps: number): Promise<void> {
    const notificationData: NotificationData = {
      id: this.generateId(),
      title: `Step ${stepNumber}/${totalSteps}`,
      message: stepDescription,
      type: 'info',
      duration: 1000,
      iconUrl: 'icons/icon48.png',
      silent: true
    };

    await this.displayNotification(notificationData);
  }

  /*
   * 🔸 PRIVATE HELPER METHODS
   * These methods handle the technical details of showing notifications
   */
  
  // Display notification using Chrome's notification API
  private static async displayNotification(data: NotificationData): Promise<void> {
    try {
      // 🔹 STEP 1: Create the notification using Chrome's API
      // This is like asking Chrome to show a popup message
      await chrome.notifications.create(data.id, {
        type: 'basic',
        iconUrl: data.iconUrl || 'icons/icon48.png',
        title: data.title,
        message: data.message,
        silent: data.silent
      });

      // 🔹 STEP 2: Set up automatic dismissal
      // Like setting a timer to automatically close the message
      setTimeout(() => {
        chrome.notifications.clear(data.id);
      }, data.duration);
      
    } catch (error) {
      // 🔸 FALLBACK: If Chrome notifications fail, log to console
      console.error('Failed to show notification:', error);
      console.log(`${data.title}: ${data.message}`);
    }
  }
  
  // Generate unique ID for each notification
  private static generateId(): string {
    return `autoapply-notification-${++this.notificationCounter}-${Date.now()}`;
  }

  /*
   * 🔸 CLEAR ALL NOTIFICATIONS METHOD
   * This method removes all active notifications
   * Like clearing all messages from your notification area
   */
  static async clearAll(): Promise<void> {
    try {
      // Get all active notifications and clear them
      const notifications = await chrome.notifications.getAll();
      for (const id in notifications) {
        if (id.startsWith('autoapply-notification-')) {
          await chrome.notifications.clear(id);
        }
      }
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  }
}

/*
 * WHY THIS NOTIFICATION MODULE MATTERS:
 * Non-tech readers: This module ensures you always know what the
 * extension is doing. It's like having a helpful assistant who
 * narrates every action and alerts you to important events.
 * 
 * Future changes: We could add notification preferences, different
 * notification styles, or integration with system notifications.
 */