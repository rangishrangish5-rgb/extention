// ============================================
// WEB SECURITY SUITE - CONTENT SCRIPT
// ============================================

// Global state
const securityState = {
  youtubeStudyMode: false,
  formAnalysisMode: false,
  urlShortenerMode: false,
  youtubeObserver: null
};

// ============================================
// OPTION 2: YOUTUBE STUDY MODE
// ============================================

// PURE Academic/Educational keywords ONLY
const STUDY_KEYWORDS = [
  'lecture series', 'class recording', 'course material',
'syllabus', 'curriculum', 'academic lecture',
'concept explanation', 'theory', 'numericals',
'problem solving', 'worked examples', 'solutions explained',
'proof', 'derivation', 'formula', 'equations','lab experiment', 'practical session', 'simulation',
'case study', 'research methodology', 'data interpretation',
'statistical analysis', 'regression', 'classification',
'probability', 'bayes theorem', 'linear algebra', 'matrix', 'vector', 'calculus', 'integration', 'differentiation','code walkthrough', 'live coding',
'debugging', 'error fixing', 'stack trace',
'complexity analysis', 'time complexity', 'space complexity',
'big o notation', 'interview preparation',
'university lecture', 'college lecture',
'nptel lecture', 'iit lecture', 'mit lecture',
'stanford lecture', 'harvard lecture',
'semester exam', 'internal assessment',
'final exam review', 'exam solutions', 'exam discussion', 
  'tutorial', 'lecture', 'course', 'class', 'learn', 'education', 'educational',
  'lesson', 'training', 'workshop', 'seminar', 'webinar', 'guide', 'instruction',
  'how to', 'step by step', 'beginners guide', 'for beginners', 'introduction to',
  'crash course', 'full course', 'complete course', 'masterclass', 'online course',
  'math', 'mathematics', 'algebra', 'calculus', 'geometry', 'trigonometry', 'statistics',
  'physics', 'chemistry', 'biology', 'science', 'geography', 'history', 'economics',
  'psychology', 'sociology', 'philosophy', 'literature', 'linguistics', 'grammar',
  'vocabulary', 'language learning', 'foreign language',
  'programming', 'coding', 'software', 'development', 'computer science', 'cs',
  'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'php', 'ruby', 'go', 'rust',
  'html', 'css', 'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask',
  'database', 'sql', 'mongodb', 'mysql', 'postgresql',
  'algorithm', 'data structure', 'data structures', 'oop', 'object oriented',
  'machine learning', 'ml', 'artificial intelligence', 'ai', 'deep learning', 'neural network',
  'data science', 'data analysis', 'big data', 'analytics',
  'cybersecurity', 'network security', 'information security',
  'web development', 'frontend', 'backend', 'full stack', 'mobile development',
  'devops', 'cloud', 'aws', 'azure', 'google cloud', 'docker', 'kubernetes',
  'engineering', 'mechanical', 'civil', 'electrical', 'electronics', 'robotics',
  'automation', 'iot', 'internet of things', 'embedded', 'arduino', 'raspberry pi',
  '3d printing', 'cad', 'design', 'architecture',
  'business', 'management', 'leadership', 'marketing', 'digital marketing', 'seo',
  'finance', 'accounting', 'investment', 'stock market', 'trading', 'cryptocurrency',
  'entrepreneurship', 'startup', 'project management', 'agile', 'scrum',
  'career', 'job interview', 'resume', 'cv', 'public speaking', 'communication',
  'exam', 'test', 'quiz', 'preparation', 'competitive exam', 'entrance exam',
  'certification', 'certificate', 'degree', 'diploma', 'mooc',
  'udemy', 'coursera', 'edx', 'khan academy', 'skillshare', 'linkedin learning',
  'mit opencourseware', 'stanford online', 'harvard online', 'nptel', 'swayam',
  'school', 'high school', 'secondary school', 'college', 'university',
  'undergraduate', 'graduate', 'postgraduate', 'phd', 'research',
  'thesis', 'dissertation', 'paper', 'publication', 'journal',
  'quantum physics', 'astronomy', 'astrophysics', 'cosmology',
  'genetics', 'evolution', 'microbiology', 'organic chemistry', 'inorganic chemistry',
  'physical chemistry', 'thermodynamics', 'electromagnetism', 'optics',
  'programming interview', 'coding interview', 'leetcode', 'hackerrank',
  'system design', 'design pattern', 'software architecture',
  'jee', 'neet', 'gate', 'upsc', 'ias', 'ips', 'cat', 'mat', 'xat',
  'cbse', 'icse', 'ncert', 'board exam', 'competitive',
  'iit jee', 'medical entrance', 'engineering entrance',
  'study with me', 'pomodoro', 'study technique', 'study tips', 'study method',
  'note taking', 'mind mapping', 'flashcards', 'anki', 'spaced repetition',
  'active recall', 'feynman technique', 'pomodoro technique',
  'english', 'spanish', 'french', 'german', 'chinese', 'japanese', 'korean',
  'hindi', 'sanskrit', 'tamil', 'telugu', 'malayalam', 'kannada', 'bengali',
  'marathi', 'gujarati', 'punjabi', 'urdu'
];

