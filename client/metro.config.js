// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Customize the config
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg', 'db', 'mjs', 'cjs'];

// Add WebView module to extraNodeModules
config.resolver.extraNodeModules = {
    'react-native-webview': require.resolve('react-native-webview'),
};

// Ensure proper module resolution
config.resolver.nodeModulesPaths = [__dirname + '/node_modules'];

module.exports = config; 