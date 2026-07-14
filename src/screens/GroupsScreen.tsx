/**
 * EduSphere — screens/GroupsScreen.tsx
 * -----------------------------------------------------------------------
 * Campus Study Group & Resource Finder — Groups Screen
 *
 * Note: the bottom nav bar is no longer rendered inside this screen.
 * It now lives once, globally, in navigation/CustomTabBar.tsx.
 * -----------------------------------------------------------------------
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SHADOW } from '../theme/colors';
import { Group, MainTabParamList, RootStackParamList } from '../navigation/types';

// Navigation from this screen needs to reach both its sibling tabs
// (unused here, but this is the standard shape) and screens in the root
// stack sitting above the tabs — GroupDetails lives in the root stack.
type GroupsScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Groups'>,
  NativeStackNavigationProp<RootStackParamList>
>;

// -----------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------
type FilterKey =
  | 'All'
  | 'My Groups'
  | 'Popular'
  | 'Computer Science'
  | 'Business'
  | 'Engineering'
  | 'Exam Prep'
  | 'New Groups';

interface MyGroup {
  id: string;
  code: string;
  title: string;
  courseName: string;
  members: number;
  statusLabel: string;
  statusType: 'new' | 'meeting' | 'resource';
  meetingLabel: string;
  category: FilterKey;
}

interface DiscoverGroup {
  id: string;
  code: string;
  title: string;
  description: string;
  members: number;
  rating: number;
  tag: string;
  category: FilterKey;
}

// -----------------------------------------------------------------------
// STATIC SAMPLE DATA
// -----------------------------------------------------------------------
const FILTERS: FilterKey[] = [
  'All',
  'My Groups',
  'Popular',
  'Computer Science',
  'Business',
  'Engineering',
  'Exam Prep',
  'New Groups',
];

const MY_GROUPS: MyGroup[] = [
  {
    id: 'mg1',
    code: 'CSM 351',
    title: 'Data Structures',
    courseName: 'CSM 351 — Data Structures',
    members: 24,
    statusLabel: 'New discussion today',
    statusType: 'new',
    meetingLabel: 'Next meeting: Today, 4:00 PM',
    category: 'Computer Science',
  },
  {
    id: 'mg2',
    code: 'MTH 263',
    title: 'Calculus II',
    courseName: 'MTH 263 — Calculus II',
    members: 18,
    statusLabel: '3 new resources',
    statusType: 'resource',
    meetingLabel: 'Next meeting: Tomorrow, 10:00 AM',
    category: 'Exam Prep',
  },
];

const DISCOVER_GROUPS: DiscoverGroup[] = [
  {
    id: 'dg1',
    code: 'CSM 461',
    title: 'Artificial Intelligence',
    description: 'Weekly deep-dives into ML models, past questions, and project collaboration.',
    members: 32,
    rating: 4.7,
    tag: 'Active discussions',
    category: 'Computer Science',
  },
  {
    id: 'dg2',
    code: 'ECN 262',
    title: 'Microeconomics',
    description: 'Focused revision sessions ahead of the mid-semester exam.',
    members: 28,
    rating: 4.6,
    tag: 'Exam prep',
    category: 'Business',
  },
  {
    id: 'dg3',
    code: 'CSM 357',
    title: 'Database Systems',
    description: 'Shared notes, SQL practice sets, and past question archives.',
    members: 41,
    rating: 4.8,
    tag: 'Resource sharing',
    category: 'Computer Science',
  },
];

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

/** Status chip used on "My Groups" cards — color varies by status type */
const StatusChip: React.FC<{ label: string; type: MyGroup['statusType'] }> = ({
  label,
  type,
}) => {
  const map = {
    new: { bg: COLORS.successLight, color: COLORS.success },
    meeting: { bg: COLORS.warningLight, color: COLORS.warning },
    resource: { bg: COLORS.primaryLight, color: COLORS.primary },
  };
  const style = map[type];
  return (
    <View style={[styles.statusChip, { backgroundColor: style.bg }]}>
      <View style={[styles.statusDot, { backgroundColor: style.color }]} />
      <Text style={[styles.statusChipText, { color: style.color }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
};

/** Small overlapping avatar stack representing group members (initials-based) */
const MemberAvatars: React.FC<{ count: number }> = ({ count }) => {
  const initials = ['NA', 'KO', 'AB'];
  return (
    <View style={styles.avatarStack}>
      {initials.map((label, index) => (
        <View
          key={label}
          style={[
            styles.avatarCircle,
            { marginLeft: index === 0 ? 0 : -10, zIndex: initials.length - index },
          ]}
        >
          <Text style={styles.avatarInitials}>{label}</Text>
        </View>
      ))}
      <View style={styles.avatarCountWrap}>
        <Text style={styles.avatarCountText}>+{Math.max(count - initials.length, 0)}</Text>
      </View>
    </View>
  );
};

/** Empty state shown when no groups match the current search / filter */
const EmptyState: React.FC<{ onCreateGroup: () => void }> = ({ onCreateGroup }) => (
  <View style={styles.emptyState}>
    <View style={styles.emptyIconWrap}>
      <Feather name="search" size={28} color={COLORS.primary} />
    </View>
    <Text style={styles.emptyTitle}>No groups found</Text>
    <Text style={styles.emptySubtitle}>
      Try searching for another course or create a new group.
    </Text>
    <TouchableOpacity style={styles.emptyCreateButton} onPress={onCreateGroup} activeOpacity={0.85}>
      <Feather name="plus" size={16} color={COLORS.white} />
      <Text style={styles.emptyCreateButtonText}>Create Group</Text>
    </TouchableOpacity>
  </View>
);

// -----------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------
const GroupsScreen: React.FC = () => {
  const navigation = useNavigation<GroupsScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('All');

  // Converts this screen's local card data into the shared Group shape
  // expected by GroupDetailsScreen's route params.
  const openMyGroup = (item: MyGroup) => {
    const group: Group = {
      id: item.id,
      categoryShort: item.code.split(' ')[0].slice(0, 2).toUpperCase(),
      code: item.code,
      name: item.courseName.includes('—') ? item.courseName : `${item.code} ${item.title}`,
      subtitle: item.title,
      description: `A study group for students taking ${item.code} — ${item.title}.`,
      members: item.members,
      rating: 4.8,
      status: 'Active',
      groupType: 'Public Group',
      isJoined: true,
    };
    navigation.navigate('GroupDetails', { group });
  };

  const openDiscoverGroup = (item: DiscoverGroup) => {
    const group: Group = {
      id: item.id,
      categoryShort: item.code.split(' ')[0].slice(0, 2).toUpperCase(),
      code: item.code,
      name: `${item.code} ${item.title}`,
      subtitle: item.title,
      description: item.description,
      members: item.members,
      rating: item.rating,
      status: 'Active',
      groupType: 'Public Group',
      isJoined: false,
    };
    navigation.navigate('GroupDetails', { group });
  };

  // Filters + search applied against both lists.
  const filteredMyGroups = useMemo(() => {
    return MY_GROUPS.filter((group) => {
      const matchesFilter =
        activeFilter === 'All' || activeFilter === 'My Groups' || group.category === activeFilter;
      const matchesSearch =
        searchQuery.trim().length === 0 ||
        group.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.code.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchQuery]);

  const filteredDiscoverGroups = useMemo(() => {
    return DISCOVER_GROUPS.filter((group) => {
      if (activeFilter === 'My Groups') return false; // discover list hidden under "My Groups" filter
      const matchesFilter = activeFilter === 'All' || group.category === activeFilter;
      const matchesSearch =
        searchQuery.trim().length === 0 ||
        group.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.code.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchQuery]);

  const hasNoResults = filteredMyGroups.length === 0 && filteredDiscoverGroups.length === 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ---------------------------------------------------------- */}
        {/* HEADER                                                      */}
        {/* ---------------------------------------------------------- */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <View>
              <Text style={styles.headerTitle}>Study Groups</Text>
              <Text style={styles.headerSubtitle}>Find groups that match your courses</Text>
            </View>

            <TouchableOpacity style={styles.filterIconButton} activeOpacity={0.7}>
              <Feather name="sliders" size={19} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ---------------------------------------------------------- */}
        {/* SEARCH BAR                                                  */}
        {/* ---------------------------------------------------------- */}
        <View style={styles.searchBarWrapper}>
          <Feather name="search" size={18} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search groups, courses, or topics..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name="x" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* ---------------------------------------------------------- */}
        {/* CATEGORY FILTER CHIPS                                       */}
        {/* ---------------------------------------------------------- */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                activeOpacity={0.8}
                onPress={() => setActiveFilter(filter)}
              >
                <Text
                  style={[styles.filterChipText, isActive && styles.filterChipTextActive]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ---------------------------------------------------------- */}
        {/* EMPTY STATE (shown only when nothing matches)               */}
        {/* ---------------------------------------------------------- */}
        {hasNoResults && (
          <EmptyState onCreateGroup={() => navigation.navigate('CreateGroup')} />
        )}

        {/* ---------------------------------------------------------- */}
        {/* MY GROUPS SECTION                                           */}
        {/* ---------------------------------------------------------- */}
        {filteredMyGroups.length > 0 && (
          <>
            <SectionHeader title="My Groups" onPressViewAll={() => {}} />
            <View style={styles.stackedCards}>
              {filteredMyGroups.map((group) => (
                <View key={group.id} style={styles.myGroupCard}>
                  <View style={styles.myGroupTopRow}>
                    <View style={styles.courseBadge}>
                      <Text style={styles.courseBadgeText}>{group.code}</Text>
                    </View>
                    <StatusChip label={group.statusLabel} type={group.statusType} />
                  </View>

                  <Text style={styles.myGroupTitle}>{group.title}</Text>
                  <Text style={styles.myGroupCourseName}>{group.courseName}</Text>

                  <View style={styles.myGroupMetaRow}>
                    <MemberAvatars count={group.members} />
                    <View style={styles.memberCountRow}>
                      <Feather name="users" size={13} color={COLORS.textSecondary} />
                      <Text style={styles.memberCountText}>{group.members} members</Text>
                    </View>
                  </View>

                  <View style={styles.myGroupFooterRow}>
                    <View style={styles.meetingRow}>
                      <Feather name="clock" size={13} color={COLORS.textSecondary} />
                      <Text style={styles.meetingText} numberOfLines={1}>
                        {group.meetingLabel}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.openButton}
                      activeOpacity={0.85}
                      onPress={() => openMyGroup(group)}
                    >
                      <Text style={styles.openButtonText}>Open</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ---------------------------------------------------------- */}
        {/* DISCOVER GROUPS SECTION                                     */}
        {/* ---------------------------------------------------------- */}
        {filteredDiscoverGroups.length > 0 && (
          <>
            <SectionHeader title="Discover Groups" />
            <View style={styles.stackedCards}>
              {filteredDiscoverGroups.map((group) => (
                <View key={group.id} style={styles.discoverCard}>
                  <View style={styles.discoverTopRow}>
                    <View style={styles.courseBadge}>
                      <Text style={styles.courseBadgeText}>{group.code}</Text>
                    </View>

                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={13} color={COLORS.star} />
                      <Text style={styles.ratingText}>{group.rating.toFixed(1)}</Text>
                    </View>
                  </View>

                  <Text style={styles.discoverTitle}>{group.title}</Text>
                  <Text style={styles.discoverDescription} numberOfLines={2}>
                    {group.description}
                  </Text>

                  <View style={styles.discoverFooterRow}>
                    <View style={styles.discoverFooterLeft}>
                      <View style={styles.memberCountRow}>
                        <Feather name="users" size={13} color={COLORS.textSecondary} />
                        <Text style={styles.memberCountText}>{group.members} members</Text>
                      </View>
                      <View style={styles.tagChip}>
                        <Text style={styles.tagChipText}>{group.tag}</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.joinButton}
                      activeOpacity={0.85}
                      onPress={() => openDiscoverGroup(group)}
                    >
                      <Text style={styles.joinButtonText}>Join</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ---------------------------------------------------------- */}
        {/* CREATE GROUP — large call-to-action card                    */}
        {/* ---------------------------------------------------------- */}
        <TouchableOpacity
          style={styles.createGroupCard}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('CreateGroup')}
        >
          <View style={styles.createGroupIconWrap}>
            <Feather name="plus" size={20} color={COLORS.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.createGroupTitle}>Create New Group</Text>
            <Text style={styles.createGroupSubtitle}>
              Start a study group for your course
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color={COLORS.white} />
        </TouchableOpacity>

        {/* Bottom spacer so content isn't hidden behind the tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ------------------------------------------------------------ */}
      {/* FLOATING ACTION BUTTON (alternative quick-create entry point) */}
      {/* ------------------------------------------------------------ */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('CreateGroup')}
      >
        <Feather name="plus" size={24} color={COLORS.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default GroupsScreen;

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
    paddingHorizontal: H_PADDING,
    paddingTop: 12,
    paddingBottom: 4,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  filterIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW,
  },

  // ---------------- SEARCH BAR ----------------
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    marginHorizontal: H_PADDING,
    marginTop: 16,
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
    fontSize: 14.5,
    color: COLORS.textPrimary,
  },

  // ---------------- FILTER CHIPS ----------------
  filterScroll: {
    paddingHorizontal: H_PADDING,
    paddingVertical: 18,
  },
  filterChip: {
    backgroundColor: COLORS.chipBg,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: COLORS.white,
  },

  // ---------------- SECTION HEADER ----------------
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: H_PADDING,
    marginTop: 8,
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

  // ---------------- SHARED BADGE / CHIP ----------------
  courseBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  courseBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.2,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
    maxWidth: 170,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // ---------------- MY GROUPS CARD ----------------
  myGroupCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: CARD_GAP,
    ...SHADOW,
  },
  myGroupTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  myGroupTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 12,
  },
  myGroupCourseName: {
    fontSize: 12.5,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  myGroupMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  memberCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberCountText: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  myGroupFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  meetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  meetingText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 6,
    flexShrink: 1,
  },
  openButton: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  openButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // ---------------- MEMBER AVATARS ----------------
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  avatarInitials: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.primary,
  },
  avatarCountWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -10,
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  avatarCountText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },

  // ---------------- DISCOVER GROUPS CARD ----------------
  discoverCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: CARD_GAP,
    ...SHADOW,
  },
  discoverTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warningLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  ratingText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.warning,
    marginLeft: 4,
  },
  discoverTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 12,
  },
  discoverDescription: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    marginTop: 6,
    lineHeight: 18,
  },
  discoverFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  discoverFooterLeft: {
    flex: 1,
    marginRight: 10,
  },
  tagChip: {
    backgroundColor: COLORS.primaryLight,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 8,
  },
  tagChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  joinButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  joinButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },

  // ---------------- CREATE GROUP CARD (CTA) ----------------
  createGroupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    marginHorizontal: H_PADDING,
    marginTop: 8,
    padding: 18,
    borderRadius: 18,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 5,
  },
  createGroupIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  createGroupTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
  createGroupSubtitle: {
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },

  // ---------------- FLOATING ACTION BUTTON ----------------
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 96,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },

  // ---------------- EMPTY STATE ----------------
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: H_PADDING,
    paddingVertical: 40,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 260,
  },
  emptyCreateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 12,
    marginTop: 18,
  },
  emptyCreateButtonText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.white,
    marginLeft: 8,
  },
});
