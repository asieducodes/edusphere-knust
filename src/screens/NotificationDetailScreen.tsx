/**
 * EduSphere — screens/NotificationDetailScreen.tsx
 * -----------------------------------------------------------------------
 * Full-content view for a single notification, reached by tapping a row
 * in NotificationsScreen. Handles the one notification type that needs a
 * real decision — group_invite — with Accept/Decline actions wired to the
 * real /group-invites endpoints; every other type just shows its content
 * plus a "View Group"/"View Resource" link when the notification points
 * at one.
 * -----------------------------------------------------------------------
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { COLORS, SHADOW } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';
import { ScreenHeader, PrimaryButton, SecondaryButton } from '../components/common';
import { useAcceptGroupInvite, useRejectGroupInvite } from '../hooks/useGroups';
import { NotificationType } from '../types/notification';

type Props = NativeStackScreenProps<RootStackParamList, 'NotificationDetail'>;

const TYPE_ICON: Record<NotificationType, keyof typeof Feather.glyphMap> = {
  group_invite: 'user-plus',
  discussion_reply: 'message-circle',
  session_reminder: 'calendar',
  resource_upload: 'upload',
  rating_received: 'star',
  system: 'bell',
};

const TYPE_LABEL: Record<NotificationType, string> = {
  group_invite: 'Group Invite',
  discussion_reply: 'Discussion Reply',
  session_reminder: 'Session Reminder',
  resource_upload: 'New Resource',
  rating_received: 'Rating Received',
  system: 'EduSphere',
};

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

type InviteState = 'idle' | 'processing' | 'accepted' | 'rejected' | 'error';

const NotificationDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { notification } = route.params;
  const groupId = typeof notification.data?.groupId === 'string' ? notification.data.groupId : undefined;
  const resourceId = typeof notification.data?.resourceId === 'string' ? notification.data.resourceId : undefined;
  const inviteId = typeof notification.data?.inviteId === 'string' ? notification.data.inviteId : undefined;

  const isInvite = notification.type === 'group_invite' && !!inviteId;

  const [inviteState, setInviteState] = useState<InviteState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const acceptMutation = useAcceptGroupInvite();
  const rejectMutation = useRejectGroupInvite();

  const handleAccept = () => {
    if (!inviteId) return;
    setInviteState('processing');
    setErrorMessage(null);
    acceptMutation.mutate(inviteId, {
      onSuccess: () => setInviteState('accepted'),
      onError: (err) => {
        const message = (err as { message?: string })?.message ?? 'Something went wrong. Please try again.';
        setErrorMessage(message);
        setInviteState('error');
      },
    });
  };

  const handleDecline = () => {
    if (!inviteId) return;
    setInviteState('processing');
    setErrorMessage(null);
    rejectMutation.mutate(inviteId, {
      onSuccess: () => setInviteState('rejected'),
      onError: (err) => {
        const message = (err as { message?: string })?.message ?? 'Something went wrong. Please try again.';
        setErrorMessage(message);
        setInviteState('error');
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScreenHeader title="Notification" onBack={() => navigation.goBack()} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Feather name={TYPE_ICON[notification.type]} size={22} color={COLORS.primary} />
          </View>

          <Text style={styles.typeLabel}>{TYPE_LABEL[notification.type]}</Text>
          <Text style={styles.title}>{notification.title}</Text>
          <Text style={styles.timestamp}>{formatTimestamp(notification.createdAt)}</Text>

          <Text style={styles.body}>{notification.body}</Text>

          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Feather name="alert-circle" size={14} color={COLORS.danger} />
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          ) : null}

          {isInvite && inviteState === 'accepted' && (
            <View style={styles.successBanner}>
              <Feather name="check-circle" size={14} color={COLORS.success} />
              <Text style={styles.successBannerText}>You've joined the group!</Text>
            </View>
          )}

          {isInvite && inviteState === 'rejected' && (
            <View style={styles.neutralBanner}>
              <Feather name="x-circle" size={14} color={COLORS.textSecondary} />
              <Text style={styles.neutralBannerText}>Invite declined.</Text>
            </View>
          )}

          {isInvite && (inviteState === 'idle' || inviteState === 'processing' || inviteState === 'error') && (
            <View style={styles.actionRow}>
              <View style={styles.actionHalf}>
                <SecondaryButton label={inviteState === 'processing' ? 'Please wait...' : 'Decline'} onPress={handleDecline} />
              </View>
              <View style={styles.actionHalf}>
                <PrimaryButton
                  label="Accept"
                  onPress={handleAccept}
                  loading={inviteState === 'processing'}
                  disabled={inviteState === 'processing'}
                />
              </View>
            </View>
          )}

          {groupId && (!isInvite || inviteState === 'accepted') && (
            <View style={styles.viewLinkWrap}>
              <SecondaryButton
                label="View Group"
                icon="arrow-right"
                onPress={() => navigation.navigate('GroupDetails', { groupId })}
              />
            </View>
          )}

          {resourceId && (
            <View style={styles.viewLinkWrap}>
              <SecondaryButton
                label="View Resource"
                icon="arrow-right"
                onPress={() => navigation.navigate('ResourceDetails', { resourceId })}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationDetailScreen;

// -----------------------------------------------------------------------
// STYLES
// -----------------------------------------------------------------------
const H_PADDING = 20;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingTop: 4,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    marginHorizontal: H_PADDING,
    padding: 22,
    ...SHADOW,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  typeLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    color: COLORS.primary,
    marginBottom: 8,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  timestamp: {
    fontSize: 12.5,
    color: COLORS.textMuted,
    marginBottom: 18,
  },
  body: {
    fontSize: 14.5,
    lineHeight: 22,
    color: COLORS.textSecondary,
  },

  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDEAEA',
    borderRadius: 12,
    padding: 12,
    marginTop: 20,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 12.5,
    color: COLORS.danger,
    marginLeft: 8,
    lineHeight: 18,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    borderRadius: 12,
    padding: 12,
    marginTop: 20,
  },
  successBannerText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.success,
    marginLeft: 8,
  },
  neutralBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.chipBg,
    borderRadius: 12,
    padding: 12,
    marginTop: 20,
  },
  neutralBannerText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginLeft: 8,
  },

  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 22,
  },
  actionHalf: {
    flex: 1,
  },
  viewLinkWrap: {
    marginTop: 20,
  },
});
