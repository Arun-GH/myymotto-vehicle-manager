const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for TypeScript and modern JavaScript
config.resolver.sourceExts.push('cjs');

// Support for web platform
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;