// BLOCK LIST: Keywords that should ALWAYS block videos (even if they have study keywords)
const BLOCK_KEYWORDS = [
  'song', 'songs', 'music','Mix','Shorts','shorts','musical', 'entertainment', 'movie', 'film', 'cinema',
  'game', 'games', 'gaming', 'playthrough', 'walkthrough', 'gameplay',
  'vlog', 'vlogging', 'daily vlog', 'lifestyle', 'fashion', 'beauty', 'makeup',
  'comedy', 'funny', 'joke', 'prank', 'challenge', 'memes', 'meme',
  'celebrities', 'celebrity', 'gossip', 'rumor', 'scandal',
  'sports', 'football', 'soccer', 'basketball', 'cricket', 'tennis', 'golf',
  'cooking', 'recipe', 'food', 'restaurant', 'travel', 'vacation', 'holiday',
  'shopping', 'haul', 'unboxing', 'review', 'product review',
  'asmr', 'satisfying', 'relaxing', 'meditation', 'sleep',
  'anime', 'manga', 'cartoon', 'animation', 'netflix', 'hbo', 'disney',
  'party', 'nightlife', 'club', 'dance', 'dancing',
  'dating', 'relationship', 'love', 'romance',
  'horror', 'scary', 'thriller', 'action', 'adventure',
  'trailer', 'teaser', 'preview',
  'podcast', 'talk show', 'interview',
  'short film', 'documentary', 'series',
  'fortnite', 'minecraft', 'roblox', 'valorant', 'cod', 'call of duty',
  'stream', 'livestream', 'twitch',
  'tiktok', 'reels', 'shorts', 'compilation', 'highlights',
  'motivation', 'inspirational', 'self-help',
  'workout', 'fitness', 'gym', 'exercise','trending', 'must watch',
'you won’t believe', 'shocking',
'epic', 'crazy', 'insane',
'watch till end', 'emotional', 'reaction video',
'roasting', 'exposed','instagram', 'snapchat', 'whatsapp',
'influencer', 'creator', 'yoga'
];

function hasStudyKeyword(text) {
  try {
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return false;
    }
    
    const lowerText = text.toLowerCase();
    
    for (const keyword of STUDY_KEYWORDS) {
      if (lowerText.includes(keyword.toLowerCase())) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error in hasStudyKeyword:', error);
    return false;
  }
}

function hasBlockKeyword(text) {
  try {
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return false;
    }
    
    const lowerText = text.toLowerCase();
    
    for (const keyword of BLOCK_KEYWORDS) {
      if (lowerText.includes(keyword.toLowerCase())) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error in hasBlockKeyword:', error);
    return false;
  }
}

