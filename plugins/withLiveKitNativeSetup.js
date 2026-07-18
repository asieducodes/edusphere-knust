/**
 * EduSphere — plugins/withLiveKitNativeSetup.js
 * -----------------------------------------------------------------------
 * @livekit/react-native requires a one-line native setup call
 * (LiveKitReactNative.setup(...)) in MainApplication.kt / AppDelegate.swift
 * before any other React Native init — see its README. Neither
 * @livekit/react-native-expo-plugin nor the native module itself does
 * this automatically (confirmed by reading LiveKitReactNative.kt: it
 * throws "Did you remember to call LiveKitReactNative.setup..." if
 * skipped, and the Expo plugin's own source only writes optional
 * AndroidManifest/Info.plist flags, never this call). Since this is a
 * managed/CNG project, android/ios aren't committed and get regenerated
 * on every prebuild — so this has to be a config plugin, not a one-off
 * manual edit, or it would silently disappear on the next prebuild.
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
