/**
 * EduSphere — plugins/withLiveKitNativeSetup.js
 * -----------------------------------------------------------------------
 * @livekit/react-native needs LiveKitReactNative.setup(...) called once
 * in MainApplication.kt / AppDelegate.swift before RN initializes, per
 * its README — skip it and it throws at runtime. Neither the library nor
 * @livekit/react-native-expo-plugin adds this call for you (the Expo
 * plugin only writes manifest/plist flags). Since android/ios aren't
 * committed here and get regenerated on every prebuild, a manual edit
 * would just vanish next time — has to be a config plugin.
 * -----------------------------------------------------------------------
 */
const { withAppDelegate, withMainApplication } = require('@expo/config-plugins');

function withLiveKitAndroidSetup(config) {
  return withMainApplication(config, (config) => {
    let contents = config.modResults.contents;

    if (!contents.includes('com.livekit.reactnative.LiveKitReactNative')) {
      contents = contents.replace(
        'import expo.modules.ApplicationLifecycleDispatcher',
        'import com.livekit.reactnative.LiveKitReactNative\nimport com.livekit.reactnative.audio.AudioType\nimport expo.modules.ApplicationLifecycleDispatcher'
      );
    }

    if (!contents.includes('LiveKitReactNative.setup(')) {
      contents = contents.replace(
        'override fun onCreate() {\n    super.onCreate()',
        'override fun onCreate() {\n    super.onCreate()\n    LiveKitReactNative.setup(this, AudioType.CommunicationAudioType())'
      );
    }

    config.modResults.contents = contents;
    return config;
  });
}

function withLiveKitIosSetup(config) {
  return withAppDelegate(config, (config) => {
    let contents = config.modResults.contents;

    if (!contents.includes('import livekit_react_native')) {
      contents = contents.replace('import Expo', 'import Expo\nimport livekit_react_native');
    }

    if (!contents.includes('LivekitReactNative.setup()')) {
      contents = contents.replace(
        'didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil\n  ) -> Bool {',
        'didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil\n  ) -> Bool {\n    LivekitReactNative.setup()'
      );
    }

    config.modResults.contents = contents;
    return config;
  });
}

module.exports = function withLiveKitNativeSetup(config) {
  config = withLiveKitAndroidSetup(config);
  config = withLiveKitIosSetup(config);
  return config;
};