function getVideoTitle(videoElement) {
  try {
    const selectors = ['#video-title', '#video-title-link', '.title', 'yt-formatted-string'];
    
    for (const selector of selectors) {
      try {
        const element = videoElement.querySelector(selector);
        if (element && element.textContent && element.textContent.trim() !== '') {
          return element.textContent.trim();
        }
      } catch (e) {
        continue;
      }
    }
    
    if (videoElement.hasAttribute('aria-label')) {
      return videoElement.getAttribute('aria-label').trim();
    }
    
    return '';
  } catch (error) {
    console.error('Error in getVideoTitle:', error);
    return '';
  }
}

function getVideoDescription(videoElement) {
  try {
    // Try to get description from YouTube's metadata
    const descriptionSelectors = [
      '#description-text',
      'ytd-video-description-transcript-snippet-renderer',
      '#description',
      '.ytd-video-secondary-info-renderer',
      'yt-attributed-string',
      '[id*="description"]',
      '[class*="description"]'
    ];
    
    for (const selector of descriptionSelectors) {
      try {
        const element = videoElement.querySelector(selector);
        if (element && element.textContent && element.textContent.trim() !== '') {
          return element.textContent.trim();
        }
      } catch (e) {
        continue;
      }
    }
    
    // For homepage videos, try to get the description text
    let descriptionText = '';
    try {
      const metadataLines = videoElement.querySelectorAll('yt-formatted-string, span');
      
      metadataLines.forEach(element => {
        try {
          if (element && element.textContent && element.textContent.trim() !== '') {
            const text = element.textContent.trim();
            // Skip titles and channel names (usually shorter)
            if (text.length > 50 && !text.includes('•') && !text.includes('views')) {
              descriptionText += ' ' + text;
            }
          }
        } catch (e) {
          // Skip errors in individual elements
        }
      });
    } catch (e) {
      // Skip if querySelectorAll fails
    }
    
    return descriptionText.trim();
  } catch (error) {
    console.error('Error in getVideoDescription:', error);
    return '';
  }
}

function shouldPlayVideo(videoElement) {
  try {
    // Get both title and description
    const title = getVideoTitle(videoElement);
    const description = getVideoDescription(videoElement);
    
    // FIRST: Check for BLOCK keywords (ALWAYS block if found)
    if (hasBlockKeyword(title) || hasBlockKeyword(description)) {
      return false; // BLOCK - contains song, music, etc.
    }
    
    // SECOND: Check for STUDY keywords (ALLOW if found, unless blocked above)
    const hasTitleKeyword = hasStudyKeyword(title);
    const hasDescriptionKeyword = hasStudyKeyword(description);
    
    // If keywords found in either, return true (PLAY)
    // If no keywords in both, return false (BLOCK)
    return hasTitleKeyword || hasDescriptionKeyword;
  } catch (error) {
    console.error('Error in shouldPlayVideo:', error);
    return false; // Default to blocking on error
  }
}

