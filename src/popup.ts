// 🔹 POPUP SCRIPT
// This file controls the extension's popup interface (the small window that opens)
// Think of it as the "control panel" or "dashboard" for the extension

import { Storage } from './storage';
import { NotificationManager } from './notification';

/*
 * 🔸 POPUP CONTROLLER CLASS
 * This class manages all interactions with the popup interface
 * Like the control room operator who manages all the buttons and displays
 */
class PopupController {
    // 🔹 UI ELEMENT REFERENCES
    // These store references to the buttons and displays in our popup
    private elements: {
        statusText?: HTMLElement;
        progressText?: HTMLElement;
        btnRecord?: HTMLButtonElement;
        btnReplay?: HTMLButtonElement;
        btnStop?: HTMLButtonElement;
        btnFlowchart?: HTMLButtonElement;
        btnSettings?: HTMLButtonElement;
    } = {};

    // 🔹 STATE VARIABLES
    // These keep track of what's currently happening
    private currentState: 'idle' | 'recording' | 'replaying' = 'idle';
    private currentSessionId: string | null = null;

    /*
     * 🔸 INITIALIZE METHOD
     * This method sets up the popup when it opens
     * Like turning on all the lights and connecting all the controls
     */
    async initialize(): Promise<void> {
        try {
            // 🔹 STEP 1: Get references to all UI elements
            // Like finding all the buttons and displays on our control panel
            this.elements = {
                statusText: document.getElementById('status-text') || undefined,
                progressText: document.getElementById('progress-text') || undefined,
                btnRecord: document.getElementById('btn-record') as HTMLButtonElement,
                btnReplay: document.getElementById('btn-replay') as HTMLButtonElement,
                btnStop: document.getElementById('btn-stop') as HTMLButtonElement,
                btnFlowchart: document.getElementById('btn-flowchart') as HTMLButtonElement,
                btnSettings: document.getElementById('btn-settings') as HTMLButtonElement
            };

            // 🔹 STEP 2: Set up event listeners for all buttons
            // Like connecting wires so buttons actually do something when clicked
            this.setupEventListeners();

            // 🔹 STEP 3: Get current status from content script
            // Like checking what's currently happening on the job site
            await this.updateStatus();

            // 🔹 STEP 4: Start periodic status updates
            // Like having someone check the status every few seconds
            this.startStatusUpdates();

            console.log('AutoApply Popup: Initialized successfully');

            /*
             * WHY POPUP INITIALIZATION MATTERS:
             * Non-tech readers: When you click on the extension icon, this
             * code runs to set up the control panel. It makes sure all buttons
             * work and shows you the current status of your job applications.
             * 
             * Future changes: We could add themes, saved preferences,
             * or more detailed status information.
             */

        } catch (error) {
            console.error('AutoApply Popup: Failed to initialize:', error);
            this.showError('Failed to initialize popup');
        }
    }

    /*
     * 🔸 SETUP EVENT LISTENERS METHOD
     * This method connects all the buttons to their functions
     * Like wiring up a control panel so buttons actually work
     */
    private setupEventListeners(): void {
        // 🔹 RECORD BUTTON: Start or stop recording
        // This button toggles between recording and not recording
        this.elements.btnRecord?.addEventListener('click', async () => {
            try {
                if (this.currentState === 'recording') {
                    await this.stopRecording();
                } else {
                    await this.startRecording();
                }
            } catch (error) {
                this.showError(`Recording error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });

        // 🔹 REPLAY BUTTON: Start replaying recorded actions
        // This button makes the extension repeat your previous actions
        this.elements.btnReplay?.addEventListener('click', async () => {
            try {
                await this.startReplay();
            } catch (error) {
                this.showError(`Replay error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });

        // 🔹 STOP BUTTON: Emergency stop for all activities
        // This button immediately stops whatever the extension is doing
        this.elements.btnStop?.addEventListener('click', async () => {
            try {
                await this.stopAll();
            } catch (error) {
                this.showError(`Stop error: ${error.message}`);
            }
        });

        // 🔹 FLOWCHART BUTTON: Open visual workflow view
        // This button shows a diagram of all your recorded actions
        this.elements.btnFlowchart?.addEventListener('click', () => {
            this.openFlowchart();
        });

        // 🔹 SETTINGS BUTTON: Open configuration options
        // This button opens settings for delays, preferences, etc.
        this.elements.btnSettings?.addEventListener('click', () => {
            this.openSettings();
        });

        /*
         * WHY EVENT LISTENERS MATTER:
         * Non-tech readers: These are like the wiring that connects buttons
         * to actions. When you click "Start Recording", this code runs to
         * actually make the recording begin on the job website.
         * 
         * Future changes: We could add keyboard shortcuts, right-click menus,
         * or gesture controls.
         */
    }

    /*
     * 🔸 RECORDING CONTROL METHODS
     * These methods handle starting and stopping the recording process
     */

    // Start recording user actions on the current job site
    private async startRecording(): Promise<void> {
        // 🔹 STEP 1: Get the active tab
        // Like figuring out which job website window is currently open
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab.id) {
            throw new Error('No active tab found');
        }

        // 🔹 STEP 2: Send start recording message to content script
        // Like sending a message to the assistant working on the job site
        const response = await chrome.tabs.sendMessage(tab.id, {
            action: 'START_RECORDING'
        });

        if (!response.success) {
            throw new Error(response.message);
        }

        // 🔹 STEP 3: Update UI to reflect recording state
        this.currentState = 'recording';
        this.updateUIState();
        
        // 🔹 STEP 4: Show success message
        this.showStatus('Recording started! Perform your job application steps.', 'Recording in progress...');

        /*
         * WHY STARTING RECORDING MATTERS:
         * Non-tech readers: This tells the extension to start paying attention
         * to everything you do on the job website - every click, every form
         * field you fill out, every button you press gets remembered.
         * 
         * Future changes: We could add recording profiles, selective recording,
         * or automatic job detection.
         */
    }

    // Stop the current recording session
    private async stopRecording(): Promise<void> {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab.id) {
            throw new Error('No active tab found');
        }

        const response = await chrome.tabs.sendMessage(tab.id, {
            action: 'STOP_RECORDING'
        });

        if (!response.success) {
            throw new Error(response.message);
        }

        this.currentState = 'idle';
        this.updateUIState();
        this.showStatus('Recording stopped', 'Click Start Recording to begin a new session');
    }

