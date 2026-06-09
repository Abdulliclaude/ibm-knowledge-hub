// IBM Knowledge Hub Configuration - Production Version
// This file uses placeholder values. Real API keys are set in Vercel environment variables.

const CONFIG = {
  // Groq API Configuration
  groq: {
    apiKey: 'YOUR_GROQ_API_KEY', // Set in Vercel dashboard
    model: 'llama-3.3-70b-versatile',
    maxTokens: 150,
    temperature: 0.7
  },

  // YouTube Data API Configuration
  youtube: {
    apiKey: 'YOUR_YOUTUBE_API_KEY', // Set in Vercel dashboard
    channelId: 'UCKWaEZ-_VweaEx1j62do_vQ', // IBM Technology channel
    maxResults: 30,
    order: 'date'
  },

  // IBM Article Sources (RSS Feeds)
  articles: {
    sources: [
      {
        name: 'Press Releases',
        url: 'https://newsroom.ibm.com/announcements?pagetemplate=rss',
        category: 'Press',
        icon: '🔬'
      },
      {
        name: 'IBM Developer',
        url: 'https://newsroom.ibm.com/press-releases-artificial-intelligence?pagetemplate=rss',
        category: 'development',
        icon: '💻'
      }
    ],
    corsProxy: 'https://api.allorigins.win/raw?url=',
  },

  // Cache Configuration
  cache: {
    expiryHours: 24,
    enableCache: true
  },

  // UI Configuration
  ui: {
    itemsPerPage: 20,
    enableAISummaries: true,
    defaultView: 'all',
    defaultSort: 'date-desc'
  },

  // Feature Flags
  features: {
    bookmarks: true,
    search: true,
    filters: true,
    aiSummaries: false,
    darkMode: false
  }
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}

// Made with Bob
