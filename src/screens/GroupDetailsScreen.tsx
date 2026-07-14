/**
 * EduSphere — screens/GroupDetailsScreen.tsx
 * -----------------------------------------------------------------------
 * Opens on top of the bottom tabs (see navigation/AppNavigator.tsx) when
 * a group card is tapped anywhere in the app. Receives an optional
 * `group` object via route params — falls back to sample data if none
 * is passed, so this screen also works if opened directly for testing.
 *
 * Follows the same design system as the rest of EduSphere (shared theme,
 * card style, spacing, typography).
 * -----------------------------------------------------------------------
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { COLORS, SHADOW } from '../theme/colors';
import { Group, ResourceData, RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'GroupDetails'>;

// -----------------------------------------------------------------------
// FALLBACK SAMPLE DATA — used when no group is passed via route params
// -----------------------------------------------------------------------
const SAMPLE_GROUP: Group = {
  id: 'g-sample',
  categoryShort: 'CS',
  code: 'CSM 351',
  name: 'CSM 351 Data Structures',
  subtitle: 'Data Structures and Algorithms',
  description:
    'A study group for students who want to improve their understanding of data structures, algorithms, and problem-solving techniques.',
  members: 24,
  rating: 4.8,
  status: 'Active',
  groupType: 'Public Group',
  isJoined: true,
};

// -----------------------------------------------------------------------
// TYPES (local to this screen)
// -----------------------------------------------------------------------
interface StatItem {
  id: string;
  icon: keyof typeof Feather.glyphMap;
  value: string;
  label: string;
}

interface DiscussionItem {
  id: string;
  question: string;
  author: string;
  initials: string;
  replies: number;
  time: string;
}

interface ResourceItem {
  id: string;
  title: string;
  fileType: 'PDF' | 'DOCX' | 'PPTX';
  size: string;
}

interface MemberItem {
  id: string;
  name: string;
  initials: string;
  role: 'Host' | 'Tutor' | 'Member';
}

// -----------------------------------------------------------------------
// STATIC SAMPLE DATA
// -----------------------------------------------------------------------
const STATS: StatItem[] = [
  { id: 'st1', icon: 'users', value: '24', label: 'Members' },
  { id: 'st2', icon: 'file-text', value: '12', label: 'Resources' },
  { id: 'st3', icon: 'calendar', value: '8', label: 'Sessions' },
  { id: 'st4', icon: 'message-circle', value: '36', label: 'Discussions' },
];

const DISCUSSIONS: DiscussionItem[] = [
  {
    id: 'd1',
    question: 'How do binary search trees work?',
    author: 'Ama',
    initials: 'AM',
    replies: 8,
    time: '15 min ago',
  },
  {
    id: 'd2',
    question: 'Difference between stack and queue?',
    author: 'Kojo',
    initials: 'KJ',
    replies: 5,
    time: '1h ago',
  },
  {
    id: 'd3',
    question: 'Best way to revise linked lists?',
    author: 'Nii',
    initials: 'NN',
    replies: 3,
    time: '2h ago',
  },
];

const RESOURCES: ResourceItem[] = [
  { id: 'r1', title: 'Data Structures Past Questions', fileType: 'PDF', size: '2.4 MB' },
  { id: 'r2', title: 'Linked List Lecture Notes', fileType: 'DOCX', size: '1.6 MB' },
  { id: 'r3', title: 'Stacks and Queues Slides', fileType: 'PPTX', size: '3.1 MB' },
];

const MEMBERS: MemberItem[] = [
  { id: 'm1', name: 'Nii Nortey', initials: 'NN', role: 'Host' },
  { id: 'm2', name: 'Ama Mensah', initials: 'AM', role: 'Tutor' },
  { id: 'm3', name: 'Kojo Asante', initials: 'KA', role: 'Member' },
  { id: 'm4', name: 'Efua Boateng', initials: 'EB', role: 'Member' },
  { id: 'm5', name: 'Kofi Appiah', initials: 'KP', role: 'Member' },
];

const HAS_UPCOMING_SESSION = true; // toggle to preview the empty state

// This screen's Shared Resources list only tracks title/fileType/size —
// ResourceDetailsScreen needs the fuller ResourceData shape. This fills
// in reasonable defaults for what isn't tracked here yet (same pattern
// used in ResourcesScreen.tsx's toResourceData helper).
const toResourceData = (item: ResourceItem, group: Group): ResourceData => ({
  id: item.id,
  title: item.title,
  fileType: item.fileType,
  courseCode: group.code,
  category: 'Shared Resource',
  description: `Shared in the ${group.name} study group.`,
  size: item.size,
  uploaded: 'Recently',
  downloads: 0,
  saves: 0,
  rating: 4.5,
  visibility: 'Group Only',
  uploader: {
    name: 'Group Member',
    initials: 'GM',
    programme: 'BSc Computer Science',
    level: 'Level 300',
    verified: false,
  },
});

const FILE_TYPE_STYLES: Record<ResourceItem['fileType'], { bg: string; color: string }> = {
  PDF: { bg: '#FDEAEA', color: '#D93A3A' },
  DOCX: { bg: '#E7EEFD', color: '#2D3FE0' },
  PPTX: { bg: '#FEF0E2', color: '#E08A1F' },
};

const ROLE_STYLES: Record<MemberItem['role'], { bg: string; color: string }> = {
  Host: { bg: COLORS.primaryLight, color: COLORS.primary },
  Tutor: { bg: COLORS.successLight, color: COLORS.success },
  Member: { bg: COLORS.chipBg, color: COLORS.textSecondary },
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

/** Reusable empty state — used for discussions, resources, and sessions */
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

