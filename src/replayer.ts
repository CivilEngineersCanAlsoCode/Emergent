// 🔹 REPLAYER MODULE
// This file handles replaying recorded actions with human-like delays (R2, R3)
// Think of it as a "robot assistant" that can repeat your job application steps

import { Action, RecordingSession, ReplayConfig } from './types';
import { Storage } from './storage';
import { NotificationManager } from './notification';

/*
 * 🔸 ACTION REPLAYER CLASS
 * This class handles replaying previously recorded user interactions
 * Like a robot that can mimic all the steps you took when applying for a job
 */
export class ActionReplayer {
  // 🔹 REPLAY STATE VARIABLES
  // These keep track of what we're currently replaying and how
  private isReplaying: boolean = false;
  private currentSession: RecordingSession | null = null;
  private currentActionIndex: number = 0;
  private replayConfig: ReplayConfig | null = null;

  /*
   * 🔸 START REPLAY METHOD
   * This method begins replaying a recorded session of actions
   * Like pressing "play" on a video of your job application process
   */
  async startReplay(sessionId: string, config?: Partial<ReplayConfig>): Promise<void> {
    try {
      // 🔹 STEP 1: Check if we're already replaying something
      if (this.isReplaying) {
        throw new Error('Replay is already in progress');
      }

      // 🔹 STEP 2: Load the session we want to replay
      // Like opening the folder with all the recorded steps
      this.currentSession = await Storage.getSession(sessionId);
      if (!this.currentSession) {
        throw new Error(`Session ${sessionId} not found`);
      }

      // 🔹 STEP 3: Set up replay configuration
      // Like choosing the speed and style of replay
      const defaultConfig: ReplayConfig = {
        humanLikeDelays: true,
        minDelay: 500,    // Minimum half-second between actions
        maxDelay: 2000,   // Maximum 2 seconds between actions
        pauseOnCaptcha: true,
        maxRetries: 3,
        showNotifications: true
      };
      this.replayConfig = { ...defaultConfig, ...config };

      // 🔹 STEP 4: Initialize replay state
      this.isReplaying = true;
      this.currentActionIndex = 0;

      // 🔹 STEP 5: Filter actions to only replay common patterns (R2)
      // Only replay actions that appeared in at least 3 different sessions
      const filteredActions = await Storage.getFilteredActions(3);
      const actionsToReplay = this.currentSession.actions.filter(action =>
        filteredActions.some(filtered => 
          filtered.type === action.type && filtered.target === action.target
        )
      );

      // 🔹 STEP 6: Start the replay process
      await NotificationManager.showSuccess(
        `Starting replay of ${actionsToReplay.length} actions`,
        'Replay Started'
      );

      // Begin replaying actions one by one
      await this.executeActionSequence(actionsToReplay);

      /*
       * WHY STARTING REPLAY MATTERS:
       * Non-tech readers: This is like having a robot assistant that can
       * repeat all the same clicks, typing, and scrolling you did before.
       * It only repeats steps that you've done multiple times, so it focuses
       * on the important, repeated parts of job applications.
       * 
       * Future changes: We could add smart adaptation to different job sites
       * or machine learning to improve action selection over time.
       */

    } catch (error) {
      console.error('Failed to start replay:', error);
      await NotificationManager.showError('Failed to start replay', 'Replay Error');
      this.stopReplay();
      throw error;
    }
  }

