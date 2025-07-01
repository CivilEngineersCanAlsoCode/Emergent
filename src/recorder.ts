// 🔹 RECORDER MODULE
// This file captures user interactions on job websites (R1)
// Think of it as a "video camera" that records everything you do on job sites

import { Action, RecordingSession } from './types';
import { Storage } from './storage';
import { NotificationManager } from './notification';

/*
 * 🔸 ACTION RECORDER CLASS
 * This class handles recording all user interactions during job applications
 * Like a personal assistant who writes down every step you take
 */
export class ActionRecorder {
  // 🔹 RECORDING STATE VARIABLES
  // These keep track of whether we're currently recording and what session we're in
  private isRecording: boolean = false;
  private currentSessionId: string | null = null;
  private actionCounter: number = 0;

  // 🔹 EVENT LISTENERS STORAGE
  // We store references to our event listeners so we can remove them later
  // Like keeping track of all the "ears" we've placed around the webpage
  private eventListeners: Array<{ element: Element | Document; event: string; handler: EventListener }> = [];

  /*
   * 🔸 START RECORDING METHOD
   * This method begins capturing user actions on the current webpage
   * Like pressing the "record" button on a video camera
   */
  async startRecording(): Promise<string> {
    try {
      // 🔹 STEP 1: Check if we're already recording
      if (this.isRecording) {
        throw new Error('Recording is already in progress');
      }

      // 🔹 STEP 2: Generate a unique session ID
      // Like creating a new folder for this job application's recording
      this.currentSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 🔹 STEP 3: Set recording flag to true
      this.isRecording = true;
      this.actionCounter = 0;

      // 🔹 STEP 4: Set up event listeners to capture user actions
      // Like placing microphones around the room to hear everything
      this.setupEventListeners();

      // 🔹 STEP 5: Record the initial page load action
      await this.recordAction({
        type: 'navigation',
        target: 'page',
        data: { url: window.location.href },
        description: `Started recording on ${window.location.hostname}`
      });

      // 🔹 STEP 6: Notify user that recording has started
      await NotificationManager.showSuccess(
        `Recording started on ${window.location.hostname}`,
        'Recording Active'
      );

      return this.currentSessionId;

      /*
       * WHY STARTING RECORDING MATTERS:
       * Non-tech readers: This is like turning on a camera that watches
       * everything you do on the job website - every click, every form
       * you fill out, every button you press gets remembered.
       * 
       * Future changes: We could add selective recording (only certain
       * types of actions) or multiple simultaneous sessions.
       */

    } catch (error) {
      console.error('Failed to start recording:', error);
      await NotificationManager.showError('Failed to start recording', 'Recording Error');
      throw error;
    }
  }

  /*
   * 🔸 STOP RECORDING METHOD
   * This method stops capturing user actions and finalizes the session
   * Like pressing the "stop" button and saving the video
   */
  async stopRecording(): Promise<void> {
    try {
      // 🔹 STEP 1: Check if we're actually recording
      if (!this.isRecording || !this.currentSessionId) {
        throw new Error('No recording in progress');
      }

      // 🔹 STEP 2: Record a final action indicating end of session
      await this.recordAction({
        type: 'navigation',
        target: 'session',
        data: { sessionEnd: true },
        description: 'Recording session ended'
      });

      // 🔹 STEP 3: Update session status in storage
      const session = await Storage.getSession(this.currentSessionId);
      if (session) {
        session.status = 'completed';
        session.endTime = Date.now();
        session.description = `Completed session with ${this.actionCounter} actions`;
      }

      // 🔹 STEP 4: Remove all event listeners
      // Like removing all the microphones we placed
      this.removeEventListeners();

      // 🔹 STEP 5: Reset recording state
      this.isRecording = false;
      const sessionId = this.currentSessionId;
      this.currentSessionId = null;
      this.actionCounter = 0;

      // 🔹 STEP 6: Notify user that recording has stopped
      await NotificationManager.showSuccess(
        `Recording stopped. Captured ${this.actionCounter} actions.`,
        'Recording Complete'
      );

    } catch (error) {
      console.error('Failed to stop recording:', error);
      await NotificationManager.showError('Failed to stop recording', 'Recording Error');
      throw error;
    }
  }

