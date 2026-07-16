/**
 * EduSphere — screens/NotificationsScreen.tsx
 * -----------------------------------------------------------------------
 * Minimal notifications list — tap to mark read, "Mark all read" action.
 * Opens on top of the tabs (see navigation/MainStackNavigator.tsx), reached
 * from the bell icon on Home/Groups/Resources/Profile.
 * -----------------------------------------------------------------------
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { COLORS } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';
import { ScreenHeader, LoadingView, ErrorView, EmptyState } from '../components/common';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '../hooks/useNotifications';
import { AppNotification, NotificationType } from '../types/notification';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

const TYPE_ICON: Record<NotificationType, keyof typeof Feather.glyphMap> = {
  group_invite: 'user-plus',
  discussion_reply: 'message-circle',
  session_reminder: 'calendar',
  resource_upload: 'upload',
  rating_received: 'star',
  system: 'bell',
};

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diffMs = Date.now() - then;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const NotificationsScreen: React.FC<Props> = ({ navigation }) => {
  const notificationsQuery = useNotifications();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  useFocusEffect(
    useCallback(() => {
      notificationsQuery.refetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const notifications = notificationsQuery.data?.items ?? [];
  const isLoading = notificationsQuery.isLoading;
  const hasError = !notificationsQuery.data && notificationsQuery.isError;
  const markingAll = markAllReadMutation.isPending;

  const handlePress = (item: AppNotification) => {
    if (!item.isRead) {
      markReadMutation.mutate(item.id);
    }
    navigation.navigate('NotificationDetail', { notification: item });
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScreenHeader
        title="Notifications"
        onBack={() => navigation.goBack()}
        rightText={hasUnread ? (markingAll ? 'Marking...' : 'Mark all read') : undefined}
        onPressRight={handleMarkAllRead}
      />

      {isLoading && <LoadingView message="Loading notifications..." />}
      {hasError && <ErrorView onRetry={() => notificationsQuery.refetch()} />}

      {!isLoading && !hasError && notifications.length === 0 && (
        <EmptyState
          icon="bell"
          title="No notifications yet"
          subtitle="You'll see group invites, replies, and reminders here."
        />
      )}

      {!isLoading && !hasError && notifications.length > 0 && (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.row, !item.isRead && styles.rowUnread]}
              activeOpacity={0.7}
              onPress={() => handlePress(item)}
            >
              <View style={styles.iconWrap}>
                <Feather name={TYPE_ICON[item.type]} size={16} color={COLORS.primary} />
              </View>
              <View style={styles.textBlock}>
                <Text style={styles.title} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.body} numberOfLines={2}>
                  {item.body}
                </Text>
                <Text style={styles.time}>{relativeTime(item.createdAt)}</Text>
              </View>
              {!item.isRead ? <View style={styles.unreadDot} /> : null}
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default NotificationsScreen;

// -----------------------------------------------------------------------
// STYLES
// -----------------------------------------------------------------------
const H_PADDING = 20;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingHorizontal: H_PADDING,
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  rowUnread: {
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  body: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    lineHeight: 17,
    marginBottom: 6,
  },
  time: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
    marginTop: 4,
  },
});
