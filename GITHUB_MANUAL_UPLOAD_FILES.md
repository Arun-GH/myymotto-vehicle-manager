# Files to Download from Replit for GitHub Upload

## Essential Files (Must Include):

### Root Level Files:
- `package.json` - Dependencies and scripts
- `package-lock.json` - Exact dependency versions
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Build configuration
- `tailwind.config.ts` - Styling configuration
- `postcss.config.js` - CSS processing
- `components.json` - UI components config
- `drizzle.config.ts` - Database configuration
- `capacitor.config.ts` - Mobile app configuration
- `voltbuilder.json` - VoltBuilder configuration
- `README.md` - Project documentation
- `replit.md` - Project context and changes

### GitHub Actions (Critical for APK Building):
- `.github/workflows/build-apk.yml` - Automatic APK building

### Source Code Folders:
- `client/` folder - Complete React frontend
- `server/` folder - Complete Express backend
- `shared/` folder - Database schema
- `android/` folder - Android project files

### Configuration Files:
- `.gitignore` - Git ignore rules
- `.replit` - Replit configuration

## Optional Files (Recommended):
- `attached_assets/` folder - Logo and branding files
- `uploads/` folder - Sample uploaded files
- `www/` folder - Built web assets (if exists)

## Files to EXCLUDE (Don't Download):
- `node_modules/` - Will be reinstalled
- `dist/` - Will be rebuilt
- `.git/` - Git history (creates conflicts)
- `app_storage/` - User data storage
- Any `.log` files
- Any `.lock` files

## Quick Download Method:

### Option 1: Download Essential Folders
Select and download these main folders:
1. `client/`
2. `server/` 
3. `shared/`
4. `android/`
5. `.github/`

### Option 2: Download Root Files
Download all root level files:
- All `.json`, `.ts`, `.js`, `.md` files from root directory

## Upload to GitHub:
1. Go to: https://github.com/Arun-GH/myymotto-vehicle-manager
2. Click "Add file" → "Upload files"
3. Drag and drop all downloaded files/folders
4. Commit with message: "Complete MyyMotto project with APK build setup"

## What Happens After Upload:
✅ GitHub Actions automatically builds APK
✅ Download APK from Actions → Artifacts
✅ Install on phone - working MyyMotto app

The most important files are:
- `package.json` (dependencies)
- `.github/workflows/build-apk.yml` (APK building)
- `client/`, `server/`, `android/` folders (app code)
- `capacitor.config.ts` (mobile configuration)