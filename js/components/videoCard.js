// Video Card Component
// Renders video cards in the content grid

const VideoCard = {
  /**
   * Create video card HTML
   * @param {object} video - Video data object
   * @returns {string} - HTML string for video card
   */
  create(video) {
    const isBookmarked = this.isBookmarked(video.id);
    const relativeTime = Helpers.formatRelativeTime(video.publishedDate);
    const tags = video.tags.slice(0, 3); // Limit to 3 tags

    return `
      <div class="content-card carbon-card" data-id="${video.id}" data-type="video">
        <div class="card-thumbnail">
          <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
          <span class="card-type-badge video">Video</span>
          ${video.durationFormatted ? `
            <span class="video-duration">${video.durationFormatted}</span>
          ` : ''}
        </div>
        <div class="card-content">
          <div class="card-meta">
            <span class="card-source video">
              <span class="card-source-icon">🎥</span>
              ${video.source}
            </span>
            <span class="card-date">${relativeTime}</span>
          </div>
          <h3 class="card-title">${video.title}</h3>
          <p class="card-description">${Helpers.truncateText(video.description, 150)}</p>
          ${video.summary ? `
            <div class="card-summary">
              <strong>🤖 AI Summary:</strong> ${video.summary}
            </div>
          ` : ''}
          ${video.viewCount > 0 ? `
            <div class="video-stats">
              <span class="video-stat">
                <span>👁️</span>
                <span>${video.viewCountFormatted} views</span>
              </span>
              ${video.likeCount > 0 ? `
                <span class="video-stat">
                  <span>👍</span>
                  <span>${Helpers.formatNumber(video.likeCount)}</span>
                </span>
              ` : ''}
            </div>
          ` : ''}
          ${tags.length > 0 ? `
            <div class="card-tags">
              ${tags.map(tag => `<span class="tag video">${tag}</span>`).join('')}
            </div>
          ` : ''}
          <div class="card-actions">
            <button class="btn-watch" onclick="VideoCard.openVideo('${video.id}')">
              <span>▶️</span> Watch Video
            </button>
            <button class="btn-bookmark ${isBookmarked ? 'bookmarked' : ''}" 
                    onclick="VideoCard.toggleBookmark('${video.id}')"
                    title="${isBookmarked ? 'Remove bookmark' : 'Add bookmark'}">
              ${isBookmarked ? '⭐' : '☆'}
            </button>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Create multiple video cards
   * @param {Array} videos - Array of video objects
   * @returns {string} - HTML string for all cards
   */
  createMultiple(videos) {
    return videos.map(video => this.create(video)).join('');
  },

  /**
   * Open video in modal
   * @param {string} videoId - Video ID
   */
  openVideo(videoId) {
    const video = window.appState?.allContent?.find(item => item.id === videoId);
    if (!video) return;

    const modal = document.getElementById('contentModal');
    const modalBody = document.getElementById('modalBody');

    const relativeTime = Helpers.formatRelativeTime(video.publishedDate);
    const fullDate = Helpers.formatDate(video.publishedDate);

    modalBody.innerHTML = `
      <div class="modal-header">
        <div class="video-embed-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 12px; margin-bottom: 24px;">
          <iframe 
            src="${video.embedUrl}?autoplay=0" 
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
          </iframe>
        </div>
        <h2 class="modal-title">${video.title}</h2>
        <div class="modal-meta">
          <div class="modal-meta-item">
            <span>🎥</span>
            <span>${video.channelTitle}</span>
          </div>
          <div class="modal-meta-item">
            <span>📅</span>
            <span title="${fullDate}">${relativeTime}</span>
          </div>
          ${video.durationFormatted ? `
            <div class="modal-meta-item">
              <span>⏱️</span>
              <span>${video.durationFormatted}</span>
            </div>
          ` : ''}
          ${video.viewCount > 0 ? `
            <div class="modal-meta-item">
              <span>👁️</span>
              <span>${video.viewCountFormatted} views</span>
            </div>
          ` : ''}
        </div>
      </div>
      <div class="modal-description">
        ${video.description}
      </div>
      ${video.summary ? `
        <div class="modal-summary">
          <div class="modal-summary-title">
            <span>🤖</span>
            <span>AI-Generated Summary</span>
          </div>
          <p class="modal-summary-text">${video.summary}</p>
        </div>
      ` : ''}
      ${video.tags.length > 0 ? `
        <div class="card-tags">
          ${video.tags.map(tag => `<span class="tag video">${tag}</span>`).join('')}
        </div>
      ` : ''}
      <div class="modal-actions">
        <a href="${video.link}" target="_blank" rel="noopener noreferrer" class="btn-primary">
          <span>▶️</span>
          <span>Watch on YouTube</span>
        </a>
        <button class="btn-secondary" onclick="Helpers.copyToClipboard('${video.link}')">
          <span>📋</span>
          <span>Copy Link</span>
        </button>
      </div>
    `;

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  },

  /**
   * Check if video is bookmarked
   * @param {string} videoId - Video ID
   * @returns {boolean} - True if bookmarked
   */
  isBookmarked(videoId) {
    const bookmarks = CacheManager.get(CACHE_KEYS.BOOKMARKS) || [];
    return bookmarks.includes(videoId);
  },

  /**
   * Toggle bookmark status
   * @param {string} videoId - Video ID
   */
  toggleBookmark(videoId) {
    let bookmarks = CacheManager.get(CACHE_KEYS.BOOKMARKS) || [];
    
    if (bookmarks.includes(videoId)) {
      // Remove bookmark
      bookmarks = bookmarks.filter(id => id !== videoId);
      Helpers.showNotification('Bookmark removed', 'info');
    } else {
      // Add bookmark
      bookmarks.push(videoId);
      Helpers.showNotification('Video bookmarked!', 'success');
    }

    CacheManager.set(CACHE_KEYS.BOOKMARKS, bookmarks);

    // Update UI
    const button = document.querySelector(`[data-id="${videoId}"] .btn-bookmark`);
    if (button) {
      const isBookmarked = bookmarks.includes(videoId);
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
  module.exports = VideoCard;
}

// Made with Bob
