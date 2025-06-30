// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: true,
});

// Add resolution for .web.js extensions to work properly
config.resolver.sourceExts = process.env.RN_SRC_EXT
  ? [...process.env.RN_SRC_EXT.split(',').map(ext => ext.trim()), ...config.resolver.sourceExts]
  : [...config.resolver.sourceExts, 'web.js', 'web.ts', 'web.tsx'];

module.exports = config;