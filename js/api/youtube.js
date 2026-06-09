// YouTube Data API Client
// Handles fetching IBM videos from YouTube

const YouTubeAPI = {
  /**
   * Fetch videos from IBM Technology channel
   * @returns {Promise<Array>} - Array of video objects
   */
  async fetchVideos() {
    try {
      // Check cache first
      const cached = CacheManager.get(CACHE_KEYS.VIDEOS);
      if (cached) {
        console.log('✅ Using cached YouTube videos');
        return cached;
      }

      // Validate API key
      if (!CONFIG.youtube.apiKey || CONFIG.youtube.apiKey.includes('YOUR_')) {
        console.warn('⚠️ YouTube API key not configured');
        return this.getMockVideos();
      }

      console.log('📺 Fetching YouTube videos...');

      // Fetch videos from channel
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?` +
        `part=snippet` +
        `&channelId=${CONFIG.youtube.channelId}` +
        `&maxResults=${CONFIG.youtube.maxResults}` +
        `&order=${CONFIG.youtube.order}` +
        `&type=video` +
        `&key=${CONFIG.youtube.apiKey}`;

      const searchResponse = await fetch(searchUrl);

      if (!searchResponse.ok) {
        const error = await searchResponse.json();
        throw new Error(`YouTube API error: ${error.error?.message || searchResponse.statusText}`);
      }

      const searchData = await searchResponse.json();
      const videoIds = searchData.items.map(item => item.id.videoId).join(',');

      // Fetch detailed video information
      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?` +
        `part=snippet,contentDetails,statistics` +
        `&id=${videoIds}` +
        `&key=${CONFIG.youtube.apiKey}`;

      const detailsResponse = await fetch(detailsUrl);

      if (!detailsResponse.ok) {
        throw new Error('Failed to fetch video details');
      }

      const detailsData = await detailsResponse.json();

      // Parse and format videos
      const videos = detailsData.items.map(item => this.parseVideo(item));

      // Cache the results
      CacheManager.set(CACHE_KEYS.VIDEOS, videos);

      console.log(`✅ Fetched ${videos.length} YouTube videos`);
      return videos;

    } catch (error) {
      console.error('YouTube API error:', error);
      Helpers.showNotification('Failed to load YouTube videos', 'error');
      return this.getMockVideos();
    }
  },

  /**
   * Parse YouTube video data
   * @param {object} item - YouTube API video item
   * @returns {object} - Parsed video object
   */
  parseVideo(item) {
    const snippet = item.snippet;
    const contentDetails = item.contentDetails;
    const statistics = item.statistics;

    return {
      id: item.id,
      type: 'video',
      title: snippet.title,
      description: snippet.description,
      link: `https://www.youtube.com/watch?v=${item.id}`,
      embedUrl: `https://www.youtube.com/embed/${item.id}`,
      thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url,
      source: 'IBM Technology',
      category: 'video',
      channelTitle: snippet.channelTitle,
      publishedDate: snippet.publishedAt,
      duration: contentDetails?.duration || 'PT0S',
      durationFormatted: Helpers.parseYouTubeDuration(contentDetails?.duration),
      viewCount: parseInt(statistics?.viewCount) || 0,
      viewCountFormatted: Helpers.formatNumber(statistics?.viewCount),
      likeCount: parseInt(statistics?.likeCount) || 0,
      commentCount: parseInt(statistics?.commentCount) || 0,
      tags: Helpers.extractTags(snippet.title + ' ' + snippet.description, 'video')
    };
  },

  /**
   * Search YouTube videos by query
   * @param {string} query - Search query
   * @returns {Promise<Array>} - Array of video objects
   */
  async searchVideos(query) {
    try {
      if (!query || query.length < 3) {
        return [];
      }

      // Validate API key
      if (!CONFIG.youtube.apiKey || CONFIG.youtube.apiKey.includes('YOUR_')) {
        console.warn('⚠️ YouTube API key not configured');
        return [];
      }

      console.log(`🔍 Searching YouTube for: ${query}`);

      const searchUrl = `https://www.googleapis.com/youtube/v3/search?` +
        `part=snippet` +
        `&q=${encodeURIComponent(query + ' IBM')}` +
        `&maxResults=10` +
        `&order=relevance` +
        `&type=video` +
        `&key=${CONFIG.youtube.apiKey}`;

      const response = await fetch(searchUrl);

      if (!response.ok) {
        throw new Error('YouTube search failed');
      }

      const data = await response.json();
      const videoIds = data.items.map(item => item.id.videoId).join(',');

      // Fetch detailed information
      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?` +
        `part=snippet,contentDetails,statistics` +
        `&id=${videoIds}` +
        `&key=${CONFIG.youtube.apiKey}`;

      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();

      const videos = detailsData.items.map(item => this.parseVideo(item));

      console.log(`✅ Found ${videos.length} videos`);
      return videos;

    } catch (error) {
      console.error('YouTube search error:', error);
      return [];
    }
  },

  /**
   * Get mock videos for testing/demo
   * @returns {Array} - Array of mock video objects
   */
  getMockVideos() {
    return [
      {
        id: 'mock-video-1',
        type: 'video',
        title: 'What is Hybrid Cloud?',
        description: 'Learn about IBM\'s hybrid cloud approach and how it helps businesses modernize their infrastructure.',
        link: 'https://www.youtube.com/watch?v=example1',
        embedUrl: 'https://www.youtube.com/embed/example1',
        thumbnail: Helpers.getThumbnail({ type: 'video' }),
        source: 'IBM Technology',
        category: 'video',
        channelTitle: 'IBM Technology',
        publishedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 'PT10M30S',
        durationFormatted: '10:30',
        viewCount: 125000,
        viewCountFormatted: '125,000',
        likeCount: 3500,
        commentCount: 250,
        tags: ['Cloud', 'Hybrid Cloud', 'video']
      },
      {
        id: 'mock-video-2',
        type: 'video',
        title: 'IBM Watson AI Explained',
        description: 'Discover how IBM Watson uses artificial intelligence to transform business operations.',
        link: 'https://www.youtube.com/watch?v=example2',
        embedUrl: 'https://www.youtube.com/embed/example2',
        thumbnail: Helpers.getThumbnail({ type: 'video' }),
        source: 'IBM Technology',
        category: 'video',
        channelTitle: 'IBM Technology',
        publishedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 'PT15M45S',
        durationFormatted: '15:45',
        viewCount: 89000,
        viewCountFormatted: '89,000',
        likeCount: 2100,
        commentCount: 180,
        tags: ['AI', 'Watson', 'video']
      },
      {
        id: 'mock-video-3',
        type: 'video',
        title: 'Kubernetes on IBM Cloud',
        description: 'Learn how to deploy and manage Kubernetes clusters on IBM Cloud for scalable applications.',
        link: 'https://www.youtube.com/watch?v=example3',
        embedUrl: 'https://www.youtube.com/embed/example3',
        thumbnail: Helpers.getThumbnail({ type: 'video' }),
        source: 'IBM Technology',
        category: 'video',
        channelTitle: 'IBM Technology',
        publishedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 'PT20M15S',
        durationFormatted: '20:15',
        viewCount: 156000,
        viewCountFormatted: '156,000',
        likeCount: 4200,
        commentCount: 320,
        tags: ['Kubernetes', 'Cloud', 'video']
      }
    ];
  },

  /**
   * Test API connection
   * @returns {Promise<boolean>} - True if API is working
   */
  async testConnection() {
    try {
      if (!CONFIG.youtube.apiKey || CONFIG.youtube.apiKey.includes('YOUR_')) {
        console.warn('⚠️ YouTube API key not configured');
        return false;
      }

      const testUrl = `https://www.googleapis.com/youtube/v3/search?` +
        `part=snippet` +
        `&channelId=${CONFIG.youtube.channelId}` +
        `&maxResults=1` +
        `&key=${CONFIG.youtube.apiKey}`;

      const response = await fetch(testUrl);

      if (response.ok) {
        console.log('✅ YouTube API connection successful');
        return true;
      } else {
        console.error('❌ YouTube API connection failed:', response.statusText);
        return false;
      }

    } catch (error) {
      console.error('❌ YouTube API test failed:', error);
      return false;
    }
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = YouTubeAPI;
}

// Made with Bob