function blockNonStudyVideos() {
  if (!securityState.youtubeStudyMode || !isYouTube()) return;
  
  try {
    // 1. Block Shorts (always blocked)
    const shortsElements = document.querySelectorAll(
      'ytd-reel-shelf-renderer, ytd-reel-item-renderer, [title*="Shorts"]'
    );
    
    shortsElements.forEach(short => {
      try {
        if (short && short.style) {
          short.style.display = 'none';
        }
      } catch (e) {
        // Skip errors on individual shorts
      }
    });
    
    // 2. Check and block non-academic videos
    const videoSelectors = [
      'ytd-rich-item-renderer', 
      'ytd-grid-video-renderer', 
      'ytd-video-renderer',
      'ytd-compact-video-renderer'
    ];
    
    videoSelectors.forEach(selector => {
      try {
        const videos = document.querySelectorAll(selector);
        
        videos.forEach(video => {
          try {
            if (!video || !video.style) return;
            
            // Check if video should play
            const shouldPlay = shouldPlayVideo(video);
            
            if (!shouldPlay) {
              // Should NOT play - BLOCK
              if (!video.querySelector('.study-overlay')) {
                const overlay = document.createElement('div');
                overlay.className = 'study-overlay';
                overlay.style.cssText = `
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  background: rgba(0, 0, 0, 0.9);
                  z-index: 100;
                  border-radius: 8px;
                `;
                
                video.style.position = 'relative';
                video.style.opacity = '0.7';
                video.appendChild(overlay);
                
                const links = video.querySelectorAll('a');
                links.forEach(link => {
                  try {
                    link.style.pointerEvents = 'none';
                    link.style.cursor = 'not-allowed';
                  } catch (e) {
                    // Skip link errors
                  }
                });
              }
            } else {
              // Should play - ALLOW
              video.style.opacity = '1';
              
              const overlay = video.querySelector('.study-overlay');
              if (overlay && overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
              }
              
              const links = video.querySelectorAll('a');
              links.forEach(link => {
                try {
                  link.style.pointerEvents = '';
                  link.style.cursor = '';
                } catch (e) {
                  // Skip link errors
                }
              });
            }
          } catch (videoError) {
            console.error('Error processing video:', videoError);
          }
        });
      } catch (selectorError) {
        console.error('Error with selector:', selector, selectorError);
      }
    });
    
    // 3. Block non-academic watch pages
    if (window.location.pathname.includes('/watch')) {
      setTimeout(() => {
        try {
          const titleElement = document.querySelector('h1.ytd-watch-metadata yt-formatted-string');
          const descriptionElement = document.querySelector('#description-text, #description, ytd-text-container');
          
          let title = '';
          let description = '';
          
          if (titleElement) {
            title = titleElement.textContent.trim();
          }
          
          if (descriptionElement) {
            description = descriptionElement.textContent.trim();
          }
          
          // Check for BLOCK keywords first
          const hasBlock = hasBlockKeyword(title) || hasBlockKeyword(description);
          
          // Check for STUDY keywords
          const hasStudy = hasStudyKeyword(title) || hasStudyKeyword(description);
          
          // Decide: BLOCK if has block keywords OR no study keywords
          const shouldPlayWatchPage = !hasBlock && hasStudy;
          
          if (!shouldPlayWatchPage) {
            // Should NOT play - BLOCK
            const player = document.querySelector('#movie_player');
            if (player && player.style) {
              player.style.opacity = '0.3';
              
              if (!player.querySelector('.watch-overlay')) {
                const overlay = document.createElement('div');
                overlay.className = 'watch-overlay';
                overlay.style.cssText = `
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  background: rgba(0, 0, 0, 0.95);
                  z-index: 1000;
                `;
                player.style.position = 'relative';
                player.appendChild(overlay);
              }
            }
          } else {
            // Should play - ALLOW
            const player = document.querySelector('#movie_player');
            if (player && player.style) {
              player.style.opacity = '1';
              
              const overlay = player.querySelector('.watch-overlay');
              if (overlay && overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
              }
            }
          }
        } catch (watchError) {
          console.error('Error processing watch page:', watchError);
        }
      }, 1000);
    }
  } catch (error) {
    console.error('Error in blockNonStudyVideos:', error);
  }
}