    /*
     * 🔸 REPLAY CONTROL METHODS
     * These methods handle replaying previously recorded actions
     */

    // Start replaying actions on the current job site
    private async startReplay(): Promise<void> {
        // 🔹 STEP 1: Get available sessions to replay
        // Like looking through your filing cabinet for recorded job applications
        const sessions = await Storage.getAllSessions();
        if (sessions.length === 0) {
            throw new Error('No recorded sessions available. Please record some actions first.');
        }

        // 🔹 STEP 2: Use the most recent completed session
        // Like choosing the most recent job application as a template
        const latestSession = sessions
            .filter(s => s.status === 'completed')
            .sort((a, b) => b.startTime - a.startTime)[0];

        if (!latestSession) {
            throw new Error('No completed sessions available for replay');
        }

        // 🔹 STEP 3: Send replay command to content script
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab.id) {
            throw new Error('No active tab found');
        }

        const response = await chrome.tabs.sendMessage(tab.id, {
            action: 'START_REPLAY',
            sessionId: latestSession.id,
            config: {
                humanLikeDelays: true,
                minDelay: 500,
                maxDelay: 2000,
                pauseOnCaptcha: true,
                showNotifications: true
            }
        });

        if (!response.success) {
            throw new Error(response.message);
        }

        // 🔹 STEP 4: Update UI state
        this.currentState = 'replaying';
        this.currentSessionId = latestSession.id;
        this.updateUIState();
        this.showStatus('Replay started', `Replaying session: ${latestSession.description || 'Unnamed session'}`);

