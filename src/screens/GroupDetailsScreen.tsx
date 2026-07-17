/**
 * EduSphere — screens/GroupDetailsScreen.tsx
 * -----------------------------------------------------------------------
 * Opens on top of the bottom tabs when a group card is tapped anywhere in
 * the app. Receives only a `groupId` via route params and fetches the
 * real group (and its discussions/resources/members/sessions) from the
 * backend — see navigation/types.ts for why this takes an id, not a full
 * object.
 *
 * Follows the same design system as the rest of EduSphere (shared theme,
 * card style, spacing, typography).
 * -----------------------------------------------------------------------
 */

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { COLORS, SHADOW } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';
import { LoadingView, ErrorView, AppTextInput, PrimaryButton } from '../components/common';
import {
  useGroup,
  useGroupPosts,
  useGroupMembers,
  useGroupSessions,
  useJoinGroup,
  useLeaveGroup,
  useCreateGroupPost,
  useCreateGroupSession,
  useInviteMember,
} from '../hooks/useGroups';
import { useResources } from '../hooks/useResources';
import { useCreateReport } from '../hooks/useReports';
import { GroupMember } from '../types/group';
import { Resource } from '../types/resource';

type Props = NativeStackScreenProps<RootStackParamList, 'GroupDetails'>;

const FILE_TYPE_STYLES: Record<Resource['fileType'], { bg: string; color: string }> = {
  PDF: { bg: '#FDEAEA', color: '#D93A3A' },
  DOCX: { bg: '#E7EEFD', color: '#2D3FE0' },
  PPTX: { bg: '#FEF0E2', color: '#E08A1F' },
  ZIP: { bg: '#F1F2F8', color: '#5B6172' },
};

const ROLE_STYLES: Record<GroupMember['role'], { bg: string; color: string }> = {
  owner: { bg: COLORS.primaryLight, color: COLORS.primary },
  member: { bg: COLORS.chipBg, color: COLORS.textSecondary },
};

// -----------------------------------------------------------------------
// SMALL REUSABLE COMPONENTS
// -----------------------------------------------------------------------

/** Section header with title + optional "View all" action */
const SectionHeader: React.FC<{ title: string; onPressViewAll?: () => void }> = ({
  title,
  onPressViewAll,
}) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {onPressViewAll && (
      <TouchableOpacity onPress={onPressViewAll} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={styles.viewAllText}>View all</Text>
      </TouchableOpacity>
    )}
  </View>
);

/** Reusable empty state — used for discussions, resources, sessions, members */
const EmptyState: React.FC<{
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}> = ({ icon, title, subtitle, actionLabel, onAction }) => (
  <View style={styles.emptyState}>
    <View style={styles.emptyIconWrap}>
      <Feather name={icon} size={22} color={COLORS.primary} />
    </View>
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptySubtitle}>{subtitle}</Text>
    {actionLabel && onAction ? (
      <TouchableOpacity style={styles.emptyActionButton} onPress={onAction} activeOpacity={0.85}>
        <Text style={styles.emptyActionButtonText}>{actionLabel}</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

/** Bottom-sheet modal shell shared by the 3 group-action forms below. */
const ActionModal: React.FC<{
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ visible, title, onClose, children }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeaderRow}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name="x" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
          {children}
        </View>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  </Modal>
);

function courseCodeToBadge(courseCode: string): string {
  return courseCode.split(' ')[0]?.slice(0, 2).toUpperCase() || '??';
}

