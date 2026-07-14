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

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StatusBar,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { COLORS, SHADOW } from "../theme/colors";
import {
  Group,
  MainTabParamList,
  RootStackParamList,
} from "../navigation/types";

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, "Home">,
  NativeStackNavigationProp<RootStackParamList>
>;

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// -----------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------
interface StudyGroup {
  id: string;
  code: string;
  title: string;
  members: number;
  status: string;
  statusType: "new" | "meeting";
}

interface Session {
  id: string;
  title: string;
  day: string;
  date: string;
  time: string;
  location: string;
}

interface RecommendedGroup {
  id: string;
  code: string;
  title: string;
  members: number;
  rating: number;
  tag: string;
}

interface Resource {
  id: string;
  title: string;
  fileType: "PDF" | "DOCX" | "PPTX";
  size: string;
  uploaded: string;
}

interface QuickAction {
  id: string;
  label: string;
  icon: keyof typeof Feather.glyphMap;
}

// -----------------------------------------------------------------------
// STATIC SAMPLE DATA
// -----------------------------------------------------------------------
const QUICK_ACTIONS: QuickAction[] = [
  { id: "1", label: "Find Group", icon: "users" },
  { id: "2", label: "Create Group", icon: "plus-circle" },
  { id: "3", label: "Resources", icon: "file-text" },
  { id: "4", label: "Campus Map", icon: "map-pin" },
];

const MY_GROUPS: StudyGroup[] = [
  {
    id: "g1",
    code: "CSM 351",
    title: "Data Structures",
    members: 24,
    status: "New discussion today",
    statusType: "new",
  },
  {
    id: "g2",
    code: "MTH 263",
    title: "Calculus II",
    members: 18,
    status: "Next meeting 4:00 PM",
    statusType: "meeting",
  },
];

const SESSIONS: Session[] = [
  {
    id: "s1",
    title: "CSM 351 Study Session",
    day: "FRI",
    date: "May 23",
    time: "4:00 PM – 6:00 PM",
    location: "CCB, Room 203",
  },
  {
    id: "s2",
    title: "MTH 263 Tutorial",
    day: "SAT",
    date: "May 24",
    time: "10:00 AM – 12:00 PM",
    location: "KSB, Room B105",
  },
];

const RECOMMENDED: RecommendedGroup[] = [
  {
    id: "r1",
    code: "CSM 461",
    title: "Artificial Intelligence",
    members: 32,
    rating: 4.7,
    tag: "Active discussions",
  },
  {
    id: "r2",
    code: "ECN 262",
    title: "Microeconomics",
    members: 28,
    rating: 4.6,
    tag: "Exam prep",
  },
];

const RESOURCES: Resource[] = [
  {
    id: "f1",
    title: "Past Questions - CSM 357",
    fileType: "PDF",
    size: "2.4 MB",
    uploaded: "Uploaded 2h ago",
  },
  {
    id: "f2",
    title: "Lecture Notes - MTH 263",
    fileType: "DOCX",
    size: "1.6 MB",
    uploaded: "Uploaded 1d ago",
  },
  {
    id: "f3",
    title: "Data Structures - Slide Deck",
    fileType: "PPTX",
    size: "3.1 MB",
    uploaded: "Uploaded 2d ago",
  },
];

// -----------------------------------------------------------------------
// SMALL REUSABLE COMPONENTS
// -----------------------------------------------------------------------

/** File-type badge with color coding by extension */
const FileBadge: React.FC<{ type: Resource["fileType"] }> = ({ type }) => {
  const map: Record<Resource["fileType"], { bg: string; color: string }> = {
    PDF: { bg: "#FDEAEA", color: "#D93A3A" },
    DOCX: { bg: "#E7EEFD", color: "#2D3FE0" },
    PPTX: { bg: "#FEF0E2", color: "#E08A1F" },
  };
  const style = map[type];
  return (
    <View style={[styles.fileBadge, { backgroundColor: style.bg }]}>
      <Text style={[styles.fileBadgeText, { color: style.color }]}>{type}</Text>
    </View>
  );
};

/** Status chip used on "My Study Groups" cards */
const StatusChip: React.FC<{ label: string; type: "new" | "meeting" }> = ({
  label,
  type,
}) => {
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
        <Text style={styles.viewAllText}>View all</Text>
      </TouchableOpacity>
    )}
  </View>
);

