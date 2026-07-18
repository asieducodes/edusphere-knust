/**
 * EduSphere — screens/ResourcePreviewScreen.tsx
 * -----------------------------------------------------------------------
 * In-app PDF preview, opened from ResourceDetailsScreen's Preview button.
 * PDF only — DOCX/PPTX/ZIP can't be rendered by a plain WebView and we
 * don't have a document-conversion service, so those just keep Download.
 *
 * Pulls fileUrl off the normal GET /resources/:id response rather than
 * hitting /download, since that endpoint bumps downloads_count and a
 * preview isn't a download.
 *
 * Android's WebView won't render a PDF on its own the way iOS's WKWebView
 * does, so Android routes through Google's viewer instead — the usual
 * workaround for this.
 * -----------------------------------------------------------------------
 */

import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ThemeColors } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { RootStackParamList } from '../navigation/types';
import { ScreenHeader, LoadingView, ErrorView } from '../components/common';
import { useResource } from '../hooks/useResources';

type Props = NativeStackScreenProps<RootStackParamList, 'ResourcePreview'>;

const ResourcePreviewScreen: React.FC<Props> = ({ navigation, route }) => {
  const { resourceId } = route.params;
  const { colors: COLORS, isDark } = useTheme();
  const { t } = useLanguage();
  const styles = React.useMemo(() => createStyles(COLORS), [COLORS]);

  const resourceQuery = useResource(resourceId);
  const [webViewLoading, setWebViewLoading] = useState(true);
  const [webViewError, setWebViewError] = useState(false);

  const resource = resourceQuery.data;
  const previewUri =
    resource && Platform.OS === 'android'
      ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(resource.fileUrl)}`
      : resource?.fileUrl;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={COLORS.background} />

      <ScreenHeader title={resource?.title ?? t('resourcePreview.title')} onBack={() => navigation.goBack()} />

      {resourceQuery.isLoading ? (
        <LoadingView message={t('resourcePreview.loading')} />
      ) : resourceQuery.isError || !resource || !previewUri ? (
        <ErrorView onRetry={() => resourceQuery.refetch()} />
      ) : webViewError ? (
        <ErrorView
          message={t('resourcePreview.previewFailed')}
          onRetry={() => {
            setWebViewError(false);
            setWebViewLoading(true);
          }}
        />
      ) : (
        <View style={styles.webViewWrap}>
          <WebView
            source={{ uri: previewUri }}
            style={styles.webView}
            onLoadEnd={() => setWebViewLoading(false)}
            onError={() => setWebViewError(true)}
            onHttpError={() => setWebViewError(true)}
          />
          {webViewLoading ? (
            <View style={styles.loadingOverlay}>
              <LoadingView message={t('resourcePreview.loading')} />
            </View>
          ) : null}
        </View>
      )}
    </SafeAreaView>
  );
};

export default ResourcePreviewScreen;

// -----------------------------------------------------------------------
// STYLES
// -----------------------------------------------------------------------
function createStyles(COLORS: ThemeColors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    webViewWrap: {
      flex: 1,
    },
    webView: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: COLORS.background,
    },
  });
}
