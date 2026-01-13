// ============================================
// WEB SECURITY SUITE - POPUP SCRIPT
// ============================================

// DOM Elements - Tabs
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// DOM Elements - Reputation Tab
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error');
const errorMessageElement = document.getElementById('errorMessage');
const resultsElement = document.getElementById('results');
const urlDisplayElement = document.getElementById('urlDisplay');
const statusBadgeElement = document.getElementById('statusBadge');
const threatDisplayElement = document.getElementById('threatDisplay');
const riskBarElement = document.getElementById('riskBar');
const riskBarTextElement = document.getElementById('riskBarText');
const riskScoreTextElement = document.getElementById('riskScoreText');
const finalLabelElement = document.getElementById('finalLabel');

// DOM Elements - Features Tab
const youtubeToggle = document.getElementById('youtubeToggle');
const formAnalysisToggle = document.getElementById('formAnalysisToggle');
const urlShortenerToggle = document.getElementById('urlShortenerToggle');
const statusMessage = document.getElementById('statusMessage');

// DOM Elements - Initial State & Button
const initialStateElement = document.getElementById('initial-state');
const checkNowBtn = document.getElementById('checkNowBtn');
const checkCustomUrlBtn = document.getElementById('checkCustomUrlBtn');
const urlInput = document.getElementById('urlInput');

// ============================================
// INITIAL STATE & BUTTON CONTROLS
// ============================================

/**
 * Show initial state (Check Now button)
 */
function showInitialState() {
  if (initialStateElement) {
    initialStateElement.classList.remove('hidden');
  }
  loadingElement.classList.add('hidden');
  errorElement.classList.add('hidden');
  resultsElement.classList.add('hidden');
}

// Add click listener to Check Now button (current tab)
if (checkNowBtn) {
  checkNowBtn.addEventListener('click', () => {
    checkCurrentTabReputation();
  });
}

// Add click listener to Check Custom URL button
if (checkCustomUrlBtn) {
  checkCustomUrlBtn.addEventListener('click', () => {
    const url = urlInput.value.trim();
    if (!url) {
      showError('Please enter a URL');
      return;
    }
    // Add https:// if no protocol is specified
    const urlToCheck = url.startsWith('http://') || url.startsWith('https://') 
      ? url 
      : 'https://' + url;
    checkCustomUrl(urlToCheck);
  });
}

// Allow Enter key in URL input
if (urlInput) {
  urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      checkCustomUrlBtn.click();
    }
  });
}

// ============================================
// TAB NAVIGATION
// ============================================

/**
 * Switch between tabs
 * @param {string} tabName - Name of tab to show
 */
function switchTab(tabName) {
  // Update tab buttons
  tabButtons.forEach(btn => {
    if (btn.dataset.tab === tabName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Update tab contents
  tabContents.forEach(content => {
    if (content.id === `${tabName}-tab`) {
      content.classList.add('active');
    } else {
      content.classList.remove('active');
    }
  });
}

// Add click listeners to tab buttons
tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    switchTab(btn.dataset.tab);
  });
});

// ============================================
// REPUTATION TAB FUNCTIONS (OPTION 1)
// ============================================

/**
 * Show loading state
 */
function showLoading() {
  if (initialStateElement) {
    initialStateElement.classList.add('hidden');
  }
  loadingElement.classList.remove('hidden');
  errorElement.classList.add('hidden');
  resultsElement.classList.add('hidden');
}

/**
 * Show error state
 * @param {string} message - Error message
 */
function showError(message) {
  loadingElement.classList.add('hidden');
  errorElement.classList.remove('hidden');
  resultsElement.classList.add('hidden');
  errorMessageElement.textContent = message;
}

/**
 * Show results
 */
function showResults() {
  loadingElement.classList.add('hidden');
  errorElement.classList.add('hidden');
  resultsElement.classList.remove('hidden');
}

/**
 * Format threat type for display
 * @param {string} threatType - Raw threat type
 * @returns {string} - Formatted threat type
 */
