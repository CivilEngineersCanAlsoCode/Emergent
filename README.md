# 🤖 AutoApply - Intelligent Job Application Assistant

## Overview

AutoApply is a comprehensive Chrome browser extension that learns from your job application process and intelligently automates repetitive tasks across multiple job platforms. Think of it as your personal assistant that watches how you apply for jobs, learns your patterns, and helps you apply faster and more consistently.

## ✨ Key Features

### 🔴 **Smart Recording** (R1)
- Records every action you take on job websites (clicks, typing, scrolling)
- Captures timestamps and page URLs for context
- Works seamlessly with Taleo, Workday, SuccessFactors, and Greenhouse

### 🧠 **Intelligent Filtering** (R2)
- Analyzes your application patterns after 5+ sessions
- Keeps only actions that appear in 3+ applications
- Focuses on truly important, repeated steps

### ⏱️ **Human-Like Automation** (R3)
- Adds realistic delays between actions (500ms - 2000ms)
- Configurable timing through Excel files
- Makes automation appear natural and human-like

### 📱 **Real-Time Notifications** (R4)
- 1-second toast notifications for every action
- Success, warning, and error notifications
- Progress tracking during replay

### 📖 **Educational Code Comments** (R5)
- Every line of code explained in simple terms
- Perfect for non-technical users to understand functionality
- Comprehensive "why" explanations for all features

### 🔒 **Error Handling & Security** (R8, R9)
- Robust error detection with context logging
- Automatic captcha detection and pause functionality
- Last-5-steps error reporting for debugging

### 💾 **Data Management** (R10)
- IndexedDB storage for all recorded sessions
- CSV export functionality for analysis
- Session management and cleanup tools

## 🚀 Installation

### Development Installation

1. **Clone and build the extension:**
```bash
git clone <repository-url>
cd autoapply-extension
npm install
npm run build
```

2. **Load in Chrome:**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (top right toggle)
   - Click "Load unpacked" 
   - Select the `dist` folder from the project

3. **Verify installation:**
   - Look for the AutoApply icon in your browser toolbar
   - Click it to open the control panel

### Production Installation
*Coming soon: Chrome Web Store listing*

## 📋 How to Use

### Recording Your First Session

1. **Navigate to a job website** (Taleo, Workday, etc.)
2. **Click the AutoApply extension icon**
3. **Click "Start Recording"** 
4. **Apply for a job normally** - fill forms, click buttons, upload resume
5. **Click "Stop Recording"** when finished
6. **Repeat for 4-5 more jobs** to build pattern recognition

### Replaying Your Actions

1. **Go to a new job posting** on any supported platform
2. **Click the extension icon**
3. **Click "Start Replay"**
4. **Watch the magic happen** - the extension repeats your steps automatically
5. **Intervene if needed** - solve captchas or handle unexpected changes

### Advanced Features

- **📊 View Flowchart**: See visual diagrams of your recorded actions
- **⚙️ Settings**: Configure delays, notification preferences
- **📈 Export Data**: Download your session data as CSV for analysis

## 🎯 Supported Platforms

### ✅ Currently Supported
- **Taleo** - Oracle's talent acquisition platform
- Basic framework for Workday, SuccessFactors, Greenhouse

### 🚧 Coming Soon (R6)
- **Workday** - Complete integration
- **SuccessFactors** - SAP's HR platform  
- **Greenhouse** - Modern recruiting software
- **LinkedIn Jobs** - Direct application support
- **Indeed** - Quick apply automation

## 🔧 Technical Architecture

### Core Components

```
📦 AutoApply Extension
├── 🎮 Popup Interface (popup.ts)
│   └── Control panel with start/stop buttons
├── 📝 Content Script (content.ts) 
│   └── Runs on job sites, handles recording/replay
├── 🔄 Background Service (background.ts)
│   └── Manages extension lifecycle and data
├── 💾 Storage System (storage.ts)
│   └── IndexedDB with filtering and export
├── 📢 Notification System (notification.ts)
│   └── Toast messages and user feedback
├── 🎥 Action Recorder (recorder.ts)
│   └── Captures user interactions intelligently
└── 🤖 Action Replayer (replayer.ts)
    └── Replays actions with human-like timing
```

