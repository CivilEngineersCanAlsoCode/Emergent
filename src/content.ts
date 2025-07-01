// 🔹 CONTENT SCRIPT
// This file runs on job websites and handles the actual recording/replay
// Think of it as the "hands and eyes" of our extension that work directly on job sites

import { recorder } from './recorder';
import { replayer } from './replayer';
import { NotificationManager } from './notification';

/*
 * 🔸 CONTENT SCRIPT MAIN CLASS
 * This class manages the extension's interaction with job website pages
 * Like a supervisor who coordinates between the extension and the webpage
 */
class ContentScript {
    // 🔹 INITIALIZATION FLAG
    // Ensures we only set up our content script once per page
    private isInitialized: boolean = false;

    /*
     * 🔸 INITIALIZE METHOD
     * This method sets up the content script when a job page loads
     * Like setting up all the equipment needed to work on a job site
     */
    async initialize(): Promise<void> {
        // 🔹 STEP 1: Prevent multiple initializations
        if (this.isInitialized) {
            return;
        }

        try {
            // 🔹 STEP 2: Check if we're on a supported job platform
            // Like checking if we're at the right workplace
            const platform = this.detectJobPlatform();
            if (platform === 'unknown') {
                console.log('AutoApply: Not on a supported job platform');
                return;
            }

            // 🔹 STEP 3: Set up message listeners
            // Like setting up a phone line to receive instructions from the popup
            this.setupMessageListeners();

            // 🔹 STEP 4: Set up page monitoring
            // Like having a watchman who notices when the page changes
            this.setupPageMonitoring();

            // 🔹 STEP 5: Mark as initialized
            this.isInitialized = true;

            console.log(`AutoApply: Content script initialized on ${platform} platform`);

            /*
             * WHY INITIALIZATION MATTERS:
             * Non-tech readers: Before we can start recording or replaying actions,
             * we need to set up all our systems on the job website. This is like
             * unpacking your tools before starting work.
             * 
             * Future changes: We could add platform-specific initialization,
             * custom CSS injection, or performance monitoring.
             */

        } catch (error) {
            console.error('AutoApply: Failed to initialize content script:', error);
        }
    }

    /*
     * 🔸 DETECT JOB PLATFORM METHOD
     * This method identifies which job platform we're currently on
     * Like looking at street signs to know what neighborhood you're in
     */
    private detectJobPlatform(): string {
        const url = window.location.href.toLowerCase();
        const hostname = window.location.hostname.toLowerCase();

        // 🔹 PLATFORM DETECTION RULES
        // Each job platform has unique characteristics we can identify
        
        if (hostname.includes('taleo.net') || url.includes('taleo')) {
            return 'taleo';
        }
        
        if (hostname.includes('workday.com') || url.includes('workday')) {
            return 'workday';
        }
        
        if (hostname.includes('successfactors.com') || url.includes('successfactors')) {
            return 'successfactors';
        }
        
        if (hostname.includes('greenhouse.io') || url.includes('greenhouse')) {
            return 'greenhouse';
        }

        // 🔹 FUTURE PLATFORMS (R6)
        // --- FUTURE:WORKDAY: Add Workday-specific detection ---
        // --- FUTURE:SUCCESSFACTORS: Add SuccessFactors-specific detection ---
        // --- FUTURE:GREENHOUSE: Add Greenhouse-specific detection ---

        return 'unknown';

        /*
         * WHY PLATFORM DETECTION MATTERS:
         * Non-tech readers: Different job websites work differently, like
         * different stores having different checkout processes. We need to
         * know which "store" we're in to use the right approach.
         * 
         * Future changes: We could add automatic platform learning,
         * user-defined platforms, or API-based detection.
         */
    }

