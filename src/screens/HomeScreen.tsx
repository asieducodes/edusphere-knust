/**
 * EduSphere — screens/HomeScreen.tsx
 * -----------------------------------------------------------------------
 * Campus Study Group & Resource Finder — Home Dashboard
 *
 * Note: the bottom nav bar is no longer rendered inside this screen.
 * It now lives once, globally, in navigation/CustomTabBar.tsx — every
 * screen just renders its own content and the tab bar sits on top.
 * -----------------------------------------------------------------------
 */

import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ThemeColors, SHADOW } from "../theme/colors";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import {
  MainTabParamList,
  RootStackParamList,
} from "../navigation/types";
import { useAuth } from "../context/AuthContext";
import { useTabBarHeight } from "../navigation/useTabBarHeight";
import { LoadingView, ErrorView } from "../components/common";
import { useMyGroups, useRecommendedGroups } from "../hooks/useGroups";
import { useResources } from "../hooks/useResources";
import { useUpcomingSessions } from "../hooks/useSessions";
import { useNotifications } from "../hooks/useNotifications";
import { Group } from "../types/group";
import { Resource } from "../types/resource";

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, "Home">,
  NativeStackNavigationProp<RootStackParamList>
>;

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const QUICK_ACTIONS: { id: string; labelKey: string; icon: keyof typeof Feather.glyphMap }[] = [
  { id: "1", labelKey: "home.findGroup", icon: "users" },
  { id: "2", labelKey: "home.createGroup", icon: "plus-circle" },
  { id: "3", labelKey: "home.resources", icon: "file-text" },
  { id: "4", labelKey: "home.campusMap", icon: "map-pin" },
];

// File-type visual mapping shared by the Recent Resources list.
const FILE_TYPE_STYLES: Record<Resource["fileType"], { bg: string; color: string }> = {
  PDF: { bg: "#FDEAEA", color: "#D93A3A" },
  DOCX: { bg: "#E7EEFD", color: "#2D3FE0" },
  PPTX: { bg: "#FEF0E2", color: "#E08A1F" },
  ZIP: { bg: "#F1F2F8", color: "#5B6172" },
};

