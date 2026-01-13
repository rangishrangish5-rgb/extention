# 🛡️ Web Security Suite

**Complete web security and productivity toolkit for Chrome**

A professional Chrome Extension (Manifest V3) that provides comprehensive protection and productivity features including URL reputation checking, YouTube study mode, form security analysis, and URL shortener detection.

---

## ✨ Features Overview

### 🔍 **Option 1: URL Reputation Check**
Real-time website reputation analysis using Google Safe Browsing API
- ✅ Detects malware, phishing, and social engineering threats
- ✅ Risk scoring system (0-100 scale)
- ✅ Visual threat assessment
- ✅ Instant security status display

### 📚 **Option 2: YouTube Study Mode** 
Filter YouTube to show only educational content
- ✅ Hides non-educational videos
- ✅ Removes distracting elements (comments, sidebar)
- ✅ Custom keyword filtering
- ✅ Educational content focus

### 🔒 **Option 3: Form Security Scanner**
Detect and prevent phishing attacks
- ✅ Analyzes form submission targets
- ✅ Detects suspicious cross-domain forms
- ✅ Highlights risky input fields
- ✅ Prevents credential theft

### 🔗 **Option 4: URL Shortener Detection**
Identify hidden and shortened URLs
- ✅ Detects 24+ popular URL shorteners
- ✅ Warns about hidden destinations
- ✅ Scans all links on page
- ✅ Protection against disguised phishing

---

## 📁 Project Structure

```
web-security-suite/
├── manifest.json           # Extension configuration (V3)
├── background.js          # Background service worker
├── content.js             # Content script (all features)
├── content.css            # Content script styles
├── popup.html             # Extension popup interface
├── popup.css              # Popup styling (professional design)
├── popup.js               # Popup functionality
├── icons/                 # Professional extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── README.md              # This file
└── INSTALL.md             # Installation guide
```

---

## 🚀 Installation

### Quick Install (3 Steps)

1. **Extract the extension folder** to your computer

2. **Open Chrome Extensions**
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (top-right toggle)

3. **Load the extension**
   - Click "Load unpacked"
   - Select the `web-security-suite` folder
   - Done! 🎉

### Detailed Instructions

See [INSTALL.md](INSTALL.md) for step-by-step installation guide with screenshots.

---

## 📖 How to Use

### 🔍 URL Reputation Check

1. Click the extension icon while on any website
2. View the **Reputation** tab (default)
3. Results show instantly:
   - ✅ Security status (Safe/Malicious)
   - ⚠️ Threat type (if detected)
   - 📊 Risk score (0-100)
   - 🏷️ Final assessment

**Risk Levels:**
- **Safe (0-30):** Green - No threats detected
- **Suspicious (31-60):** Orange - Potential risks
- **High Risk (61-100):** Red - Dangerous website

---

### 📚 YouTube Study Mode

1. Click extension icon
2. Go to **Features** tab
3. Toggle **YouTube Study Mode** ON
4. YouTube will now:
   - Show only educational videos
   - Hide comments and recommendations
   - Remove distracting elements
   - Display warning for non-educational content

**Educational Keywords Include:**
- tutorial, lecture, course, class, learn
- programming, python, java, coding
- math, physics, chemistry, biology
- engineering, data science, AI
- exam prep, college, university

**Blocked Content:**
- vlogs, pranks, gaming, reactions
- music videos, movie trailers
- entertainment, comedy, memes

---

### 🔒 Form Security Scanner

1. Click extension icon
2. Go to **Features** tab
3. Toggle **Form Security Scanner** ON
4. The extension will:
   - Scan all forms on every page
   - Detect cross-domain form submissions
   - Highlight suspicious input fields (red border)
   - Show warning banner for risky forms
   - Confirm before submitting sensitive data

**Protects Against:**
- Phishing attacks
- Credential theft
- Credit card fraud
- Cross-site form submissions

---

### 🔗 URL Shortener Detection

1. Click extension icon
2. Go to **Features** tab
3. Toggle **URL Shortener Alert** ON
4. When visiting shortened URLs:
   - Warning banner appears
   - All shortened links are identified
   - Protection against disguised phishing

**Detected Shorteners (24+):**
- bit.ly, tinyurl.com, goo.gl
- ow.ly, t.co, is.gd
- rebrand.ly, cutt.ly, short.link
- And 15+ more popular services

