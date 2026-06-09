// Cache Management Utility
// Handles localStorage caching for API responses

const CacheManager = {
  /**
   * Check if cached data is still valid
   * @param {string} key - Cache key
   * @returns {boolean} - True if cache is valid
   */
  isValid(key) {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return false;

      const data = JSON.parse(cached);
      const now = Date.now();
      const expiryTime = CONFIG.cache.expiryHours * 60 * 60 * 1000;
      
      return (now - data.timestamp) < expiryTime;
    } catch (error) {
      console.error('Cache validation error:', error);
      return false;
    }
  },

  /**
   * Get cached data
   * @param {string} key - Cache key
   * @returns {any} - Cached data or null
   */
  get(key) {
    try {
      if (!CONFIG.cache.enableCache) return null;
      if (!this.isValid(key)) return null;

      const cached = localStorage.getItem(key);
      const data = JSON.parse(cached);
      
      console.log(`✅ Cache hit: ${key}`);
      return data.content;
    } catch (error) {
      console.error('Cache retrieval error:', error);
      return null;
    }
  },

  /**
   * Set cached data
   * @param {string} key - Cache key
   * @param {any} content - Data to cache
   */
  set(key, content) {
    try {
      if (!CONFIG.cache.enableCache) return;

      const data = {
        content: content,
        timestamp: Date.now()
      };

      localStorage.setItem(key, JSON.stringify(data));
      console.log(`💾 Cached: ${key}`);
    } catch (error) {
      console.error('Cache storage error:', error);
      // Handle quota exceeded error
      if (error.name === 'QuotaExceededError') {
        console.warn('Cache quota exceeded, clearing old cache...');
        this.clearOldest();
      }
    }
  },

  /**
   * Clear specific cache entry
   * @param {string} key - Cache key
   */
  clear(key) {
    try {
      localStorage.removeItem(key);
      console.log(`🗑️ Cleared cache: ${key}`);
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  },

  /**
   * Clear all cache entries
   */
  clearAll() {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith('ibm-hub-'));
      
      cacheKeys.forEach(key => localStorage.removeItem(key));
      console.log(`🗑️ Cleared all cache (${cacheKeys.length} entries)`);
    } catch (error) {
      console.error('Cache clear all error:', error);
    }
  },

  /**
   * Clear oldest cache entry to free up space
   */
  clearOldest() {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith('ibm-hub-'));
      
      if (cacheKeys.length === 0) return;

      let oldestKey = null;
      let oldestTime = Date.now();

      cacheKeys.forEach(key => {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (data.timestamp < oldestTime) {
            oldestTime = data.timestamp;
            oldestKey = key;
          }
        } catch (e) {
          // Invalid cache entry, remove it
          localStorage.removeItem(key);
        }
      });

      if (oldestKey) {
        localStorage.removeItem(oldestKey);
        console.log(`🗑️ Cleared oldest cache: ${oldestKey}`);
      }
    } catch (error) {
      console.error('Clear oldest cache error:', error);
    }
  },

  /**
   * Get cache statistics
   * @returns {object} - Cache stats
   */
  getStats() {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith('ibm-hub-'));
      
      let totalSize = 0;
      const entries = [];

      cacheKeys.forEach(key => {
        try {
          const value = localStorage.getItem(key);
          const size = new Blob([value]).size;
          const data = JSON.parse(value);
          
          totalSize += size;
          entries.push({
            key,
            size,
            timestamp: data.timestamp,
            age: Date.now() - data.timestamp
          });
        } catch (e) {
          // Skip invalid entries
        }
      });

      return {
        count: entries.length,
        totalSize: totalSize,
        totalSizeKB: (totalSize / 1024).toFixed(2),
        entries: entries.sort((a, b) => b.timestamp - a.timestamp)
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return { count: 0, totalSize: 0, entries: [] };
    }
  },

  /**
   * Get last update time for a cache key
   * @param {string} key - Cache key
   * @returns {Date|null} - Last update date or null
   */
  getLastUpdate(key) {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const data = JSON.parse(cached);
      return new Date(data.timestamp);
    } catch (error) {
      console.error('Get last update error:', error);
      return null;
    }
  }
};

// Cache keys constants
const CACHE_KEYS = {
  ARTICLES: 'ibm-hub-articles',
  VIDEOS: 'ibm-hub-videos',
  SUMMARIES: 'ibm-hub-summaries',
  BOOKMARKS: 'ibm-hub-bookmarks'
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CacheManager, CACHE_KEYS };
}

// Made with Bob
