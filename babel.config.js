module.exports = function (api) {
  api.cache(true);
  return {
    // babel-preset-expo isn't hoisted to the project root here, so it must
    // be resolved through expo's own node_modules rather than by bare name.
    presets: [require.resolve('expo/node_modules/babel-preset-expo')],
  };
};