    /*
     * 🔸 SETUP MESSAGE LISTENERS METHOD
     * This method sets up communication with the extension popup
     * Like installing a telephone to receive instructions from headquarters
     */
    private setupMessageListeners(): void {
        // 🔹 LISTEN FOR MESSAGES FROM POPUP
        // The popup sends us commands like "start recording" or "start replay"
        chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
            try {
                console.log('AutoApply: Received message:', message);

                switch (message.action) {
                    case 'START_RECORDING':
                        await this.handleStartRecording();
                        sendResponse({ success: true, message: 'Recording started' });
                        break;

                    case 'STOP_RECORDING':
                        await this.handleStopRecording();
                        sendResponse({ success: true, message: 'Recording stopped' });
                        break;

                    case 'START_REPLAY':
                        await this.handleStartReplay(message.sessionId, message.config);
                        sendResponse({ success: true, message: 'Replay started' });
                        break;

                    case 'STOP_REPLAY':
                        await this.handleStopReplay();
                        sendResponse({ success: true, message: 'Replay stopped' });
                        break;

                    case 'GET_STATUS':
                        const status = await this.getStatus();
                        sendResponse({ success: true, data: status });
                        break;

                    case 'RESUME_REPLAY':
                        await this.handleResumeReplay();
                        sendResponse({ success: true, message: 'Replay resumed' });
                        break;

                    default:
                        sendResponse({ success: false, message: 'Unknown action' });
                }

                /*
                 * WHY MESSAGE LISTENING MATTERS:
                 * Non-tech readers: This is like having a walkie-talkie that
                 * lets the extension popup send instructions to the part of
                 * the extension working on the job website.
                 * 
                 * Future changes: We could add more commands, batch operations,
                 * or encrypted message passing for security.
                 */

            } catch (error) {
                console.error('AutoApply: Error handling message:', error);
                sendResponse({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
            }
        });
    }

    /*
     * 🔸 SETUP PAGE MONITORING METHOD
     * This method watches for changes on the job website page
     * Like having a security guard who notices when things change
     */
    private setupPageMonitoring(): void {
        // 🔹 MONITOR URL CHANGES
        // Some job sites change URLs without full page reloads
        let currentUrl = window.location.href;
        setInterval(() => {
            if (window.location.href !== currentUrl) {
                currentUrl = window.location.href;
                this.onPageChanged();
            }
        }, 1000);

        // 🔹 MONITOR PAGE CONTENT CHANGES
        // Watch for dynamic content loading (common on modern job sites)
        const observer = new MutationObserver((mutations) => {
            // Only react to significant changes, not minor ones
            const significantChange = mutations.some(mutation => 
                mutation.type === 'childList' && 
                mutation.addedNodes.length > 0
            );
            
            if (significantChange) {
                this.onContentChanged();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: false,
            attributeOldValue: false,
            characterData: false,
            characterDataOldValue: false
        });

        /*
         * WHY PAGE MONITORING MATTERS:
         * Non-tech readers: Job websites often change content dynamically
         * (like loading new forms or updating buttons). We need to watch
         * for these changes so our recording and replay stay accurate.
         * 
         * Future changes: We could add performance monitoring, error detection,
         * or intelligent content analysis.
         */
    }

    /*
     * 🔸 MESSAGE HANDLER METHODS
     * These methods handle specific commands from the popup
     */

    // Handle request to start recording user actions
    private async handleStartRecording(): Promise<void> {
        try {
            if (recorder.isCurrentlyRecording()) {
                throw new Error('Recording is already active');
            }

            const sessionId = await recorder.startRecording();
            await NotificationManager.showSuccess(
                'Recording started! Perform your job application steps.',
                'Recording Active'
            );

            // Notify popup about successful start
            chrome.runtime.sendMessage({
                type: 'RECORDING_STARTED',
                sessionId: sessionId
            });

        } catch (error) {
            await NotificationManager.showError(
                `Failed to start recording: ${error.message}`,
                'Recording Error'
            );
            throw error;
        }
    }

    // Handle request to stop recording
    private async handleStopRecording(): Promise<void> {
        try {
            if (!recorder.isCurrentlyRecording()) {
                throw new Error('No recording is currently active');
            }

            await recorder.stopRecording();
            
            // Notify popup about successful stop
            chrome.runtime.sendMessage({
                type: 'RECORDING_STOPPED'
            });

        } catch (error) {
            await NotificationManager.showError(
                `Failed to stop recording: ${error.message}`,
                'Recording Error'
            );
            throw error;
        }
    }

    // Handle request to start replaying actions
    private async handleStartReplay(sessionId: string, config?: any): Promise<void> {
        try {
            if (replayer.isCurrentlyReplaying()) {
                throw new Error('Replay is already active');
            }

            await replayer.startReplay(sessionId, config);
            
            // Notify popup about successful start
            chrome.runtime.sendMessage({
                type: 'REPLAY_STARTED',
                sessionId: sessionId
            });

        } catch (error) {
            await NotificationManager.showError(
                `Failed to start replay: ${error.message}`,
                'Replay Error'
            );
            throw error;
        }
    }

    // Handle request to stop replay
    private async handleStopReplay(): Promise<void> {
        try {
            replayer.stopReplay();
            
            // Notify popup about successful stop
            chrome.runtime.sendMessage({
                type: 'REPLAY_STOPPED'
            });

            await NotificationManager.showInfo('Replay stopped', 'Stopped');

        } catch (error) {
            await NotificationManager.showError(
                `Failed to stop replay: ${error.message}`,
                'Replay Error'
            );
            throw error;
        }
    }

    // Handle request to resume paused replay (useful after captcha solving)
    private async handleResumeReplay(): Promise<void> {
        try {
            replayer.resumeReplay();
            await NotificationManager.showSuccess('Replay resumed', 'Resumed');
            
            chrome.runtime.sendMessage({
                type: 'REPLAY_RESUMED'
            });

        } catch (error) {
            await NotificationManager.showError(
                `Failed to resume replay: ${error.message}`,
                'Resume Error'
            );
            throw error;
        }
    }

    // Get current status of recording/replay operations
    private async getStatus(): Promise<any> {
        const isRecording = recorder.isCurrentlyRecording();
        const isReplaying = replayer.isCurrentlyReplaying();
        const replayProgress = replayer.getReplayProgress();

        return {
            isRecording,
            isReplaying,
            currentSessionId: recorder.getCurrentSessionId(),
            replayProgress,
            platform: this.detectJobPlatform(),
            url: window.location.href
        };
    }

    /*
     * 🔸 EVENT HANDLER METHODS
     * These methods respond to page changes and events
     */

    // Handle page URL changes
    private onPageChanged(): void {
        console.log('AutoApply: Page URL changed to:', window.location.href);
        
        // If we're recording, record the navigation
        if (recorder.isCurrentlyRecording()) {
            // The recorder will automatically capture this navigation
        }

        // Update popup with new page info
        chrome.runtime.sendMessage({
            type: 'PAGE_CHANGED',
            url: window.location.href,
            platform: this.detectJobPlatform()
        });
    }

    // Handle significant content changes on the page
    private onContentChanged(): void {
        // This could be used for advanced features like detecting form changes
        // or new interactive elements appearing on the page
        
        // For now, we just log it for debugging purposes
        console.log('AutoApply: Page content changed');
    }

    /*
     * 🔸 UTILITY METHODS
     * Helper functions for content script operations
     */

    // Check if the current page is a job application page
    private isJobApplicationPage(): boolean {
        const indicators = [
            'apply', 'application', 'job', 'career', 'position',
            'resume', 'cv', 'submit', 'candidate'
        ];

        const url = window.location.href.toLowerCase();
        const title = document.title.toLowerCase();
        
        return indicators.some(indicator => 
            url.includes(indicator) || title.includes(indicator)
        );
    }

    // Extract job information from the current page
    private extractJobInfo(): any {
        // This is a placeholder for future job information extraction
        // --- FUTURE:JOB_EXTRACTION: Add intelligent job info parsing ---
        
        return {
            title: document.title,
            url: window.location.href,
            company: this.extractCompanyName(),
            platform: this.detectJobPlatform()
        };
    }

    // Extract company name from page (basic implementation)
    private extractCompanyName(): string {
        // Try common selectors for company names
        const selectors = [
            '.company-name',
            '[data-company]',
            '.employer',
            '.organization'
        ];

        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent) {
                return element.textContent.trim();
            }
        }

