# 🔧 Fix: Remove API Keys from Git History

GitHub detected API keys in your Git history and is blocking the push. We need to completely remove them.

## Solution: Remove config.js from ALL commits

### Step 1: Remove config.js from Git History

Run these commands in PowerShell:

```bash
cd c:/Users/E006156/Desktop/ibm-knowledge-hub

# Remove config.js from all commits in history
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch config.js" --prune-empty --tag-name-filter cat -- --all
```

This will rewrite Git history to remove config.js from all commits.

### Step 2: Force Push to GitHub

```bash
# Force push to overwrite remote history
git push origin main --force
```

### Step 3: Clean Up Local Repository

```bash
# Remove backup refs
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin

# Garbage collect
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

## Alternative: Start Fresh (Easier)

If the above doesn't work, start with a clean repository:

### Option A: Delete and Recreate Repository

1. **Delete the GitHub repository:**
   - Go to https://github.com/Abdulliclaude/ibm_digest/settings
   - Scroll to bottom → "Delete this repository"

2. **Create a new repository:**
   - Go to https://github.com/new
   - Name: `ibm_digest`
   - Create repository

3. **Push fresh code:**
```bash
cd c:/Users/E006156/Desktop/ibm-knowledge-hub

# Remove .git folder
rm -rf .git

# Initialize fresh repository
git init
git add .
git commit -m "Initial commit - secure config"

# Add new remote
git remote add origin https://github.com/Abdulliclaude/ibm_digest.git

# Push
git branch -M main
git push -u origin main --force
```

### Option B: Use GitHub's Secret Bypass (Quick Fix)

GitHub gave you a bypass URL. You can:

1. Click the URL in the error message:
   ```
   https://github.com/Abdulliclaude/ibm_digest/security/secret-scanning/unblock-secret/3EtNbJgVc7BBVXLmFKsOQf2qd3
   ```

2. Click "Allow secret" (acknowledges you know about the key)

3. Push again:
   ```bash
   git push origin main
   ```

⚠️ **Warning:** This exposes your API key! You'll need to:
- Revoke the old Groq API key
- Create a new one
- Update your local config.js

## Recommended: Option A (Start Fresh)

This is the cleanest solution and ensures no API keys are in the repository.

## After Successful Push

Your Vercel site will work with the new secure config system:
1. Users enter their own API keys
2. Keys stored in browser localStorage
3. No keys in the repository

## Verify It Worked

After pushing, check:
```bash
# Search for API keys in repository
git log --all --full-history --source --all -- config.js
```

Should return nothing if config.js was successfully removed.

---

**Recommended:** Use Option A (Delete & Recreate) for a clean start!