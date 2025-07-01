// 🔹 BACKGROUND SCRIPT (SERVICE WORKER)
// This file runs continuously in the background while Chrome is open
// Think of it as the "central command center" that coordinates everything

/*
 * 🔸 BACKGROUND SERVICE WORKER
 * This script manages extension lifecycle, storage, and cross-tab communication
 * Like a headquarters that stays running even when you're not using the extension
 */

// 🔹 IMPORT REQUIRED MODULES
// These provide the tools we need for background operations
import { Storage } from './storage';
import { NotificationManager } from './notification';

/*
 * 🔸 EXTENSION INSTALLATION/UPDATE HANDLER
 * This runs when the extension is first installed or updated
 * Like a setup routine that prepares everything for first use
 */
chrome.runtime.onInstalled.addListener(async (details) => {
    console.log('AutoApply Extension: Installation event triggered');
    
    try {
        if (details.reason === 'install') {
            // 🔹 FIRST INSTALLATION
            // Like setting up a new office space
            console.log('AutoApply Extension: First installation detected');
            
            await NotificationManager.showSuccess(
                'AutoApply extension installed successfully! Click the extension icon to get started.',
                'Welcome to AutoApply!'
            );
            
            // Initialize default storage data
            // Like setting up filing cabinets and organizing supplies
            await Storage.getAllSessions(); // This will create default structure if none exists
            
        } else if (details.reason === 'update') {
            // 🔹 EXTENSION UPDATE
            // Like upgrading office equipment
            const previousVersion = details.previousVersion || 'unknown';
            console.log(`AutoApply Extension: Updated from version ${previousVersion} to ${chrome.runtime.getManifest().version}`);
            
            await NotificationManager.showInfo(
                `AutoApply updated to version ${chrome.runtime.getManifest().version}`,
                'Extension Updated'
            );
        }

        /*
         * WHY INSTALLATION HANDLING MATTERS:
         * Non-tech readers: When you first install the extension, this code
         * runs to set up everything properly. It's like unpacking and organizing
         * a new piece of software so it's ready to use.
         * 
         * Future changes: We could add onboarding tutorials, migration scripts
         * for data format changes, or feature announcement notifications.
         */

    } catch (error) {
        console.error('AutoApply Extension: Error during installation:', error);
    }
});

/*
 * 🔸 MESSAGE HANDLING
 * This handles communication between different parts of the extension
 * Like a telephone operator who routes calls between departments
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('AutoApply Background: Received message:', message);

    // Handle different types of messages
    switch (message.type) {
        case 'RECORDING_STARTED':
            handleRecordingStarted(message.sessionId);
            break;

        case 'RECORDING_STOPPED':
            handleRecordingStopped();
            break;

        case 'REPLAY_STARTED':
            handleReplayStarted(message.sessionId);
            break;

        case 'REPLAY_STOPPED':
            handleReplayStopped();
            break;

        case 'PAGE_CHANGED':
            handlePageChanged(message.url, message.platform);
            break;

        case 'ERROR_OCCURRED':
            handleError(message.error, message.context);
            break;

        default:
            console.warn('AutoApply Background: Unknown message type:', message.type);
    }

    /*
     * WHY MESSAGE HANDLING MATTERS:
     * Non-tech readers: Different parts of the extension need to talk to
     * each other. This is like having a central switchboard that routes
     * messages between the popup, the job website, and the storage system.
     * 
     * Future changes: We could add message encryption, priority queuing,
     * or cross-extension communication.
     */
});

/*
 * 🔸 EVENT HANDLER FUNCTIONS
 * These functions respond to specific events in the extension
 */

// Handle recording start events
async function handleRecordingStarted(sessionId: string): Promise<void> {
    console.log(`AutoApply Background: Recording started with session ID: ${sessionId}`);
    
    // Update extension badge to show recording status
    await chrome.action.setBadgeText({ text: 'REC' });
    await chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
    
    // --- FUTURE:ANALYTICS: Track recording start events ---
    // We could send anonymous usage statistics here
}

// Handle recording stop events
async function handleRecordingStopped(): Promise<void> {
    console.log('AutoApply Background: Recording stopped');
    
    // Clear extension badge
    await chrome.action.setBadgeText({ text: '' });
    
    // Show completion notification
    await NotificationManager.showSuccess(
        'Recording session completed successfully!',
        'Recording Complete'
    );
}

// Handle replay start events
async function handleReplayStarted(sessionId: string): Promise<void> {
    console.log(`AutoApply Background: Replay started for session: ${sessionId}`);
    
    // Update extension badge to show replay status
    await chrome.action.setBadgeText({ text: 'PLAY' });
    await chrome.action.setBadgeBackgroundColor({ color: '#00FF00' });
}

// Handle replay stop events
async function handleReplayStopped(): Promise<void> {
    console.log('AutoApply Background: Replay stopped');
    
    // Clear extension badge
    await chrome.action.setBadgeText({ text: '' });
}

// Handle page navigation events
async function handlePageChanged(url: string, platform: string): Promise<void> {
    console.log(`AutoApply Background: Page changed to ${url} (platform: ${platform})`);
    
    // --- FUTURE:PAGE_TRACKING: Track page navigation patterns ---
    // We could analyze which pages users visit most often
}

