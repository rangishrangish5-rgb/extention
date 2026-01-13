# 📥 Installation Guide - Web Security Suite

## Quick Install (3 Simple Steps)

### Step 1: Extract the Extension
- Extract the `web-security-suite` folder to a permanent location
- ⚠️ **Important:** Don't delete this folder after installation!

### Step 2: Open Chrome Extensions Page
1. Open Google Chrome browser
2. Type `chrome://extensions/` in the address bar
3. Press **Enter**
4. Enable **Developer mode** (toggle in top-right corner)

### Step 3: Load the Extension
1. Click the **"Load unpacked"** button
2. Navigate to and select the `web-security-suite` folder
3. Click **"Select Folder"**
4. ✅ **Done!** The extension is now installed

---

## 📌 Pin the Extension

For easy access:
1. Click the **puzzle piece icon** 🧩 in Chrome's toolbar
2. Find "Web Security Suite"
3. Click the **pin icon** 📌 to pin it to your toolbar

---

## ⚙️ Initial Setup

### Enable Features

1. Click the **extension icon** (🛡️) in your toolbar
2. Go to the **Features tab**
3. Enable the features you want:
   - 📚 **YouTube Study Mode** - Filter educational content
   - 🔒 **Form Security Scanner** - Detect phishing forms
   - 🔗 **URL Shortener Alert** - Identify shortened URLs

### Check URL Reputation

1. Navigate to any website
2. Click the **extension icon**
3. View instant security analysis in the **Reputation tab**

---

## ✅ Verify Installation

### Test Each Feature

**1. URL Reputation Check:**
- Visit `https://google.com`
- Click extension icon
- Should show "Safe" status with 0 risk score

**2. YouTube Study Mode:**
- Enable YouTube Study Mode toggle
- Go to `youtube.com`
- Search for "Python tutorial"
- Should show only educational videos

**3. Form Security:**
- Enable Form Security Scanner
- Visit any login page
- Should detect password fields

**4. URL Shortener:**
- Enable URL Shortener Alert
- Visit `bit.ly` or any shortened URL
- Should show warning banner

---

## 🔧 Configuration

### API Key (Optional)

The extension includes a pre-configured API key. To use your own:

1. Get a free API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the **Safe Browsing API**
3. Open the extension folder
4. Edit `background.js`
5. Replace the API key on line 7

### Custom Settings

All settings are saved automatically using Chrome Storage.

---

## 🎨 Interface Overview

### Reputation Tab
- **Website URL:** Current page address
- **Security Status:** Safe/Malicious badge
- **Threat Analysis:** Detected threats
- **Risk Assessment:** 0-100 score with visual bar
- **Final Assessment:** Overall security rating

### Features Tab
- **YouTube Study Mode:** Toggle with description
- **Form Security Scanner:** Toggle with features list
- **URL Shortener Alert:** Toggle with capabilities
- **Status Message:** Real-time feedback

---

## 📱 Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Recommended |
| Edge (Chromium) | ✅ Full | Works perfectly |
| Brave | ✅ Full | Fully compatible |
| Opera | ✅ Full | No issues |
| Firefox | ⚠️ Partial | Requires modifications |

---

## 🚫 Troubleshooting

### Extension Not Appearing?

**Problem:** Can't find the extension after installation

**Solutions:**
1. Check `chrome://extensions/` - ensure it's enabled
2. Click puzzle icon 🧩 and pin the extension
3. Refresh the page after installation
4. Restart Chrome browser

---

### Features Not Working?

**Problem:** Toggles don't seem to work

**Solutions:**
1. Ensure toggles are **ON** (blue/purple)
2. **Reload the webpage** after enabling
3. Check for error messages in console (F12)
4. Clear browser cache and try again

---

### YouTube Study Mode Issues?

**Problem:** Non-educational videos still showing

**Solutions:**
1. Verify toggle is **ON**
2. Reload YouTube completely (Ctrl+R or Cmd+R)
3. Clear YouTube from cache
4. Toggle OFF and ON again
5. Check video titles contain study keywords

---

### Form Security Not Detecting?

**Problem:** No warnings on suspicious forms