// -----------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------
const GroupDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  // Falls back to sample data if this screen is opened without params
  // (e.g. directly, during testing).
  const group: Group = route.params?.group ?? SAMPLE_GROUP;

  const [isJoined, setIsJoined] = useState(group.isJoined);
  const [isSaved, setIsSaved] = useState(false);

  const hasDiscussions = DISCUSSIONS.length > 0;
  const hasResources = RESOURCES.length > 0;

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

        <TouchableOpacity style={styles.headerIconButton} activeOpacity={0.7}>
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
              <Text style={styles.heroBadgeText}>{group.categoryShort}</Text>
            </View>

            <View style={styles.heroChipsRow}>
              <View style={styles.statusChip}>
                <View style={styles.statusDot} />
                <Text style={styles.statusChipText}>{group.status}</Text>
              </View>
              <View style={styles.typeChip}>
                <Text style={styles.typeChipText}>{group.groupType}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.heroTitle}>{group.name}</Text>
          <Text style={styles.heroSubtitle}>{group.subtitle}</Text>
          <Text style={styles.heroDescription}>{group.description}</Text>

          <View style={styles.heroMetaRow}>
            <View style={styles.heroMetaItem}>
              <Feather name="users" size={14} color={COLORS.textSecondary} />
              <Text style={styles.heroMetaText}>{group.members} members</Text>
            </View>
            <View style={styles.heroMetaItem}>
              <Ionicons name="star" size={14} color={COLORS.star} />
              <Text style={styles.heroMetaText}>{group.rating.toFixed(1)} rating</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.heroActionButton}
            activeOpacity={0.85}
            onPress={() => setIsJoined((prev) => !prev)}
          >
            <Text style={styles.heroActionButtonText}>
              {isJoined ? 'Open Group' : 'Join Group'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ---------------------------------------------------------- */}
        {/* GROUP STATS                                                 */}
        {/* ---------------------------------------------------------- */}
        <View style={styles.statsRow}>
          {STATS.map((stat) => (
            <View key={stat.id} style={styles.statCard}>
              <View style={styles.statIconWrap}>
                <Feather name={stat.icon} size={16} color={COLORS.primary} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* ---------------------------------------------------------- */}
        {/* UPCOMING SESSION                                            */}
        {/* ---------------------------------------------------------- */}
        <SectionHeader title="Upcoming Session" />
        {HAS_UPCOMING_SESSION ? (
          <View style={styles.stackedCards}>
            <View style={styles.sessionCard}>
              <Text style={styles.sessionTitle}>Data Structures Revision</Text>

              <View style={styles.sessionMetaRow}>
                <Feather name="calendar" size={13} color={COLORS.textSecondary} />
                <Text style={styles.sessionMetaText}>Today</Text>
              </View>
              <View style={styles.sessionMetaRow}>
                <Feather name="clock" size={13} color={COLORS.textSecondary} />
                <Text style={styles.sessionMetaText}>4:00 PM – 6:00 PM</Text>
              </View>
              <View style={styles.sessionMetaRow}>
                <Feather name="map-pin" size={13} color={COLORS.textSecondary} />
                <Text style={styles.sessionMetaText}>CCB, Room 203</Text>
              </View>

              <TouchableOpacity
                style={styles.viewOnMapButton}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('MainTabs', { screen: 'Map' })}
              >
                <Feather name="map" size={13} color={COLORS.white} />
                <Text style={styles.viewOnMapButtonText}>View on Map</Text>
              </TouchableOpacity>
            </View>
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

        {/* ---------------------------------------------------------- */}
        {/* RECENT DISCUSSIONS                                          */}
        {/* ---------------------------------------------------------- */}
        <SectionHeader title="Recent Discussions" onPressViewAll={() => {}} />
        {hasDiscussions ? (
          <View style={styles.listCard}>
            {DISCUSSIONS.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.discussionRow,
                  index !== DISCUSSIONS.length - 1 && styles.rowDivider,
                ]}
                activeOpacity={0.7}
              >
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitials}>{item.initials}</Text>
                </View>

                <View style={styles.discussionInfo}>
                  <Text style={styles.discussionQuestion} numberOfLines={2}>
                    {item.question}
                  </Text>
                  <Text style={styles.discussionMeta}>
                    Asked by {item.author} • {item.replies} replies • {item.time}
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

        {/* ---------------------------------------------------------- */}
        {/* SHARED RESOURCES                                            */}
        {/* ---------------------------------------------------------- */}
        <SectionHeader title="Shared Resources" onPressViewAll={() => {}} />
        {hasResources ? (
          <View style={styles.listCard}>
            {RESOURCES.map((item, index) => {
              const fileStyle = FILE_TYPE_STYLES[item.fileType];
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.resourceRow,
                    index !== RESOURCES.length - 1 && styles.rowDivider,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('ResourceDetails', { resource: toResourceData(item, group) })}
                >
                  <View style={[styles.fileBadge, { backgroundColor: fileStyle.bg }]}>
                    <Text style={[styles.fileBadgeText, { color: fileStyle.color }]}>
                      {item.fileType}
                    </Text>
                  </View>

                  <View style={styles.resourceInfo}>
                    <Text style={styles.resourceTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.resourceMeta}>
                      {item.fileType} • {item.size}
                    </Text>
                  </View>

                  <TouchableOpacity style={styles.resourceIconButton} activeOpacity={0.7}>
                    <Feather name="download" size={16} color={COLORS.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.resourceIconButton} activeOpacity={0.7}>
                    <Feather name="more-vertical" size={16} color={COLORS.textMuted} />
                  </TouchableOpacity>
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
        <SectionHeader title="Members" onPressViewAll={() => {}} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.membersScroll}
        >
          {MEMBERS.map((member) => {
            const roleStyle = ROLE_STYLES[member.role];
            return (
              <View key={member.id} style={styles.memberCard}>
                <View style={styles.memberAvatarCircle}>
                  <Text style={styles.memberAvatarInitials}>{member.initials}</Text>
                </View>
                <Text style={styles.memberName} numberOfLines={1}>
                  {member.name.split(' ')[0]}
                </Text>
                <View style={[styles.roleChip, { backgroundColor: roleStyle.bg }]}>
                  <Text style={[styles.roleChipText, { color: roleStyle.color }]}>
                    {member.role}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* ---------------------------------------------------------- */}
        {/* GROUP ACTIONS                                               */}
        {/* ---------------------------------------------------------- */}
        <SectionHeader title="Group Actions" />
        <View style={styles.actionsGrid}>
          {/* These 3 actions don't have dedicated screens yet — only
              CreateGroup, ResourceDetails, UploadResource, and EditProfile
              have been built so far. Wire these onPress handlers to real
              navigation once DiscussionThread, ScheduleSession, and
              InviteMember screens exist. */}
          <TouchableOpacity
            style={styles.primaryActionCard}
            activeOpacity={0.85}
            onPress={() => {
              // Placeholder — no DiscussionThread/CreateDiscussion screen yet.
            }}
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
            onPress={() => {
              // Placeholder — no ScheduleSession screen yet.
            }}
          >
            <View style={styles.secondaryActionIconWrap}>
              <Feather name="calendar" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.secondaryActionLabel}>Schedule Session</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryActionCard}
            activeOpacity={0.85}
            onPress={() => {
              // Placeholder — no InviteMember screen yet.
            }}
          >
            <View style={styles.secondaryActionIconWrap}>
              <Feather name="user-plus" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.secondaryActionLabel}>Invite Member</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom spacer so content isn't hidden behind the fixed bar */}
        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ------------------------------------------------------------ */}
      {/* FIXED BOTTOM ACTION BAR                                       */}
      {/* ------------------------------------------------------------ */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.bottomPrimaryButton}
          activeOpacity={0.85}
          onPress={() => setIsJoined((prev) => !prev)}
        >
          <Text style={styles.bottomPrimaryButtonText}>
            {isJoined ? 'Open Group' : 'Join Group'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomSaveButton}
          activeOpacity={0.85}
          onPress={() => setIsSaved((prev) => !prev)}
        >
          <Feather
            name="bookmark"
            size={20}
            color={isSaved ? COLORS.primary : COLORS.textMuted}
          />
        </TouchableOpacity>
      </View>
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
  heroChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
    marginRight: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
    marginRight: 5,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.success,
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
  viewOnMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 14,
  },
  viewOnMapButtonText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.white,
    marginLeft: 6,
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
  resourceIconButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
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

  // ---------------- FIXED BOTTOM BAR ----------------
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.card,
    paddingHorizontal: H_PADDING,
    paddingTop: 14,
    paddingBottom: 28,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#1B1F3B',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 10,
    gap: 12,
  },
  bottomPrimaryButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  bottomPrimaryButtonText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: COLORS.white,
  },
  bottomSaveButton: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: COLORS.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
