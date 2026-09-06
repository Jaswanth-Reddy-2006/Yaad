const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Enable bundling of local ONNX and ORT model assets
if (!config.resolver.assetExts.includes('onnx')) {
  config.resolver.assetExts.push('onnx');
}
if (!config.resolver.assetExts.includes('ort')) {
  config.resolver.assetExts.push('ort');
}

module.exports = config;