function cleanupYouTubeBlocks() {
  try {
    const overlays = document.querySelectorAll('.study-overlay, .watch-overlay');
    overlays.forEach(overlay => {
      try {
        if (overlay && overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      } catch (e) {
        // Skip individual overlay errors
      }
    });
    
    const shorts = document.querySelectorAll('ytd-reel-shelf-renderer, ytd-reel-item-renderer');
    shorts.forEach(short => {
      try {
        if (short && short.style) {
          short.style.display = '';
        }
      } catch (e) {
        // Skip individual short errors
      }
    });
    
    const videos = document.querySelectorAll('ytd-rich-item-renderer, ytd-video-renderer');
    videos.forEach(video => {
      try {
        if (video && video.style) {
          video.style.opacity = '1';
          video.style.position = '';
        }
        
        const links = video.querySelectorAll('a');
        links.forEach(link => {
          try {
            link.style.pointerEvents = '';
            link.style.cursor = '';
          } catch (e) {
            // Skip link errors
          }
        });
      } catch (e) {
        // Skip video errors
      }
    });
    
    const player = document.querySelector('#movie_player');
    if (player && player.style) {
      player.style.opacity = '1';
      player.style.position = '';
    }
  } catch (error) {
    console.error('Error in cleanupYouTubeBlocks:', error);
  }
}

function setupYouTubeObserver() {
  try {
    if (securityState.youtubeObserver) {
      securityState.youtubeObserver.disconnect();
    }
    
    securityState.youtubeObserver = new MutationObserver(() => {
      if (securityState.youtubeStudyMode && isYouTube()) {
        setTimeout(blockNonStudyVideos, 300);
      }
    });
    
    securityState.youtubeObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  } catch (error) {
    console.error('Error in setupYouTubeObserver:', error);
  }
}

function initYouTubeStudyMode() {
  try {
    if (!isYouTube()) return;
    
    if (securityState.youtubeStudyMode) {
      blockNonStudyVideos();
      setupYouTubeObserver();
      
      // Run multiple times to catch dynamically loaded content
      setTimeout(blockNonStudyVideos, 500);
      setTimeout(blockNonStudyVideos, 2000);
    } else {
      cleanupYouTubeBlocks();
      
      if (securityState.youtubeObserver) {
        securityState.youtubeObserver.disconnect();
      }
    }
  } catch (error) {
    console.error('Error in initYouTubeStudyMode:', error);
  }
}

// ============================================
// OPTION 3: FORM SECURITY ANALYSIS
// ============================================

function getDomain(url) {
  try {
    if (!url || url === '' || url === '#') {
      return window.location.hostname;
    }
    
    if (url.startsWith('/') || !url.includes('://')) {
      return window.location.hostname;
    }
    
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    return window.location.hostname;
  }
}

function isSensitiveInput(input) {
  try {
    const type = input.type.toLowerCase();
    const name = (input.name || '').toLowerCase();
    const id = (input.id || '').toLowerCase();
    
    if (type === 'password') return true;
    if (type === 'email') return true;
    
    const cardKeywords = ['card', 'credit', 'debit', 'cvv', 'cvc', 'expiry'];
    const isCreditCard = cardKeywords.some(keyword => 
      name.includes(keyword) || id.includes(keyword)
    );
    
    return isCreditCard;
  } catch (error) {
    console.error('Error in isSensitiveInput:', error);
    return false;
  }
}

function analyzeForm(form) {
  try {
    const formAction = form.action || '';
    const formDomain = getDomain(formAction);
    const currentDomain = window.location.hostname;
    
    const inputs = Array.from(form.querySelectorAll('input'));
    const sensitiveInputs = inputs.filter(input => isSensitiveInput(input));
    
    const isSuspicious = sensitiveInputs.length > 0 && formDomain !== currentDomain;
    
    return {
      form: form,
      formDomain: formDomain,
      currentDomain: currentDomain,
      sensitiveInputs: sensitiveInputs,
      isSuspicious: isSuspicious
    };
  } catch (error) {
    console.error('Error in analyzeForm:', error);
    return {
      form: form,
      formDomain: '',
      currentDomain: window.location.hostname,
      sensitiveInputs: [],
      isSuspicious: false
    };
  }
}

function highlightSuspiciousInputs(inputs) {
  try {
    inputs.forEach(input => {
      try {
        input.style.border = '2px solid #f44336';
        input.style.boxShadow = '0 0 5px rgba(244, 67, 54, 0.5)';
        input.setAttribute('data-security-warning', 'true');
      } catch (e) {
        // Skip individual input errors
      }
    });
  } catch (error) {
    console.error('Error in highlightSuspiciousInputs:', error);
  }
}

function removeInputHighlights() {
  try {
    const highlightedInputs = document.querySelectorAll('[data-security-warning="true"]');
    highlightedInputs.forEach(input => {
      try {
        input.style.border = '';
        input.style.boxShadow = '';
        input.removeAttribute('data-security-warning');
      } catch (e) {
        // Skip individual input errors
      }
    });
  } catch (error) {
    console.error('Error in removeInputHighlights:', error);
  }
}

function scanFormsOnPage() {
  try {
    if (!securityState.formAnalysisMode) {
      removeInputHighlights();
      return;
    }
    
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      try {
        const analysis = analyzeForm(form);
        
        if (analysis.isSuspicious) {
          highlightSuspiciousInputs(analysis.sensitiveInputs);
          
          if (!form.hasAttribute('data-security-warning-added')) {
            form.addEventListener('submit', function(e) {
              const confirmed = confirm(
                '⚠️ Security Warning\n\n' +
                'This form submits to an external domain and may be unsafe.\n\n' +
                'Are you sure you want to continue?'
              );
              
              if (!confirmed) {
                e.preventDefault();
              }
            }, true);
            
            form.setAttribute('data-security-warning-added', 'true');
          }
        }
      } catch (formError) {
        console.error('Error processing form:', formError);
      }
    });
  } catch (error) {
    console.error('Error in scanFormsOnPage:', error);
  }
}

