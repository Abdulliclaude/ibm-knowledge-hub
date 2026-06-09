// Sidebar Component
// Handles sidebar navigation and interactions

const Sidebar = {
  /**
   * Initialize sidebar functionality
   */
  init() {
    this.setupNavigation();
    this.setupFilters();
    this.setupToggle();
    this.setupRefresh();
  },

  /**
   * Setup navigation items
   */
  setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all items
        navItems.forEach(nav => nav.classList.remove('active'));
        
        // Add active class to clicked item
        item.classList.add('active');
        
        // Get view type
        const view = item.getAttribute('data-view');
        
        // Update content
        if (window.App && window.App.filterByView) {
          window.App.filterByView(view);
        }
        
        // Close sidebar on mobile
        if (window.innerWidth <= 768) {
          this.closeSidebar();
        }
      });
    });
  },

  /**
   * Setup filter checkboxes
   */
  setupFilters() {
    const filterCheckboxes = document.querySelectorAll('.filter-checkbox');
    
    filterCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        if (window.App && window.App.applyFilters) {
          window.App.applyFilters();
        }
      });
    });
  },

  /**
   * Setup sidebar toggle for mobile
   */
  setupToggle() {
    const toggleBtn = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
    }

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        if (!sidebar.contains(e.target) && sidebar.classList.contains('open')) {
          this.closeSidebar();
        }
      }
    });
  },

  /**
   * Setup refresh button
   */
  setupRefresh() {
    const refreshBtn = document.getElementById('refreshBtn');
    
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        if (window.App && window.App.refreshContent) {
          window.App.refreshContent();
        }
      });
    }
  },

  /**
   * Close sidebar (mobile)
   */
  closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.remove('open');
  },

  /**
   * Update navigation counts
   * @param {object} counts - Object with count values
   */
  updateCounts(counts) {
    const countAll = document.getElementById('countAll');
    const countArticles = document.getElementById('countArticles');
    const countVideos = document.getElementById('countVideos');
    const countBookmarks = document.getElementById('countBookmarks');

    if (countAll) countAll.textContent = counts.all || 0;
    if (countArticles) countArticles.textContent = counts.articles || 0;
    if (countVideos) countVideos.textContent = counts.videos || 0;
    if (countBookmarks) countBookmarks.textContent = counts.bookmarks || 0;
  },

  /**
   * Update last updated time
   * @param {Date} date - Last update date
   */
  updateLastUpdated(date) {
    const lastUpdated = document.getElementById('lastUpdated');
    if (lastUpdated && date) {
      lastUpdated.textContent = Helpers.formatRelativeTime(date);
    }
  },

  /**
   * Get selected filters
   * @returns {Array} - Array of selected filter values
   */
  getSelectedFilters() {
    const checkboxes = document.querySelectorAll('.filter-checkbox:checked');
    return Array.from(checkboxes).map(cb => cb.value);
  },

  /**
   * Clear all filters
   */
  clearFilters() {
    const checkboxes = document.querySelectorAll('.filter-checkbox');
    checkboxes.forEach(cb => cb.checked = false);
  },

  /**
   * Set active view
   * @param {string} view - View name (all, articles, videos, bookmarks)
   */
  setActiveView(view) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      if (item.getAttribute('data-view') === view) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Sidebar;
}

// Made with Bob
