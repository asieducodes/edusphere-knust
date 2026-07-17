/**
 * EduSphere — screens/GroupsScreen.tsx
 * -----------------------------------------------------------------------
 * Campus Study Group & Resource Finder — Groups Screen
 *
 * Note: the bottom nav bar is no longer rendered inside this screen.
 * It now lives once, globally, in navigation/CustomTabBar.tsx.
 * -----------------------------------------------------------------------
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SHADOW } from '../theme/colors';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { LoadingView, ErrorView } from '../components/common';
import { useMyGroups, useDiscoverGroups, useJoinGroup } from '../hooks/useGroups';
import { Group } from '../types/group';

// Navigation from this screen needs to reach both its sibling tabs
// (unused here, but this is the standard shape) and screens in the root
// stack sitting above the tabs — GroupDetails lives in the root stack.
type GroupsScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Groups'>,
  NativeStackNavigationProp<RootStackParamList>
>;

// -----------------------------------------------------------------------
// FILTERS — 'My Groups' shows only groups you've joined; the rest match
// against a group's tags (same options CreateGroupScreen lets you pick
// from when creating a group).
// -----------------------------------------------------------------------
type FilterKey = 'All' | 'My Groups' | 'Exam Prep' | 'Assignment Help' | 'Discussion' | 'Resource Sharing' | 'Tutorial' | 'Revision' | 'Project Work';

const FILTERS: FilterKey[] = [
  'All',
  'My Groups',
  'Exam Prep',
  'Assignment Help',
  'Discussion',
  'Resource Sharing',
  'Tutorial',
  'Revision',
  'Project Work',
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
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('All');

  // Debounce search input so we don't fire a request on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const myGroupsQuery = useMyGroups();
  const discoverQuery = useDiscoverGroups(
    { search: debouncedSearch || undefined, category: activeFilter !== 'All' && activeFilter !== 'My Groups' ? activeFilter : undefined },
    activeFilter !== 'My Groups'
  );
  const joinGroupMutation = useJoinGroup();

  useFocusEffect(
    useCallback(() => {
      myGroupsQuery.refetch();
      if (activeFilter !== 'My Groups') discoverQuery.refetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeFilter])
  );

  // getMyGroups has no search param server-side — filter client-side
  // instead (a student's own group count is small).
  let myGroups: Group[] = myGroupsQuery.data?.items ?? [];
  if (debouncedSearch) {
    const q = debouncedSearch.toLowerCase();
    myGroups = myGroups.filter((g) => g.name.toLowerCase().includes(q) || g.courseCode.toLowerCase().includes(q));
  }
  if (activeFilter !== 'All' && activeFilter !== 'My Groups') {
    myGroups = myGroups.filter((g) => g.tags.includes(activeFilter));
  }

  const discoverGroups: Group[] = activeFilter === 'My Groups' ? [] : discoverQuery.data?.items ?? [];

  const isLoading = myGroupsQuery.isLoading || (activeFilter !== 'My Groups' && discoverQuery.isLoading);
  const hasNoData = !myGroupsQuery.data && !discoverQuery.data;
  const hasError = hasNoData && (myGroupsQuery.isError || discoverQuery.isError);

  const refetchAll = () => {
    myGroupsQuery.refetch();
    discoverQuery.refetch();
  };

  const openGroup = (group: Group) => {
    navigation.navigate('GroupDetails', { groupId: group.id });
  };

  const handleQuickJoin = (group: Group) => {
    joinGroupMutation.mutate(group.id, {
      onSuccess: () => navigation.navigate('GroupDetails', { groupId: group.id }),
      onError: (err) => {
        const message = (err as { message?: string })?.message ?? 'Something went wrong. Please try again.';
        Alert.alert('Error', message);
      },
    });
  };

  const hasNoResults = !isLoading && !hasError && myGroups.length === 0 && discoverGroups.length === 0;

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

            <TouchableOpacity
              style={styles.filterIconButton}
              activeOpacity={0.7}
              onPress={() => Alert.alert('Filters', "Advanced filters aren't available yet — use the category chips below.")}
            >
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

        {isLoading && <LoadingView message="Loading groups..." />}
        {hasError && <ErrorView message="Couldn't load groups." onRetry={refetchAll} />}

        {/* ---------------------------------------------------------- */}
        {/* EMPTY STATE (shown only when nothing matches)               */}
        {/* ---------------------------------------------------------- */}
        {hasNoResults && (
          <EmptyState onCreateGroup={() => navigation.navigate('CreateGroup')} />
        )}

        {/* ---------------------------------------------------------- */}
        {/* MY GROUPS SECTION                                           */}
        {/* ---------------------------------------------------------- */}
        {!isLoading && !hasError && myGroups.length > 0 && (
          <>
            <SectionHeader title="My Groups" onPressViewAll={() => setActiveFilter('My Groups')} />
            <View style={styles.stackedCards}>
              {myGroups.map((group) => (
                <View key={group.id} style={styles.myGroupCard}>
                  <View style={styles.myGroupTopRow}>
                    <View style={styles.courseBadge}>
                      <Text style={styles.courseBadgeText}>{group.courseCode}</Text>
                    </View>
                    <View style={styles.roleChip}>
                      <Text style={styles.roleChipText}>{group.groupType}</Text>
                    </View>
                  </View>

                  <Text style={styles.myGroupTitle}>{group.name}</Text>
                  <Text style={styles.myGroupCourseName}>{group.courseTitle}</Text>

                  <View style={styles.myGroupMetaRow}>
                    <View style={styles.memberCountRow}>
                      <Feather name="users" size={13} color={COLORS.textSecondary} />
                      <Text style={styles.memberCountText}>{group.membersCount} members</Text>
                    </View>
                    {group.rating !== undefined ? (
                      <View style={styles.memberCountRow}>
                        <Ionicons name="star" size={13} color={COLORS.star} />
                        <Text style={styles.memberCountText}>{group.rating.toFixed(1)}</Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.myGroupFooterRow}>
                    <View style={styles.meetingRow}>
                      <Feather name="clock" size={13} color={COLORS.textSecondary} />
                      <Text style={styles.meetingText} numberOfLines={1}>
                        {group.meetingDay && group.meetingTime
                          ? `${group.meetingDay}, ${group.meetingTime}`
                          : 'No meeting scheduled'}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.openButton}
                      activeOpacity={0.85}
                      onPress={() => openGroup(group)}
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
        {!isLoading && !hasError && discoverGroups.length > 0 && (
          <>
            <SectionHeader title="Discover Groups" />
            <View style={styles.stackedCards}>
              {discoverGroups.map((group) => (
                <TouchableOpacity
                  key={group.id}
                  style={styles.discoverCard}
                  activeOpacity={0.85}
                  onPress={() => openGroup(group)}
                >
                  <View style={styles.discoverTopRow}>
                    <View style={styles.courseBadge}>
                      <Text style={styles.courseBadgeText}>{group.courseCode}</Text>
                    </View>

                    <View style={styles.discoverTopRowRight}>
                      {group.isJoined ? (
                        <View style={styles.joinedBadge}>
                          <Feather name="check" size={11} color={COLORS.success} />
                          <Text style={styles.joinedBadgeText}>Joined</Text>
                        </View>
                      ) : null}
                      {group.rating !== undefined ? (
                        <View style={styles.ratingRow}>
                          <Ionicons name="star" size={13} color={COLORS.star} />
                          <Text style={styles.ratingText}>{group.rating.toFixed(1)}</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>

                  <Text style={styles.discoverTitle}>{group.name}</Text>
                  <Text style={styles.discoverDescription} numberOfLines={2}>
                    {group.description}
                  </Text>

                  <View style={styles.discoverFooterRow}>
                    <View style={styles.discoverFooterLeft}>
                      <View style={styles.memberCountRow}>
                        <Feather name="users" size={13} color={COLORS.textSecondary} />
                        <Text style={styles.memberCountText}>{group.membersCount} members</Text>
                      </View>
                      {group.tags[0] ? (
                        <View style={styles.tagChip}>
                          <Text style={styles.tagChipText}>{group.tags[0]}</Text>
                        </View>
                      ) : null}
                    </View>

                    <TouchableOpacity
                      style={styles.joinButton}
                      activeOpacity={0.85}
                      onPress={() => (group.isJoined ? openGroup(group) : handleQuickJoin(group))}
                    >
                      <Text style={styles.joinButtonText}>
                        {group.isJoined ? 'Open' : group.groupType === 'Private' ? 'View' : 'Join'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
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
  roleChip: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: COLORS.chipBg,
  },
  roleChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
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
    marginTop: 14,
    gap: 16,
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
  discoverTopRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  joinedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  joinedBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.success,
    marginLeft: 3,
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