  /*
   * 🔸 EXECUTE ACTION SEQUENCE METHOD
   * This method performs each recorded action with appropriate delays
   * Like a choreographed dance that follows the recorded steps
   */
  private async executeActionSequence(actions: Action[]): Promise<void> {
    for (let i = 0; i < actions.length && this.isReplaying; i++) {
      const action = actions[i];
      this.currentActionIndex = i;

      try {
        // 🔹 STEP 1: Show progress notification
        await NotificationManager.showStep(
          action.description,
          i + 1,
          actions.length
        );

        // 🔹 STEP 2: Apply human-like delay before action (R3)
        // Like pausing to think before doing something, just like a human would
        if (this.replayConfig?.humanLikeDelays) {
          const delay = this.calculateHumanDelay();
          await NotificationManager.showInfo(`Waiting ${delay}ms...`, 'Thinking...');
          await this.sleep(delay);
        }

        // 🔹 STEP 3: Check for captcha before proceeding (R9)
        if (this.replayConfig?.pauseOnCaptcha && await this.detectCaptcha()) {
          await this.handleCaptcha();
          continue; // Skip this action and wait for user
        }

        // 🔹 STEP 4: Execute the actual action
        await this.executeAction(action);

        // 🔹 STEP 5: Wait for page to respond if needed
        if (action.type === 'click' || action.type === 'navigation') {
          await this.waitForPageStability();
        }

        /*
         * WHY ACTION SEQUENCING MATTERS:
         * Non-tech readers: Just like when you fill out a job application,
         * we need to do things in the right order and wait for the page
         * to respond. This ensures each step completes before moving to the next.
         * 
         * Future changes: We could add intelligent waiting based on page
         * loading indicators or dynamic content detection.
         */

      } catch (error) {
        console.error(`Failed to execute action ${i}:`, error);
        
        // 🔹 RETRY LOGIC: Try the action again if it fails
        if (this.replayConfig && this.replayConfig.maxRetries > 0) {
          await NotificationManager.showWarning(`Retrying action: ${action.description}`);
          this.replayConfig.maxRetries--;
          i--; // Retry the same action
          continue;
        }

        // 🔹 ERROR HANDLING: Show error with context (R8)
        const recentActions = actions.slice(Math.max(0, i - 5), i).map(a => a.description);
        await NotificationManager.showError(
          `Failed to execute: ${action.description}`,
          'Replay Error',
          recentActions
        );
        
        this.stopReplay();
        return;
      }
    }

    // 🔹 COMPLETION: All actions executed successfully
    await NotificationManager.showSuccess('All actions completed successfully!', 'Replay Complete');
    this.stopReplay();
  }

  /*
   * 🔸 EXECUTE ACTION METHOD
   * This method performs a single recorded action on the current page
   * Like following one specific instruction from the recorded steps
   */
  private async executeAction(action: Action): Promise<void> {
    switch (action.type) {
      case 'click':
        await this.executeClick(action);
        break;
      case 'input':
        await this.executeInput(action);
        break;
      case 'keypress':
        await this.executeKeypress(action);
        break;
      case 'scroll':
        await this.executeScroll(action);
        break;
      case 'navigation':
        await this.executeNavigation(action);
        break;
      default:
        console.warn(`Unknown action type: ${action.type}`);
    }
  }

