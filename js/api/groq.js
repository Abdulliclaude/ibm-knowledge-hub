// Groq API Client
// Handles AI-powered content summarization using Groq LLM

const GroqAPI = {
  /**
   * Generate summary for content
   * @param {string} content - Content to summarize
   * @param {string} contentId - Unique content ID for caching
   * @returns {Promise<string>} - Generated summary
   */
  async generateSummary(content, contentId) {
    try {
      // Check if AI summaries are enabled
      if (!CONFIG.features.aiSummaries) {
        return null;
      }

      // Check cache first
      const cachedSummaries = CacheManager.get(CACHE_KEYS.SUMMARIES) || {};
      if (cachedSummaries[contentId]) {
        console.log(`✅ Using cached summary for: ${contentId}`);
        return cachedSummaries[contentId];
      }

      // Validate API key
      if (!CONFIG.groq.apiKey || CONFIG.groq.apiKey.includes('YOUR_')) {
        console.warn('⚠️ Groq API key not configured');
        return null;
      }

      // Prepare content for summarization
      const cleanContent = Helpers.stripHtml(content);
      const truncatedContent = Helpers.truncateText(cleanContent, 1000);

      console.log('🤖 Generating AI summary...');

      // Call Groq API
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CONFIG.groq.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: CONFIG.groq.model,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that creates concise, informative summaries of technical content. Focus on key points and main takeaways. Keep summaries to 2-3 sentences.'
            },
            {
              role: 'user',
              content: `Summarize this IBM content in 2-3 clear sentences:\n\n${truncatedContent}`
            }
          ],
          max_tokens: CONFIG.groq.maxTokens,
          temperature: CONFIG.groq.temperature
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Groq API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const summary = data.choices[0]?.message?.content?.trim();

      if (!summary) {
        throw new Error('No summary generated');
      }

      // Cache the summary
      cachedSummaries[contentId] = summary;
      CacheManager.set(CACHE_KEYS.SUMMARIES, cachedSummaries);

      console.log('✅ Summary generated successfully');
      return summary;

    } catch (error) {
      console.error('Groq API error:', error);
      
      // Return fallback summary
      const fallback = Helpers.truncateText(Helpers.stripHtml(content), 200);
      return fallback || null;
    }
  },

  /**
   * Generate summaries for multiple content items
   * @param {Array} items - Array of content items
   * @returns {Promise<Array>} - Items with summaries
   */
  async generateBatchSummaries(items) {
    try {
      if (!CONFIG.features.aiSummaries) {
        return items;
      }

      console.log(`🤖 Generating summaries for ${items.length} items...`);

      // Process items with rate limiting
      const itemsWithSummaries = [];
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        // Generate summary
        const summary = await this.generateSummary(
          item.description || item.title,
          item.id
        );

        itemsWithSummaries.push({
          ...item,
          summary: summary
        });

        // Rate limiting: wait 500ms between requests
        if (i < items.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Update progress
        if ((i + 1) % 5 === 0) {
          console.log(`📊 Progress: ${i + 1}/${items.length} summaries generated`);
        }
      }

      console.log('✅ All summaries generated');
      return itemsWithSummaries;

    } catch (error) {
      console.error('Batch summary generation error:', error);
      return items; // Return items without summaries on error
    }
  },

  /**
   * Enhance search query with AI
   * @param {string} query - User search query
   * @returns {Promise<string>} - Enhanced query
   */
  async enhanceSearchQuery(query) {
    try {
      if (!query || query.length < 3) return query;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CONFIG.groq.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: CONFIG.groq.model,
          messages: [
            {
              role: 'system',
              content: 'You are a search query enhancer. Expand the user query with relevant IBM technology keywords. Return only the enhanced query, no explanations.'
            },
            {
              role: 'user',
              content: `Enhance this search query for IBM content: "${query}"`
            }
          ],
          max_tokens: 50,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        return query; // Return original on error
      }

      const data = await response.json();
      const enhanced = data.choices[0]?.message?.content?.trim();

      return enhanced || query;

    } catch (error) {
      console.error('Query enhancement error:', error);
      return query;
    }
  },

  /**
   * Test API connection
   * @returns {Promise<boolean>} - True if API is working
   */
  async testConnection() {
    try {
      if (!CONFIG.groq.apiKey || CONFIG.groq.apiKey.includes('YOUR_')) {
        console.warn('⚠️ Groq API key not configured');
        return false;
      }

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CONFIG.groq.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: CONFIG.groq.model,
          messages: [
            {
              role: 'user',
              content: 'Hello'
            }
          ],
          max_tokens: 10
        })
      });

      if (response.ok) {
        console.log('✅ Groq API connection successful');
        return true;
      } else {
        console.error('❌ Groq API connection failed:', response.statusText);
        return false;
      }

    } catch (error) {
      console.error('❌ Groq API test failed:', error);
      return false;
    }
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GroqAPI;
}

// Made with Bob
