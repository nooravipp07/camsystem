const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
async function getConfig() {
  const defaultConfig = await getDefaultConfig(__dirname);

  return mergeConfig(defaultConfig, {
    resolver: {
      assetExts: [
        ...defaultConfig.resolver.assetExts,
        'png',
        'jpg',
        'jpeg',
        'gif',
        'svg',
      ],
    },
  });
}

module.exports = getConfig();
