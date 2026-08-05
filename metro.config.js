// Extends Expo's default Metro config so the Map screen's 3D building
// models (assets/models/*.glb) can be require()'d like any other asset.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('glb');

module.exports = config;