        /*
         * WHY STARTING REPLAY MATTERS:
         * Non-tech readers: This makes the extension automatically repeat
         * all the steps you recorded before. It's like having a robot assistant
         * fill out the job application for you using your previous actions as a guide.
         * 
         * Future changes: We could add session selection, custom replay speeds,
         * or AI-powered adaptations for different job sites.
         */
    }

    // Stop all current activities (recording or replay)
    private async stopAll(): Promise<void> {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab.id) {
            throw new Error('No active tab found');
        }

        // Send stop commands for both recording and replay
        if (this.currentState === 'recording') {
            await chrome.tabs.sendMessage(tab.id, { action: 'STOP_RECORDING' });
        } else if (this.currentState === 'replaying') {
            await chrome.tabs.sendMessage(tab.id, { action: 'STOP_REPLAY' });
        }

        this.currentState = 'idle';
        this.currentSessionId = null;
        this.updateUIState();
        this.showStatus('All activities stopped', 'Ready for new commands');
    }

    /*
     * 🔸 UI UPDATE METHODS
     * These methods manage the appearance and text of the popup interface
     */

    // Update the popup interface based on current state
    private updateUIState(): void {
        switch (this.currentState) {
            case 'recording':
                // 🔹 RECORDING STATE: Show red record button and enable stop
                if (this.elements.btnRecord) {
                    this.elements.btnRecord.textContent = '⏹️ Stop Recording';
                    this.elements.btnRecord.className = 'btn btn-danger';
                }
                if (this.elements.btnReplay) {
                    this.elements.btnReplay.disabled = true;
                }
                if (this.elements.btnStop) {
                    this.elements.btnStop.disabled = false;
                }
                break;

            case 'replaying':
                // 🔹 REPLAYING STATE: Disable most buttons, enable stop
                if (this.elements.btnRecord) {
                    this.elements.btnRecord.disabled = true;
                }
                if (this.elements.btnReplay) {
                    this.elements.btnReplay.disabled = true;
                }
                if (this.elements.btnStop) {
                    this.elements.btnStop.disabled = false;
                }
                break;

            case 'idle':
            default:
                // 🔹 IDLE STATE: Enable record and replay, disable stop
                if (this.elements.btnRecord) {
                    this.elements.btnRecord.textContent = '🔴 Start Recording';
                    this.elements.btnRecord.className = 'btn btn-primary';
                    this.elements.btnRecord.disabled = false;
                }
                if (this.elements.btnReplay) {
                    this.elements.btnReplay.disabled = false;
                }
                if (this.elements.btnStop) {
                    this.elements.btnStop.disabled = true;
                }
                break;
        }

        /*
         * WHY UI UPDATES MATTER:
         * Non-tech readers: The buttons and text in the popup change based
         * on what's happening. When recording, the record button becomes red
         * and says "Stop Recording". This helps you understand the current state.
         * 
         * Future changes: We could add progress bars, animation effects,
         * or color coding for different job platforms.
         */
    }

    // Update status display text
    private showStatus(statusText: string, progressText?: string): void {
        if (this.elements.statusText) {
            this.elements.statusText.textContent = statusText;
        }
        if (this.elements.progressText && progressText) {
            this.elements.progressText.textContent = progressText;
        }
    }

    // Show error message to user
    private showError(message: string): void {
        this.showStatus('❌ Error', message);
        console.error('AutoApply Popup Error:', message);
    }

    /*
     * 🔸 STATUS MONITORING METHODS
     * These methods keep the popup updated with current information
     */

    // Get current status from content script
    private async updateStatus(): Promise<void> {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab.id) {
                this.showStatus('No active tab', 'Please navigate to a job website');
                return;
            }

            // Try to get status from content script
            const response = await chrome.tabs.sendMessage(tab.id, {
                action: 'GET_STATUS'
            }).catch(() => ({ success: false, message: 'Content script not loaded' }));

            if (response.success) {
                const status = response.data;
                this.currentState = status.isRecording ? 'recording' : 
                                  status.isReplaying ? 'replaying' : 'idle';
                this.currentSessionId = status.currentSessionId;
                
                this.updateUIState();
                
                // Update status text based on current activity
                if (status.isRecording) {
                    this.showStatus('🔴 Recording Active', `Platform: ${status.platform}`);
                } else if (status.isReplaying) {
                    const progress = status.replayProgress;
                    this.showStatus('▶️ Replaying Actions', 
                        `Step ${progress.current}/${progress.total}: ${progress.action || 'Processing...'}`);
                } else {
                    this.showStatus('Ready', `Platform: ${status.platform} | ${tab.url}`);
                }
            } else {
                this.showStatus('Waiting...', 'Please refresh the page if needed');
            }

        } catch (error) {
            console.error('Failed to update status:', error);
            this.showStatus('Connection Error', 'Unable to connect to job website');
        }
    }

    // Start periodic status updates
    private startStatusUpdates(): void {
        // Update status every 2 seconds
        setInterval(() => {
            this.updateStatus();
        }, 2000);
    }

    /*
     * 🔸 NAVIGATION METHODS
     * These methods handle opening other extension pages
     */

    // Open the flowchart visualization page
    private openFlowchart(): void {
        // --- FUTURE:FLOWCHART: Implement flowchart visualization ---
        // This would open a new tab showing a visual diagram of recorded actions
        chrome.tabs.create({
            url: chrome.runtime.getURL('flowchart.html')
        });
    }

    // Open the settings/options page
    private openSettings(): void {
        // --- FUTURE:SETTINGS: Implement settings page ---
        // This would open a page for configuring delays, preferences, etc.
        chrome.tabs.create({
            url: chrome.runtime.getURL('options.html')
        });
    }

    /*
     * 🔸 DATA EXPORT METHODS
     * These methods handle exporting recorded data (R10)
     */

    // Export session data to CSV file
    private async exportData(): Promise<void> {
        try {
            const csvData = await Storage.exportToCSV();
            if (!csvData) {
                throw new Error('No data to export');
            }

            // Create and download CSV file
            const blob = new Blob([csvData], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            
            // Use Chrome's download API to save the file
            await chrome.downloads.download({
                url: url,
                filename: `autoapply_data_${new Date().toISOString().split('T')[0]}.csv`,
                saveAs: true
            });

            this.showStatus('✅ Export Complete', 'Data exported to CSV file');

        } catch (error) {
            this.showError(`Export failed: ${error.message}`);
        }
    }
}

/*
 * 🔸 POPUP INITIALIZATION
 * Set up the popup when it loads
 */

// 🔹 CREATE POPUP CONTROLLER INSTANCE
// Like hiring a control room operator for our extension
const popupController = new PopupController();

// 🔹 INITIALIZE WHEN POPUP HTML IS READY
// Wait for all the buttons and displays to be loaded
document.addEventListener('DOMContentLoaded', () => {
    popupController.initialize();
});

/*
 * WHY THIS POPUP SCRIPT MATTERS:
 * Non-tech readers: This is the "control room" of our extension. When you
 * click on the extension icon, this code creates the interface you see and
 * makes all the buttons work. It's like the dashboard of a car - it shows
 * you what's happening and lets you control the extension.
 * 
 * Future changes: We could add session management, advanced settings,
 * real-time statistics, or integration with job boards for enhanced
 * functionality.
 */