// -----------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------
const GroupDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { groupId } = route.params;

  const [activeModal, setActiveModal] = useState<'discussion' | 'session' | 'invite' | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const [discussionTitle, setDiscussionTitle] = useState('');
  const [discussionBody, setDiscussionBody] = useState('');
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [sessionStartTime, setSessionStartTime] = useState('');
  const [sessionEndTime, setSessionEndTime] = useState('');
  const [sessionLocation, setSessionLocation] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  const groupQuery = useGroup(groupId);
  const group = groupQuery.data;

  const postsQuery = useGroupPosts(groupId, !!group?.isJoined);
  const membersQuery = useGroupMembers(groupId, !!group?.isJoined);
  const sessionsQuery = useGroupSessions(groupId, !!group?.isJoined);
  const resourcesQuery = useResources({ groupId });

  const joinMutation = useJoinGroup();
  const leaveMutation = useLeaveGroup();
  const createPostMutation = useCreateGroupPost(groupId);
  const createSessionMutation = useCreateGroupSession(groupId);
  const inviteMutation = useInviteMember(groupId);
  const reportMutation = useCreateReport();

  useFocusEffect(
    useCallback(() => {
      groupQuery.refetch();
      resourcesQuery.refetch();
      if (group?.isJoined) {
        postsQuery.refetch();
        membersQuery.refetch();
        sessionsQuery.refetch();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [group?.isJoined])
  );

  const posts = postsQuery.data?.items ?? [];
  const discussionsCount = postsQuery.data?.meta.total ?? 0;
  const members = membersQuery.data?.items ?? [];
  const sessions = sessionsQuery.data?.items ?? [];
  const sessionsCount = sessionsQuery.data?.meta.total ?? 0;
  const resources = resourcesQuery.data?.items ?? [];
  const resourcesCount = resourcesQuery.data?.meta.total ?? 0;

  const isJoinLeaveSubmitting = joinMutation.isPending || leaveMutation.isPending;

  const handleJoinLeave = () => {
    if (!group) return;
    const mutation = group.isJoined ? leaveMutation : joinMutation;
    mutation.mutate(groupId, {
      onError: (err) => {
        const message = (err as { message?: string })?.message ?? 'Something went wrong. Please try again.';
        Alert.alert('Error', message);
      },
    });
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalError(null);
  };

  const handleShareGroup = () => {
    if (!group) return;
    Share.share({
      title: group.name,
      message: `Check out "${group.name}" (${group.courseCode}) on EduSphere.`,
    }).catch(() => {
      // Share sheet dismissed/cancelled — nothing to do.
    });
  };

  const handleReportGroup = () => {
    Alert.alert('Report this group?', 'Our team will review it.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Report',
        style: 'destructive',
        onPress: () =>
          reportMutation.mutate(
            { targetType: 'group', targetId: groupId, reason: 'Inappropriate or misleading group' },
            {
              onSuccess: () => Alert.alert('Reported', 'Thanks — our team will review this group.'),
              onError: (err) => {
                const message = (err as { message?: string })?.message ?? 'Something went wrong. Please try again.';
                Alert.alert('Error', message);
              },
            }
          ),
      },
    ]);
  };

  const handlePressOptions = () => {
    if (!group) return;
    Alert.alert(group.name, 'Group options', [
      { text: 'Share Group', onPress: handleShareGroup },
      { text: 'Report Group', style: 'destructive', onPress: handleReportGroup },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const isModalSubmitting =
    createPostMutation.isPending || createSessionMutation.isPending || inviteMutation.isPending;

  const handleSubmitDiscussion = () => {
    if (!discussionTitle.trim()) {
      setModalError('Please enter a title.');
      return;
    }
    setModalError(null);
    createPostMutation.mutate(
      { title: discussionTitle.trim(), body: discussionBody.trim() || undefined },
      {
        onSuccess: () => {
          setDiscussionTitle('');
          setDiscussionBody('');
          closeModal();
        },
        onError: (err) => setModalError((err as { message?: string })?.message ?? 'Something went wrong. Please try again.'),
      }
    );
  };

  const handleSubmitSession = () => {
    if (!sessionTitle.trim() || !sessionDate.trim() || !sessionStartTime.trim() || !sessionEndTime.trim() || !sessionLocation.trim()) {
      setModalError('Please fill in every field.');
      return;
    }
    setModalError(null);
    createSessionMutation.mutate(
      {
        title: sessionTitle.trim(),
        date: sessionDate.trim(),
        startTime: sessionStartTime.trim(),
        endTime: sessionEndTime.trim(),
        location: sessionLocation.trim(),
      },
      {
        onSuccess: () => {
          setSessionTitle('');
          setSessionDate('');
          setSessionStartTime('');
          setSessionEndTime('');
          setSessionLocation('');
          closeModal();
        },
        onError: (err) => setModalError((err as { message?: string })?.message ?? 'Something went wrong. Please try again.'),
      }
    );
  };

  const handleSubmitInvite = () => {
    if (!inviteEmail.trim()) {
      setModalError('Please enter an email address.');
      return;
    }
    setModalError(null);
    inviteMutation.mutate(
      { email: inviteEmail.trim() },
      {
        onSuccess: () => {
          setInviteEmail('');
          closeModal();
          Alert.alert('Invite sent', 'They’ll see it once they sign in.');
        },
        onError: (err) => setModalError((err as { message?: string })?.message ?? 'Something went wrong. Please try again.'),
      }
    );
  };

  if (groupQuery.isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <LoadingView message="Loading group..." />
      </SafeAreaView>
    );
  }

  if (groupQuery.isError || !group) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerIconButton} activeOpacity={0.7} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Group Details</Text>
          <View style={styles.headerIconButton} />
        </View>
        <ErrorView message="Couldn't load this group." onRetry={() => groupQuery.refetch()} />
      </SafeAreaView>
    );
  }

  const hasDiscussions = posts.length > 0;
  const hasResources = resources.length > 0;
  const hasSessions = sessions.length > 0;
  const hasMembers = members.length > 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* ---------------------------------------------------------- */}
      {/* HEADER                                                      */}
      {/* ---------------------------------------------------------- */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIconButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Group Details</Text>

        <TouchableOpacity style={styles.headerIconButton} activeOpacity={0.7} onPress={handlePressOptions}>
          <Feather name="more-vertical" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ---------------------------------------------------------- */}
        {/* GROUP HERO CARD                                             */}
        {/* ---------------------------------------------------------- */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>{courseCodeToBadge(group.courseCode)}</Text>
            </View>

            <View style={styles.typeChip}>
              <Text style={styles.typeChipText}>{group.groupType} Group</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>{group.name}</Text>
          <Text style={styles.heroSubtitle}>
            {group.courseCode} — {group.courseTitle}
          </Text>
          <Text style={styles.heroDescription}>{group.description}</Text>

          <View style={styles.heroMetaRow}>
            <View style={styles.heroMetaItem}>
              <Feather name="users" size={14} color={COLORS.textSecondary} />
              <Text style={styles.heroMetaText}>{group.membersCount} members</Text>
            </View>
            {group.rating !== undefined ? (
              <View style={styles.heroMetaItem}>
                <Ionicons name="star" size={14} color={COLORS.star} />
                <Text style={styles.heroMetaText}>{group.rating.toFixed(1)} rating</Text>
              </View>
            ) : null}
          </View>

          <TouchableOpacity
            style={[styles.heroActionButton, isJoinLeaveSubmitting && styles.heroActionButtonDisabled]}
            activeOpacity={0.85}
            onPress={handleJoinLeave}
            disabled={isJoinLeaveSubmitting}
          >
            <Text style={styles.heroActionButtonText}>
              {isJoinLeaveSubmitting ? 'Please wait...' : group.isJoined ? 'Leave Group' : 'Join Group'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ---------------------------------------------------------- */}
        {/* GROUP STATS                                                 */}
        {/* ---------------------------------------------------------- */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIconWrap}>
              <Feather name="users" size={16} color={COLORS.primary} />
            </View>
            <Text style={styles.statValue}>{group.membersCount}</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconWrap}>
              <Feather name="file-text" size={16} color={COLORS.primary} />
            </View>
            <Text style={styles.statValue}>{resourcesCount}</Text>
            <Text style={styles.statLabel}>Resources</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconWrap}>
              <Feather name="calendar" size={16} color={COLORS.primary} />
            </View>
            <Text style={styles.statValue}>{sessionsCount}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconWrap}>
              <Feather name="message-circle" size={16} color={COLORS.primary} />
            </View>
            <Text style={styles.statValue}>{discussionsCount}</Text>
            <Text style={styles.statLabel}>Discussions</Text>
          </View>
        </View>

        {!group.isJoined ? (
          <View style={styles.joinPrompt}>
            <Feather name="lock" size={13} color={COLORS.textMuted} />
            <Text style={styles.joinPromptText}>Join this group to see discussions, sessions, and members.</Text>
          </View>
        ) : null}

        {/* ---------------------------------------------------------- */}
        {/* UPCOMING SESSIONS                                           */}
        {/* ---------------------------------------------------------- */}
        {group.isJoined && (
          <>
            <SectionHeader title="Upcoming Sessions" />
            {hasSessions ? (
              <View style={styles.stackedCards}>
                {sessions.map((session) => (
                  <View key={session.id} style={styles.sessionCard}>
                    <Text style={styles.sessionTitle}>{session.title}</Text>

                    <View style={styles.sessionMetaRow}>
                      <Feather name="calendar" size={13} color={COLORS.textSecondary} />
                      <Text style={styles.sessionMetaText}>{session.date}</Text>
                    </View>
                    <View style={styles.sessionMetaRow}>
                      <Feather name="clock" size={13} color={COLORS.textSecondary} />
                      <Text style={styles.sessionMetaText}>
                        {session.startTime} – {session.endTime}
                      </Text>
                    </View>
                    <View style={styles.sessionMetaRow}>
                      <Feather name="map-pin" size={13} color={COLORS.textSecondary} />
                      <Text style={styles.sessionMetaText}>{session.location}</Text>
                    </View>
                    <View style={styles.sessionMetaRow}>
                      <Feather name="users" size={13} color={COLORS.textSecondary} />
                      <Text style={styles.sessionMetaText}>{session.attendeesCount} attending</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.stackedCards}>
                <View style={styles.emptyStateCard}>
                  <EmptyState
                    icon="calendar"
                    title="No upcoming sessions"
                    subtitle="Schedule a session so members know when to meet."
                  />
                </View>
              </View>
            )}
          </>
        )}

        {/* ---------------------------------------------------------- */}
        {/* RECENT DISCUSSIONS                                          */}
        {/* ---------------------------------------------------------- */}
        {group.isJoined && (
          <>
            <SectionHeader title="Recent Discussions" />
            {hasDiscussions ? (
              <View style={styles.listCard}>
                {posts.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.discussionRow, index !== posts.length - 1 && styles.rowDivider]}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('PostDetails', { postId: item.id, groupId })}
                  >
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarInitials}>
                        {item.authorName
                          .split(' ')
                          .map((p) => p[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.discussionInfo}>
                      <Text style={styles.discussionQuestion} numberOfLines={2}>
                        {item.title}
                      </Text>
                      <Text style={styles.discussionMeta}>
                        Asked by {item.authorName} • {item.repliesCount} replies
                      </Text>
                    </View>

                    <Feather name="chevron-right" size={18} color={COLORS.textMuted} />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.listCard}>
                <EmptyState
                  icon="message-circle"
                  title="No discussions yet"
                  subtitle="Start the first conversation in this group."
                />
              </View>
            )}
          </>
        )}

        {/* ---------------------------------------------------------- */}
        {/* SHARED RESOURCES                                            */}
        {/* ---------------------------------------------------------- */}
        <SectionHeader
          title="Shared Resources"
          onPressViewAll={() => navigation.navigate('MainTabs', { screen: 'Resources' })}
        />
        {hasResources ? (
          <View style={styles.listCard}>
            {resources.map((item, index) => {
              const fileStyle = FILE_TYPE_STYLES[item.fileType];
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.resourceRow, index !== resources.length - 1 && styles.rowDivider]}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('ResourceDetails', { resourceId: item.id })}
                >
                  <View style={[styles.fileBadge, { backgroundColor: fileStyle.bg }]}>
                    <Text style={[styles.fileBadgeText, { color: fileStyle.color }]}>{item.fileType}</Text>
                  </View>

                  <View style={styles.resourceInfo}>
                    <Text style={styles.resourceTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.resourceMeta}>
                      {item.fileType} • {item.size}
                    </Text>
                  </View>

                  <Feather name="chevron-right" size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.listCard}>
            <EmptyState
              icon="folder"
              title="No resources shared"
              subtitle="Upload the first file for this group."
              actionLabel="Upload Resource"
              onAction={() => navigation.navigate('UploadResource')}
            />
          </View>
        )}

        {/* ---------------------------------------------------------- */}
        {/* MEMBERS                                                     */}
        {/* ---------------------------------------------------------- */}
        {group.isJoined && (
          <>
            <SectionHeader title="Members" />
            {hasMembers ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.membersScroll}
              >
                {members.map((member) => {
                  const roleStyle = ROLE_STYLES[member.role];
                  return (
                    <View key={member.id} style={styles.memberCard}>
                      <View style={styles.memberAvatarCircle}>
                        <Text style={styles.memberAvatarInitials}>
                          {member.fullName
                            .split(' ')
                            .map((p) => p[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.memberName} numberOfLines={1}>
                        {member.fullName.split(' ')[0]}
                      </Text>
                      <View style={[styles.roleChip, { backgroundColor: roleStyle.bg }]}>
                        <Text style={[styles.roleChipText, { color: roleStyle.color }]}>
                          {member.role === 'owner' ? 'Owner' : 'Member'}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            ) : null}
          </>
        )}

        {/* ---------------------------------------------------------- */}
        {/* GROUP ACTIONS                                               */}
        {/* ---------------------------------------------------------- */}
        {group.isJoined && (
          <>
            <SectionHeader title="Group Actions" />
            <View style={styles.actionsGrid}>
              <TouchableOpacity
                style={styles.primaryActionCard}
                activeOpacity={0.85}
                onPress={() => setActiveModal('discussion')}
              >
                <View style={styles.primaryActionIconWrap}>
                  <Feather name="message-square" size={18} color={COLORS.white} />
                </View>
                <Text style={styles.primaryActionLabel}>Start Discussion</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryActionCard}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('UploadResource')}
              >
                <View style={styles.secondaryActionIconWrap}>
                  <Feather name="upload" size={18} color={COLORS.primary} />
                </View>
                <Text style={styles.secondaryActionLabel}>Upload Resource</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryActionCard}
                activeOpacity={0.85}
                onPress={() => setActiveModal('session')}
              >
                <View style={styles.secondaryActionIconWrap}>
                  <Feather name="calendar" size={18} color={COLORS.primary} />
                </View>
                <Text style={styles.secondaryActionLabel}>Schedule Session</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryActionCard}
                activeOpacity={0.85}
                onPress={() => setActiveModal('invite')}
              >
                <View style={styles.secondaryActionIconWrap}>
                  <Feather name="user-plus" size={18} color={COLORS.primary} />
                </View>
                <Text style={styles.secondaryActionLabel}>Invite Member</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Bottom spacer */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ------------------------------------------------------------ */}
      {/* GROUP ACTION MODALS                                           */}
      {/* ------------------------------------------------------------ */}
      <ActionModal visible={activeModal === 'discussion'} title="Start Discussion" onClose={closeModal}>
        <AppTextInput label="Title" value={discussionTitle} onChangeText={setDiscussionTitle} placeholder="What's your question?" />
        <AppTextInput
          label="Details (optional)"
          value={discussionBody}
          onChangeText={setDiscussionBody}
          placeholder="Add more context..."
          multiline
        />
        {modalError ? <Text style={styles.modalErrorText}>{modalError}</Text> : null}
        <PrimaryButton label="Post Discussion" onPress={handleSubmitDiscussion} loading={isModalSubmitting} />
      </ActionModal>

      <ActionModal visible={activeModal === 'session'} title="Schedule Session" onClose={closeModal}>
        <AppTextInput label="Title" value={sessionTitle} onChangeText={setSessionTitle} placeholder="e.g. Data Structures Revision" />
        <AppTextInput label="Date" value={sessionDate} onChangeText={setSessionDate} placeholder="e.g. 2026-08-01" />
        <AppTextInput label="Start Time" value={sessionStartTime} onChangeText={setSessionStartTime} placeholder="e.g. 4:00 PM" />
        <AppTextInput label="End Time" value={sessionEndTime} onChangeText={setSessionEndTime} placeholder="e.g. 6:00 PM" />
        <AppTextInput label="Location" value={sessionLocation} onChangeText={setSessionLocation} placeholder="e.g. CCB, Room 203" />
        {modalError ? <Text style={styles.modalErrorText}>{modalError}</Text> : null}
        <PrimaryButton label="Schedule Session" onPress={handleSubmitSession} loading={isModalSubmitting} />
      </ActionModal>

      <ActionModal visible={activeModal === 'invite'} title="Invite Member" onClose={closeModal}>
        <AppTextInput
          label="KNUST Email"
          value={inviteEmail}
          onChangeText={setInviteEmail}
          placeholder="student@knust.edu.gh"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        {modalError ? <Text style={styles.modalErrorText}>{modalError}</Text> : null}
        <PrimaryButton label="Send Invite" onPress={handleSubmitInvite} loading={isModalSubmitting} />
      </ActionModal>
    </SafeAreaView>
  );
};

