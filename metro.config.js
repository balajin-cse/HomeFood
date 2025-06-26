const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add custom resolver to handle native-only modules on web
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Custom resolver to handle native-only imports on web
const originalResolver = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Handle native-only modules on web platform
  if (platform === 'web' && moduleName === 'react-native/Libraries/Utilities/codegenNativeCommands') {
    // Return a mock module for web
    return {
      filePath: require.resolve('./web-mock-module.js'),
      type: 'sourceFile',
    };
  }
  
  // Use the original resolver for all other cases
  if (originalResolver) {
    return originalResolver(context, moduleName, platform);
  }
  
  // Fallback to default resolution
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;