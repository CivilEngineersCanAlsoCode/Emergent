// 🔹 TYPES DEFINITION FILE
// This file defines the "blueprints" or "templates" for different kinds of data
// Think of these as forms that ensure all our data has the same structure

/*
 * 🔸 ACTION INTERFACE
 * This defines what information we capture for each user action
 * Like a form that must be filled out completely for every click, type, or scroll
 */
export interface Action {
  // Unique identifier for this action (like a receipt number)
  id: string;
  
  // What type of action was performed (click, input, keypress, etc.)
  type: 'click' | 'input' | 'keypress' | 'scroll' | 'navigation' | 'wait';
  
  // Which HTML element was interacted with (like "Submit Button" or "Email Field")
  target: string;
  
  // The exact time when this action happened
  timestamp: number;
  
  // The website URL where this action occurred
  url: string;
  
  // Any additional data (like text that was typed)
  data?: any;
  
  // Visual description for human understanding
  description: string;
  
  // How long to wait before performing this action during replay
  delay?: number;
  
  // Which job application session this action belongs to
  sessionId?: string;
}

/*
 * 🔸 RECORDING SESSION INTERFACE
 * This defines information about a complete job application session
 * Like a folder that contains all actions for one job application
 */
export interface RecordingSession {
  // Unique identifier for this session
  id: string;
  
  // When the session started
  startTime: number;
  
  // When the session ended (if completed)
  endTime?: number;
  
  // List of all actions performed in this session
  actions: Action[];
  
  // Which job website this session was for
  platform: 'taleo' | 'workday' | 'successfactors' | 'greenhouse' | 'unknown';
  
  // Current status of the session
  status: 'recording' | 'completed' | 'failed' | 'paused';
  
  // URL where the session started
  startUrl: string;
  
  // Human-readable description of what this session accomplished
  description?: string;
}

/*
 * 🔸 REPLAY CONFIGURATION INTERFACE
 * This defines settings for how actions should be replayed
 * Like preferences for how fast or slow to perform actions
 */
export interface ReplayConfig {
  // Should we add random delays to make it look more human?
  humanLikeDelays: boolean;
  
  // Minimum delay between actions (in milliseconds)
  minDelay: number;
  
  // Maximum delay between actions (in milliseconds)
  maxDelay: number;
  
  // Should we pause if we detect a captcha?
  pauseOnCaptcha: boolean;
  
  // How many times to retry if an element is not found
  maxRetries: number;
  
  // Should we show notifications during replay?
  showNotifications: boolean;
  
  // Which browser tab to use for replay
  targetTabId?: number;
}

/*
 * 🔸 NOTIFICATION DATA INTERFACE
 * This defines the structure of popup notifications
 * Like a template for the little messages that appear in the corner
 */
export interface NotificationData {
  // Unique identifier for this notification
  id: string;
  
  // Main title of the notification
  title: string;
  
  // Detailed message content
  message: string;
  
  // Type of notification (affects color and behavior)
  type: 'info' | 'success' | 'warning' | 'error';
  
  // How long to show the notification (in milliseconds)
  duration: number;
  
  // Path to the icon to display
  iconUrl?: string;
  
  // Should this notification make a sound?
  silent: boolean;
}

/*
 * 🔸 STORAGE INTERFACE
 * This defines how we organize data in the browser's storage
 * Like a filing system for all our recorded information
 */
export interface StorageData {
  // List of all recording sessions
  sessions: RecordingSession[];
  
  // Current replay configuration settings
  replayConfig: ReplayConfig;
  
  // Statistics about extension usage
  stats: {
    totalSessions: number;
    totalActions: number;
    successfulReplays: number;
    failedReplays: number;
  };
  
  // When the data was last updated
  lastUpdated: number;
}

/*
 * 🔸 PLATFORM DETECTOR INTERFACE
 * This defines how we identify different job websites
 * Like a checklist for recognizing which job site we're on
 */
export interface PlatformDetector {
  // Name of the job platform
  name: string;
  
  // Patterns in the URL that identify this platform
  urlPatterns: string[];
  
  // Specific CSS selectors for common elements on this platform
  selectors: {
    submitButton?: string;
    emailField?: string;
    passwordField?: string;
    jobTitle?: string;
    companyName?: string;
    applyButton?: string;
    continueButton?: string;
    nextButton?: string;
    fileUpload?: string;
    textArea?: string;
  };
  
  // Whether this platform is currently supported
  supported: boolean;
}

/*
 * 🔸 ERROR INFORMATION INTERFACE
 * This defines how we track and report errors
 * Like an incident report form for when things go wrong
 */
export interface ErrorInfo {
  // Unique identifier for this error
  id: string;
  
  // When the error occurred
  timestamp: number;
  
  // Brief description of the error
  message: string;
  
  // Detailed technical information
  details: string;
  
  // Which part of the extension caused the error
  source: 'recorder' | 'replayer' | 'storage' | 'popup' | 'background';
  
  // The last few actions that led to this error
  context: Action[];
  
  // Current URL when error occurred
  url: string;
  
  // How critical is this error
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/*
 * WHY THESE TYPES MATTER:
 * Non-tech readers: Think of these as standardized forms that ensure
 * all parts of our extension "speak the same language" when sharing data.
 * 
 * Future changes: If we need to add new information (like mouse coordinates),
 * we just update these type definitions and TypeScript will tell us
 * everywhere in the code that needs to be updated.
 */