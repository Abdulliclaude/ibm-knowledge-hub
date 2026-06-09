// Main Application
// Orchestrates all components and manages application state

const App = {
  // Application state
  state: {
    allContent: [],
    filteredContent: [],
    currentView: 'all',
    currentPage: 1,
    itemsPerPage: CONFIG.ui.itemsPerPage,
    searchQuery: '',
    selectedFilters: [],
    sortBy: CONFIG.ui.defaultSort
  },

  /**
   * Initialize the application
   */
  async init() {
    console.log('🚀 Initializing IBM Knowledge Hub...');

    // Show loading overlay
    this.showLoading();

    try {
      // Initialize components
      Sidebar.init();
      this.setupSearch();
      this.setupSort();
      this.setupModal();

      // Load content
      await this.loadContent();

      // Hide loading overlay
      this.hideLoading();

      console.log('✅ Application initialized successfully');
    } catch (error) {
      console.error('❌ Application initialization failed:', error);
      this.showError('Failed to initialize application. Please refresh the page.');
      this.hideLoading();
    }
  },

  /**
   * Load all content (articles and videos)
   */
  async loadContent() {
    try {
      console.log('📥 Loading content...');

      // Fetch articles and videos in parallel
      const [articles, videos] = await Promise.all([
        ArticlesAPI.fetchArticles(),
        YouTubeAPI.fetchVideos()
      ]);

      // Combine and store content
      this.state.allContent = [...articles, ...videos];
      this.state.filteredContent = [...this.state.allContent];

      // Sort content
      this.sortContent();

      // Display content
      this.displayContent();

      // Update counts
      this.updateCounts();

      // Update last updated time
      const lastUpdate = CacheManager.getLastUpdate(CACHE_KEYS.ARTICLES) || new Date();
      Sidebar.updateLastUpdated(lastUpdate);

      // Generate AI summaries in background (if enabled)
      if (CONFIG.features.aiSummaries) {
        this.generateSummariesInBackground();
      }

      console.log(`✅ Loaded ${this.state.allContent.length} items`);
    } catch (error) {
      console.error('Content loading error:', error);
      throw error;
    }
  },

  /**
   * Generate AI summaries in background
   */
  async generateSummariesInBackground() {
    try {
      // Only generate for items without summaries
      const itemsNeedingSummaries = this.state.allContent.filter(item => !item.summary);
      
      if (itemsNeedingSummaries.length === 0) {
        console.log('✅ All items already have summaries');
        return;
      }

      console.log(`🤖 Generating summaries for ${itemsNeedingSummaries.length} items...`);

      // Generate summaries (limited to first 10 to avoid rate limits)
      const itemsToProcess = itemsNeedingSummaries.slice(0, 10);
      
      for (const item of itemsToProcess) {
        const summary = await GroqAPI.generateSummary(
          item.description || item.title,
          item.id
        );
        
        if (summary) {
          item.summary = summary;
        }

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Refresh display with summaries
      this.displayContent();

      console.log('✅ Summaries generated');
    } catch (error) {
      console.error('Summary generation error:', error);
    }
  },

  /**
   * Display content in grid
   */
  displayContent() {
    const contentGrid = document.getElementById('contentGrid');
    const emptyState = document.getElementById('emptyState');
    const loadMoreContainer = document.getElementById('loadMoreContainer');

    if (!contentGrid) return;

    // Calculate items to display
    const startIndex = 0;
    const endIndex = this.state.currentPage * this.state.itemsPerPage;
    const itemsToDisplay = this.state.filteredContent.slice(startIndex, endIndex);

    // Check if empty
    if (itemsToDisplay.length === 0) {
      contentGrid.innerHTML = '';
      emptyState.style.display = 'block';
      loadMoreContainer.style.display = 'none';
      return;
    }

    emptyState.style.display = 'none';

    // Render cards
    const cardsHTML = itemsToDisplay.map(item => {
      if (item.type === 'article') {
        return ArticleCard.create(item);
      } else {
        return VideoCard.create(item);
      }
    }).join('');

    contentGrid.innerHTML = cardsHTML;

    // Show/hide load more button
    if (endIndex < this.state.filteredContent.length) {
      loadMoreContainer.style.display = 'flex';
      const loadMoreBtn = document.getElementById('loadMoreBtn');
      loadMoreBtn.onclick = () => this.loadMore();
    } else {
      loadMoreContainer.style.display = 'none';
    }

    // Update content info
    this.updateContentInfo();
  },

  /**
   * Load more content
   */
  loadMore() {
    this.state.currentPage++;
    this.displayContent();
    Helpers.scrollToElement('#contentGrid');
  },

  /**
   * Filter content by view
   * @param {string} view - View type (all, articles, videos, bookmarks)
   */
  filterByView(view) {
    this.state.currentView = view;
    this.state.currentPage = 1;
    this.applyFilters();
  },

  /**
   * Apply all filters
   */
  applyFilters() {
    let filtered = [...this.state.allContent];

    // Filter by view
    if (this.state.currentView === 'articles') {
      filtered = filtered.filter(item => item.type === 'article');
    } else if (this.state.currentView === 'videos') {
      filtered = filtered.filter(item => item.type === 'video');
    } else if (this.state.currentView === 'bookmarks') {
      const bookmarks = CacheManager.get(CACHE_KEYS.BOOKMARKS) || [];
      filtered = filtered.filter(item => bookmarks.includes(item.id));
    }

    // Filter by category
    const selectedFilters = Sidebar.getSelectedFilters();
    if (selectedFilters.length > 0) {
      filtered = filtered.filter(item => 
        selectedFilters.includes(item.category)
      );
    }

    // Filter by search query
    if (this.state.searchQuery) {
      const query = this.state.searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        return item.title.toLowerCase().includes(query) ||
               item.description.toLowerCase().includes(query) ||
               item.tags.some(tag => tag.toLowerCase().includes(query));
      });
    }

    this.state.filteredContent = filtered;
    this.state.currentPage = 1;
    this.sortContent();
    this.displayContent();
  },

  /**
   * Sort content
   */
  sortContent() {
    const sortBy = this.state.sortBy;

    this.state.filteredContent.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.publishedDate) - new Date(a.publishedDate);
        case 'date-asc':
          return new Date(a.publishedDate) - new Date(b.publishedDate);
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });
  },

  /**
   * Setup search functionality
   */
  setupSearch() {
    const searchInput = document.getElementById('searchInput');
    
    if (searchInput) {
      const debouncedSearch = Helpers.debounce((query) => {
        this.state.searchQuery = query;
        this.applyFilters();
      }, 300);

      searchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value);
      });
    }
  },

  /**
   * Setup sort functionality
   */
  setupSort() {
    const sortSelect = document.getElementById('sortSelect');
    
    if (sortSelect) {
      sortSelect.value = this.state.sortBy;
      sortSelect.addEventListener('change', (e) => {
        this.state.sortBy = e.target.value;
        this.sortContent();
        this.displayContent();
      });
    }
  },

  /**
   * Setup modal functionality
   */
  setupModal() {
    const modal = document.getElementById('contentModal');
    const modalClose = document.getElementById('modalClose');
    const modalOverlay = document.getElementById('modalOverlay');

    if (modalClose) {
      modalClose.addEventListener('click', () => this.closeModal());
    }

    if (modalOverlay) {
      modalOverlay.addEventListener('click', () => this.closeModal());
    }

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.style.display === 'flex') {
        this.closeModal();
      }
    });
  },

  /**
   * Close modal
   */
  closeModal() {
    const modal = document.getElementById('contentModal');
    modal.style.display = 'none';
    document.body.style.overflow = '';
  },

  /**
   * Update content counts
   */
  updateCounts() {
    const bookmarks = CacheManager.get(CACHE_KEYS.BOOKMARKS) || [];
    const articles = this.state.allContent.filter(item => item.type === 'article');
    const videos = this.state.allContent.filter(item => item.type === 'video');

    Sidebar.updateCounts({
      all: this.state.allContent.length,
      articles: articles.length,
      videos: videos.length,
      bookmarks: bookmarks.length
    });
  },

  /**
   * Update content info text
   */
  updateContentInfo() {
    const contentTitle = document.getElementById('contentTitle');
    const contentSubtitle = document.getElementById('contentSubtitle');

    if (!contentTitle || !contentSubtitle) return;

    const total = this.state.filteredContent.length;
    const displayed = Math.min(this.state.currentPage * this.state.itemsPerPage, total);

    let title = 'All Content';
    let subtitle = `Showing ${displayed} of ${total} items`;

    switch (this.state.currentView) {
      case 'articles':
        title = 'Articles';
        subtitle = `${total} IBM articles`;
        break;
      case 'videos':
        title = 'Videos';
        subtitle = `${total} IBM videos`;
        break;
      case 'bookmarks':
        title = 'Bookmarks';
        subtitle = `${total} bookmarked items`;
        break;
    }

    if (this.state.searchQuery) {
      subtitle = `${total} results for "${this.state.searchQuery}"`;
    }

    contentTitle.textContent = title;
    contentSubtitle.textContent = subtitle;
  },

  /**
   * Refresh content
   */
  async refreshContent() {
    try {
      Helpers.showNotification('Refreshing content...', 'info');
      
      // Clear cache
      CacheManager.clear(CACHE_KEYS.ARTICLES);
      CacheManager.clear(CACHE_KEYS.VIDEOS);

      // Reload content
      await this.loadContent();

      Helpers.showNotification('Content refreshed!', 'success');
    } catch (error) {
      console.error('Refresh error:', error);
      Helpers.showNotification('Failed to refresh content', 'error');
    }
  },

  /**
   * Show loading overlay
   */
  showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'flex';
  },

  /**
   * Hide loading overlay
   */
  hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'none';
  },

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    const retryBtn = document.getElementById('retryBtn');

    if (errorMessage && errorText) {
      errorText.textContent = message;
      errorMessage.style.display = 'flex';

      if (retryBtn) {
        retryBtn.onclick = () => {
          errorMessage.style.display = 'none';
          this.init();
        };
      }
    }
  }
};

// Make App available globally
window.App = App;
window.appState = App.state;

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = App;
}

// Made with Bob
