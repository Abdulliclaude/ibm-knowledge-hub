// IBM Knowledge Hub Configuration
// Copy this file to config.js and add your API keys

const CONFIG = {
  // Groq API Configuration
  groq: {
    apiKey: 'YOUR_GROQ_API_KEY_HERE', // Get from https://console.groq.com
    model: 'llama-3.1-70b-versatile', // or 'mixtral-8x7b-32768'
    maxTokens: 150,
    temperature: 0.7
  },

  // YouTube Data API Configuration
  youtube: {
    apiKey: 'YOUR_YOUTUBE_API_KEY_HERE', // Get from https://console.cloud.google.com
    channelId: 'UCKWaEZ-_VweaEx1j62do_vQ', // IBM Technology channel
    maxResults: 30,
    order: 'date' // Options: date, relevance, viewCount
  },

  // IBM Article Sources (RSS Feeds)
  articles: {
    sources: [
      {
        name: 'IBM Research',
        url: 'https://research.ibm.com/blog/rss',
        category: 'research',
        icon: '🔬'
      },
      {
        name: 'IBM Developer',
        url: 'https://developer.ibm.com/blogs/feed/',
        category: 'development',
        icon: '💻'
      },
      {
        name: 'IBM Cloud Blog',
        url: 'https://www.ibm.com/blog/feed/',
        category: 'cloud',
        icon: '☁️'
      },
      {
        name: 'IBM Security Intelligence',
        url: 'https://securityintelligence.com/feed/',
        category: 'security',
        icon: '🔒'
      }
    ],
    // CORS proxy for fetching RSS feeds
    corsProxy: 'https://api.allorigins.win/raw?url=',
    // Alternative: 'https://corsproxy.io/?'
  },

  // Cache Configuration
  cache: {
    expiryHours: 24, // Cache duration in hours
    enableCache: true
  },

  // UI Configuration
  ui: {
    itemsPerPage: 20,
    enableAISummaries: true,
    defaultView: 'all', // Options: all, articles, videos
    defaultSort: 'date-desc' // Options: date-desc, date-asc, title-asc, title-desc
  },

  // Feature Flags
  features: {
    bookmarks: true,
    search: true,
    filters: true,
    aiSummaries: true,
    darkMode: false // Future feature
  }
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}

// Made with Bob
