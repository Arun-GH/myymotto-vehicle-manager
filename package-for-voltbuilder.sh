#!/bin/bash

# VoltBuilder Package Creator for MyyMotto
# This script prepares your project for VoltBuilder upload

echo "🚗 Preparing MyyMotto for VoltBuilder..."

# Step 1: Build the React app
echo "📦 Building React app..."
npm run build

# Step 2: Sync Capacitor
echo "🔄 Syncing Capacitor..."
npx cap sync android

# Step 3: Clean up build artifacts to reduce size
echo "🧹 Cleaning build artifacts..."
cd android
rm -rf app/build build .gradle
cd ..

# Step 4: Create package for VoltBuilder
echo "📁 Creating VoltBuilder package..."
tar -czf myymotto-voltbuilder.tar.gz android/ \
  --exclude="*/build" \
  --exclude="*/.gradle" \
  --exclude="*/node_modules"

# Step 5: Display results
echo "✅ Package ready for VoltBuilder!"
echo ""
echo "📁 File: myymotto-voltbuilder.tar.gz"
echo "📊 Size: $(du -h myymotto-voltbuilder.tar.gz | cut -f1)"
echo ""
echo "🚀 Next steps:"
echo "1. Go to https://volt.build"
echo "2. Create account (15-day free trial)"
echo "3. Upload myymotto-voltbuilder.tar.gz"
echo "4. Build APK (free for debug builds)"
echo "5. Download and install on your phone"
echo ""
echo "💡 Your APK will have:"
echo "   ✅ 'Open' button after installation"
echo "   ✅ 'MyyMotto' in app launcher"
echo "   ✅ Vehicle management features"
echo "   ✅ Emergency contact sharing"
echo ""