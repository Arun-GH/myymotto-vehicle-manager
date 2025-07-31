# GitHub Personal Access Token Troubleshooting

## Common PAT Authentication Issues:

### 1. **Token Permissions**
Your PAT needs these permissions:
- ✅ **repo** (Full repository access) - REQUIRED
- ✅ **workflow** (Update GitHub Actions) - RECOMMENDED
- ✅ **write:packages** (if using packages) - OPTIONAL

### 2. **Correct Push Command Format**
Use this exact format:
```bash
git push https://YOUR_USERNAME:YOUR_TOKEN@github.com/Arun-GH/myymotto-vehicle-manager.git main
```

Replace:
- `YOUR_USERNAME` with `Arun-GH`
- `YOUR_TOKEN` with your actual PAT

### 3. **Token Expiration**
- Check if your PAT has expired
- Go to GitHub → Settings → Developer settings → Personal access tokens
- Look for expiration date

### 4. **Username Case Sensitivity**
Make sure you use exact GitHub username: `Arun-GH`

### 5. **Repository Visibility**
- Is your repository private or public?
- Private repos need additional permissions

## Alternative Solutions:

### Option A: Use GitHub CLI (if available)
```bash
gh auth login
git push origin main
```

### Option B: Set Git Credentials
```bash
git config --global user.name "Arun-GH"
git config --global user.email "your-email@example.com"
git push origin main
```

### Option C: Manual Upload (Easiest)
1. Download `myymotto-github-upload.zip` from Replit
2. Extract on your computer
3. Go to GitHub repository web interface
4. Upload files manually via "Add file" → "Upload files"

## Test Your PAT:
Try this simple test:
```bash
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user
```

If this works, your token is valid.

## Most Common Issue:
PAT missing **repo** permissions. Regenerate token with full repo access.