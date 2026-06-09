// Config Loader - Loads API keys from URL parameters or uses defaults
// This allows deploying without exposing API keys in the repository

(function() {
  // Get API keys from URL parameters (for testing) or use placeholders
  const urlParams = new URLSearchParams(window.location.search);
  
  // Check if we're in production and keys are placeholders
  const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
  const hasPlaceholderKeys = CONFIG.groq.apiKey === 'YOUR_GROQ_API_KEY' || CONFIG.youtube.apiKey === 'YOUR_YOUTUBE_API_KEY';
  
  if (isProduction && hasPlaceholderKeys) {
    // In production with placeholder keys - show setup message
    console.warn('⚠️ API keys not configured. Please set up your API keys.');
    
    // You can either:
    // 1. Show a setup modal to users
    // 2. Load keys from URL parameters (not recommended for security)
    // 3. Use a backend API to fetch keys securely
    
    // For now, let's try to load from localStorage (if user has set them before)
    const savedGroqKey = localStorage.getItem('groq_api_key');
    const savedYoutubeKey = localStorage.getItem('youtube_api_key');
    
    if (savedGroqKey) {
      CONFIG.groq.apiKey = savedGroqKey;
      console.log('✅ Loaded Groq API key from localStorage');
    }
    
    if (savedYoutubeKey) {
      CONFIG.youtube.apiKey = savedYoutubeKey;
      console.log('✅ Loaded YouTube API key from localStorage');
    }
    
    // If still no keys, show setup UI
    if (!savedGroqKey || !savedYoutubeKey) {
      showSetupModal();
    }
  }
  
  function showSetupModal() {
    // Create a simple setup modal
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;
    
    modal.innerHTML = `
      <div style="background: white; padding: 40px; border-radius: 12px; max-width: 500px; width: 90%;">
        <h2 style="margin-top: 0; color: #2d2d2d;">🔑 API Keys Required</h2>
        <p style="color: #6b6b6b; margin-bottom: 20px;">
          This app requires API keys to fetch content. Enter your keys below:
        </p>
        
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #2d2d2d;">
            YouTube API Key:
          </label>
          <input 
            type="text" 
            id="youtube-key-input" 
            placeholder="AIzaSy..." 
            style="width: 100%; padding: 12px; border: 1px solid #e8e8e8; border-radius: 6px; font-size: 14px;"
          />
          <small style="color: #999; display: block; margin-top: 4px;">
            Get it from: <a href="https://console.cloud.google.com/apis/credentials" target="_blank">Google Cloud Console</a>
          </small>
        </div>
        
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #2d2d2d;">
            Groq API Key (Optional):
          </label>
          <input 
            type="text" 
            id="groq-key-input" 
            placeholder="gsk_..." 
            style="width: 100%; padding: 12px; border: 1px solid #e8e8e8; border-radius: 6px; font-size: 14px;"
          />
          <small style="color: #999; display: block; margin-top: 4px;">
            Get it from: <a href="https://console.groq.com/keys" target="_blank">Groq Console</a>
          </small>
        </div>
        
        <button 
          onclick="saveApiKeys()" 
          style="width: 100%; padding: 14px; background: #2d2d2d; color: white; border: none; border-radius: 6px; font-size: 16px; font-weight: 600; cursor: pointer;"
        >
          Save & Continue
        </button>
        
        <p style="color: #999; font-size: 12px; margin-top: 16px; margin-bottom: 0;">
          ℹ️ Keys are stored locally in your browser and never sent to any server.
        </p>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Make saveApiKeys function global
    window.saveApiKeys = function() {
      const youtubeKey = document.getElementById('youtube-key-input').value.trim();
      const groqKey = document.getElementById('groq-key-input').value.trim();
      
      if (!youtubeKey) {
        alert('YouTube API key is required!');
        return;
      }
      
      // Save to localStorage
      localStorage.setItem('youtube_api_key', youtubeKey);
      if (groqKey) {
        localStorage.setItem('groq_api_key', groqKey);
      }
      
      // Update CONFIG
      CONFIG.youtube.apiKey = youtubeKey;
      if (groqKey) {
        CONFIG.groq.apiKey = groqKey;
      }
      
      // Remove modal
      modal.remove();
      
      // Reload the app
      if (window.App && window.App.init) {
        window.location.reload();
      }
    };
  }
})();

// Made with Bob
