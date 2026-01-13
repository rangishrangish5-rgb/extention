// ============================================
// OPTION 1: URL REPUTATION CHECK (UNCHANGED)
// ============================================

// Google Safe Browsing API Key
const GOOGLE_SAFE_BROWSING_API_KEY = "AIzaSyBUZLNrapuYy4Aoh_OfTNXCNzOwHuX8g48";

// Google Safe Browsing API v4 endpoint
const SAFE_BROWSING_API_URL = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${"AIzaSyBUZLNrapuYy4Aoh_OfTNXCNzOwHuX8g48"}`;

/**
 * Check URL reputation using Google Safe Browsing API
 * @param {string} url - The URL to check
 * @returns {Promise<Object>} - Reputation result with status, threat type, and risk score
 */
async function checkUrlReputation(url) {
  try {
    // Prepare the request body for Safe Browsing API
    const requestBody = {
      client: {
        clientId: "web-security-suite",
        clientVersion: "2.0.0"
      },
      threatInfo: {
        // Threat types to check against
        threatTypes: [
          "MALWARE",
          "SOCIAL_ENGINEERING",
          "UNWANTED_SOFTWARE",
          "POTENTIALLY_HARMFUL_APPLICATION"
        ],
        // Platform types
        platformTypes: ["ANY_PLATFORM"],
        // Threat entry types
        threatEntryTypes: ["URL"],
        // The URL to check
        threatEntries: [
          { url: url }
        ]
      }
    };

    // Make API request to Google Safe Browsing
    const response = await fetch(SAFE_BROWSING_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    // Parse the response
    const data = await response.json();

    // Check if any threats were found
    if (data.matches && data.matches.length > 0) {
      // Threat detected - website is malicious
      const threatType = data.matches[0].threatType;
      
      return {
        status: "Malicious",
        threatType: threatType,
        riskScore: 40, // +40 risk points for malicious detection
        url: url
      };
    } else {
      // No threats found - website is safe
      return {
        status: "Safe",
        threatType: "None",
        riskScore: 0, // 0 risk points for safe websites
        url: url
      };
    }
  } catch (error) {
    console.error("Error checking URL reputation:", error);
    
    // Return error status
    return {
      status: "Error",
      threatType: "Unknown",
      riskScore: 0,
      url: url,
      error: error.message
    };
  }
}

/**
 * Calculate final risk label based on risk score
 * @param {number} riskScore - The risk score (0-100)
 * @returns {string} - Risk label
 */
function getRiskLabel(riskScore) {
  if (riskScore >= 0 && riskScore <= 30) {
    return "Safe";
  } else if (riskScore >= 31 && riskScore <= 60) {
    return "Suspicious";
  } else if (riskScore >= 61 && riskScore <= 100) {
    return "High Risk";
  }
  return "Unknown";
}

// ============================================
// MESSAGE HANDLER
// ============================================

// Listen for messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // OPTION 1: URL Reputation Check
  if (request.action === "checkReputation") {
    (async () => {
      try {
        const url = request.url;
        
        // Check URL reputation using Safe Browsing API
        const result = await checkUrlReputation(url);
        
        // Calculate risk label
        const riskLabel = getRiskLabel(result.riskScore);
        
        // Send response back to popup
        sendResponse({
          success: true,
          data: {
            url: result.url,
            status: result.status,
            threatType: result.threatType,
            riskScore: result.riskScore,
            riskLabel: riskLabel,
            error: result.error || null
          }
        });
      } catch (error) {
        sendResponse({
          success: false,
          error: error.message
        });
      }
    })();
    
    // Return true to indicate async response
    return true;
  }
  
  // OPTION 4: URL Shortener Detection - forward to content script
  if (request.action === "checkShortener") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "analyzeShortener" }, (response) => {
          sendResponse(response || { success: false, error: "No response from content script" });
        });
      } else {
        sendResponse({ success: false, error: "No active tab" });
      }
    });
    return true;
  }
});

console.log("Web Security Suite - Background script loaded");
