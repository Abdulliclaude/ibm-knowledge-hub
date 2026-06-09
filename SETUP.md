# 🚀 Quick Setup Guide

Get your IBM Knowledge Hub up and running in 5 minutes!

## Step 1: Get Your API Keys

### Groq API Key (for AI Summaries)
1. Visit [https://console.groq.com](https://console.groq.com)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `gsk_`)

### YouTube Data API Key
1. Visit [https://console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable "YouTube Data API v3"
4. Go to Credentials → Create Credentials → API Key
5. Copy the API key

## Step 2: Configure the Application

1. Open `config.js` in the project root
2. Replace the placeholder API keys:

```javascript
const CONFIG = {
  groq: {
    apiKey: 'gsk_YOUR_ACTUAL_GROQ_KEY_HERE', // Paste your Groq key
    // ...
  },
  youtube: {
    apiKey: 'YOUR_ACTUAL_YOUTUBE_KEY_HERE', // Paste your YouTube key
    // ...
  }
};
```

3. Save the file

## Step 3: Run the Application

### Option A: Direct File Access
Simply open `index.html` in your web browser.

### Option B: Local Server (Recommended)

**Using Python:**
```bash
cd ibm-knowledge-hub
python -m http.server 8000
```
Then visit: `http://localhost:8000`

**Using Node.js:**
```bash
cd ibm-knowledge-hub
npx http-server
```

**Using PHP:**
```bash
cd ibm-knowledge-hub
php -S localhost:8000
```

## Step 4: Test the Application

1. Wait for content to load (first load may take 10-15 seconds)
2. You should see IBM articles and videos displayed
3. Try the search functionality
4. Test bookmarking features
5. Check if AI summaries appear (may take a few moments)

## Troubleshooting

### "Failed to load content"
- **Check API keys**: Make sure they're correctly pasted in `config.js`
- **Check console**: Press F12 and look for error messages
- **Check internet**: Ensure you have an active internet connection

### "CORS Error"
- Use a local server instead of opening the file directly
- The CORS proxy might be temporarily down - wait and retry

### "API Rate Limit"
- YouTube API has daily quotas
- Groq API has rate limits
- Wait a few minutes and try again
- Check your API dashboard for quota status

### No AI Summaries
- Summaries generate in the background
- First 10 items get summaries automatically
- Check browser console for Groq API errors
- Verify your Groq API key is valid

## Next Steps

### Deploy to GitHub Pages

1. **Create GitHub Repository:**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ibm-knowledge-hub.git
git push -u origin main
```

2. **Enable GitHub Pages:**
   - Go to repository Settings
   - Navigate to Pages
   - Select `main` branch and `/root` folder
   - Save

3. **Access Your Site:**
   - Visit: `https://YOUR_USERNAME.github.io/ibm-knowledge-hub`

### Customize Content Sources

Edit `config.js` to add more IBM RSS feeds:

```javascript
articles: {
  sources: [
    // Add your custom sources here
    {
      name: 'Custom IBM Blog',
      url: 'https://example.com/feed.xml',
      category: 'custom',
      icon: '📌'
    }
  ]
}
```

## Features Overview

✅ **Content Aggregation** - Automatically fetches from 4 IBM sources
✅ **Smart Search** - Real-time filtering across all content
✅ **AI Summaries** - Powered by Groq's LLM
✅ **Bookmarks** - Save your favorite content
✅ **Responsive Design** - Works on all devices
✅ **Smart Caching** - 24-hour cache for fast loading
✅ **Category Filters** - Filter by Research, Cloud, AI, Security, Development

## Support

If you encounter issues:

1. Check the main [README.md](README.md) for detailed documentation
2. Review the browser console (F12) for error messages
3. Verify API keys are correctly configured
4. Ensure you're using a modern browser (Chrome, Firefox, Safari, Edge)

## Security Note

⚠️ **Important**: Never commit `config.js` with real API keys to a public repository!

The `.gitignore` file is already configured to exclude `config.js`.

---

**Ready to explore IBM content? Open the app and start learning! 🚀**