// ============================================
// OPTION 4: URL SHORTENER DETECTION
// ============================================

const URL_SHORTENERS = [
  'bit.ly', 'tinyurl.com', 'goo.gl', 'ow.ly', 'short.link',
  't.co', 'buff.ly', 'adf.ly', 'is.gd', 'cli.gs',
  'tiny.cc', 'u.to', 'j.mp', 'tr.im', 'soo.gd',
  'rebrand.ly', 'bl.ink', 'shorturl.at', 'cutt.ly', 's.id',
  'bitly.com', 'shorturl.com', 'miniurl.com', 'snip.ly'
];

function detectUrlShortener() {
  try {
    const currentDomain = window.location.hostname.replace('www.', '');
    const isShortener = URL_SHORTENERS.some(shortener => 
      currentDomain === shortener
    );
    
    return {
      isShortener: isShortener,
      domain: currentDomain,
      url: window.location.href
    };
  } catch (error) {
    console.error('Error in detectUrlShortener:', error);
    return {
      isShortener: false,
      domain: '',
      url: window.location.href
    };
  }
}

function showShortenerWarning() {
  try {
    const existing = document.getElementById('shortener-warning-banner');
    if (existing) return;
    
    const banner = document.createElement('div');
    banner.id = 'shortener-warning-banner';
    banner.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #ff9800;
        color: white;
        padding: 10px 15px;
        z-index: 999998;
        font-family: Arial, sans-serif;
        display: flex;
        align-items: center;
        justify-content: space-between;
      ">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 20px;">🔗</span>
          <div>
            <div style="font-weight: bold; font-size: 14px;">URL Shortener Detected</div>
            <div style="font-size: 12px;">Be cautious about clicking links</div>
          </div>
        </div>
        <button id="dismiss-shortener-warning" style="
          background: white;
          color: #ff9800;
          border: none;
          padding: 5px 10px;
          border-radius: 3px;
          cursor: pointer;
          font-size: 12px;
          font-weight: bold;
        ">
          Dismiss
        </button>
      </div>
    `;
    
    document.body.insertBefore(banner, document.body.firstChild);
    
    const dismissBtn = document.getElementById('dismiss-shortener-warning');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        try {
          if (banner.parentNode) {
            banner.parentNode.removeChild(banner);
          }
        } catch (e) {
          console.error('Error dismissing banner:', e);
        }
      });
    }
  } catch (error) {
    console.error('Error in showShortenerWarning:', error);
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function isYouTube() {
  try {
    return window.location.hostname.includes('youtube.com');
  } catch (e) {
    return false;
  }
}

// ============================================
// MAIN INITIALIZATION
// ============================================

function init() {
  console.log('Web Security Suite - Content script loaded');
  
  try {
    chrome.storage.sync.get(['youtubeStudyMode', 'formAnalysisMode', 'urlShortenerMode'], (result) => {
      try {
        securityState.youtubeStudyMode = result.youtubeStudyMode || false;
        securityState.formAnalysisMode = result.formAnalysisMode || false;
        securityState.urlShortenerMode = result.urlShortenerMode || false;
        
        // Initialize YouTube Study Mode
        if (isYouTube()) {
          initYouTubeStudyMode();
        }
        
        // Initialize Form Security Analysis
        if (securityState.formAnalysisMode) {
          scanFormsOnPage();
        }
        
        // Initialize URL Shortener Detection
        if (securityState.urlShortenerMode) {
          const shortenerResult = detectUrlShortener();
          if (shortenerResult.isShortener) {
            showShortenerWarning();
          }
        }
      } catch (storageError) {
        console.error('Error processing storage data:', storageError);
      }
    });
  } catch (error) {
    console.error('Error in init:', error);
  }
}

// ============================================
// EVENT LISTENERS
// ============================================

try {
  chrome.storage.onChanged.addListener((changes) => {
    try {
      // YouTube Study Mode
      if (changes.youtubeStudyMode) {
        securityState.youtubeStudyMode = changes.youtubeStudyMode.newValue;
        if (isYouTube()) {
          initYouTubeStudyMode();
        }
      }
      
      // Form Analysis Mode
      if (changes.formAnalysisMode) {
        securityState.formAnalysisMode = changes.formAnalysisMode.newValue;
        scanFormsOnPage();
      }
      
      // URL Shortener Mode
      if (changes.urlShortenerMode) {
        securityState.urlShortenerMode = changes.urlShortenerMode.newValue;
        if (securityState.urlShortenerMode) {
          const shortenerResult = detectUrlShortener();
          if (shortenerResult.isShortener) {
            showShortenerWarning();
          }
        } else {
          const banner = document.getElementById('shortener-warning-banner');
          if (banner && banner.parentNode) {
            banner.parentNode.removeChild(banner);
          }
        }
      }
    } catch (changeError) {
      console.error('Error processing storage changes:', changeError);
    }
  });

  // Listen for messages from background/popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    try {
      if (request.action === 'analyzeShortener') {
        const shortenerResult = detectUrlShortener();
        
        const links = Array.from(document.querySelectorAll('a[href]'));
        const shortenedLinks = [];
        
        links.forEach(link => {
          try {
            const href = link.href;
            const linkDomain = new URL(href).hostname.replace('www.', '');
            const isShortened = URL_SHORTENERS.some(shortener => 
              linkDomain === shortener
            );
            
            if (isShortened) {
              shortenedLinks.push({
                url: href,
                domain: linkDomain,
                text: link.textContent.trim().substring(0, 50)
              });
            }
          } catch (e) {
            // Skip invalid URLs
          }
        });
        
        sendResponse({
          success: true,
          data: {
            currentUrl: shortenerResult,
            linksFound: shortenedLinks
          }
        });
      }
    } catch (messageError) {
      console.error('Error processing runtime message:', messageError);
      sendResponse({
        success: false,
        error: messageError.message
      });
    }
    
    return true;
  });
} catch (listenerError) {
  console.error('Error setting up event listeners:', listenerError);
}

// Initialize when DOM is ready
try {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
} catch (initError) {
  console.error('Error in DOM initialization:', initError);
}