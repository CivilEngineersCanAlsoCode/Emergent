// 🔹 STORAGE MODULE
// This file handles saving and retrieving data from the browser's storage
// Think of it as the "filing cabinet" for all our recorded job application data

import { Action, RecordingSession, StorageData, ReplayConfig } from './types';

/*
 * 🔸 STORAGE CLASS
 * This class manages all data storage operations for the extension
 * Like a librarian who knows where everything is stored and can retrieve it
 */
export class Storage {
  // 🔹 STORAGE KEY CONSTANT
  // This is the "folder name" where we store all our data in the browser
  private static readonly STORAGE_KEY = 'autoapply_data';

  /*
   * 🔸 SAVE ACTION METHOD
   * This method saves a single user action to storage
   * Like adding a new entry to a logbook
   */
  static async saveAction(action: Action, sessionId: string): Promise<void> {
    try {
      // 🔹 STEP 1: Get existing data from storage
      // Like opening the filing cabinet to see what's already there
      const data = await this.getAllData();
      
      // 🔹 STEP 2: Find the correct session to add this action to
      // Like finding the right folder for this job application
      let session = data.sessions.find(s => s.id === sessionId);
      
      // 🔹 STEP 3: If session doesn't exist, create a new one
      // Like creating a new folder if this is the first action
      if (!session) {
        session = {
          id: sessionId,
          startTime: Date.now(),
          actions: [],
          platform: this.detectPlatform(action.url),
          status: 'recording',
          startUrl: action.url,
          description: `Session started at ${new Date().toLocaleString()}`
        };
        data.sessions.push(session);
      }
      
      // 🔹 STEP 4: Add the new action to the session
      // Like adding a new page to the job application folder
      session.actions.push(action);
      
      // 🔹 STEP 5: Update statistics
      // Like updating a counter of how many actions we've recorded
      data.stats.totalActions++;
      data.lastUpdated = Date.now();
      
      // 🔹 STEP 6: Save everything back to storage
      // Like putting the updated folder back in the filing cabinet
      await this.saveAllData(data);
      
      /*
       * WHY THIS MATTERS:
       * Non-tech readers: Every click, type, or scroll you make gets saved
       * so we can replay it later on other job applications.
       * 
       * Future changes: If we need to save additional information (like
       * mouse coordinates), we just add it to the Action type and it
       * will automatically be saved here.
       */
      
    } catch (error) {
      // 🔸 ERROR HANDLING: If something goes wrong, log it
      console.error('Failed to save action:', error);
      throw new Error(`Storage error: ${error}`);
    }
  }

  /*
   * 🔸 GET SESSION METHOD
   * This method retrieves a specific recording session
   * Like pulling out a specific job application folder
   */
  static async getSession(sessionId: string): Promise<RecordingSession | null> {
    try {
      // 🔹 STEP 1: Get all data from storage
      const data = await this.getAllData();
      
      // 🔹 STEP 2: Find and return the requested session
      // Like searching through folders to find the right one
      return data.sessions.find(s => s.id === sessionId) || null;
      
    } catch (error) {
      console.error('Failed to get session:', error);
      return null;
    }
  }

  /*
   * 🔸 GET ALL SESSIONS METHOD
   * This method retrieves all recording sessions
   * Like getting all job application folders from the filing cabinet
   */
  static async getAllSessions(): Promise<RecordingSession[]> {
    try {
      const data = await this.getAllData();
      return data.sessions;
    } catch (error) {
      console.error('Failed to get all sessions:', error);
      return [];
    }
  }

