# 🧪 AutoApply Extension Manual Testing Guide

## 📋 Overview

This document provides a comprehensive guide for manually testing the AutoApply Chrome extension. Since automated browser testing cannot fully simulate Chrome extension installation and interaction with job websites, these manual tests should be performed in an actual Chrome browser environment.

## 🚀 Installation Testing

### Basic Installation
1. Open Chrome browser
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `/app/dist` directory
6. **Expected Result:** Extension should install without errors
7. **Verification:** Extension icon should appear in Chrome toolbar

### Permissions Verification
1. Click on "Details" for the installed extension
2. Review the permissions granted
3. **Expected Result:** Should match permissions in manifest.json:
   - activeTab
   - notifications
   - storage
   - tabs

## 🎮 UI Testing

### Popup Interface
1. Click the extension icon in the toolbar
2. **Expected Result:** Popup should open showing:
   - Extension title and subtitle
   - Status display showing "Ready to Start"
   - Start Recording button
   - Start Replay button (disabled initially)
   - Stop All button (disabled initially)
   - View Flowchart button
   - Settings button

### Button States
1. Click "Start Recording"
2. **Expected Result:**
   - Button should change to "Stop Recording"
   - Start Replay button should be disabled
   - Stop All button should be enabled
   - Status should update to "Recording Active"

2. Click "Stop Recording"
3. **Expected Result:**
   - Button should change back to "Start Recording"
   - Start Replay button should be enabled
   - Stop All button should be disabled
   - Status should update to "Ready"

## 🎥 Recording Testing

### Basic Recording
1. Navigate to a job application website (ideally Taleo)
2. Click the extension icon
3. Click "Start Recording"
4. Perform some basic actions:
   - Click on form fields
   - Enter text in input fields
   - Click buttons
   - Navigate between pages
5. Click the extension icon again
6. Click "Stop Recording"
7. **Expected Result:** Status should show recording completed

### Notification Testing
1. Start a new recording session
2. Perform actions on the page
3. **Expected Result:** Toast notifications should appear for each action
4. Stop recording
5. **Expected Result:** Completion notification should appear

## ▶️ Replay Testing

### Basic Replay
1. After recording a session, navigate to a similar job application page
2. Click the extension icon
3. Click "Start Replay"
4. **Expected Result:**
   - Extension should replay recorded actions
   - Actions should execute with human-like delays
   - Status should update with current action
   - Toast notifications should appear for each action

### Error Handling
1. Record a session on one page
2. Try to replay on a significantly different page
3. **Expected Result:**
   - Extension should attempt to find elements
   - Should show error notifications when elements can't be found
   - Should stop replay after multiple failures

### Captcha Detection
1. If possible, find a page with a CAPTCHA
2. Start replay that would interact with the CAPTCHA
3. **Expected Result:**
   - Extension should detect the CAPTCHA
   - Should pause replay
   - Should show notification asking for manual intervention

## 💾 Data Management Testing

### Session Storage
1. Record multiple sessions
2. Close and reopen Chrome
3. Click the extension icon
4. **Expected Result:** Previously recorded sessions should still be available for replay

### CSV Export
1. Record at least one session
2. Click the extension icon
3. Click "Settings" (if available)
4. Look for export option
5. **Expected Result:** Should be able to export session data as CSV

## 🔍 Platform-Specific Testing

### Taleo Testing
1. Find a Taleo-based job application
2. Record a complete application process
3. Try to replay on another Taleo job
4. **Expected Result:** Should work relatively well on the same platform

### Other Platforms
1. Test on Workday, SuccessFactors, or Greenhouse if available
2. **Expected Result:** Basic functionality should work, though may be less reliable than on Taleo

## 🐛 Edge Case Testing

### Network Issues
1. Start replay
2. Disable network connection
3. **Expected Result:** Should handle network failure gracefully with error message

### Page Structure Changes
1. Record session
2. Modify page structure using DevTools
3. Start replay
4. **Expected Result:** Should attempt alternative selectors before failing

### Multiple Tabs
1. Open multiple job application tabs
2. Record in one tab
3. Try to replay in another tab
4. **Expected Result:** Should work independently in each tab

## 📊 Performance Testing

### Memory Usage
1. Open Chrome Task Manager (Menu > More Tools > Task Manager)
2. Start recording for an extended period
3. **Expected Result:** Memory usage should remain stable, not continuously increasing

### CPU Usage
1. Monitor CPU usage during extended replay
2. **Expected Result:** CPU spikes should only occur during active operations, not continuously

## 🔒 Security Testing

### Password Fields
1. Record a session including entering text in password fields
2. Export data or check storage
3. **Expected Result:** Password values should be masked or not recorded

## 📝 Test Results Template

For each test category, record:

- **Test Name:**
- **Steps Performed:**
- **Expected Result:**
- **Actual Result:**
- **Status:** PASS/FAIL
- **Notes:**

## 🏁 Final Verification Checklist

- [ ] Extension installs without errors
- [ ] UI renders correctly and is responsive
- [ ] Recording functionality works on supported platforms
- [ ] Replay functionality works with appropriate timing
- [ ] Notifications appear as expected
- [ ] Error handling works appropriately
- [ ] Data is properly stored and persisted
- [ ] No console errors during normal operation
- [ ] Extension uninstalls cleanly

## 📌 Known Limitations

- Extension currently works best on Taleo platform
- Other platforms have basic support but may be less reliable
- Complex dynamic content may cause replay issues
- CAPTCHAs require manual intervention