### Technology Stack
- **TypeScript** - Type-safe development
- **Chrome Extension Manifest V3** - Modern extension architecture
- **IndexedDB** - Client-side data storage
- **Webpack** - Build system and bundling
- **Chrome APIs** - Notifications, storage, tabs

## 🎛️ Configuration

### Delay Settings (R3)
Configure realistic delays between actions:

```typescript
{
  humanLikeDelays: true,
  minDelay: 500,    // Minimum 0.5 seconds
  maxDelay: 2000,   // Maximum 2 seconds
  pauseOnCaptcha: true,
  showNotifications: true
}
```

### Future: Excel Configuration
*Coming soon: Load delay preferences from Excel files*

## 🛡️ Privacy & Security

- **Local Storage Only** - All data stays on your computer
- **No Cloud Sync** - Nothing is sent to external servers
- **Password Protection** - Passwords are never recorded
- **Encrypted Storage** - Future feature for sensitive data

## 🔮 Future Enhancements

### Phase 2 Features (R7, R11, R12)
- **🖱️ Mouse Coordinate Replay** - Precise cursor movement recording
- **🗂️ Multi-Tab Operations** - Apply to multiple jobs simultaneously
- **🔐 AES-GCM Encryption** - Enhanced security for sensitive data
- **☁️ Cloud Synchronization** - Sync sessions across devices

### Advanced Features
- **🤖 AI Integration** - Smart form filling with GPT models
- **📊 Success Analytics** - Track application success rates
- **🎯 Job Matching** - AI-powered job recommendation
- **📝 Cover Letter Generation** - Automated personalization

## 🐛 Troubleshooting

### Common Issues

**Extension not recording:**
- Refresh the job website page
- Check if the site is supported
- Verify extension permissions

**Replay not working:**
- Ensure you have recorded sessions
- Check if page structure has changed
- Try refreshing and replaying

**Captcha detected:**
- Solve the captcha manually
- Click "Resume" in the extension popup
- Recording/replay will continue automatically

### Debug Mode
Enable detailed logging:
1. Open Chrome DevTools (F12)
2. Go to Console tab
3. Look for "AutoApply:" messages

## 🤝 Contributing

### Development Setup
```bash
# Install dependencies
npm install

# Development build (with watching)
npm run dev

# Production build
npm run build

# Clean build artifacts
npm run clean
```

### Code Standards
- **Comprehensive Comments** - Every line explained for non-technical users
- **TypeScript Strict Mode** - Type safety required
- **Error Handling** - Robust error catching and user feedback
- **Accessibility** - WCAG 2.1 AA compliance

## 📊 Analytics & Metrics

### Usage Statistics
- Recording sessions created
- Actions captured per session
- Successful replay completions
- Error rates and types

### Pattern Analysis
- Most common action sequences
- Platform-specific optimizations
- Success rate improvements over time

## ⚖️ Legal & Compliance

- **Terms of Service Compliance** - Respects job site ToS
- **Rate Limiting** - Human-like interaction speeds
- **Ethical Usage** - Designed for legitimate job seeking
- **No Spam** - Prevents automated mass applications

## 📞 Support

### Getting Help
- Check the troubleshooting section above
- Review console logs for error messages
- Submit issues with detailed reproduction steps

### Feature Requests
- Use GitHub issues for new feature ideas
- Provide clear use cases and benefits
- Consider contributing implementation

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Chrome Extension APIs and documentation
- TypeScript community for type definitions
- Open source libraries used in development

---

**Disclaimer**: This extension is designed for legitimate job seeking activities. Users are responsible for complying with job site terms of service and applicable laws. Always review and customize applications before submission.