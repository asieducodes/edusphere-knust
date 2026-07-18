/**
 * EduSphere — plugins/withApkFileName.js
 * -----------------------------------------------------------------------
 * Without this, Gradle names the built APK after the module (e.g.
 * app-release.apk) rather than the app. Overrides every variant's output
 * filename to EduSphere.apk / EduSphere.aab so downloads from EAS/Gradle
 * are recognizable instead of generic.
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