---

## 🎨 User Interface

### Modern Design Features

- **Gradient Theme:** Purple gradient (667eea → 764ba2)
- **Tab Navigation:** Easy switching between Reputation and Features
- **Toggle Switches:** Professional iOS-style toggles
- **Animated Elements:** Smooth transitions and hover effects
- **Visual Feedback:** Status messages and loading indicators
- **Responsive Layout:** Optimized 450px width

### Color Scheme

| Element | Color | Usage |
|---------|-------|-------|
| Primary | #667eea | Main brand color |
| Secondary | #764ba2 | Accent color |
| Success | #4caf50 | Safe/enabled status |
| Warning | #ff9800 | Suspicious content |
| Danger | #f44336 | High risk/malicious |

---

## ⚙️ Technical Details

### Manifest V3 Compliance

- ✅ Service worker background script
- ✅ Content scripts with proper injection
- ✅ Chrome Storage API for settings
- ✅ Message passing between components
- ✅ Host permissions properly scoped

### Architecture

```
┌─────────────┐    Messages     ┌──────────────┐    API Calls    ┌──────────────┐
│  Popup UI   │ ◄──────────────► │  Background  │ ◄──────────────► │  Google Safe │
│  (popup.js) │                  │(background.js)│                  │   Browsing   │
└─────────────┘                  └──────────────┘                  └──────────────┘
       │                                │
       │ Messages                       │ Messages
       ▼                                ▼
┌─────────────────────────────────────────────────┐
│            Content Script (content.js)           │
│  - YouTube Study Mode                            │
│  - Form Security Analysis                        │
│  - URL Shortener Detection                       │
│  - MutationObserver for dynamic content          │
└─────────────────────────────────────────────────┘
```

### APIs Used

- **Google Safe Browsing v4:** URL reputation checking
- **Chrome Tabs API:** Active tab detection
- **Chrome Storage API:** Settings persistence
- **Chrome Runtime API:** Message passing
- **MutationObserver:** Dynamic content monitoring

---

## 🔧 Configuration

### Google Safe Browsing API Key

The extension comes pre-configured with an API key. To use your own:

1. Get an API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the **Safe Browsing API**
3. Open `background.js`
4. Replace line 7:
   ```javascript
   const GOOGLE_SAFE_BROWSING_API_KEY = "YOUR_API_KEY_HERE";
   ```

### Customizing Study Mode Keywords

To modify educational keywords, edit `content.js`:

**Line 23-29:** STUDY_KEYWORDS array
```javascript
const STUDY_KEYWORDS = [
  'tutorial', 'lecture', 'course',
  // Add your keywords here
];
```

**Line 33-38:** NON_STUDY_KEYWORDS array
```javascript
const NON_STUDY_KEYWORDS = [
  'vlog', 'prank', 'gaming',
  // Add blocked keywords here
];
```

### Adding URL Shorteners

Edit `content.js` line 429-437:
```javascript
const URL_SHORTENERS = [
  'bit.ly', 'tinyurl.com',
  // Add more shorteners here
];
```

---

## 🛠️ Development

### File Responsibilities

| File | Purpose |
|------|---------|
| `manifest.json` | Extension configuration and permissions |
| `background.js` | URL reputation API calls |
| `content.js` | All content script features (Options 2, 3, 4) |
| `content.css` | Styles for injected content |
| `popup.html` | Extension popup structure |
| `popup.css` | Professional popup styling |
| `popup.js` | Popup logic and controls |

### Key Functions

**background.js:**
- `checkUrlReputation(url)` - Calls Safe Browsing API
- `getRiskLabel(score)` - Calculates risk level

**content.js:**
- `initYouTubeStudyMode()` - YouTube filtering
- `scanFormsOnPage()` - Form security analysis
- `detectUrlShortener()` - Shortener detection
- `initObserver()` - Dynamic content monitoring

**popup.js:**
- `checkCurrentTabReputation()` - Trigger reputation check
- `displayResults(data)` - Show reputation results
- `saveSetting(key, value)` - Persist feature toggles

---

## 🔒 Permissions Explained