  /*
   * 🔸 EXECUTE CLICK METHOD
   * This method clicks on a specific element on the page
   * Like pointing at something and clicking on it
   */
  private async executeClick(action: Action): Promise<void> {
    // 🔹 STEP 1: Find the element to click
    const element = await this.findElement(action.target);
    if (!element) {
      throw new Error(`Element not found: ${action.target}`);
    }

    // 🔹 STEP 2: Make sure the element is visible and clickable
    // Like making sure you can actually see and reach the button
    if (!this.isElementVisible(element) || !this.isElementClickable(element)) {
      throw new Error(`Element not clickable: ${action.target}`);
    }

    // 🔹 STEP 3: Scroll the element into view if needed
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await this.sleep(500); // Wait for scroll to complete

    // 🔹 STEP 4: Simulate the click
    // We use multiple methods to ensure the click works on different websites
    element.click();
    
    // Also dispatch a mouse event for compatibility
    element.dispatchEvent(new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    }));

    /*
     * WHY CLICKING IS COMPLEX:
     * Non-tech readers: Clicking a button might seem simple, but websites
     * can be finicky. We need to make sure the button is visible, reachable,
     * and actually responds to clicks. Some sites need special types of clicks.
     * 
     * Future changes: We could add visual feedback, hover effects, or
     * smart retry logic for stubborn elements.
     */
  }

  /*
   * 🔸 EXECUTE INPUT METHOD
   * This method types text into form fields
   * Like filling out a form field with the recorded text
   */
  private async executeInput(action: Action): Promise<void> {
    // 🔹 STEP 1: Find the input field
    const element = await this.findElement(action.target) as HTMLInputElement;
    if (!element) {
      throw new Error(`Input element not found: ${action.target}`);
    }

    // 🔹 STEP 2: Clear existing content
    element.value = '';
    element.focus();

    // 🔹 STEP 3: Type the text character by character (more human-like)
    const text = action.data?.value || '';
    for (let i = 0; i < text.length; i++) {
      element.value += text[i];
      
      // Trigger input events so the website knows text was entered
      element.dispatchEvent(new Event('input', { bubbles: true }));
      
      // Small delay between characters to simulate human typing
      await this.sleep(Math.random() * 100 + 50); // 50-150ms per character
    }

    // 🔹 STEP 4: Trigger change event to notify the website
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /*
   * 🔸 CALCULATE HUMAN DELAY METHOD (R3)
   * This method creates realistic delays between actions
   * Like simulating the natural pauses humans take while working
   */
  private calculateHumanDelay(): number {
    if (!this.replayConfig) return 1000;

    // 🔹 STEP 1: Get base delay range from configuration
    const min = this.replayConfig.minDelay;
    const max = this.replayConfig.maxDelay;

    // 🔹 STEP 2: Create random delay within range
    // Like how humans don't do everything at exactly the same speed
    const baseDelay = Math.random() * (max - min) + min;

    // 🔹 STEP 3: Add some randomness to make it more natural
    // Sometimes humans pause longer, sometimes shorter
    const randomFactor = 0.8 + Math.random() * 0.4; // 80% to 120% of base delay
    
    return Math.round(baseDelay * randomFactor);

    /*
     * WHY HUMAN-LIKE DELAYS MATTER:
     * Non-tech readers: Real humans don't click buttons instantly one after
     * another. We pause to read, think, and move our mouse. These delays
     * make the automation look more natural and less like a robot.
     * 
     * Future changes: We could read delay preferences from an Excel file
     * as mentioned in the requirements, or learn from user's natural timing.
     */
  }

  /*
   * 🔸 DETECT CAPTCHA METHOD (R9)
   * This method checks if there's a captcha on the current page
   * Like looking around to see if there's a puzzle to solve
   */
  private async detectCaptcha(): Promise<boolean> {
    // 🔹 Common captcha indicators
    const captchaSelectors = [
      'iframe[src*="recaptcha"]',
      '.g-recaptcha',
      '#captcha',
      '.captcha',
      'img[alt*="captcha"]',
      'img[src*="captcha"]',
      '[data-sitekey]',
      '.hcaptcha',
      '.cf-turnstile'
    ];

    // 🔹 Check if any captcha elements are present and visible
    for (const selector of captchaSelectors) {
      const element = document.querySelector(selector);
      if (element && this.isElementVisible(element as HTMLElement)) {
        return true;
      }
    }

    return false;
  }

  /*
   * 🔸 HANDLE CAPTCHA METHOD
   * This method pauses replay when a captcha is detected
   * Like asking a human for help when encountering a puzzle
   */
  private async handleCaptcha(): Promise<void> {
    // 🔹 STEP 1: Pause the replay
    this.isReplaying = false;

    // 🔹 STEP 2: Notify user about captcha
    await NotificationManager.showCaptchaDetected();

    // 🔹 STEP 3: Wait for user to solve captcha
    // We'll implement a resume mechanism in the popup interface
    console.log('Captcha detected - replay paused. Please solve captcha and resume manually.');
  }

  /*
   * 🔸 HELPER METHODS
   * These methods provide utility functions for element interaction
   */

  // Find an element using various strategies
  private async findElement(selector: string): Promise<HTMLElement | null> {
    // Try direct selection first
    let element = document.querySelector(selector) as HTMLElement;
    if (element) return element;

    // Try waiting a bit and looking again (elements might load dynamically)
    await this.sleep(1000);
    element = document.querySelector(selector) as HTMLElement;
    if (element) return element;

    // Try alternative selectors if the original doesn't work
    const alternatives = this.generateAlternativeSelectors(selector);
    for (const altSelector of alternatives) {
      element = document.querySelector(altSelector) as HTMLElement;
      if (element) return element;
    }

    return null;
  }

  // Check if an element is currently visible on the page
  private isElementVisible(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && 
           rect.top < window.innerHeight && rect.bottom > 0;
  }

  // Check if an element can be clicked (not disabled or hidden)
  private isElementClickable(element: HTMLElement): boolean {
    return !element.hasAttribute('disabled') && 
           element.style.display !== 'none' &&
           element.style.visibility !== 'hidden';
  }

  // Wait for the page to be stable after an action
  private async waitForPageStability(): Promise<void> {
    return new Promise((resolve) => {
      let stabilityTimer: NodeJS.Timeout;
      
      const checkStability = () => {
        clearTimeout(stabilityTimer);
        stabilityTimer = setTimeout(() => {
          resolve();
        }, 1000); // Wait 1 second of stability
      };

      // Listen for page changes
      const observer = new MutationObserver(checkStability);
      observer.observe(document.body, { childList: true, subtree: true });
      
      // Initial stability check
      checkStability();
      
      // Cleanup after maximum wait time
      setTimeout(() => {
        observer.disconnect();
        clearTimeout(stabilityTimer);
        resolve();
      }, 10000); // Max 10 seconds wait
    });
  }

  // Generate alternative CSS selectors if the primary one fails
  private generateAlternativeSelectors(selector: string): string[] {
    const alternatives: string[] = [];
    
    // If it's an ID selector, try without the ID
    if (selector.startsWith('#')) {
      const id = selector.substring(1);
      alternatives.push(`[id="${id}"]`);
      alternatives.push(`*[id*="${id}"]`);
    }
    
    // If it's a class selector, try variations
    if (selector.startsWith('.')) {
      const className = selector.substring(1);
      alternatives.push(`[class*="${className}"]`);
      alternatives.push(`*[class="${className}"]`);
    }
    
    return alternatives;
  }

  // Sleep utility function
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /*
   * 🔸 CONTROL METHODS
   * These methods allow external control of the replay process
   */

  // Stop the current replay
  stopReplay(): void {
    this.isReplaying = false;
    this.currentSession = null;
    this.currentActionIndex = 0;
    this.replayConfig = null;
  }

  // Resume a paused replay (useful after captcha solving)
  resumeReplay(): void {
    if (this.currentSession && !this.isReplaying) {
      this.isReplaying = true;
      // Continue from where we left off
    }
  }

  // Check if replay is currently running
  isCurrentlyReplaying(): boolean {
    return this.isReplaying;
  }

  // Get current progress information
  getReplayProgress(): { current: number; total: number; action?: string } {
    if (!this.currentSession) {
      return { current: 0, total: 0 };
    }
    
    return {
      current: this.currentActionIndex + 1,
      total: this.currentSession.actions.length,
      action: this.currentSession.actions[this.currentActionIndex]?.description
    };
  }

  // Execute remaining methods for other action types
  private async executeKeypress(action: Action): Promise<void> {
    const key = action.data?.key;
    if (key) {
      document.dispatchEvent(new KeyboardEvent('keydown', { key }));
    }
  }

  private async executeScroll(action: Action): Promise<void> {
    if (action.data?.scrollX !== undefined && action.data?.scrollY !== undefined) {
      window.scrollTo(action.data.scrollX, action.data.scrollY);
    }
  }

  private async executeNavigation(action: Action): Promise<void> {
    if (action.data?.url && action.data.url !== window.location.href) {
      window.location.href = action.data.url;
    }
  }
}

/*
 * WHY THIS REPLAYER MODULE MATTERS:
 * Non-tech readers: This module is like having a very precise robot assistant
 * that can perfectly repeat every step of your job application process.
 * It's smart enough to wait for pages to load, handle errors, and even
 * pause when it encounters security puzzles (captchas).
 * 
 * Future changes: We could add machine learning to adapt to different
 * job sites, voice narration of actions, or integration with job boards' APIs.
 */

// 🔹 EXPORT SINGLETON INSTANCE
export const replayer = new ActionReplayer();