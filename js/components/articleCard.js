// Article Card Component
// Renders article cards in the content grid

const ArticleCard = {
  /**
   * Create article card HTML
   * @param {object} article - Article data object
   * @returns {string} - HTML string for article card
   */
  create(article) {
    const isBookmarked = this.isBookmarked(article.id);
    const relativeTime = Helpers.formatRelativeTime(article.publishedDate);
    const tags = article.tags.slice(0, 3); // Limit to 3 tags

    return `
      <div class="content-card carbon-card" data-id="${article.id}" data-type="article">
        <div class="card-thumbnail">
          <img src="${article.thumbnail}" alt="${article.title}" loading="lazy">
          <span class="card-type-badge article">Article</span>
        </div>
        <div class="card-content">
          <div class="card-meta">
            <span class="card-source ${article.category}">
              <span class="card-source-icon">${article.icon}</span>
              ${article.source}
            </span>
            <span class="card-date">${relativeTime}</span>
          </div>
          <h3 class="card-title">${article.title}</h3>
          <p class="card-description">${Helpers.truncateText(article.description, 150)}</p>
          ${article.summary ? `
            <div class="card-summary">
              <strong>🤖 AI Summary:</strong> ${article.summary}
            </div>
          ` : ''}
          ${tags.length > 0 ? `
            <div class="card-tags">
              ${tags.map(tag => `<span class="tag ${article.category}">${tag}</span>`).join('')}
            </div>
          ` : ''}
          <div class="card-actions">
            <button class="btn-read" onclick="ArticleCard.openArticle('${article.id}')">
              <span>📖</span> Read Article
            </button>
            <button class="btn-bookmark ${isBookmarked ? 'bookmarked' : ''}" 
                    onclick="ArticleCard.toggleBookmark('${article.id}')"
                    title="${isBookmarked ? 'Remove bookmark' : 'Add bookmark'}">
              ${isBookmarked ? '⭐' : '☆'}
            </button>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Create multiple article cards
   * @param {Array} articles - Array of article objects
   * @returns {string} - HTML string for all cards
   */
  createMultiple(articles) {
    return articles.map(article => this.create(article)).join('');
  },

  /**
   * Open article in modal
   * @param {string} articleId - Article ID
   */
  openArticle(articleId) {
    const article = window.appState?.allContent?.find(item => item.id === articleId);
    if (!article) return;

    const modal = document.getElementById('contentModal');
    const modalBody = document.getElementById('modalBody');

    const relativeTime = Helpers.formatRelativeTime(article.publishedDate);
    const fullDate = Helpers.formatDate(article.publishedDate);

    modalBody.innerHTML = `
      <div class="modal-header">
        <img src="${article.thumbnail}" alt="${article.title}" class="modal-thumbnail">
        <h2 class="modal-title">${article.title}</h2>
        <div class="modal-meta">
          <div class="modal-meta-item">
            <span>${article.icon}</span>
            <span>${article.source}</span>
          </div>
          <div class="modal-meta-item">
            <span>📅</span>
            <span title="${fullDate}">${relativeTime}</span>
          </div>
          ${article.author ? `
            <div class="modal-meta-item">
              <span>✍️</span>
              <span>${article.author}</span>
            </div>
          ` : ''}
        </div>
      </div>
      <div class="modal-description">
        ${article.description}
      </div>
      ${article.summary ? `
        <div class="modal-summary">
          <div class="modal-summary-title">
            <span>🤖</span>
            <span>AI-Generated Summary</span>
          </div>
          <p class="modal-summary-text">${article.summary}</p>
        </div>
      ` : ''}
      ${article.tags.length > 0 ? `
        <div class="card-tags">
          ${article.tags.map(tag => `<span class="tag ${article.category}">${tag}</span>`).join('')}
        </div>
      ` : ''}
      <div class="modal-actions">
        <a href="${article.link}" target="_blank" rel="noopener noreferrer" class="btn-primary">
          <span>🔗</span>
          <span>Read Full Article</span>
        </a>
        <button class="btn-secondary" onclick="Helpers.copyToClipboard('${article.link}')">
          <span>📋</span>
          <span>Copy Link</span>
        </button>
      </div>
    `;

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  },

  /**
   * Check if article is bookmarked
   * @param {string} articleId - Article ID
   * @returns {boolean} - True if bookmarked
   */
  isBookmarked(articleId) {
    const bookmarks = CacheManager.get(CACHE_KEYS.BOOKMARKS) || [];
    return bookmarks.includes(articleId);
  },

  /**
   * Toggle bookmark status
   * @param {string} articleId - Article ID
   */
  toggleBookmark(articleId) {
    let bookmarks = CacheManager.get(CACHE_KEYS.BOOKMARKS) || [];
    
    if (bookmarks.includes(articleId)) {
      // Remove bookmark
      bookmarks = bookmarks.filter(id => id !== articleId);
      Helpers.showNotification('Bookmark removed', 'info');
    } else {
      // Add bookmark
      bookmarks.push(articleId);
      Helpers.showNotification('Article bookmarked!', 'success');
    }

    CacheManager.set(CACHE_KEYS.BOOKMARKS, bookmarks);

    // Update UI
    const button = document.querySelector(`[data-id="${articleId}"] .btn-bookmark`);
    if (button) {
      const isBookmarked = bookmarks.includes(articleId);
      button.classList.toggle('bookmarked', isBookmarked);
      button.textContent = isBookmarked ? '⭐' : '☆';
      button.title = isBookmarked ? 'Remove bookmark' : 'Add bookmark';
    }

    // Update bookmark count
    if (window.App && window.App.updateCounts) {
      window.App.updateCounts();
    }
  },

  /**
   * Create skeleton loading card
   * @returns {string} - HTML string for skeleton card
   */
  createSkeleton() {
    return `
      <div class="skeleton-card">
        <div class="skeleton skeleton-thumbnail"></div>
        <div class="skeleton-content">
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text"></div>
        </div>
      </div>
    `;
  },

  /**
   * Create multiple skeleton cards
   * @param {number} count - Number of skeleton cards
   * @returns {string} - HTML string for skeleton cards
   */
  createSkeletons(count = 6) {
    return Array(count).fill(null).map(() => this.createSkeleton()).join('');
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ArticleCard;
}

// Made with Bob