        // Fallback to hostname
        return window.location.hostname;
    }
}

/*
 * 🔸 CONTENT SCRIPT INITIALIZATION
 * Set up the content script when the page loads
 */

// 🔹 CREATE CONTENT SCRIPT INSTANCE
// Like hiring a supervisor for this particular job site
const contentScript = new ContentScript();

// 🔹 INITIALIZE WHEN PAGE IS READY
// Wait for the page to fully load before setting up our systems
if (document.readyState === 'loading') {
    // Page is still loading, wait for it to finish
    document.addEventListener('DOMContentLoaded', () => {
        contentScript.initialize();
    });
} else {
    // Page is already loaded, initialize immediately
    contentScript.initialize();
}

// 🔹 ALSO INITIALIZE ON WINDOW LOAD (for dynamic content)
// Some job sites load content after the initial page load
window.addEventListener('load', () => {
    contentScript.initialize();
});

/*
 * WHY THIS CONTENT SCRIPT MATTERS:
 * Non-tech readers: This is the part of our extension that actually works
 * on job websites. It's like having a smart assistant who sits with you
 * while you apply for jobs, watching what you do and ready to help repeat
 * those same actions later.
 * 
 * Future changes: We could add visual indicators on the page, smart form
 * filling, automatic job information extraction, or integration with
 * job board APIs for enhanced functionality.
 */