  /*
   * 🔸 FILTER ACTIONS METHOD
   * This method finds actions that appear in multiple sessions (R2)
   * Like finding common steps that appear in most job applications
   */
  static async getFilteredActions(minOccurrences: number = 3): Promise<Action[]> {
    try {
      // 🔹 STEP 1: Get all sessions
      const sessions = await this.getAllSessions();
      
      // 🔹 STEP 2: Count how often each action pattern appears
      // Like counting how many times we click "Submit" across all applications
      const actionCounts = new Map<string, { count: number; action: Action }>();
      
      // 🔹 STEP 3: Loop through all sessions and actions
      sessions.forEach(session => {
        session.actions.forEach(action => {
          // Create a "fingerprint" for this action based on its target and type
          const fingerprint = `${action.type}:${action.target}`;
          
          if (actionCounts.has(fingerprint)) {
            // If we've seen this action before, increase the count
            actionCounts.get(fingerprint)!.count++;
          } else {
            // If this is the first time, add it to our tracking
            actionCounts.set(fingerprint, { count: 1, action });
          }
        });
      });
      
      // 🔹 STEP 4: Return only actions that appear frequently enough
      // Like keeping only the steps that appear in at least 3 job applications
      return Array.from(actionCounts.values())
        .filter(item => item.count >= minOccurrences)
        .map(item => item.action);
        
      /*
       * WHY THIS FILTERING MATTERS:
       * Non-tech readers: After you apply to 5 jobs, we look for steps
       * that you did in at least 3 of them. These are probably the
       * important steps that should be automated.
       * 
       * Future changes: We could make the minimum count configurable
       * or add more sophisticated pattern matching.
       */
      
    } catch (error) {
      console.error('Failed to filter actions:', error);
      return [];
    }
  }

  /*
   * 🔸 EXPORT TO CSV METHOD
   * This method exports session data to a CSV file (R10)
   * Like printing out all your job application data in a spreadsheet format
   */
  static async exportToCSV(): Promise<string> {
    try {
      // 🔹 STEP 1: Get all sessions
      const sessions = await this.getAllSessions();
      
      // 🔹 STEP 2: Create CSV header row
      // Like creating column titles in a spreadsheet
      let csv = 'Session ID,Platform,Start Time,Action Type,Target,Description,URL,Timestamp\n';
      
      // 🔹 STEP 3: Add data rows for each action
      sessions.forEach(session => {
        session.actions.forEach(action => {
          // Format each action as a row in the CSV
          csv += `"${session.id}","${session.platform}","${new Date(session.startTime).toISOString()}","${action.type}","${action.target}","${action.description}","${action.url}","${new Date(action.timestamp).toISOString()}"\n`;
        });
      });
      
      return csv;
      
    } catch (error) {
      console.error('Failed to export to CSV:', error);
      return '';
    }
  }

  /*
   * 🔸 PRIVATE HELPER METHODS
   * These methods handle the low-level storage operations
   */
  
  // Get all data from Chrome's storage
  private static async getAllData(): Promise<StorageData> {
    return new Promise((resolve) => {
      chrome.storage.local.get([this.STORAGE_KEY], (result) => {
        // If no data exists, create default structure
        if (!result[this.STORAGE_KEY]) {
          resolve(this.createDefaultData());
        } else {
          resolve(result[this.STORAGE_KEY]);
        }
      });
    });
  }
  
  // Save all data to Chrome's storage
  private static async saveAllData(data: StorageData): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [this.STORAGE_KEY]: data }, () => {
        resolve();
      });
    });
  }
  
  // Create default data structure when extension is first used
  private static createDefaultData(): StorageData {
    return {
      sessions: [],
      replayConfig: {
        humanLikeDelays: true,
        minDelay: 500,
        maxDelay: 2000,
        pauseOnCaptcha: true,
        maxRetries: 3,
        showNotifications: true
      },
      stats: {
        totalSessions: 0,
        totalActions: 0,
        successfulReplays: 0,
        failedReplays: 0
      },
      lastUpdated: Date.now()
    };
  }
  
  // Detect which job platform based on URL
  private static detectPlatform(url: string): RecordingSession['platform'] {
    if (url.includes('taleo.net')) return 'taleo';
    if (url.includes('workday.com')) return 'workday';
    if (url.includes('successfactors.com')) return 'successfactors';
    if (url.includes('greenhouse.io')) return 'greenhouse';
    return 'unknown';
  }
}

/*
 * WHY THIS STORAGE MODULE MATTERS:
 * Non-tech readers: This is like having a smart filing system that
 * automatically organizes and saves every step of your job applications.
 * It can later find patterns and export your data for analysis.
 * 
 * Future changes: We could add encryption, cloud sync, or more
 * sophisticated data analysis features.
 */