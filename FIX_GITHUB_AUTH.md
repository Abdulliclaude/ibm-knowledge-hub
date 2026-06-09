# 🔧 Fix GitHub Authentication Error

## The Problem
GitHub no longer accepts passwords for Git operations. You need a **Personal Access Token (PAT)**.

## Quick Fix - 3 Steps

### Step 1: Update Remote URL with Your Username

```bash
git remote set-url origin https://github.com/Abdulliclaude/ibm-knowledge-hub.git
```

### Step 2: Create Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Fill in:
   - **Note:** `IBM Knowledge Hub`
   - **Expiration:** 90 days (or No expiration)
   - **Select scopes:** Check ✅ **repo** (all repo permissions)
4. Scroll down and click **"Generate token"**
5. **COPY THE TOKEN** (starts with `ghp_...`) - You won't see it again!

### Step 3: Push with Token

```bash
git push -u origin main
```

When prompted:
- **Username:** `Abdulliclaude`
- **Password:** Paste your token (the one starting with `ghp_...`)

## Alternative: Use GitHub CLI (Easier)

### Install GitHub CLI:
Download from: https://cli.github.com/

### Login and Push:
```bash
# Login to GitHub
gh auth login

# Follow prompts:
# - What account? GitHub.com
# - Protocol? HTTPS
# - Authenticate? Login with a web browser
# - Copy the code and press Enter

# Now push
git push -u origin main
```

## Alternative: Use GitHub Desktop (Easiest)

1. Download: https://desktop.github.com/
2. Install and login
3. File → Add Local Repository
4. Select your folder: `c:/Users/E006156/Desktop/ibm-knowledge-hub`
5. Click "Publish repository"
6. Done!

## Save Token for Future Use (Optional)

To avoid entering token every time:

```bash
# Windows - Store credentials
git config --global credential.helper wincred
```

Next time you push, enter your token once and it will be saved.

## Verify It Worked

After successful push:
```bash
# Check remote
git remote -v

# Should show:
# origin  https://github.com/Abdulliclaude/ibm-knowledge-hub.git (fetch)
# origin  https://github.com/Abdulliclaude/ibm-knowledge-hub.git (push)
```

Visit: https://github.com/Abdulliclaude/ibm-knowledge-hub

You should see your code!

## Next Steps After Successful Push

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Click "Import Git Repository"
4. Select `ibm-knowledge-hub`
5. Click "Deploy"

Your site will be live at: `https://ibm-knowledge-hub.vercel.app`

---

**Recommended:** Use GitHub CLI or GitHub Desktop for easier authentication!