export default GroupDetailsScreen;

// -----------------------------------------------------------------------
// STYLES
// -----------------------------------------------------------------------
const CARD_GAP = 14;
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
    paddingBottom: 12,
  },

  // ---------------- HEADER ----------------
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

  // ---------------- HERO CARD ----------------
  heroCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    marginHorizontal: H_PADDING,
    marginTop: 12,
    padding: 18,
    ...SHADOW,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBadgeText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
  typeChip: {
    backgroundColor: COLORS.chipBg,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },
  typeChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  heroTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 16,
  },
  heroSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 3,
  },
  heroDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
    marginTop: 10,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  heroMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 18,
  },
  heroMetaText: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  heroActionButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 16,
  },
  heroActionButtonDisabled: {
    opacity: 0.7,
  },
  heroActionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },

  // ---------------- STATS ----------------
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: H_PADDING,
    marginTop: 18,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    ...SHADOW,
  },
  statIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 15.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 10.5,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // ---------------- JOIN PROMPT ----------------
  joinPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: H_PADDING,
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: COLORS.chipBg,
    borderRadius: 12,
  },
  joinPromptText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },

  // ---------------- SECTION HEADER ----------------
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: H_PADDING,
    marginTop: 22,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },

  stackedCards: {
    paddingHorizontal: H_PADDING,
  },

  // ---------------- UPCOMING SESSION ----------------
  sessionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: CARD_GAP,
    ...SHADOW,
  },
  sessionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  sessionMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  sessionMetaText: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    marginLeft: 7,
  },
  emptyStateCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    ...SHADOW,
  },

  // ---------------- SHARED LIST CARD ----------------
  listCard: {
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

  // ---------------- DISCUSSIONS ----------------
  discussionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarInitials: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  discussionInfo: {
    flex: 1,
    marginRight: 8,
  },
  discussionQuestion: {
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  discussionMeta: {
    fontSize: 11.5,
    color: COLORS.textMuted,
  },

  // ---------------- RESOURCES ----------------
  resourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  fileBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 12,
  },
  fileBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  resourceInfo: {
    flex: 1,
    marginRight: 8,
  },
  resourceTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  resourceMeta: {
    fontSize: 11.5,
    color: COLORS.textMuted,
  },

  // ---------------- MEMBERS ----------------
  membersScroll: {
    paddingHorizontal: H_PADDING,
    paddingBottom: 4,
  },
  memberCard: {
    width: 84,
    alignItems: 'center',
    marginRight: CARD_GAP,
  },
  memberAvatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  memberAvatarInitials: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
  memberName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 5,
  },
  roleChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  roleChipText: {
    fontSize: 9.5,
    fontWeight: '700',
  },

  // ---------------- GROUP ACTIONS ----------------
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: H_PADDING,
    gap: 10,
  },
  primaryActionCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 14,
    marginBottom: 2,
  },
  primaryActionIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  primaryActionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  secondaryActionCard: {
    flexBasis: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    ...SHADOW,
  },
  secondaryActionIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  secondaryActionLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flexShrink: 1,
  },

  // ---------------- EMPTY STATE (reusable) ----------------
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    paddingHorizontal: 16,
  },
  emptyIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 260,
  },
  emptyActionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 12,
    marginTop: 16,
  },
  emptyActionButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },

  // ---------------- ACTION MODALS ----------------
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17,17,17,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalErrorText: {
    fontSize: 12,
    color: COLORS.danger,
    marginBottom: 12,
  },
});
