/**
 * EduSphere — screens/ProfileScreen.tsx
 * -----------------------------------------------------------------------
 * Campus Study Group & Resource Finder — Profile Screen
 *
 * Follows the same design system as HomeScreen.tsx / GroupsScreen.tsx /
 * ResourcesScreen.tsx / MapScreen.tsx (shared theme, card style, spacing,
 * typography). The bottom nav bar is not rendered here — it lives once,
 * globally, in navigation/CustomTabBar.tsx.
 * -----------------------------------------------------------------------
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { COLORS, SHADOW } from "../theme/colors";
import { MainTabParamList, RootStackParamList } from "../navigation/types";

// Navigation from this screen needs to reach EditProfile, which lives in
// the root stack sitting above the tabs.
type ProfileScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, "Profile">,
  NativeStackNavigationProp<RootStackParamList>
>;

// -----------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------
interface StatItem {
  id: string;
  icon: keyof typeof Feather.glyphMap;
  value: string;
  label: string;
}

interface AcademicInfoRow {
  id: string;
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
}

interface InterestChip {
  id: string;
  label: string;
  accent?: boolean;
}

interface ActivityItem {
  id: string;
  icon: keyof typeof Feather.glyphMap;
  text: string;
  time: string;
}

interface MenuRow {
  id: string;
  icon: keyof typeof Feather.glyphMap;
  label: string;
  subtitle: string;
}

// -----------------------------------------------------------------------
// STATIC SAMPLE DATA
// -----------------------------------------------------------------------
const STATS: StatItem[] = [
  { id: "st1", icon: "users", value: "5", label: "Groups" },
  { id: "st2", icon: "file-text", value: "12", label: "Resources" },
  { id: "st3", icon: "calendar", value: "8", label: "Sessions" },
  { id: "st4", icon: "star", value: "4.7", label: "Rating" },
];

const ACADEMIC_INFO: AcademicInfoRow[] = [
  {
    id: "ai1",
    icon: "book-open",
    label: "Programme",
    value: "BSc Computer Engineering",
  },
  {
    id: "ai2",
    icon: "layers",
    label: "Department",
    value: "Computer Engineering",
  },
  {
    id: "ai3",
    icon: "home",
    label: "College",
    value: "College of Engineering",
  },
  { id: "ai4", icon: "bar-chart-2", label: "Level", value: "300" },
  {
    id: "ai5",
    icon: "mail",
    label: "Student Email",
    value: "aaoduro@st.knust.edu.gh",
  },
];

const INTERESTS: InterestChip[] = [
  { id: "in1", label: "Data Structures", accent: true },
  { id: "in2", label: "Database Systems" },
  { id: "in3", label: "Artificial Intelligence", accent: true },
  { id: "in4", label: "Calculus" },
  { id: "in5", label: "Web Development" },
  { id: "in6", label: "Cybersecurity" },
];

const RECENT_ACTIVITY: ActivityItem[] = [
  {
    id: "ac1",
    icon: "user-plus",
    text: "Joined CSM 351 Data Structures group",
    time: "2h ago",
  },
  {
    id: "ac2",
    icon: "upload",
    text: "Uploaded Past Questions - CSM 357",
    time: "1d ago",
  },
  {
    id: "ac3",
    icon: "star",
    text: "Rated MTH 263 Tutorial group",
    time: "2d ago",
  },
  {
    id: "ac4",
    icon: "check-circle",
    text: "Attended Database Systems study session",
    time: "3d ago",
  },
];

const ACCOUNT_MENU: MenuRow[] = [
  {
    id: "mn1",
    icon: "bookmark",
    label: "Saved Resources",
    subtitle: "6 saved items",
  },
  {
    id: "mn2",
    icon: "upload",
    label: "My Uploads",
    subtitle: "12 files shared",
  },
  {
    id: "mn3",
    icon: "users",
    label: "My Study Groups",
    subtitle: "5 active groups",
  },
  {
    id: "mn4",
    icon: "bell",
    label: "Notifications",
    subtitle: "Manage alerts",
  },
  {
    id: "mn5",
    icon: "shield",
    label: "Privacy & Security",
    subtitle: "Password, data",
  },
  {
    id: "mn6",
    icon: "help-circle",
    label: "Help & Support",
    subtitle: "FAQs, contact us",
  },
];

// -----------------------------------------------------------------------
// SMALL REUSABLE COMPONENTS
// -----------------------------------------------------------------------

/** Section header — Profile screen sections don't need "View all" links,
 *  so this is a simpler title-only variant of the pattern used elsewhere. */
