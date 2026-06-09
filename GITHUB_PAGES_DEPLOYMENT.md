# 🚀 Deploy IBM Knowledge Hub to GitHub Pages

## Prerequisites
- GitHub account
- Git installed on your computer
- Your API keys configured in `config.js`

## ⚠️ IMPORTANT: Security Warning

**DO NOT commit your API keys to GitHub!**

Your `config.js` contains sensitive API keys:
- YouTube API Key
- Groq API Key

These should **NEVER** be pushed to a public repository.

## Deployment Steps

### Step 1: Prepare Your Repository

1. **Check .gitignore**
   - Verify `config.js` is in `.gitignore` (it already is)
   - This prevents your API keys from being committed

2. **Create a config template**
   - Keep `config.example.js` (already exists)
   - This shows users what to configure without exposing your keys

### Step 2: Create GitHub Repository

1. Go to [GitHub](https://github.com)
2. Click **"New repository"** (+ icon in top right)
3. Name it: `ibm-knowledge-hub`
4. Choose **Public** (required for free GitHub Pages)
5. **DO NOT** initialize with README (you already have one)
6. Click **"Create repository"**

### Step 3: Push Your Code

Open terminal in your project folder and run:

```bash
# Initialize git (if not already done)
git init

# Add all files (config.js will be ignored due to .gitignore)
git add .

# Commit your changes
git commit -m "Initial commit: IBM Knowledge Hub"

# Add your GitHub repository as remote
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/ibm-knowledge-hub.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 4: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll down to **Pages** section (left sidebar)
4. Under **Source**, select:
   - Branch: `main`
   - Folder: `/ (root)`
5. Click **Save**
6. Wait 1-2 minutes for deployment

### Step 5: Configure API Keys for Production

**Option A: Use Environment Variables (Recommended)**

Create a new file `config.prod.js` (add to .gitignore):

```javascript
const CONFIG = {
  groq: {
    apiKey: 'YOUR_GROQ_KEY',
    model: 'llama-3.3-70b-versatile',
    maxTokens: 150,
    temperature: 0.7
  },
  youtube: {
    apiKey: 'YOUR_YOUTUBE_KEY',
    channelId: 'UCKWaEZ-_VweaEx1j62do_vQ',
    maxResults: 30,
    order: 'date'
  },
  // ... rest of config
};
```

**Option B: Use GitHub Secrets + GitHub Actions**

This is more secure but requires setting up GitHub Actions to inject secrets at build time.

**Option C: Client-Side Configuration (Least Secure)**

Add a setup page where users enter their own API keys, stored in localStorage.

### Step 6: Access Your Site

Your site will be available at:
```
https://YOUR_USERNAME.github.io/ibm-knowledge-hub/
```

Replace `YOUR_USERNAME` with your actual GitHub username.

## 🔒 Security Best Practices

### For Public Deployment:

1. **Never commit API keys** - Already handled by .gitignore
2. **Use API key restrictions:**
   - YouTube API: Restrict to your domain in Google Cloud Console
   - Groq API: Set usage limits in Groq dashboard
3. **Monitor API usage** - Check for unexpected spikes
4. **Consider backend proxy** - For production, use a backend to hide API keys

### Recommended: Backend Proxy Setup

For a production app, create a simple backend:

```
User → GitHub Pages (Frontend) → Your Backend API → YouTube/Groq APIs
```

This way, API keys stay on your server, not in the browser.

## 📝 Post-Deployment Checklist

- [ ] Verify site loads at GitHub Pages URL
- [ ] Test article fetching works
- [ ] Test video fetching works
- [ ] Check browser console for errors
- [ ] Test on mobile devices
- [ ] Set up custom domain (optional)

## 🔄 Updating Your Site

After making changes:

```bash
git add .
git commit -m "Description of changes"
git push origin main
```

GitHub Pages will automatically rebuild (takes 1-2 minutes).

## 🌐 Custom Domain (Optional)

1. Buy a domain (e.g., from Namecheap, GoDaddy)
2. In GitHub repo settings → Pages → Custom domain
3. Enter your domain: `ibm-hub.yourdomain.com`
4. Add DNS records at your domain provider:
   ```
   Type: CNAME
   Name: ibm-hub
   Value: YOUR_USERNAME.github.io
   ```

## ⚠️ Limitations of GitHub Pages

- Static hosting only (no backend)
- API keys visible in browser (security risk)
- 1GB repository size limit
- 100GB bandwidth per month
- 10 builds per hour

## 🚀 Alternative Hosting Options

If you need more security:

1. **Vercel** - Free, supports environment variables
2. **Netlify** - Free, supports serverless functions
3. **Cloudflare Pages** - Free, with Workers for backend
4. **AWS Amplify** - Free tier, full backend support

All of these allow you to hide API keys better than GitHub Pages.

## Need Help?

- GitHub Pages Docs: https://docs.github.com/pages
- Git Basics: https://git-scm.com/book/en/v2/Getting-Started-Git-Basics
- GitHub Desktop (GUI): https://desktop.github.com/

---

**Remember:** For a production app with API keys, consider using a backend service or one of the alternative hosting options that support environment variables!