**Solutions:**
1. Confirm Form Security Scanner is **enabled**
2. Page must contain `<form>` elements with password/email fields
3. Cross-domain submission required for warnings
4. Reload page after enabling feature
5. Some sites use JavaScript forms (may not detect)

---

### "Unable to get current tab URL" Error?

**Problem:** Error message in Reputation tab

**Solutions:**
1. Extension can't check `chrome://` pages
2. Try a regular website like `google.com`
3. Ensure you're on a valid HTTP/HTTPS page
4. Refresh the page and try again

---

## 🔄 Updating the Extension

### Manual Update

1. Download the new version
2. Extract to the **same location**
3. Go to `chrome://extensions/`
4. Click **"Reload"** button on the extension
5. Settings are preserved automatically

---

## 🗑️ Uninstallation

### Remove Extension

1. Go to `chrome://extensions/`
2. Find "Web Security Suite"
3. Click **"Remove"**
4. Confirm removal
5. Delete the extension folder from your computer

**Note:** All settings will be deleted. No data is stored externally.

---

## 📊 System Requirements

### Minimum Requirements
- **Chrome Version:** 88 or higher
- **RAM:** 50 MB free
- **Storage:** 5 MB disk space
- **Internet:** Required for URL reputation checks

### Recommended
- **Chrome Version:** Latest stable
- **RAM:** 100 MB+ free
- **Internet:** Broadband for best performance

---

## 🔐 Permissions Explained

When installing, Chrome will request these permissions:

| Permission | Why Needed |
|------------|------------|
| **Read and change data on websites** | For content scripts (YouTube, forms, shorteners) |
| **Read browsing history** | To check current tab URL only |
| **Communicate with cooperating websites** | For Google Safe Browsing API calls |

**Privacy Note:** 
- No data is collected or stored externally
- All settings saved locally in Chrome
- URL checks go only to Google Safe Browsing
- No tracking or analytics

---

## 📝 Post-Installation Checklist

- [ ] Extension icon visible in toolbar
- [ ] Can open popup by clicking icon
- [ ] Reputation tab shows results
- [ ] Features tab shows all toggles
- [ ] YouTube Study Mode toggle works
- [ ] Form Security toggle works
- [ ] URL Shortener toggle works
- [ ] Settings persist after closing popup
- [ ] No error messages in console

---

## 🎯 Quick Start Guide

### For Maximum Protection

Enable all features for comprehensive security:

1. **Click extension icon**
2. **Go to Features tab**
3. **Enable all three toggles:**
   - ✅ YouTube Study Mode
   - ✅ Form Security Scanner
   - ✅ URL Shortener Alert
4. **Done!** You're fully protected

### For Productivity Focus

If you just want YouTube filtering:

1. **Click extension icon**
2. **Features tab**
3. **Enable only:** YouTube Study Mode
4. **Visit YouTube** and enjoy distraction-free learning

### For Security Only

If you only want security features:

1. **Click extension icon**
2. **Features tab**
3. **Enable:**
   - ✅ Form Security Scanner
   - ✅ URL Shortener Alert
4. **Browse safely** across all websites

---

## 💡 Pro Tips

### Tip 1: Keyboard Shortcuts
- Add keyboard shortcut in `chrome://extensions/shortcuts`
- Quickly toggle features on/off

### Tip 2: Multiple Profiles
- Use Chrome profiles for different feature sets
- Work profile: All security features ON
- Personal profile: Customize as needed

### Tip 3: Whitelist Trusted Sites
- If you trust a site flagged by Form Security
- Temporarily disable Form Security for that session
- Re-enable before leaving the site

### Tip 4: YouTube Productivity
- Keep Study Mode ON during work hours
- Blocks distractions automatically
- Focus on learning content only

---

## 🆘 Need More Help?

### Resources
- **Full Documentation:** See README.md
- **Technical Details:** Check source code comments
- **Chrome Developer Docs:** https://developer.chrome.com/docs/extensions/

### Reporting Issues
1. Open browser console (F12)
2. Check for error messages
3. Note which feature is affected
4. Take screenshots if helpful
5. Provide detailed steps to reproduce

---

## ✨ Success!

You've successfully installed **Web Security Suite**! 

Enjoy a safer and more productive browsing experience.

---

**Installation Support**  
Version 2.0.0 | January 2026  
Made with 💜
