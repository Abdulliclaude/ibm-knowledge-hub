# 📤 Push IBM Knowledge Hub to GitHub

## Step-by-Step Guide

### Step 1: Check Git Installation

Open PowerShell or Command Prompt and check if Git is installed:

```bash
git --version
```

If you see a version number (e.g., `git version 2.x.x`), you're good!

If not, download Git from: https://git-scm.com/download/win

### Step 2: Configure Git (First Time Only)

Set your name and email (used for commits):

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Step 3: Create GitHub Repository

1. Go to [GitHub.com](https://github.com)
2. Click the **"+"** icon (top right) → **"New repository"**
3. Fill in:
   - **Repository name:** `ibm-knowledge-hub`
   - **Description:** "IBM Knowledge Hub - Centralized hub for IBM articles and videos"
   - **Visibility:** Choose **Public** or **Private**
   - **DO NOT** check "Initialize with README" (you already have files)
4. Click **"Create repository"**

GitHub will show you a page with commands - **keep this page open!**

### Step 4: Initialize Git in Your Project

Open PowerShell in your project folder:

```bash
cd c:/Users/E006156/Desktop/ibm-knowledge-hub
```

Initialize Git repository:

```bash
git init
```

You should see: `Initialized empty Git repository`

### Step 5: Add All Files

```bash
git add .
```

This stages all files for commit. The `.gitignore` file will automatically exclude `config.js` (your API keys are safe!).

### Step 6: Create First Commit

```bash
git commit -m "Initial commit: IBM Knowledge Hub with articles and videos"
```

You should see a summary of files added.

### Step 7: Connect to GitHub

Replace `YOUR_USERNAME` with your actual GitHub username:

```bash
git remote add origin https://github.com/YOUR_USERNAME/ibm-knowledge-hub.git
```

### Step 8: Rename Branch to Main

```bash
git branch -M main
```

### Step 9: Push to GitHub

```bash
git push -u origin main
```

You'll be prompted to login to GitHub. Use your:
- **Username:** Your GitHub username
- **Password:** Use a **Personal Access Token** (not your password)

#### How to Create Personal Access Token:

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name: "IBM Knowledge Hub"
4. Select scopes: Check **"repo"** (full control of private repositories)
5. Click "Generate token"
6. **COPY THE TOKEN** (you won't see it again!)
7. Use this token as your password when pushing

### Step 10: Verify on GitHub

1. Go to your repository: `https://github.com/YOUR_USERNAME/ibm-knowledge-hub`
2. You should see all your files!
3. **Verify `config.js` is NOT there** (it should be ignored)

## ✅ Success! Your Code is on GitHub

Now you can proceed to deploy on Vercel!

## 🔄 Future Updates

When you make changes to your code:

```bash
# Stage changes
git add .

# Commit with a message
git commit -m "Description of what you changed"

# Push to GitHub
git push origin main
```

Vercel will automatically deploy the changes!

## 🆘 Troubleshooting

### Issue: "git: command not found"
**Solution:** Install Git from https://git-scm.com/download/win

### Issue: Authentication failed
**Solution:** Use a Personal Access Token instead of password (see Step 9)

### Issue: "config.js" appears on GitHub
**Solution:** 
```bash
# Remove it from Git tracking
git rm --cached config.js
git commit -m "Remove config.js from tracking"
git push origin main
```

### Issue: Can't push - "rejected"
**Solution:**
```bash
# Pull first, then push
git pull origin main --rebase
git push origin main
```

### Issue: Wrong remote URL
**Solution:**
```bash
# Check current remote
git remote -v

# Change it
git remote set-url origin https://github.com/YOUR_USERNAME/ibm-knowledge-hub.git
```

## 📋 Quick Reference

```bash
# Check status
git status

# See commit history
git log --oneline

# See what changed
git diff

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard all local changes
git reset --hard HEAD
```

## 🔐 Security Checklist

Before pushing, verify:
- [ ] `config.js` is in `.gitignore`
- [ ] No API keys in any committed files
- [ ] `config.example.js` exists (template without real keys)
- [ ] README doesn't contain sensitive info

## Next Steps

After pushing to GitHub:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Deploy!

---

**Your repository will be at:** `https://github.com/YOUR_USERNAME/ibm-knowledge-hub`

Ready to deploy to Vercel once pushed!