function formatThreatType(threatType) {
  if (threatType === "None") {
    return "No threats detected";
  }
  
  const formatted = threatType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  return formatted;
}

/**
 * Display reputation results
 * @param {Object} data - Reputation data
 */
function displayResults(data) {
  // URL
  urlDisplayElement.textContent = data.url;
  
  // Status Badge
  statusBadgeElement.textContent = data.status;
  statusBadgeElement.className = 'status-badge';
  
  if (data.status === "Safe") {
    statusBadgeElement.classList.add('status-safe');
  } else if (data.status === "Malicious") {
    statusBadgeElement.classList.add('status-malicious');
  } else {
    statusBadgeElement.classList.add('status-error');
  }
  
  // Threat Type
  const formattedThreat = formatThreatType(data.threatType);
  threatDisplayElement.textContent = formattedThreat;
  threatDisplayElement.className = 'threat-display';
  
  if (data.threatType === "None") {
    threatDisplayElement.classList.add('threat-none');
  } else {
    threatDisplayElement.classList.add('threat-detected');
  }
  
  // Risk Score Bar
  const riskScore = data.riskScore;
  riskBarElement.style.width = `${Math.max(riskScore, 5)}%`; // Minimum 5% for visibility
  riskBarElement.className = 'risk-bar';
  
  // Set risk bar color
  if (riskScore >= 0 && riskScore <= 30) {
    riskBarElement.classList.add('risk-safe');
  } else if (riskScore >= 31 && riskScore <= 60) {
    riskBarElement.classList.add('risk-suspicious');
  } else if (riskScore >= 61 && riskScore <= 100) {
    riskBarElement.classList.add('risk-high');
  }
  
  // Risk bar text
  riskBarTextElement.textContent = `${riskScore}%`;
  
  // Risk score text
  riskScoreTextElement.textContent = `Risk Score: ${riskScore} / 100`;
  
  // Final Label
  finalLabelElement.textContent = data.riskLabel;
  finalLabelElement.className = 'final-label';
  
  if (data.riskLabel === "Safe") {
    finalLabelElement.classList.add('label-safe');
  } else if (data.riskLabel === "Suspicious") {
    finalLabelElement.classList.add('label-suspicious');
  } else if (data.riskLabel === "High Risk") {
    finalLabelElement.classList.add('label-high-risk');
  }
  
  // Show results
  showResults();
}

/**
 * Check reputation of current tab
 */
async function checkCurrentTabReputation() {
  try {
    showLoading();
    
    // Check if Chrome tabs API is available
    if (typeof chrome === 'undefined' || !chrome.tabs || typeof chrome.tabs.query !== 'function') {
      showError('Tabs API unavailable. Make sure the extension is properly loaded and has tabs permission.');
      return;
    }
    
    // Get current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.url) {
      showError("Unable to get current tab URL");
      return;
    }
    
    // Check if URL is valid
    if (tab.url.startsWith('chrome://') || 
        tab.url.startsWith('chrome-extension://') ||
        tab.url.startsWith('edge://') ||
        tab.url.startsWith('about:')) {
      showError("Cannot check reputation for browser internal pages");
      return;
    }
    
    const currentUrl = tab.url;
    
    // Check if Chrome runtime API is available
    if (typeof chrome === 'undefined' || !chrome.runtime || typeof chrome.runtime.sendMessage !== 'function') {
      showError('Chrome API not available. Make sure the extension is properly loaded.');
      return;
    }
    
    // Send message to background script
    chrome.runtime.sendMessage(
      {
        action: "checkReputation",
        url: currentUrl
      },
      (response) => {
        if (chrome.runtime.lastError) {
          showError(`Error: ${chrome.runtime.lastError.message}`);
          return;
        }
        
        if (response.success) {
          displayResults(response.data);
        } else {
          showError(`Error checking reputation: ${response.error}`);
        }
      }
    );
    
  } catch (error) {
    showError(`Error: ${error.message}`);
  }
}

/**
 * Check reputation of custom URL entered by user
 * @param {string} url - The URL to check
 */