  /*
   * 🔸 RECORD ACTION METHOD
   * This method saves a single user action to storage
   * Like writing down one specific thing the user did
   */
  private async recordAction(actionData: Partial<Action>): Promise<void> {
    if (!this.isRecording || !this.currentSessionId) {
      return; // Don't record if we're not in recording mode
    }

    try {
      // 🔹 STEP 1: Create a complete action object
      // Like filling out a form with all the details of what happened
      const action: Action = {
        id: `action_${Date.now()}_${++this.actionCounter}`,
        type: actionData.type || 'click',
        target: actionData.target || 'unknown',
        timestamp: Date.now(),
        url: window.location.href,
        data: actionData.data || {},
        description: actionData.description || `${actionData.type} on ${actionData.target}`,
        sessionId: this.currentSessionId
      };

      // 🔹 STEP 2: Save the action to storage
      await Storage.saveAction(action, this.currentSessionId);

      // 🔹 STEP 3: Show a brief notification about the recorded action
      await NotificationManager.showInfo(
        action.description,
        `Action ${this.actionCounter}`
      );

      /*
       * WHY RECORDING EACH ACTION MATTERS:
       * Non-tech readers: Every time you click a button or fill a field,
       * we save exactly what you did and when you did it. Later, we can
       * repeat these same actions automatically on other job applications.
       * 
       * Future changes: We could add smart filtering to ignore accidental
       * clicks or add more detailed information like mouse coordinates.
       */

    } catch (error) {
      console.error('Failed to record action:', error);
    }
  }

