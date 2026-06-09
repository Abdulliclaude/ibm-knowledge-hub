// Helper Utility Functions
// Common utility functions used across the application

const Helpers = {
  /**
   * Format date to relative time (e.g., "2 days ago")
   * @param {string|Date} date - Date to format
   * @returns {string} - Formatted relative time
   */
  formatRelativeTime(date) {
    try {
      const now = new Date();
      const past = new Date(date);
      const diffMs = now - past;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);
      const diffWeek = Math.floor(diffDay / 7);
      const diffMonth = Math.floor(diffDay / 30);
      const diffYear = Math.floor(diffDay / 365);

      if (diffSec < 60) return 'Just now';
      if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
      if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
      if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
      if (diffWeek < 4) return `${diffWeek} week${diffWeek > 1 ? 's' : ''} ago`;
      if (diffMonth < 12) return `${diffMonth} month${diffMonth > 1 ? 's' : ''} ago`;
      return `${diffYear} year${diffYear > 1 ? 's' : ''} ago`;
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Unknown date';
    }
  },

  /**
   * Format date to readable string
   * @param {string|Date} date - Date to format
   * @returns {string} - Formatted date string
   */
  formatDate(date) {
    try {
      const d = new Date(date);
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return d.toLocaleDateString('en-US', options);
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  },

  /**
   * Truncate text to specified length
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} - Truncated text
   */
  truncateText(text, maxLength = 150) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  },

  /**
   * Strip HTML tags from text
   * @param {string} html - HTML string
   * @returns {string} - Plain text
   */
  stripHtml(html) {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  },

  /**
   * Sanitize user input
   * @param {string} input - User input
   * @returns {string} - Sanitized input
   */
  sanitizeInput(input) {
    if (!input) return '';
    return input.replace(/[<>]/g, '').trim();
  },

  /**
   * Generate unique ID
   * @returns {string} - Unique ID
   */
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Debounce function execution
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in ms
   * @returns {Function} - Debounced function
   */
  debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Throttle function execution
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in ms
   * @returns {Function} - Throttled function
   */
  throttle(func, limit = 1000) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * Parse YouTube duration (ISO 8601) to readable format
   * @param {string} duration - ISO 8601 duration (e.g., "PT10M30S")
   * @returns {string} - Readable duration (e.g., "10:30")
   */
  parseYouTubeDuration(duration) {
    try {
      if (!duration) return '0:00';
      
      const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
      if (!match) return '0:00';

      const hours = (match[1] || '').replace('H', '');
      const minutes = (match[2] || '').replace('M', '');
      const seconds = (match[3] || '').replace('S', '');

      const h = parseInt(hours) || 0;
      const m = parseInt(minutes) || 0;
      const s = parseInt(seconds) || 0;

      if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      }
      return `${m}:${s.toString().padStart(2, '0')}`;
    } catch (error) {
      console.error('Duration parsing error:', error);
      return '0:00';
    }
  },

  /**
   * Format number with commas
   * @param {number} num - Number to format
   * @returns {string} - Formatted number
   */
  formatNumber(num) {
    if (!num) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },

  /**
   * Extract tags from text
   * @param {string} text - Text to extract tags from
   * @param {string} category - Content category
   * @returns {Array} - Array of tags
   */
  extractTags(text, category) {
    const tags = new Set();
    
    // Add category as primary tag
    if (category) {
      tags.add(category);
    }

    // Common IBM-related keywords
    const keywords = [
      'AI', 'Cloud', 'Watson', 'Quantum', 'Security', 'Blockchain',
      'Hybrid Cloud', 'Red Hat', 'OpenShift', 'Kubernetes', 'DevOps',
      'Machine Learning', 'Data Science', 'Analytics', 'IoT',
      'Automation', 'Integration', 'API', 'Microservices'
    ];

    const lowerText = text.toLowerCase();
    keywords.forEach(keyword => {
      if (lowerText.includes(keyword.toLowerCase())) {
        tags.add(keyword);
      }
    });

    return Array.from(tags).slice(0, 5); // Limit to 5 tags
  },

  /**
   * Get thumbnail from content
   * @param {object} item - Content item
   * @returns {string} - Thumbnail URL or placeholder
   */
  getThumbnail(item) {
    if (item.thumbnail) return item.thumbnail;
    
    // Default placeholder based on type
    if (item.type === 'video') {
      return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%230f62fe" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="48" fill="white"%3E🎥%3C/text%3E%3C/svg%3E';
    }
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%230f62fe" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="48" fill="white"%3E📄%3C/text%3E%3C/svg%3E';
  },

  /**
   * Show notification
   * @param {string} message - Notification message
   * @param {string} type - Notification type (success, error, info, warning)
   */
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">${this.getNotificationIcon(type)}</span>
        <p class="notification-message">${message}</p>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  },

  /**
   * Get notification icon based on type
   * @param {string} type - Notification type
   * @returns {string} - Icon emoji
   */
  getNotificationIcon(type) {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type] || icons.info;
  },

  /**
   * Copy text to clipboard
   * @param {string} text - Text to copy
   * @returns {Promise} - Promise that resolves when copied
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.showNotification('Copied to clipboard!', 'success');
      return true;
    } catch (error) {
      console.error('Clipboard error:', error);
      this.showNotification('Failed to copy to clipboard', 'error');
      return false;
    }
  },

  /**
   * Check if element is in viewport
   * @param {HTMLElement} element - Element to check
   * @returns {boolean} - True if in viewport
   */
  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  /**
   * Smooth scroll to element
   * @param {string} selector - Element selector
   */
  scrollToElement(selector) {
    const element = document.querySelector(selector);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  },

  /**
   * Get query parameter from URL
   * @param {string} param - Parameter name
   * @returns {string|null} - Parameter value or null
   */
  getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  },

  /**
   * Set query parameter in URL
   * @param {string} param - Parameter name
   * @param {string} value - Parameter value
   */
  setQueryParam(param, value) {
    const url = new URL(window.location);
    url.searchParams.set(param, value);
    window.history.pushState({}, '', url);
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Helpers;
}

// Made with Bob