function relativeTime(iso: string, t: (path: string, options?: Record<string, string | number>) => string): string {
  const then = new Date(iso).getTime();
  const diffMs = Date.now() - then;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return t('common.uploadedJustNow');
  if (minutes < 60) return t('common.uploadedMinutesAgo', { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t('common.uploadedHoursAgo', { count: hours });
  const days = Math.floor(hours / 24);
  return t('common.uploadedDaysAgo', { count: days });
}

function formatSessionDate(iso: string): { day: string; date: string } {
  const d = new Date(iso);
  const day = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const date = d.getDate().toString();
  return { day, date };
}

// -----------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------
const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { colors: COLORS, isDark } = useTheme();
  const { t } = useLanguage();
  const styles = React.useMemo(() => createStyles(COLORS), [COLORS]);
  const tabBarHeight = useTabBarHeight();

  // ---- Small reusable pieces, defined here so they close over this
  // render's styles/COLORS instead of needing them threaded as props. ----

  /** File-type badge with color coding by extension */
  const FileBadge: React.FC<{ type: Resource["fileType"] }> = ({ type }) => {
    const style = FILE_TYPE_STYLES[type];
    return (
      <View style={[styles.fileBadge, { backgroundColor: style.bg }]}>
        <Text style={[styles.fileBadgeText, { color: style.color }]}>{type}</Text>
      </View>
    );
  };

  /** Status chip used on "My Study Groups" cards */
  const StatusChip: React.FC<{ label: string; type: "new" | "meeting" }> = ({ label, type }) => {
    const isNew = type === "new";
    return (
      <View
        style={[
          styles.statusChip,
          { backgroundColor: isNew ? COLORS.successLight : COLORS.warningLight },
        ]}
      >
        <View
          style={[
            styles.statusDot,
            { backgroundColor: isNew ? COLORS.success : COLORS.warning },
          ]}
        />
        <Text
          style={[
            styles.statusChipText,
            { color: isNew ? COLORS.success : COLORS.warning },
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
    );
  };

  /** Section header with title + optional "View all" action */
  const SectionHeader: React.FC<{
    title: string;
    onPressViewAll?: () => void;
  }> = ({ title, onPressViewAll }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onPressViewAll && (
        <TouchableOpacity
          onPress={onPressViewAll}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.viewAllText}>{t('common.seeAll')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const { user } = useAuth();

  const groupsQuery = useMyGroups();
  const recommendedQuery = useRecommendedGroups();
  const resourcesQuery = useResources({ limit: 3 });
  const sessionsQuery = useUpcomingSessions();
  const notificationsQuery = useNotifications();

  // isLoading is only true on a genuine first load (no cached data yet) —
  // a background refetch on revisit sets isFetching instead, leaving
  // `data` (and therefore the UI) untouched until the new data arrives.
  // That's what kills the "reload spinner on every screen visit" feeling.
  const isLoading =
    groupsQuery.isLoading || recommendedQuery.isLoading || resourcesQuery.isLoading || sessionsQuery.isLoading;
  const hasNoData =
    !groupsQuery.data && !recommendedQuery.data && !resourcesQuery.data && !sessionsQuery.data;
  const hasError =
    hasNoData &&
    (groupsQuery.isError || recommendedQuery.isError || resourcesQuery.isError || sessionsQuery.isError);

  const refetchAll = useCallback(() => {
    groupsQuery.refetch();
    recommendedQuery.refetch();
    resourcesQuery.refetch();
    sessionsQuery.refetch();
    notificationsQuery.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Screens inside a bottom-tab navigator stay mounted when you switch
  // tabs, so without this, revisiting Home after 30s+ elsewhere would show
  // increasingly stale data until the app fully remounts. refetch() keeps
  // showing the cached data while it quietly re-fetches, so this doesn't
  // reintroduce a loading flash.
  useFocusEffect(refetchAll);

  const myGroups: Group[] = groupsQuery.data?.items ?? [];
  const recommended: Group[] = recommendedQuery.data?.items ?? [];
  const resources: Resource[] = resourcesQuery.data?.items ?? [];
  const sessions = sessionsQuery.data?.items ?? [];
  const hasUnreadNotifications = notificationsQuery.data?.items.some((n) => !n.isRead) ?? false;

  const openGroup = (item: Group) => {
    navigation.navigate("GroupDetails", { groupId: item.id });
  };

  const handleQuickAction = (id: string) => {
    switch (id) {
      case "1":
        navigation.navigate("Groups");
        break;
      case "2":
        navigation.navigate("CreateGroup");
        break;
      case "3":
        navigation.navigate("Resources");
        break;
      case "4":
        navigation.navigate("Map");
        break;
    }
  };

  const firstName = user?.fullName?.split(' ')[0] ?? 'there';

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={COLORS.background} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ---------------------------------------------------------- */}
        {/* TOP HEADER                                                  */}
        {/* ---------------------------------------------------------- */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <View style={styles.brandRow}>
              <View style={styles.logoBox}>
                <Feather name="book-open" size={18} color={COLORS.white} />
              </View>
              <Text style={styles.brandText}>EduSphere</Text>
            </View>

            <TouchableOpacity
              style={styles.iconButton}
              activeOpacity={0.7}
              onPress={() => navigation.navigate("Notifications")}
            >
              <Feather name="bell" size={22} color={COLORS.textPrimary} />
              {hasUnreadNotifications ? <View style={styles.notificationDot} /> : null}
            </TouchableOpacity>
          </View>

          <View style={styles.greetingRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.avatarWrapper}
              onPress={() => navigation.navigate("Profile")}
            >
              {user?.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Feather name="user" size={18} color={COLORS.primary} />
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.greetingBlock}>
              <Text style={styles.greetingText}>{t('home.greeting', { name: firstName })}</Text>
              <Text style={styles.greetingSubtitle}>
                {t('home.subtitle')}
              </Text>
            </View>
          </View>
        </View>

        {/* ---------------------------------------------------------- */}
        {/* SEARCH BAR                                                  */}
        {/* ---------------------------------------------------------- */}
        <TouchableOpacity
          style={styles.searchBarWrapper}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("Search")}
        >
          <Feather name="search" size={18} color={COLORS.textMuted} />
          <Text style={styles.searchPlaceholderText}>{t('common.searchPlaceholder')}</Text>
        </TouchableOpacity>

        {/* ---------------------------------------------------------- */}
        {/* QUICK ACTION CARDS (2x2 grid)                               */}
        {/* ---------------------------------------------------------- */}
        <View style={styles.quickActionsGrid}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickActionCard}
              activeOpacity={0.8}
              onPress={() => handleQuickAction(action.id)}
            >
              <View style={styles.quickActionIconWrap}>
                <Feather name={action.icon} size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.quickActionLabel}>{t(action.labelKey)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading && <LoadingView message={t('home.loadingDashboard')} />}
        {hasError && <ErrorView onRetry={refetchAll} />}

        {!isLoading && !hasError && (
          <>
            {/* ---------------------------------------------------------- */}
            {/* MY STUDY GROUPS                                             */}
            {/* ---------------------------------------------------------- */}
            {myGroups.length > 0 && (
              <>
                <SectionHeader title={t('home.myStudyGroups')} onPressViewAll={() => navigation.navigate("Groups")} />

                <View style={styles.stackedCards}>
                  {myGroups.map((group) => {
                    const hasMeeting = !!(group.meetingDay && group.meetingTime);
                    const statusLabel = hasMeeting
                      ? `${group.meetingDay} • ${group.meetingTime}`
                      : t('common.members', { count: group.membersCount });
                    return (
                      <TouchableOpacity
                        key={group.id}
                        style={styles.groupCard}
                        activeOpacity={0.8}
                        onPress={() => openGroup(group)}
                      >
                        <View style={styles.groupCardTop}>
                          <View style={styles.courseBadge}>
                            <Text style={styles.courseBadgeText}>{group.courseCode}</Text>
                          </View>
                          <StatusChip label={statusLabel} type={hasMeeting ? "meeting" : "new"} />
                        </View>

                        <Text style={styles.groupTitle}>{group.name}</Text>

                        <View style={styles.groupMetaRow}>
                          <Feather name="users" size={14} color={COLORS.textSecondary} />
                          <Text style={styles.groupMetaText}>
                            {t('common.members', { count: group.membersCount })}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}

            {/* ---------------------------------------------------------- */}
            {/* UPCOMING SESSIONS                                           */}
            {/* ---------------------------------------------------------- */}
            {sessions.length > 0 && (
              <>
                <SectionHeader title={t('home.upcomingSessions')} />

                <View style={styles.stackedCards}>
                  {sessions.map((session) => {
                    const { day, date } = formatSessionDate(session.date);
                    return (
                      <View key={session.id} style={styles.sessionCard}>
                        <View style={styles.dateBlock}>
                          <Text style={styles.dateBlockDay}>{day}</Text>
                          <Text style={styles.dateBlockDate}>{date}</Text>
                        </View>

                        <View style={styles.sessionInfo}>
                          <Text style={styles.sessionTitle}>{session.title}</Text>

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
                        </View>

                        <View style={styles.calendarIconWrap}>
                          <Feather name="calendar" size={18} color={COLORS.primary} />
                        </View>
                      </View>
                    );
                  })}
                </View>
              </>
            )}

            {/* ---------------------------------------------------------- */}
            {/* RECOMMENDED GROUPS                                          */}
            {/* ---------------------------------------------------------- */}
            {recommended.length > 0 && (
              <>
                <SectionHeader title={t('home.recommendedGroups')} />

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.recommendedScroll}
                >
                  {recommended.map((group) => (
                    <View key={group.id} style={styles.recommendedCard}>
                      <View style={styles.courseBadge}>
                        <Text style={styles.courseBadgeText}>{group.courseCode}</Text>
                      </View>

                      <Text style={styles.recommendedTitle} numberOfLines={2}>
                        {group.name}
                      </Text>

                      <View style={styles.groupMetaRow}>
                        <Feather name="users" size={13} color={COLORS.textSecondary} />
                        <Text style={styles.groupMetaText}>
                          {t('common.members', { count: group.membersCount })}
                        </Text>
                      </View>

                      {group.rating ? (
                        <View style={styles.groupMetaRow}>
                          <Ionicons name="star" size={13} color={COLORS.star} />
                          <Text style={styles.groupMetaText}>
                            {t('home.rating', { value: group.rating.toFixed(1) })}
                          </Text>
                        </View>
                      ) : null}

                      {group.tags[0] ? (
                        <View style={styles.tagChip}>
                          <Text style={styles.tagChipText}>{group.tags[0]}</Text>
                        </View>
                      ) : null}

                      <TouchableOpacity
                        style={styles.joinButton}
                        activeOpacity={0.85}
                        onPress={() => openGroup(group)}
                      >
                        <Text style={styles.joinButtonText}>{t('common.view')}</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </>
            )}

            {/* ---------------------------------------------------------- */}
            {/* RECENT RESOURCES                                            */}
            {/* ---------------------------------------------------------- */}
            {resources.length > 0 && (
              <>
                <SectionHeader title={t('home.recentResources')} onPressViewAll={() => navigation.navigate("Resources")} />

                <View style={styles.resourcesCard}>
                  {resources.map((resource, index) => (
                    <TouchableOpacity
                      key={resource.id}
                      style={[
                        styles.resourceRow,
                        index !== resources.length - 1 && styles.resourceRowDivider,
                      ]}
                      activeOpacity={0.7}
                      onPress={() => navigation.navigate("ResourceDetails", { resourceId: resource.id })}
                    >
                      <FileBadge type={resource.fileType} />

                      <View style={styles.resourceInfo}>
                        <Text style={styles.resourceTitle} numberOfLines={1}>
                          {resource.title}
                        </Text>
                        <Text style={styles.resourceMeta}>
                          {resource.fileType} • {resource.size} • {relativeTime(resource.createdAt, t)}
                        </Text>
                      </View>

                      <Feather name="chevron-right" size={17} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </>
        )}

        {/* Bottom spacer so content isn't hidden behind the tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

// -----------------------------------------------------------------------
// STYLES
// -----------------------------------------------------------------------
const CARD_GAP = 14;
const H_PADDING = 20;

function createStyles(COLORS: ThemeColors) {
  return StyleSheet.create({
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
    paddingBottom: 8,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  brandText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOW,
  },
  notificationDot: {
    position: "absolute",
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.danger,
    borderWidth: 1.5,
    borderColor: COLORS.card,
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
  },
  avatarWrapper: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  greetingBlock: {
    marginLeft: 12,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  greetingSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 3,
  },

  // ---------------- SEARCH BAR ----------------
  searchBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    marginHorizontal: H_PADDING,
    marginTop: 18,
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 16,
    ...SHADOW,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14.5,
    color: COLORS.textPrimary,
  },
  searchPlaceholderText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14.5,
    color: COLORS.textMuted,
  },

  // ---------------- QUICK ACTIONS ----------------
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: H_PADDING,
    marginTop: 20,
  },
  quickActionCard: {
    width: (SCREEN_WIDTH - H_PADDING * 2 - CARD_GAP) / 2,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: CARD_GAP,
    ...SHADOW,
  },
  quickActionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  quickActionLabel: {
    fontSize: 13.5,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },

  // ---------------- SECTION HEADER ----------------
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: H_PADDING,
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16.5,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.primary,
  },

  // ---------------- SHARED CARD CONTAINERS ----------------
  stackedCards: {
    paddingHorizontal: H_PADDING,
  },

  // ---------------- MY STUDY GROUPS ----------------
  groupCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: CARD_GAP,
    ...SHADOW,
  },
  groupCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  courseBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  courseBadgeText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: COLORS.primary,
    letterSpacing: 0.2,
  },
  groupTitle: {
    fontSize: 15.5,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginTop: 12,
  },
  groupMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  groupMetaText: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
    maxWidth: 160,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: "600",
  },

  // ---------------- SESSIONS ----------------
  sessionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 14,
    marginBottom: CARD_GAP,
    ...SHADOW,
  },
  dateBlock: {
    width: 52,
    height: 56,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  dateBlockDay: {
    fontSize: 10.5,
    fontWeight: "700",
    color: COLORS.primarySoft,
    letterSpacing: 0.5,
  },
  dateBlockDate: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.white,
    marginTop: 1,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  sessionMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  sessionMetaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  calendarIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  // ---------------- RECOMMENDED GROUPS ----------------
  recommendedScroll: {
    paddingHorizontal: H_PADDING,
    paddingBottom: 4,
  },
  recommendedCard: {
    width: SCREEN_WIDTH * 0.62,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    marginRight: CARD_GAP,
    ...SHADOW,
  },
  recommendedTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginTop: 12,
    marginBottom: 6,
    minHeight: 38,
  },
  tagChip: {
    backgroundColor: COLORS.primaryLight,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 10,
  },
  tagChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.primary,
  },
  joinButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 14,
  },
  joinButtonText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: COLORS.white,
  },

  // ---------------- RECENT RESOURCES ----------------
  resourcesCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    marginHorizontal: H_PADDING,
    paddingHorizontal: 14,
    ...SHADOW,
  },
  resourceRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  resourceRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  fileBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 12,
  },
  fileBadgeText: {
    fontSize: 10.5,
    fontWeight: "700",
  },
  resourceInfo: {
    flex: 1,
    marginRight: 8,
  },
  resourceTitle: {
    fontSize: 13.5,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  resourceMeta: {
    fontSize: 11.5,
    color: COLORS.textMuted,
  },
  resourceIconButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  });
}