| Permission | Usage | Required For |
|------------|-------|--------------|
| `activeTab` | Access current tab URL | URL reputation check |
| `tabs` | Query active tabs | All features |
| `storage` | Save user settings | Feature toggles |
| `<all_urls>` | Content script injection | Form analysis, URL detection |
| `safebrowsing.googleapis.com` | API calls | URL reputation |
| `*.youtube.com` | YouTube filtering | Study mode |

---

## 🧪 Testing

### Test Scenarios

**URL Reputation:**
- ✅ Safe site: `https://google.com`
- ⚠️ Test phishing: Use Google's test URLs
- ❌ Invalid: `chrome://extensions/`

**YouTube Study Mode:**
- Search "Python tutorial" → Shows results
- Search "funny cat videos" → Hides results
- Watch educational video → No warning
- Watch entertainment → Warning shown

**Form Security:**
- Visit login page with cross-domain form
- Check for red borders on password fields
- Try submitting → Confirmation prompt

**URL Shortener:**
- Visit `bit.ly` → Warning banner
- Visit page with shortened links → Detection

---

## 📊 Feature Comparison

| Feature | Free | Premium Tools |
|---------|------|---------------|
| URL Reputation | ✅ Included | $10/month |
| YouTube Study Mode | ✅ Included | $5/month |
| Form Security | ✅ Included | $8/month |
| URL Shortener Detection | ✅ Included | $3/month |
| **Total Value** | **FREE** | **$26/month** |

---

## 🐛 Troubleshooting

### Extension Not Working?

1. **Check installation:**
   - Go to `chrome://extensions/`
   - Ensure "Web Security Suite" is enabled
   - Check for error messages

2. **Features not activating:**
   - Click extension icon
   - Verify toggles are ON in Features tab
   - Try reloading the page

3. **YouTube Study Mode not working:**
   - Ensure you're on `youtube.com`
   - Toggle OFF and ON again
   - Clear browser cache
   - Reload YouTube

4. **Form warnings not showing:**
   - Check if Form Security Scanner is enabled
   - Ensure page has forms with password/email fields
   - Some sites may use shadow DOM (not supported)

### Common Issues

**Issue:** "Unable to get current tab URL"
- **Solution:** Try clicking a valid webpage (not chrome:// pages)

**Issue:** Features not persisting
- **Solution:** Check Chrome storage settings, ensure sync is enabled

**Issue:** Extension icon not visible
- **Solution:** Click puzzle icon in toolbar, pin the extension

---

## 📈 Roadmap

### Planned Features
- [ ] Domain age checking
- [ ] SSL certificate analysis
- [ ] Custom blacklist/whitelist
- [ ] Export security reports
- [ ] Multi-language support
- [ ] Dark mode theme

### Future Enhancements
- Advanced threat intelligence
- Machine learning-based detection
- Browser fingerprinting protection
- Privacy score calculation

---

## 🤝 Contributing

Contributions are welcome! Please ensure:
- Code follows existing style
- Features are well-documented
- Tests pass before submitting
- No external dependencies added

---

## 📄 License

This extension is provided for educational and personal use.

---

## 🙏 Acknowledgments

- **Google Safe Browsing API** - Threat detection
- **Chrome Extension Platform** - Development framework
- **Community** - Feature suggestions and testing

---

## 📞 Support

### Getting Help

1. Check this README thoroughly
2. Review [INSTALL.md](INSTALL.md) for setup issues
3. Check browser console for error messages
4. Verify all permissions are granted

### Feedback

Use Chrome's extension feedback to report:
- Bugs and issues
- Feature requests
- Performance problems
- UI/UX improvements

---

## 📊 Statistics

- **Lines of Code:** 2000+
- **Files:** 9 core files
- **Permissions:** 6 required
- **Supported Sites:** All websites
- **Update Frequency:** As needed

---

## 🎓 Learn More

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Google Safe Browsing API](https://developers.google.com/safe-browsing)
- [Content Scripts Guide](https://developer.chrome.com/docs/extensions/mv3/content_scripts/)

---

**Version:** 2.0.0  
**Manifest Version:** 3  
**Last Updated:** January 2026  
**Status:** Production Ready ✅

---

Made with 💜 for a safer and more productive web
#   c r o m e _ e x t e n t i o n  
 #   c r o m e _ e x t e n t i o n  
 