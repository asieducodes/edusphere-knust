/**
 * EduSphere — plugins/withApkFileName.js
 * -----------------------------------------------------------------------
 * Without this, Gradle names the built APK after the module (e.g.
 * app-release.apk) instead of the app. Renames every variant's output to
 * EduSphere.apk so downloads from EAS/Gradle are actually recognizable.
 * -----------------------------------------------------------------------
 */
const { withAppBuildGradle } = require('@expo/config-plugins');

const OUTPUT_BLOCK = `
android {
    applicationVariants.all { variant ->
        variant.outputs.all { output ->
            outputFileName = "EduSphere.apk"
        }
    }
}
`;

module.exports = function withApkFileName(config) {
  return withAppBuildGradle(config, (config) => {
    if (!config.modResults.contents.includes('outputFileName = "EduSphere.apk"')) {
      config.modResults.contents += OUTPUT_BLOCK;
    }
    return config;
  });
};