  /*
   * 🔸 SETUP EVENT LISTENERS METHOD
   * This method attaches listeners to capture different types of user interactions
   * Like placing sensors throughout the webpage to detect user activity
   */
  private setupEventListeners(): void {
    // 🔹 CLICK LISTENER: Captures all mouse clicks
    // Like having someone watch for every time you click something
    const clickListener = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target) {
        this.recordAction({
          type: 'click',
          target: this.getElementSelector(target),
          data: {
            tagName: target.tagName,
            className: target.className,
            textContent: target.textContent?.trim().substring(0, 50) || '',
            id: target.id
          },
          description: `Clicked on ${target.tagName.toLowerCase()} element: "${target.textContent?.trim().substring(0, 30) || target.className || target.id || 'unnamed'}"`
        });
      }
    };

    // 🔹 INPUT LISTENER: Captures text being typed into form fields
    // Like having someone write down everything you type
    const inputListener = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        // Don't record sensitive information like passwords
        const isPassword = target.type === 'password';
        const value = isPassword ? '[PASSWORD]' : target.value;
        
        this.recordAction({
          type: 'input',
          target: this.getElementSelector(target),
          data: {
            tagName: target.tagName,
            inputType: target.type,
            value: value,
            placeholder: target.placeholder
          },
          description: `Entered text in ${target.type || 'text'} field: ${target.placeholder || target.name || 'unnamed field'}`
        });
      }
    };

    // 🔹 KEYPRESS LISTENER: Captures special key presses like Enter or Tab
    // Like noting when you press important keys
    const keypressListener = (event: Event) => {
      const keyEvent = event as KeyboardEvent;
      // Only record special keys that might be important for navigation
      const specialKeys = ['Enter', 'Tab', 'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
      if (specialKeys.includes(keyEvent.key)) {
        this.recordAction({
          type: 'keypress',
          target: this.getElementSelector(keyEvent.target as HTMLElement),
          data: {
            key: keyEvent.key,
            code: keyEvent.code,
            ctrlKey: keyEvent.ctrlKey,
            shiftKey: keyEvent.shiftKey,
            altKey: keyEvent.altKey
          },
          description: `Pressed ${keyEvent.key} key`
        });
      }
    };

    // 🔹 SCROLL LISTENER: Captures page scrolling
    // Like noting when you scroll up or down the page
    const scrollListener = () => {
      this.recordAction({
        type: 'scroll',
        target: 'window',
        data: {
          scrollX: window.scrollX,
          scrollY: window.scrollY
        },
        description: `Scrolled to position (${window.scrollX}, ${window.scrollY})`
      });
    };

    // 🔹 ATTACH ALL LISTENERS
    // Add all our "sensors" to the webpage
    document.addEventListener('click', clickListener, true);
    document.addEventListener('input', inputListener, true);
    document.addEventListener('keydown', keypressListener, true);
    window.addEventListener('scroll', scrollListener, true);

    // 🔹 STORE LISTENER REFERENCES
    // Remember all the sensors we placed so we can remove them later
    this.eventListeners.push(
      { element: document, event: 'click', handler: clickListener },
      { element: document, event: 'input', handler: inputListener },
      { element: document, event: 'keydown', handler: keypressListener },
      { element: window, event: 'scroll', handler: scrollListener }
    );

    /*
     * WHY EVENT LISTENERS MATTER:
     * Non-tech readers: These are like having multiple assistants watching
     * different aspects of your interaction with the webpage - one watches
     * for clicks, one for typing, one for scrolling, etc.
     * 
     * Future changes: We could add listeners for drag-and-drop, right-clicks,
     * or hover actions for more complete recording.
     */
  }

  /*
   * 🔸 REMOVE EVENT LISTENERS METHOD
   * This method removes all the event listeners we added
   * Like removing all the sensors when we're done recording
   */
  private removeEventListeners(): void {
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler, true);
    });
    this.eventListeners = [];
  }

  /*
   * 🔸 GET ELEMENT SELECTOR METHOD
   * This method creates a CSS selector to uniquely identify an HTML element
   * Like creating an address that points to a specific element on the page
   */
  private getElementSelector(element: HTMLElement): string {
    // 🔹 STEP 1: Try to use ID if it exists and is unique
    // IDs are like house numbers - usually unique and reliable
    if (element.id) {
      return `#${element.id}`;
    }

    // 🔹 STEP 2: Try to use data attributes (common in job sites)
    // Data attributes are like name tags that developers put on elements
    const dataAttrs = ['data-apply-btn', 'data-form-field', 'data-submit', 'data-continue'];
    for (const attr of dataAttrs) {
      if (element.hasAttribute(attr)) {
        return `[${attr}="${element.getAttribute(attr)}"]`;
      }
    }

    // 🔹 STEP 3: Use class names if they look stable
    // Class names are like categories - sometimes reliable
    if (element.className && !element.className.includes('random') && !element.className.includes('generated')) {
      const firstClass = element.className.split(' ')[0];
      return `.${firstClass}`;
    }

    // 🔹 STEP 4: Fall back to tag name and position
    // Like saying "the third button on the page"
    const tagName = element.tagName.toLowerCase();
    const siblings = Array.from(element.parentElement?.children || []).filter(child => child.tagName === element.tagName);
    const index = siblings.indexOf(element);
    
    return `${tagName}:nth-of-type(${index + 1})`;

    /*
     * WHY ELEMENT SELECTORS MATTER:
     * Non-tech readers: When we want to click a button later, we need
     * a way to find that exact same button. This creates a "GPS coordinate"
     * for each element so we can find it again.
     * 
     * Future changes: We could add machine learning to predict the best
     * selector or use visual recognition for elements.
     */
  }

  /*
   * 🔸 IS RECORDING METHOD
   * This method tells us whether recording is currently active
   * Like checking if the camera is rolling
   */
  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  /*
   * 🔸 GET CURRENT SESSION ID METHOD
   * This method returns the ID of the current recording session
   * Like getting the name of the current video file
   */
  getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }
}

/*
 * WHY THIS RECORDER MODULE MATTERS:
 * Non-tech readers: This module is like having a perfect memory assistant
 * who remembers every single thing you do when applying for jobs. Later,
 * this same assistant can repeat all your actions automatically.
 * 
 * Future changes: We could add features like recording mouse movements,
 * detecting form validation errors, or smart filtering of irrelevant actions.
 */

// 🔹 EXPORT SINGLETON INSTANCE
// Create one recorder that the entire extension can use
export const recorder = new ActionRecorder();