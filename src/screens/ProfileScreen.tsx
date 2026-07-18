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

import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
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
import { MainTabParamList, RootStackParamList } from "../navigation/types";
import { useTabBarHeight } from "../navigation/useTabBarHeight";
import { useAuth } from "../context/AuthContext";
import { LoadingView, ErrorView } from "../components/common";
import { useMyProfile, useProfileStats } from "../hooks/useProfile";

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

interface MenuRow {
  id: string;
  icon: keyof typeof Feather.glyphMap;
  label: string;
  subtitle: string;
}

// -----------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------
const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { logout } = useAuth();
  const { colors: COLORS, isDark } = useTheme();
  const { t } = useLanguage();
  const styles = React.useMemo(() => createStyles(COLORS), [COLORS]);
  const tabBarHeight = useTabBarHeight();

  /** Section header — Profile screen sections don't need "View all" links,
   *  so this is a simpler title-only variant of the pattern used elsewhere. */
  const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );


  const profileQuery = useMyProfile();
  const statsQuery = useProfileStats();
  const user = profileQuery.data;
  const counts = statsQuery.data ?? { groups: 0, uploads: 0, sessions: 0, saved: 0 };

  const isLoading = profileQuery.isLoading || statsQuery.isLoading;
  const hasError = !profileQuery.data && (profileQuery.isError || statsQuery.isError);

  const refetchAll = useCallback(() => {
    profileQuery.refetch();
    statsQuery.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFocusEffect(refetchAll);

  const handleMenuPress = (item: MenuRow) => {
    if (item.id === "mn1" || item.id === "mn2") {
      navigation.navigate("Resources");
      return;
    }
    if (item.id === "mn3") {
      navigation.navigate("Groups");
      return;
    }
    if (item.id === "mn4") {
      navigation.navigate("Notifications");
      return;
    }
    Alert.alert(item.label, t('profile.sectionUnavailable'));
  };

  const handleLogOut = () => {
    Alert.alert(t('profile.logOutConfirmTitle'), t('profile.logOutConfirmBody'), [
      { text: t('common.cancel'), style: "cancel" },
      {
        text: t('profile.logOut'),
        style: "destructive",
        // logout() always clears local session state even if the
        // server-side call fails (see AuthContext.tsx) — nothing else to
        // handle here, just avoid an unhandled-rejection warning.
        onPress: () => {
          logout().catch(() => undefined);
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={COLORS.background} />
        <LoadingView message={t('profile.loading')} />
      </SafeAreaView>
    );
  }

  if (hasError || !user) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={COLORS.background} />
        <ErrorView onRetry={refetchAll} />
      </SafeAreaView>
    );
  }

  const STATS: StatItem[] = [
    { id: "st1", icon: "users", value: String(counts.groups), label: t('profile.statGroups') },
    { id: "st2", icon: "file-text", value: String(counts.uploads), label: t('profile.statResources') },
    { id: "st3", icon: "calendar", value: String(counts.sessions), label: t('profile.statSessions') },
    { id: "st4", icon: "star", value: user.rating ? user.rating.toFixed(1) : "—", label: t('profile.statRating') },
  ];

  const ACADEMIC_INFO: AcademicInfoRow[] = [
    { id: "ai1", icon: "book-open", label: t('profile.programme'), value: user.programme || t('profile.notSet') },
    { id: "ai2", icon: "layers", label: t('profile.department'), value: user.department || t('profile.notSet') },
    { id: "ai3", icon: "home", label: t('profile.college'), value: user.college || t('profile.notSet') },
    { id: "ai4", icon: "bar-chart-2", label: t('profile.level'), value: user.level || t('profile.notSet') },
    { id: "ai5", icon: "mail", label: t('profile.studentEmail'), value: user.email },
  ];

  const ACCOUNT_MENU: MenuRow[] = [
    { id: "mn1", icon: "bookmark", label: t('profile.savedResources'), subtitle: t('profile.savedItems', { count: counts.saved }) },
    { id: "mn2", icon: "upload", label: t('profile.myUploads'), subtitle: t('profile.filesShared', { count: counts.uploads }) },
    { id: "mn3", icon: "users", label: t('profile.myStudyGroups'), subtitle: t('profile.activeGroups', { count: counts.groups }) },
    { id: "mn4", icon: "bell", label: t('profile.notifications'), subtitle: t('profile.manageAlerts') },
    { id: "mn5", icon: "shield", label: t('profile.privacySecurity'), subtitle: t('profile.passwordData') },
    { id: "mn6", icon: "help-circle", label: t('profile.helpSupport'), subtitle: t('profile.faqsContactUs') },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={COLORS.background} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ---------------------------------------------------------- */}
        {/* HEADER                                                      */}
        {/* ---------------------------------------------------------- */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <Text style={styles.headerTitle}>{t('profile.title')}</Text>
            <TouchableOpacity
              style={styles.settingsIconButton}
              activeOpacity={0.7}
              onPress={() => navigation.navigate("Settings")}
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
              {user.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Feather name="user" size={28} color={COLORS.primary} />
                </View>
              )}
              {user.isEmailVerified ? (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark" size={11} color={COLORS.white} />
                </View>
              ) : null}
            </View>

            <View style={styles.profileNameBlock}>
              <View style={styles.profileNameRow}>
                <Text style={styles.profileName}>{user.fullName}</Text>
              </View>
              <Text style={styles.profileProgramme}>{user.programme || t('profile.programmeNotSet')}</Text>
              <View style={styles.profileMetaRow}>
                {user.level ? (
                  <View style={styles.levelBadge}>
                    <Text style={styles.levelBadgeText}>{user.level}</Text>
                  </View>
                ) : null}
                <Text style={styles.profileUniversity}>{t('profile.knust')}</Text>
              </View>
            </View>
          </View>

          {user.isEmailVerified ? (
            <View style={styles.verifiedStrip}>
              <Feather name="shield" size={13} color={COLORS.primary} />
              <Text style={styles.verifiedStripText}>{t('profile.verifiedStudent')}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={styles.editProfileButton}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <Feather name="edit-2" size={14} color={COLORS.primary} />
            <Text style={styles.editProfileButtonText}>{t('profile.editProfile')}</Text>
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
        <SectionHeader title={t('profile.academicInformation')} />
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
        {user.interests && user.interests.length > 0 && (
          <>
            <SectionHeader title={t('profile.studyInterests')} />
            <View style={styles.interestsWrap}>
              {user.interests.map((interest) => (
                <View key={interest} style={styles.interestChip}>
                  <Text style={styles.interestChipText}>{interest}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ---------------------------------------------------------- */}
        {/* ACCOUNT MENU                                                */}
        {/* ---------------------------------------------------------- */}
        <SectionHeader title={t('profile.account')} />
        <View style={styles.listCard}>
          {ACCOUNT_MENU.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuRow,
                index !== ACCOUNT_MENU.length - 1 && styles.rowDivider,
              ]}
              activeOpacity={0.7}
              onPress={() => handleMenuPress(item)}
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

        {/* ---------------------------------------------------------- */}
        {/* LOGOUT BUTTON                                               */}
        {/* ---------------------------------------------------------- */}
        <TouchableOpacity style={styles.logoutButton} activeOpacity={0.85} onPress={handleLogOut}>
          <Feather name="log-out" size={16} color={COLORS.danger} />
          <Text style={styles.logoutButtonText}>{t('profile.logOut')}</Text>
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
  avatarPlaceholder: {
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
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
  interestChipText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: COLORS.textSecondary,
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

  // ---------------- LOGOUT BUTTON ----------------
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.dangerLight,
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
}