// -----------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------
const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState("");

  // Converts a "My Study Groups" card into the shared Group shape
  // expected by GroupDetailsScreen's route params.
  const openGroup = (item: StudyGroup) => {
    const group: Group = {
      id: item.id,
      categoryShort: item.code.split(" ")[0].slice(0, 2).toUpperCase(),
      code: item.code,
      name: `${item.code} ${item.title}`,
      subtitle: item.title,
      description: `A study group for students taking ${item.code} — ${item.title}.`,
      members: item.members,
      rating: 4.8,
      status: "Active",
      groupType: "Public Group",
      isJoined: true,
    };
    navigation.navigate("GroupDetails", { group });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
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

            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <Feather name="bell" size={22} color={COLORS.textPrimary} />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>

          <View style={styles.greetingRow}>
            <TouchableOpacity activeOpacity={0.8} style={styles.avatarWrapper}>
              <Image
                source={{ uri: "https://i.pravatar.cc/100?img=12" }}
                style={styles.avatar}
              />
            </TouchableOpacity>

            <View style={styles.greetingBlock}>
              <Text style={styles.greetingText}>Hi, Nii 👋</Text>
              <Text style={styles.greetingSubtitle}>
                Find your next study session
              </Text>
            </View>
          </View>
        </View>

        {/* ---------------------------------------------------------- */}
        {/* SEARCH BAR                                                  */}
        {/* ---------------------------------------------------------- */}
        <View style={styles.searchBarWrapper}>
          <Feather name="search" size={18} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search courses, groups, notes..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
        </View>

        {/* ---------------------------------------------------------- */}
        {/* QUICK ACTION CARDS (2x2 grid)                               */}
        {/* ---------------------------------------------------------- */}
        <View style={styles.quickActionsGrid}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickActionCard}
              activeOpacity={0.8}
            >
              <View style={styles.quickActionIconWrap}>
                <Feather name={action.icon} size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ---------------------------------------------------------- */}
        {/* MY STUDY GROUPS                                             */}
        {/* ---------------------------------------------------------- */}
        <SectionHeader title="My Study Groups" onPressViewAll={() => {}} />

        <View style={styles.stackedCards}>
          {MY_GROUPS.map((group) => (
            <TouchableOpacity
              key={group.id}
              style={styles.groupCard}
              activeOpacity={0.8}
              onPress={() => openGroup(group)}
            >
              <View style={styles.groupCardTop}>
                <View style={styles.courseBadge}>
                  <Text style={styles.courseBadgeText}>{group.code}</Text>
                </View>
                <StatusChip label={group.status} type={group.statusType} />
              </View>

              <Text style={styles.groupTitle}>{group.title}</Text>

              <View style={styles.groupMetaRow}>
                <Feather name="users" size={14} color={COLORS.textSecondary} />
                <Text style={styles.groupMetaText}>
                  {group.members} members
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ---------------------------------------------------------- */}
        {/* UPCOMING SESSIONS                                           */}
        {/* ---------------------------------------------------------- */}
        <SectionHeader title="Upcoming Sessions" />

        <View style={styles.stackedCards}>
          {SESSIONS.map((session) => (
            <View key={session.id} style={styles.sessionCard}>
              <View style={styles.dateBlock}>
                <Text style={styles.dateBlockDay}>{session.day}</Text>
                <Text style={styles.dateBlockDate}>
                  {session.date.split(" ")[1]}
                </Text>
              </View>

              <View style={styles.sessionInfo}>
                <Text style={styles.sessionTitle}>{session.title}</Text>

                <View style={styles.sessionMetaRow}>
                  <Feather
                    name="clock"
                    size={13}
                    color={COLORS.textSecondary}
                  />
                  <Text style={styles.sessionMetaText}>{session.time}</Text>
                </View>

                <View style={styles.sessionMetaRow}>
                  <Feather
                    name="map-pin"
                    size={13}
                    color={COLORS.textSecondary}
                  />
                  <Text style={styles.sessionMetaText}>{session.location}</Text>
                </View>
              </View>

              <View style={styles.calendarIconWrap}>
                <Feather name="calendar" size={18} color={COLORS.primary} />
              </View>
            </View>
          ))}
        </View>

        {/* ---------------------------------------------------------- */}
        {/* RECOMMENDED GROUPS                                          */}
        {/* ---------------------------------------------------------- */}
        <SectionHeader title="Recommended Groups" />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recommendedScroll}
        >
          {RECOMMENDED.map((group) => (
            <View key={group.id} style={styles.recommendedCard}>
              <View style={styles.courseBadge}>
                <Text style={styles.courseBadgeText}>{group.code}</Text>
              </View>

              <Text style={styles.recommendedTitle} numberOfLines={2}>
                {group.title}
              </Text>

              <View style={styles.groupMetaRow}>
                <Feather name="users" size={13} color={COLORS.textSecondary} />
                <Text style={styles.groupMetaText}>
                  {group.members} members
                </Text>
              </View>

              <View style={styles.groupMetaRow}>
                <Ionicons name="star" size={13} color={COLORS.star} />
                <Text style={styles.groupMetaText}>
                  {group.rating.toFixed(1)} rating
                </Text>
              </View>

              <View style={styles.tagChip}>
                <Text style={styles.tagChipText}>{group.tag}</Text>
              </View>

              <TouchableOpacity style={styles.joinButton} activeOpacity={0.85}>
                <Text style={styles.joinButtonText}>Join</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        {/* ---------------------------------------------------------- */}
        {/* RECENT RESOURCES                                            */}
        {/* ---------------------------------------------------------- */}
        <SectionHeader title="Recent Resources" onPressViewAll={() => {}} />

        <View style={styles.resourcesCard}>
          {RESOURCES.map((resource, index) => (
            <View
              key={resource.id}
              style={[
                styles.resourceRow,
                index !== RESOURCES.length - 1 && styles.resourceRowDivider,
              ]}
            >
              <FileBadge type={resource.fileType} />

              <View style={styles.resourceInfo}>
                <Text style={styles.resourceTitle} numberOfLines={1}>
                  {resource.title}
                </Text>
                <Text style={styles.resourceMeta}>
                  {resource.fileType} • {resource.size} • {resource.uploaded}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.resourceIconButton}
                activeOpacity={0.7}
              >
                <Feather name="download" size={17} color={COLORS.primary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resourceIconButton}
                activeOpacity={0.7}
              >
                <Feather
                  name="more-vertical"
                  size={17}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>

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