const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

/** Generic empty state — reused for "no activity" and "no saved resources" */
const EmptyState: React.FC<{
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
}> = ({ icon, title, subtitle }) => (
  <View style={styles.emptyState}>
    <View style={styles.emptyIconWrap}>
      <Feather name={icon} size={22} color={COLORS.primary} />
    </View>
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptySubtitle}>{subtitle}</Text>
  </View>
);

// -----------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------
const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  // Toggle these to preview the empty states — wire to real data later.
  const [hasActivity] = useState(true);
  const [hasSavedResources] = useState(true);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
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
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity
              style={styles.settingsIconButton}
              activeOpacity={0.7}
            >
              <Feather name="settings" size={19} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ---------------------------------------------------------- */}
        {/* USER PROFILE CARD                                           */}
        {/* ---------------------------------------------------------- */}
        <View style={styles.profileCard}>
          <View style={styles.profileTopRow}>
            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: "https://i.pravatar.cc/150?img=12" }}
                style={styles.avatar}
              />
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={11} color={COLORS.white} />
              </View>
            </View>

            <View style={styles.profileNameBlock}>
              <View style={styles.profileNameRow}>
                <Text style={styles.profileName}>Nii Nortey</Text>
              </View>
              <Text style={styles.profileProgramme}>BSc Computer Science</Text>
              <View style={styles.profileMetaRow}>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelBadgeText}>Level 300</Text>
                </View>
                <Text style={styles.profileUniversity}>KNUST</Text>
              </View>
            </View>
          </View>

          <View style={styles.verifiedStrip}>
            <Feather name="shield" size={13} color={COLORS.primary} />
            <Text style={styles.verifiedStripText}>Verified Student</Text>
          </View>

          <TouchableOpacity
            style={styles.editProfileButton}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <Feather name="edit-2" size={14} color={COLORS.primary} />
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* ---------------------------------------------------------- */}
        {/* STUDENT STATS                                               */}
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
        {/* ACADEMIC INFORMATION                                        */}
        {/* ---------------------------------------------------------- */}
        <SectionHeader title="Academic Information" />
        <View style={styles.listCard}>
          {ACADEMIC_INFO.map((row, index) => (
            <View
              key={row.id}
              style={[
                styles.infoRow,
                index !== ACADEMIC_INFO.length - 1 && styles.rowDivider,
              ]}
            >
              <View style={styles.infoIconWrap}>
                <Feather name={row.icon} size={15} color={COLORS.primary} />
              </View>
              <View style={styles.infoTextBlock}>
                <Text style={styles.infoLabel}>{row.label}</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {row.value}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* ---------------------------------------------------------- */}
        {/* STUDY INTERESTS                                             */}
        {/* ---------------------------------------------------------- */}
        <SectionHeader title="Study Interests" />
        <View style={styles.interestsWrap}>
          {INTERESTS.map((interest) => (
            <View
              key={interest.id}
              style={[
                styles.interestChip,
                interest.accent && styles.interestChipAccent,
              ]}
            >
              <Text
                style={[
                  styles.interestChipText,
                  interest.accent && styles.interestChipTextAccent,
                ]}
              >
                {interest.label}
              </Text>
            </View>
          ))}
        </View>

        {/* ---------------------------------------------------------- */}
        {/* RECENT ACTIVITY                                             */}
        {/* ---------------------------------------------------------- */}
        <SectionHeader title="Recent Activity" />
        {hasActivity ? (
          <View style={styles.listCard}>
            {RECENT_ACTIVITY.map((activity, index) => (
              <View
                key={activity.id}
                style={[
                  styles.activityRow,
                  index !== RECENT_ACTIVITY.length - 1 && styles.rowDivider,
                ]}
              >
                <View style={styles.activityIconWrap}>
                  <Feather
                    name={activity.icon}
                    size={15}
                    color={COLORS.primary}
                  />
                </View>
                <Text style={styles.activityText} numberOfLines={2}>
                  {activity.text}
                </Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.listCard}>
            <EmptyState
              icon="activity"
              title="No activity yet"
              subtitle="Join a group or upload a resource to get started."
            />
          </View>
        )}

        {/* ---------------------------------------------------------- */}
        {/* ACCOUNT MENU                                                */}
        {/* ---------------------------------------------------------- */}
        <SectionHeader title="Account" />
        <View style={styles.listCard}>
          {ACCOUNT_MENU.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuRow,
                index !== ACCOUNT_MENU.length - 1 && styles.rowDivider,
              ]}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconWrap}>
                <Feather name={item.icon} size={16} color={COLORS.primary} />
              </View>
              <View style={styles.menuTextBlock}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Feather
                name="chevron-right"
                size={18}
                color={COLORS.textMuted}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Reference to the "no saved resources" empty state — this is
            what the Saved Resources screen would show when the list is
            empty; included here per spec as a reusable component. */}
        {!hasSavedResources && (
          <View style={styles.listCard}>
            <EmptyState
              icon="bookmark"
              title="No saved resources"
              subtitle="Bookmark notes or past questions to find them here."
            />
          </View>
        )}

        {/* ---------------------------------------------------------- */}
        {/* LOGOUT BUTTON                                               */}
        {/* ---------------------------------------------------------- */}
        <TouchableOpacity style={styles.logoutButton} activeOpacity={0.85}>
          <Feather name="log-out" size={16} color={COLORS.danger} />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>

        {/* Bottom spacer so content isn't hidden behind the tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  settingsIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOW,
  },

  // ---------------- PROFILE CARD ----------------
  profileCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    marginHorizontal: H_PADDING,
    marginTop: 16,
    padding: 18,
    ...SHADOW,
  },
  profileTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  profileNameBlock: {
    flex: 1,
    marginLeft: 16,
  },
  profileNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileName: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  profileProgramme: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  profileMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  levelBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  levelBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primary,
  },
  profileUniversity: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "600",
  },
  verifiedStrip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primaryLight,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: 16,
  },
  verifiedStripText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: COLORS.primary,
    marginLeft: 6,
  },
  editProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: COLORS.primaryLight,
    borderRadius: 12,
    paddingVertical: 11,
    marginTop: 16,
  },
  editProfileButtonText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: COLORS.primary,
    marginLeft: 8,
  },

  // ---------------- STUDENT STATS ----------------
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: H_PADDING,
    marginTop: 18,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    ...SHADOW,
  },
  statIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 10.5,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // ---------------- SECTION HEADER ----------------
  sectionHeader: {
    paddingHorizontal: H_PADDING,
    marginTop: 22,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16.5,
    fontWeight: "700",
    color: COLORS.textPrimary,
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

  // ---------------- ACADEMIC INFO ROW ----------------
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  infoIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoTextBlock: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 13.5,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },

  // ---------------- STUDY INTERESTS ----------------
  interestsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: H_PADDING,
    gap: 8,
  },
  interestChip: {
    backgroundColor: COLORS.chipBg,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    marginBottom: 8,
  },
  interestChipAccent: {
    backgroundColor: COLORS.primaryLight,
  },
  interestChipText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  interestChipTextAccent: {
    color: COLORS.primary,
  },

  // ---------------- RECENT ACTIVITY ----------------
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  activityIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  activityText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
    marginRight: 8,
    lineHeight: 18,
  },
  activityTime: {
    fontSize: 11,
    color: COLORS.textMuted,
  },

  // ---------------- ACCOUNT MENU ----------------
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  menuIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuTextBlock: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 13.5,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 11.5,
    color: COLORS.textMuted,
  },

  // ---------------- EMPTY STATE (reusable) ----------------
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 28,
  },
  emptyIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 240,
  },

  // ---------------- LOGOUT BUTTON ----------------
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDEAEA",
    marginHorizontal: H_PADDING,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.danger,
    marginLeft: 8,
  },
});