// Handle error events (R8)
async function handleError(error: any, context?: any[]): Promise<void> {
    console.error('AutoApply Background: Error occurred:', error);
    
    // Show error notification with context
    const contextDescription = context ? 
        `Last actions: ${context.slice(-5).join(' → ')}` : 
        'No context available';
    
    await NotificationManager.showError(
        `Extension error: ${error.message || error}`,
        'AutoApply Error',
        context
    );
    
    // --- FUTURE:ERROR_REPORTING: Send error reports for debugging ---
    // We could collect anonymous error reports to improve the extension
}

/*
 * 🔸 PERIODIC MAINTENANCE TASKS
 * These functions run regularly to keep the extension healthy
 * Like routine maintenance that keeps everything running smoothly
 */

// Clean up old session data periodically
async function performMaintenance(): Promise<void> {
    try {
        console.log('AutoApply Background: Performing maintenance tasks');
        
        // Get all sessions
        const sessions = await Storage.getAllSessions();
        
        // --- FUTURE:DATA_CLEANUP: Remove very old sessions ---
        // We could implement automatic cleanup of sessions older than X days
        
        // Clear old notifications
        await NotificationManager.clearAll();
        
        console.log(`AutoApply Background: Maintenance completed. ${sessions.length} sessions in storage`);
        
    } catch (error) {
        console.error('AutoApply Background: Maintenance error:', error);
    }
}

// Run maintenance every hour
setInterval(performMaintenance, 60 * 60 * 1000); // 1 hour in milliseconds

/*
 * 🔸 ALARM HANDLERS
 * These handle scheduled tasks and reminders
 * Like having an assistant who reminds you about important things
 */

// Create alarms for maintenance and reminders
chrome.alarms.onAlarm.addListener(async (alarm) => {
    console.log(`AutoApply Background: Alarm triggered: ${alarm.name}`);
    
    switch (alarm.name) {
        case 'maintenance':
            await performMaintenance();
            break;
            
        case 'session-reminder':
            // --- FUTURE:REMINDERS: Remind users to record new sessions ---
            await NotificationManager.showInfo(
                'Consider recording a new job application session to improve automation',
                'Session Reminder'
            );
            break;
            
        default:
            console.warn(`AutoApply Background: Unknown alarm: ${alarm.name}`);
    }
});

// Set up recurring alarms
chrome.alarms.create('maintenance', { 
    delayInMinutes: 60, // First run in 1 hour
    periodInMinutes: 60 // Then every hour
});

/*
 * 🔸 TAB MANAGEMENT
 * These functions help manage browser tabs for replay operations
 * Like having an assistant who can open, close, and switch between windows
 */

// Handle tab creation and removal
chrome.tabs.onCreated.addListener((tab) => {
    console.log(`AutoApply Background: New tab created: ${tab.id}`);
    // --- FUTURE:MULTI_TAB: Track tabs for multi-tab replay ---
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    console.log(`AutoApply Background: Tab removed: ${tabId}`);
    // --- FUTURE:MULTI_TAB: Clean up tab-specific data ---
});

/*
 * 🔸 STORAGE MANAGEMENT
 * These functions help manage extension data and settings
 */

// Monitor storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
    console.log(`AutoApply Background: Storage changed in ${namespace}:`, changes);
    
    // --- FUTURE:SYNC: Handle data synchronization across devices ---
    // We could implement cloud sync functionality here
});

/*
 * 🔸 CONTEXT MENU INTEGRATION (FUTURE FEATURE)
 * These would add right-click menu options on job sites
 */

// --- FUTURE:CONTEXT_MENU: Add right-click menu options ---
/*
chrome.contextMenus.create({
    id: 'autoapply-record',
    title: 'Start AutoApply Recording',
    contexts: ['page'],
    documentUrlPatterns: ['*://*.taleo.net/*', '*://*.workday.com/*']
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'autoapply-record' && tab?.id) {
        chrome.tabs.sendMessage(tab.id, { action: 'START_RECORDING' });
    }
});
*/

/*
 * 🔸 NETWORK MONITORING (FUTURE FEATURE)
 * These would monitor network requests to job sites
 */

// --- FUTURE:NETWORK_MONITORING: Monitor job site API calls ---
/*
chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
        console.log('AutoApply: Network request detected:', details.url);
        // Could analyze API calls to job sites for better automation
    },
    { urls: ['*://*.taleo.net/*', '*://*.workday.com/*'] },
    ['requestBody']
);
*/

/*
 * 🔸 PERFORMANCE MONITORING
 * Keep track of extension performance and resource usage
 */

// Monitor memory usage periodically
setInterval(async () => {
    if (chrome.system && chrome.system.memory) {
        const memInfo = await chrome.system.memory.getInfo();
        console.log(`AutoApply Background: System memory - Available: ${memInfo.availableCapacity}MB`);
        
        // --- FUTURE:PERFORMANCE: Implement smart resource management ---
        // We could pause non-critical operations if memory is low
    }
}, 5 * 60 * 1000); // Check every 5 minutes

/*
 * WHY THIS BACKGROUND SCRIPT MATTERS:
 * Non-tech readers: This is like the engine room of our extension. It runs
 * quietly in the background, coordinating between different parts, handling
 * errors, managing data, and keeping everything organized. You don't see it
 * directly, but it's essential for everything to work properly.
 * 
 * Future changes: We could add cloud synchronization, advanced analytics,
 * machine learning features, or integration with job board APIs.
 */

console.log('AutoApply Background Script: Initialized successfully');