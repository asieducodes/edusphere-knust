/**
 * EduSphere — screens/MyReportsScreen.tsx
 * -----------------------------------------------------------------------
 * Read-only list of reports the signed-in student has filed (resources,
 * groups, users, posts, comments) via ResourceDetailsScreen's/
 * GroupDetailsScreen's "Report" actions, with the moderation status of
 * each. Reached from ProfileScreen's account menu.
 * -----------------------------------------------------------------------
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SHADOW, ThemeColors } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { RootStackParamList } from '../navigation/types';
import { EmptyState, LoadingView, ErrorView } from '../components/common';
import { useMyReports } from '../hooks/useReports';
import { Report, ReportStatus, ReportTargetType } from '../types/report';

type Props = NativeStackScreenProps<RootStackParamList, 'MyReports'>;

const TARGET_ICONS: Record<ReportTargetType, keyof typeof Feather.glyphMap> = {
  resource: 'file-text',
  group: 'users',
  user: 'user',
  post: 'message-square',
  comment: 'message-circle',
};

function relativeTime(iso: string, t: (path: string, options?: Record<string, string | number>) => string): string {
  const then = new Date(iso).getTime();
  const diffMs = Date.now() - then;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return t('notifications.justNow');
  if (minutes < 60) return t('notifications.minutesAgo', { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t('notifications.hoursAgo', { count: hours });
  const days = Math.floor(hours / 24);
  return t('notifications.daysAgo', { count: days });
}

const MyReportsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors: COLORS, isDark } = useTheme();
  const { t } = useLanguage();
  const styles = React.useMemo(() => createStyles(COLORS), [COLORS]);

  const STATUS_STYLES: Record<ReportStatus, { bg: string; color: string; label: string }> = {
    pending: { bg: COLORS.warningLight, color: COLORS.warning, label: t('myReports.statusPending') },
    reviewed: { bg: COLORS.primaryLight, color: COLORS.primary, label: t('myReports.statusReviewed') },
    resolved: { bg: COLORS.successLight, color: COLORS.success, label: t('myReports.statusResolved') },
    dismissed: { bg: COLORS.chipBg, color: COLORS.textMuted, label: t('myReports.statusDismissed') },
  };

  const reportsQuery = useMyReports();
  const reports = reportsQuery.data?.items ?? [];

  const isLoading = reportsQuery.isLoading;
  const isError = !reportsQuery.data && reportsQuery.isError;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconButton} activeOpacity={0.7} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('myReports.title')}</Text>
        <View style={styles.headerIconButton} />
      </View>

      {isLoading ? (
        <LoadingView message={t('myReports.loading')} />
      ) : isError ? (
        <ErrorView message={t('myReports.loadError')} onRetry={() => reportsQuery.refetch()} />
      ) : reports.length === 0 ? (
        <EmptyState icon="flag" title={t('myReports.noReports')} subtitle={t('myReports.noReportsSubtitle')} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            {reports.map((report: Report, index) => {
              const statusInfo = STATUS_STYLES[report.status];
              return (
                <View key={report.id} style={index !== reports.length - 1 ? styles.rowDivider : undefined}>
                  <View style={styles.row}>
                    <View style={styles.rowIconWrap}>
                      <Feather name={TARGET_ICONS[report.targetType]} size={16} color={COLORS.primary} />
                    </View>
                    <View style={styles.reportTextBlock}>
                      <Text style={styles.reportReason} numberOfLines={2}>
                        {report.reason}
                      </Text>
                      {report.details ? (
                        <Text style={styles.reportDetails} numberOfLines={2}>
                          {report.details}
                        </Text>
                      ) : null}
                      <View style={styles.reportMetaRow}>
                        <View style={[styles.statusChip, { backgroundColor: statusInfo.bg }]}>
                          <Text style={[styles.statusChipText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                        </View>
                        <Text style={styles.reportTimestamp}>{relativeTime(report.createdAt, t)}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default MyReportsScreen;

// -----------------------------------------------------------------------
// STYLES
// -----------------------------------------------------------------------
const H_PADDING = 20;

function createStyles(COLORS: ThemeColors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: H_PADDING,
      paddingTop: 12,
      paddingBottom: 8,
    },
    headerIconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: COLORS.card,
      alignItems: 'center',
      justifyContent: 'center',
      ...SHADOW,
    },
    headerTitle: {
      fontSize: 16.5,
      fontWeight: '700',
      color: COLORS.textPrimary,
    },
    scrollContent: {
      paddingTop: 8,
      paddingBottom: 12,
    },
    card: {
      backgroundColor: COLORS.card,
      borderRadius: 18,
      marginHorizontal: H_PADDING,
      paddingHorizontal: 16,
      ...SHADOW,
    },
    rowDivider: {
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: 14,
    },
    rowIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: COLORS.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
      marginTop: 2,
    },
    reportTextBlock: {
      flex: 1,
    },
    reportReason: {
      fontSize: 14,
      fontWeight: '600',
      color: COLORS.textPrimary,
    },
    reportDetails: {
      fontSize: 12.5,
      color: COLORS.textSecondary,
      marginTop: 4,
      lineHeight: 18,
    },
    reportMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
    },
    statusChip: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
      marginRight: 10,
    },
    statusChipText: {
      fontSize: 11,
      fontWeight: '700',
    },
    reportTimestamp: {
      fontSize: 11.5,
      color: COLORS.textMuted,
    },
  });
}
