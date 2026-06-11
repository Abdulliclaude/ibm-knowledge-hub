// Articles API Client
// Handles fetching IBM articles from RSS feeds

const ArticlesAPI = {
  /**
   * Fetch all articles from configured sources
   * @returns {Promise<Array>} - Array of article objects
   */
  async fetchArticles() {
    try {
      // Check cache first
      const cached = CacheManager.get(CACHE_KEYS.ARTICLES);
      if (cached) {
        console.log('✅ Using cached articles');
        return cached;
      }

      console.log('📰 Fetching IBM articles...');
      console.log(`📋 Configured sources: ${CONFIG.articles.sources.length}`);

      // Fetch from all sources in parallel
      const fetchPromises = CONFIG.articles.sources.map(source =>
        this.fetchFromSource(source)
      );

      const results = await Promise.allSettled(fetchPromises);

      // Combine all successful results
      const allArticles = [];
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          console.log(`✅ ${CONFIG.articles.sources[index].name}: ${result.value.length} articles`);
          allArticles.push(...result.value);
        } else {
          console.error(`❌ ${CONFIG.articles.sources[index].name} FAILED:`, result.reason);
        }
      });

      // If no articles fetched, return mock articles
      if (allArticles.length === 0) {
        console.warn('⚠️ No articles fetched from any source, using mock data');
        return this.getMockArticles();
      }

      // Sort by date (newest first)
      allArticles.sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));

      // Cache the results
      CacheManager.set(CACHE_KEYS.ARTICLES, allArticles);

      console.log(`✅ Fetched ${allArticles.length} articles from ${results.filter(r => r.status === 'fulfilled').length} sources`);
      return allArticles;

    } catch (error) {
      console.error('❌ Articles fetch error:', error);
      Helpers.showNotification('Failed to load articles', 'error');
      return this.getMockArticles();
    }
  },

  /**
   * Fetch articles from a single RSS source
   * @param {object} source - Source configuration
   * @returns {Promise<Array>} - Array of article objects
   */
  async fetchFromSource(source) {
    try {
      console.log(`📡 Fetching from ${source.name}...`);

      // Use CORS proxy
      const proxyUrl = CONFIG.articles.corsProxy + encodeURIComponent(source.url);
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // allorigins.win returns JSON with {contents: "..."} structure
      const data = await response.json();
      const xmlText = data.contents || data;
      
      // Parse XML - try as HTML first to handle malformed XML
      const parser = new DOMParser();
      let xmlDoc = parser.parseFromString(xmlText, 'text/html');
      
      // If HTML parsing worked, try to find RSS/XML content
      let items = xmlDoc.querySelectorAll('item, entry');
      
      // If no items found with HTML parser, try XML parser
      if (items.length === 0) {
        xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        items = xmlDoc.querySelectorAll('item, entry');
      }

      // Check for parsing errors (but don't fail if we found items)
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError && items.length === 0) {
        console.warn(`XML parsing warning for ${source.name}:`, parserError.textContent);
        throw new Error('XML parsing error - no items found');
      }

      // Parse RSS items
      const articles = this.parseRSSFeed(xmlDoc, source);

      if (articles.length === 0) {
        console.warn(`⚠️ No articles found from ${source.name}`);
      } else {
        console.log(`✅ Fetched ${articles.length} articles from ${source.name}`);
      }
      
      return articles;

    } catch (error) {
      console.error(`Error fetching from ${source.name}:`, error);
      throw error;
    }
  },

  /**
   * Parse RSS feed XML
   * @param {Document} xmlDoc - Parsed XML document
   * @param {object} source - Source configuration
   * @returns {Array} - Array of article objects
   */
  parseRSSFeed(xmlDoc, source) {
    const articles = [];
    const items = xmlDoc.querySelectorAll('item, entry'); // Support both RSS and Atom

    items.forEach(item => {
      try {
        const article = this.parseRSSItem(item, source);
        if (article) {
          articles.push(article);
        }
      } catch (error) {
        console.warn('Error parsing RSS item:', error);
      }
    });

    return articles;
  },

  /**
   * Parse single RSS item
   * @param {Element} item - RSS item element
   * @param {object} source - Source configuration
   * @returns {object} - Article object
   */
  parseRSSItem(item, source) {
    // Helper to get text content from element
    const getText = (selector) => {
      const element = item.querySelector(selector);
      return element ? element.textContent.trim() : '';
    };

    // Helper to get attribute
    const getAttr = (selector, attr) => {
      const element = item.querySelector(selector);
      return element ? element.getAttribute(attr) : '';
    };

    // Extract data (support both RSS and Atom formats)
    const title = getText('title');
    
    // Try multiple ways to get the link
    let link = getText('link') || getAttr('link', 'href');
    
    // If link is still empty, try getting it from guid
    if (!link) {
      const guidElement = item.querySelector('guid');
      if (guidElement && guidElement.textContent.startsWith('http')) {
        link = guidElement.textContent.trim();
      }
    }
    
    const description = getText('description') || getText('summary') || getText('content');
    const pubDate = getText('pubDate') || getText('published') || getText('updated');
    const author = getText('author') || getText('dc\\:creator') || getText('creator');
    const guid = getText('guid') || link;

    // Extract thumbnail/image
    let thumbnail = getAttr('media\\:thumbnail', 'url') || 
                   getAttr('media\\:content', 'url') ||
                   getAttr('enclosure', 'url');

    // Try to extract image from content
    if (!thumbnail && description) {
      const imgMatch = description.match(/<img[^>]+src="([^">]+)"/);
      if (imgMatch) {
        thumbnail = imgMatch[1];
      }
    }

    // Use default thumbnail if none found
    if (!thumbnail) {
      thumbnail = Helpers.getThumbnail({ type: 'article' });
    }

    // Create article object
    return {
      id: Helpers.generateId(),
      type: 'article',
      title: Helpers.stripHtml(title),
      description: Helpers.stripHtml(description),
      link: link,
      source: source.name,
      category: source.category,
      icon: source.icon,
      author: Helpers.stripHtml(author),
      publishedDate: pubDate || new Date().toISOString(),
      thumbnail: thumbnail,
      tags: Helpers.extractTags(title + ' ' + description, source.category),
      guid: guid
    };
  },

  /**
   * Get mock articles for testing/demo
   * @returns {Array} - Array of mock article objects
   */
  getMockArticles() {
    return [
      {
        id: 'mock-article-1',
        type: 'article',
        title: 'IBM Unveils Next-Generation Quantum Computing Platform',
        description: 'IBM announces breakthrough in quantum computing with new 1000+ qubit processor, marking a significant milestone in the journey toward practical quantum advantage.',
        link: 'https://research.ibm.com/blog/quantum-computing',
        source: 'IBM Research',
        category: 'research',
        icon: '🔬',
        author: 'IBM Research Team',
        publishedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        thumbnail: Helpers.getThumbnail({ type: 'article' }),
        tags: ['Quantum', 'research', 'AI'],
        guid: 'mock-article-1'
      },
      {
        id: 'mock-article-2',
        type: 'article',
        title: 'Building Scalable Microservices with IBM Cloud',
        description: 'Learn best practices for designing and deploying microservices architecture on IBM Cloud using Kubernetes and OpenShift.',
        link: 'https://developer.ibm.com/articles/microservices',
        source: 'IBM Developer',
        category: 'development',
        icon: '💻',
        author: 'Jane Developer',
        publishedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        thumbnail: Helpers.getThumbnail({ type: 'article' }),
        tags: ['Microservices', 'Cloud', 'development'],
        guid: 'mock-article-2'
      },
      {
        id: 'mock-article-3',
        type: 'article',
        title: 'Zero Trust Security: A Modern Approach to Cybersecurity',
        description: 'Explore how IBM\'s zero trust security framework helps organizations protect against evolving cyber threats in hybrid cloud environments.',
        link: 'https://securityintelligence.com/zero-trust',
        source: 'IBM Security Intelligence',
        category: 'security',
        icon: '🔒',
        author: 'Security Team',
        publishedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        thumbnail: Helpers.getThumbnail({ type: 'article' }),
        tags: ['Security', 'Zero Trust', 'security'],
        guid: 'mock-article-3'
      },
      {
        id: 'mock-article-4',
        type: 'article',
        title: 'AI-Powered Analytics Transform Business Intelligence',
        description: 'Discover how IBM Watson Analytics uses artificial intelligence to provide deeper insights and predictive capabilities for data-driven decision making.',
        link: 'https://www.ibm.com/blog/ai-analytics',
        source: 'IBM Cloud Blog',
        category: 'cloud',
        icon: '☁️',
        author: 'Cloud Team',
        publishedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        thumbnail: Helpers.getThumbnail({ type: 'article' }),
        tags: ['AI', 'Analytics', 'cloud'],
        guid: 'mock-article-4'
      },
      {
        id: 'mock-article-5',
        type: 'article',
        title: 'Hybrid Cloud Strategy: Best Practices for 2026',
        description: 'A comprehensive guide to implementing a successful hybrid cloud strategy that balances flexibility, security, and cost optimization.',
        link: 'https://www.ibm.com/blog/hybrid-cloud-2026',
        source: 'IBM Cloud Blog',
        category: 'cloud',
        icon: '☁️',
        author: 'Strategy Team',
        publishedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        thumbnail: Helpers.getThumbnail({ type: 'article' }),
        tags: ['Hybrid Cloud', 'Cloud', 'cloud'],
        guid: 'mock-article-5'
      }
    ];
  },

  /**
   * Test RSS feed connection
   * @returns {Promise<boolean>} - True if at least one source is accessible
   */
  async testConnection() {
    try {
      const testSource = CONFIG.articles.sources[0];
      const proxyUrl = CONFIG.articles.corsProxy + encodeURIComponent(testSource.url);
      
      const response = await fetch(proxyUrl);

      if (response.ok) {
        console.log('✅ Articles RSS feed connection successful');
        return true;
      } else {
        console.error('❌ Articles RSS feed connection failed:', response.statusText);
        return false;
      }

    } catch (error) {
      console.error('❌ Articles RSS feed test failed:', error);
      return false;
    }
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ArticlesAPI;
}

// Made with Bob