async function checkCustomUrl(url) {
  try {
    showLoading();
    
    // Check if Chrome runtime API is available
    if (typeof chrome === 'undefined' || !chrome.runtime || typeof chrome.runtime.sendMessage !== 'function') {
      showError('Chrome API not available. Make sure the extension is properly loaded.');
      return;
    }
    
    // Send message to background script to check reputation
    chrome.runtime.sendMessage(
      {
        action: "checkReputation",
        url: url
      },
      (response) => {
        if (chrome.runtime.lastError) {
          showError(`Error: ${chrome.runtime.lastError.message}`);
          return;
        }

        if (!response) {
          showError('No response from background service worker. Try reloading the extension.');
          return;
        }
        
        if (response.success) {
          // Display results
          displayResults(response.data);
        } else {
          showError(`Error checking reputation: ${response.error}`);
        }
      }
    );
    
  } catch (error) {
    showError(`Error: ${error.message}`);
  }
}

// ============================================
// FEATURES TAB FUNCTIONS (OPTIONS 2, 3, 4)
// ============================================

/**
 * Show status message
 * @param {string} message - Message to show
 * @param {string} type - 'success' or 'error'
 */
function showStatusMessage(message, type = 'success') {
  statusMessage.textContent = message;
  statusMessage.className = `status-message show ${type}`;
  
  setTimeout(() => {
    statusMessage.classList.remove('show');
  }, 3000);
}

/**
 * Load saved settings from storage
 */
function loadSettings() {
  chrome.storage.sync.get(['youtubeStudyMode', 'formAnalysisMode', 'urlShortenerMode'], (result) => {
    youtubeToggle.checked = result.youtubeStudyMode || false;
    formAnalysisToggle.checked = result.formAnalysisMode || false;
    urlShortenerToggle.checked = result.urlShortenerMode || false;
  });
}

/**
 * Save setting to storage
 * @param {string} key - Setting key
 * @param {boolean} value - Setting value
 */
function saveSetting(key, value) {
  chrome.storage.sync.set({ [key]: value }, () => {
    if (chrome.runtime.lastError) {
      showStatusMessage('Failed to save settings', 'error');
    } else {
      const featureName = key.replace('Mode', '').replace(/([A-Z])/g, ' $1').trim();
      const status = value ? 'enabled' : 'disabled';
      showStatusMessage(`${featureName} ${status}`, 'success');
    }
  });
}

// ============================================
// EVENT LISTENERS
// ============================================

// YouTube Study Mode Toggle
youtubeToggle.addEventListener('change', (e) => {
  const isEnabled = e.target.checked;
  saveSetting('youtubeStudyMode', isEnabled);
  
  // Reload YouTube tabs if enabled
  if (isEnabled) {
    chrome.tabs.query({ url: '*://*.youtube.com/*' }, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.reload(tab.id);
      });
    });
  }
});

// Form Analysis Toggle
formAnalysisToggle.addEventListener('change', (e) => {
  const isEnabled = e.target.checked;
  saveSetting('formAnalysisMode', isEnabled);
  
  // Reload current tab to apply changes
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.reload(tabs[0].id);
    }
  });
});

// URL Shortener Toggle
urlShortenerToggle.addEventListener('change', (e) => {
  const isEnabled = e.target.checked;
  saveSetting('urlShortenerMode', isEnabled);
  
  // Reload current tab to apply changes
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.reload(tabs[0].id);
    }
  });
});

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize popup
 */
function init() {
  console.log("Web Security Suite - Popup loaded");
  
  // Load saved settings
  loadSettings();
  
  // Show initial state - wait for user to click Check Now
  showInitialState();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Listen for tab changes to refresh reputation
chrome.tabs.onActivated.addListener(() => {
  if (document.querySelector('.tab-btn.active').dataset.tab === 'reputation') {
    checkCurrentTabReputation();
  }
});

// Listen for URL changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id === tabId) {
        if (document.querySelector('.tab-btn.active').dataset.tab === 'reputation') {
          checkCurrentTabReputation();
        }
      }
    });
  }
});