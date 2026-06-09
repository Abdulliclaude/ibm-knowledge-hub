# 🚀 Deploy IBM Knowledge Hub to Vercel

Vercel is the **BEST** option for this project because it supports environment variables to keep your API keys secure!

## Prerequisites
- ✅ Vercel account (you have this!)
- Git installed
- GitHub account (recommended)

## Method 1: Deploy via GitHub (Recommended)

### Step 1: Push to GitHub

```bash
# In your project folder
git init
git add .
git commit -m "Initial commit: IBM Knowledge Hub"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/ibm-knowledge-hub.git
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your `ibm-knowledge-hub` repository
5. Click **"Import"**

### Step 3: Configure Build Settings

Vercel will auto-detect it's a static site. Settings should be:
- **Framework Preset:** Other
- **Build Command:** (leave empty)
- **Output Directory:** `.` (current directory)
- **Install Command:** (leave empty)

### Step 4: Add Environment Variables

**IMPORTANT:** This is where you secure your API keys!

1. In the import screen, expand **"Environment Variables"**
2. Add these variables:

```
Name: YOUTUBE_API_KEY
Value: your_youtube_api_key_here

Name: GROQ_API_KEY
Value: your_groq_api_key_here
```

3. Click **"Deploy"**

### Step 5: Update config.js to Use Environment Variables

**WAIT!** Since this is a static site, environment variables won't work directly in the browser. We need a different approach.

## Method 2: Direct Deploy (Simpler for Static Sites)

Since this is a **client-side only** app, let's use Vercel CLI:

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate.

### Step 3: Deploy

```bash
# In your project folder
cd c:/Users/E006156/Desktop/ibm-knowledge-hub
vercel
```

Follow the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Your account
- **Link to existing project?** → No
- **Project name?** → ibm-knowledge-hub
- **Directory?** → ./ (press Enter)
- **Override settings?** → No

Vercel will deploy and give you a URL like:
```
https://ibm-knowledge-hub-xxxxx.vercel.app
```

### Step 4: Production Deployment

```bash
vercel --prod
```

This creates your production URL:
```
https://ibm-knowledge-hub.vercel.app
```

## 🔒 Securing API Keys on Vercel

Since this is a **static frontend app**, API keys will still be visible in the browser. Here are your options:

### Option A: Accept the Risk (Quick & Easy)
- API keys are in `config.js` (already in .gitignore)
- Set up API restrictions:
  - **YouTube API:** Restrict to your Vercel domain in Google Cloud Console
  - **Groq API:** Set rate limits in Groq dashboard
- Monitor usage regularly

### Option B: Create a Vercel Serverless Function (Recommended)

Create a backend API to hide your keys:

1. Create `api/youtube.js`:
```javascript
export default async function handler(req, res) {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?` +
    `part=snippet&channelId=UCKWaEZ-_VweaEx1j62do_vQ&` +
    `maxResults=30&order=date&type=video&` +
    `key=${process.env.YOUTUBE_API_KEY}`
  );
  const data = await response.json();
  res.json(data);
}
```

2. Create `api/groq.js`:
```javascript
export default async function handler(req, res) {
  const { content } = req.body;
  
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a helpful assistant...' },
        { role: 'user', content: `Summarize: ${content}` }
      ],
      max_tokens: 150
    })
  });
  
  const data = await response.json();
  res.json(data);
}
```

3. Add environment variables in Vercel Dashboard:
   - Go to Project Settings → Environment Variables
   - Add `YOUTUBE_API_KEY` and `GROQ_API_KEY`

4. Update your frontend to call `/api/youtube` instead of YouTube directly

## 📝 Vercel Configuration File

Create `vercel.json` in your project root:

```json
{
  "version": 2,
  "name": "ibm-knowledge-hub",
  "builds": [
    {
      "src": "index.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

## 🔄 Updating Your Deployment

### If using GitHub:
```bash
git add .
git commit -m "Update description"
git push origin main
```
Vercel auto-deploys on push!

### If using Vercel CLI:
```bash
vercel --prod
```

## 🌐 Custom Domain

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Vercel provides free SSL certificate

## ✅ Post-Deployment Checklist

- [ ] Site loads at Vercel URL
- [ ] Articles fetch correctly
- [ ] Videos fetch correctly
- [ ] No console errors
- [ ] Test on mobile
- [ ] Set up domain restrictions for API keys

## 🎯 Quick Deploy Commands

```bash
# First time setup
vercel login
cd c:/Users/E006156/Desktop/ibm-knowledge-hub
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs
```

## 🆘 Troubleshooting

**Issue:** API keys exposed in browser
**Solution:** Use Vercel Serverless Functions (Option B above)

**Issue:** CORS errors
**Solution:** CORS proxy is already configured in your app

**Issue:** Deployment fails
**Solution:** Check `vercel logs` for errors

**Issue:** Old version showing
**Solution:** Clear browser cache or use incognito mode

## 📚 Resources

- Vercel Docs: https://vercel.com/docs
- Vercel CLI: https://vercel.com/docs/cli
- Serverless Functions: https://vercel.com/docs/functions

---

**Your app will be live at:** `https://ibm-knowledge-hub.vercel.app`

For maximum security, implement Option B (Serverless Functions) to hide API keys!