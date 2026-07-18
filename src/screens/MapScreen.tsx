/**
 * EduSphere — screens/MapScreen.tsx
 * -----------------------------------------------------------------------
 * Campus Study Group & Resource Finder — Map Screen
 *
 * Follows the same design system as HomeScreen.tsx / GroupsScreen.tsx /
 * ResourcesScreen.tsx (shared theme, card style, spacing, typography).
 * The bottom nav bar is not rendered here — it lives once, globally, in
 * navigation/CustomTabBar.tsx.
 *
 * MAP IMPLEMENTATION NOTE:
 * This screen ships with a hand-built STATIC map placeholder — no map
 * package required. It's a pure View/SVG composition styled to look like
 * a simplified campus map (roads, green space, pins, labels) so the
 * screen is fully functional and good-looking today.
 *
 * When you're ready to connect a real interactive map, swap out the
 * <StaticMapPlaceholder /> component (search for "SWAP POINT" below) for
 * a MapView from react-native-maps. Everything else — the marker data,
 * filters, cards below the map — is already structured to plug straight
 * into real coordinates later (see the `coordinate` field already present
 * on each MapPlace, ready for latitude/longitude).
 *
 * INSTALLATION FOR REAL MAPS LATER (not required for this version):
 *   npx expo install react-native-maps
 * -----------------------------------------------------------------------
 */

import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import type { DimensionValue } from "react-native";
import { ThemeColors, SHADOW } from "../theme/colors";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { useTabBarHeight } from "../navigation/useTabBarHeight";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// -----------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------
type FilterKey =
  | "All"
  | "Libraries"
  | "Lecture Halls"
  | "Study Spots"
  | "Cafeterias"
  | "Departments"
  | "Hostels"
  | "Nearby";

type StatusType = "open" | "busy" | "available";

interface MapPlace {
  id: string;
  name: string;
  // Position on the static placeholder, expressed as percentages of the
  // map card's width/height. Swap for real lat/lng when using a real map.
  top: DimensionValue;
  left: DimensionValue;
  isPrimary?: boolean;
}

interface StudySpot {
  id: string;
  name: string;
  description: string;
  status: StatusType;
  statusLabel: string;
  distance: string;
  category: FilterKey;
}

interface MeetingLocation {
  id: string;
  courseCode: string;
  title: string;
  time: string;
  location: string;
}

interface NearbyPlace {
  id: string;
  label: string;
  distance: string;
  icon: keyof typeof Feather.glyphMap;
}

// -----------------------------------------------------------------------
// STATIC SAMPLE DATA
// -----------------------------------------------------------------------
const FILTERS: FilterKey[] = [
  "All",
  "Libraries",
  "Lecture Halls",
  "Study Spots",
  "Cafeterias",
  "Departments",
  "Hostels",
  "Nearby",
];

// Positions are hand-placed to look reasonably spread out on the
// placeholder map card. Replace with real coordinates for react-native-maps.
const MAP_PLACES: MapPlace[] = [
  {
    id: "mp1",
    name: "KNUST Main Library",
    top: "22%",
    left: "58%",
    isPrimary: true,
  },
  { id: "mp2", name: "College of Science Block", top: "42%", left: "24%" },
  { id: "mp3", name: "CCB, Room 203", top: "58%", left: "68%" },
  { id: "mp4", name: "KSB, Room B105", top: "72%", left: "34%" },
  { id: "mp5", name: "Engineering Auditorium", top: "16%", left: "20%" },
  { id: "mp6", name: "Commercial Area", top: "82%", left: "62%" },
];

const STUDY_SPOTS: StudySpot[] = [
  {
    id: "ss1",
    name: "KNUST Main Library",
    description: "Quiet study area",
    status: "open",
    statusLabel: "Open now",
    distance: "0.8 km away",
    category: "Libraries",
  },
  {
    id: "ss2",
    name: "College of Science Block",
    description: "Group discussion spot",
    status: "available",
    statusLabel: "Available rooms",
    distance: "1.2 km away",
    category: "Study Spots",
  },
  {
    id: "ss3",
    name: "Engineering Auditorium Area",
    description: "Popular meeting point",
    status: "busy",
    statusLabel: "Busy",
    distance: "1.5 km away",
    category: "Lecture Halls",
  },
];

const MEETING_LOCATIONS: MeetingLocation[] = [
  {
    id: "ml1",
    courseCode: "CSM 351",
    title: "CSM 351 Study Session",
    time: "Today, 4:00 PM",
    location: "CCB, Room 203",
  },
  {
    id: "ml2",
    courseCode: "MTH 263",
    title: "MTH 263 Tutorial",
    time: "Tomorrow, 10:00 AM",
    location: "KSB, Room B105",
  },
];

const NEARBY_PLACES: NearbyPlace[] = [
  { id: "np1", label: "Library", distance: "0.8 km", icon: "book" },
  { id: "np2", label: "Cafeteria", distance: "0.5 km", icon: "coffee" },
  { id: "np3", label: "Lecture Hall", distance: "1.1 km", icon: "layout" },
  { id: "np4", label: "Study Room", distance: "0.9 km", icon: "edit-3" },
  { id: "np5", label: "Department Block", distance: "1.4 km", icon: "home" },
];

const FILTER_LABEL_KEYS: Record<FilterKey, string> = {
  All: "map.filterAll",
  Libraries: "map.filterLibraries",
  "Lecture Halls": "map.filterLectureHalls",
  "Study Spots": "map.filterStudySpots",
  Cafeterias: "map.filterCafeterias",
  Departments: "map.filterDepartments",
  Hostels: "map.filterHostels",
  Nearby: "map.filterNearby",
};


// -----------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------
const MapScreen: React.FC = () => {
  const { colors: COLORS, isDark } = useTheme();
  const { t } = useLanguage();
  const styles = React.useMemo(() => createStyles(COLORS), [COLORS]);
  const tabBarHeight = useTabBarHeight();

  // Status chip visual mapping
  const STATUS_STYLES: Record<StatusType, { bg: string; color: string }> = {
    open: { bg: COLORS.successLight, color: COLORS.success },
    busy: { bg: "#FDEAEA", color: COLORS.danger },
    available: { bg: COLORS.primaryLight, color: COLORS.primary },
  };

  // ---- Small reusable pieces, defined here so they close over this
  // render's styles/COLORS instead of needing them threaded as props. ----

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

  /** Status chip used on study spot cards */
  const StatusChip: React.FC<{ label: string; type: StatusType }> = ({
    label,
    type,
  }) => {
    const style = STATUS_STYLES[type];
    return (
      <View style={[styles.statusChip, { backgroundColor: style.bg }]}>
        <View style={[styles.statusDot, { backgroundColor: style.color }]} />
        <Text style={[styles.statusChipText, { color: style.color }]}>
          {label}
        </Text>
      </View>
    );
  };

  /**
   * Static map placeholder — SWAP POINT for react-native-maps later.
   *
   * Built entirely from Views: a soft base, faint "road" lines, a couple of
   * green-space blobs, and absolutely-positioned pin markers with labels.
   * No external assets or map SDK required.
   */
  const StaticMapPlaceholder: React.FC<{ places: MapPlace[] }> = ({ places }) => {
    return (
      <View style={styles.mapCard}>
        {/* Decorative "roads" */}
        <View
          style={[
            styles.mapRoad,
            {
              top: "30%",
              left: "-10%",
              width: "120%",
              transform: [{ rotate: "-6deg" }],
            },
          ]}
        />
        <View
          style={[
            styles.mapRoad,
            {
              top: "62%",
              left: "-10%",
              width: "120%",
              transform: [{ rotate: "4deg" }],
            },
          ]}
        />
        <View
          style={[
            styles.mapRoadVertical,
            {
              left: "35%",
              top: "-10%",
              height: "120%",
              transform: [{ rotate: "3deg" }],
            },
          ]}
        />
        <View
          style={[
            styles.mapRoadVertical,
            {
              left: "72%",
              top: "-10%",
              height: "120%",
              transform: [{ rotate: "-4deg" }],
            },
          ]}
        />

        {/* Decorative green space */}
        <View
          style={[
            styles.mapGreenSpace,
            { top: "10%", left: "45%", width: 90, height: 60 },
          ]}
        />
        <View
          style={[
            styles.mapGreenSpace,
            { top: "55%", left: "8%", width: 70, height: 50 },
          ]}
        />

        {/* Markers */}
        {places.map((place) => (
          <View
            key={place.id}
            style={[styles.mapMarkerWrap, { top: place.top, left: place.left }]}
          >
            {place.isPrimary && <View style={styles.mapMarkerPulse} />}
            <View
              style={[styles.mapPin, place.isPrimary && styles.mapPinPrimary]}
            >
              <Feather
                name="map-pin"
                size={place.isPrimary ? 16 : 13}
                color={COLORS.white}
              />
            </View>
            <View style={styles.mapPinLabelWrap}>
              <Text style={styles.mapPinLabel} numberOfLines={1}>
                {place.name}
              </Text>
            </View>
          </View>
        ))}

        {/* Current location floating button */}
        <TouchableOpacity
          style={styles.currentLocationButton}
          activeOpacity={0.85}
        >
          <Feather name="navigation" size={18} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    );
  };

  /** Empty state shown when no locations match the current search / filter */
  const EmptyState: React.FC<{ onShowAll: () => void }> = ({ onShowAll }) => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconWrap}>
        <Feather name="map-pin" size={28} color={COLORS.primary} />
      </View>
      <Text style={styles.emptyTitle}>{t('map.noLocationsFound')}</Text>
      <Text style={styles.emptySubtitle}>
        {t('map.noLocationsSubtitle')}
      </Text>
      <TouchableOpacity
        style={styles.emptyShowAllButton}
        onPress={onShowAll}
        activeOpacity={0.85}
      >
        <Text style={styles.emptyShowAllButtonText}>{t('map.showAllLocations')}</Text>
      </TouchableOpacity>
    </View>
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("All");

  const filteredSpots = useMemo(() => {
    return STUDY_SPOTS.filter((spot) => {
      const matchesFilter =
        activeFilter === "All" || spot.category === activeFilter;
      const matchesSearch =
        searchQuery.trim().length === 0 ||
        spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spot.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchQuery]);

  const hasNoResults = filteredSpots.length === 0;

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
            <View>
              <Text style={styles.headerTitle}>{t('map.title')}</Text>
              <Text style={styles.headerSubtitle}>
                {t('map.subtitle')}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.locationIconButton}
              activeOpacity={0.7}
            >
              <Feather name="crosshair" size={19} color={COLORS.textPrimary} />
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
            placeholder={t('map.searchPlaceholder')}
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="x" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* ---------------------------------------------------------- */}
        {/* LOCATION FILTER CHIPS                                       */}
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
                  style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                  ]}
                >
                  {t(FILTER_LABEL_KEYS[filter])}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ---------------------------------------------------------- */}
        {/* MAP AREA (static placeholder — see SWAP POINT above)        */}
        {/* ---------------------------------------------------------- */}
        <View style={styles.mapSection}>
          <StaticMapPlaceholder places={MAP_PLACES} />
        </View>

        {/* ---------------------------------------------------------- */}
        {/* EMPTY STATE (shown only when nothing matches)               */}
        {/* ---------------------------------------------------------- */}
        {hasNoResults && (
          <EmptyState
            onShowAll={() => {
              setSearchQuery("");
              setActiveFilter("All");
            }}
          />
        )}

        {/* ---------------------------------------------------------- */}
        {/* RECOMMENDED STUDY SPOTS                                     */}
        {/* ---------------------------------------------------------- */}
        {filteredSpots.length > 0 && (
          <>
            <SectionHeader
              title={t('map.recommendedSpots')}
              onPressViewAll={() => {}}
            />
            <View style={styles.stackedCards}>
              {filteredSpots.map((spot) => (
                <View key={spot.id} style={styles.spotCard}>
                  <View style={styles.spotIconWrap}>
                    <Feather name="map-pin" size={18} color={COLORS.primary} />
                  </View>

                  <View style={styles.spotInfo}>
                    <View style={styles.spotTopRow}>
                      <Text style={styles.spotName} numberOfLines={1}>
                        {spot.name}
                      </Text>
                      <StatusChip label={spot.statusLabel} type={spot.status} />
                    </View>

                    <Text style={styles.spotDescription}>
                      {spot.description}
                    </Text>

                    <View style={styles.spotFooterRow}>
                      <View style={styles.spotDistanceRow}>
                        <Feather
                          name="navigation-2"
                          size={12}
                          color={COLORS.textSecondary}
                        />
                        <Text style={styles.spotDistanceText}>
                          {spot.distance}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={styles.directionsButton}
                        activeOpacity={0.85}
                      >
                        <Feather
                          name="corner-up-right"
                          size={13}
                          color={COLORS.primary}
                        />
                        <Text style={styles.directionsButtonText}>
                          {t('map.directions')}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ---------------------------------------------------------- */}
        {/* UPCOMING MEETING LOCATIONS                                  */}
        {/* ---------------------------------------------------------- */}
        <SectionHeader title={t('map.upcomingMeetingLocations')} />
        <View style={styles.stackedCards}>
          {MEETING_LOCATIONS.map((meeting) => (
            <View key={meeting.id} style={styles.meetingCard}>
              <View style={styles.meetingTopRow}>
                <View style={styles.courseBadge}>
                  <Text style={styles.courseBadgeText}>
                    {meeting.courseCode}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.viewOnMapButton}
                  activeOpacity={0.85}
                >
                  <Feather name="map" size={12} color={COLORS.white} />
                  <Text style={styles.viewOnMapButtonText}>{t('map.viewOnMap')}</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.meetingTitle}>{meeting.title}</Text>

              <View style={styles.meetingMetaRow}>
                <Feather name="clock" size={13} color={COLORS.textSecondary} />
                <Text style={styles.meetingMetaText}>{meeting.time}</Text>
              </View>

              <View style={styles.meetingMetaRow}>
                <Feather
                  name="map-pin"
                  size={13}
                  color={COLORS.textSecondary}
                />
                <Text style={styles.meetingMetaText}>{meeting.location}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ---------------------------------------------------------- */}
        {/* NEARBY ON CAMPUS                                            */}
        {/* ---------------------------------------------------------- */}
        <SectionHeader title={t('map.nearbyOnCampus')} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.nearbyScroll}
        >
          {NEARBY_PLACES.map((place) => (
            <TouchableOpacity
              key={place.id}
              style={styles.nearbyCard}
              activeOpacity={0.85}
            >
              <View style={styles.nearbyIconWrap}>
                <Feather name={place.icon} size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.nearbyLabel} numberOfLines={1}>
                {place.label}
              </Text>
              <Text style={styles.nearbyDistance}>{place.distance}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Bottom spacer so content isn't hidden behind the tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default MapScreen;

// -----------------------------------------------------------------------
// STYLES
// -----------------------------------------------------------------------
const CARD_GAP = 14;
const H_PADDING = 20;
const MAP_HEIGHT = 260;

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
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  locationIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOW,
  },

  // ---------------- SEARCH BAR ----------------
  searchBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: COLORS.white,
  },

  // ---------------- MAP SECTION ----------------
  mapSection: {
    paddingHorizontal: H_PADDING,
    marginBottom: 8,
  },
  mapCard: {
    height: MAP_HEIGHT,
    borderRadius: 20,
    backgroundColor: "#EAF0FB",
    overflow: "hidden",
    ...SHADOW,
  },
  mapRoad: {
    position: "absolute",
    height: 10,
    backgroundColor: "#DCE3F5",
  },
  mapRoadVertical: {
    position: "absolute",
    width: 10,
    backgroundColor: "#DCE3F5",
  },
  mapGreenSpace: {
    position: "absolute",
    backgroundColor: "#DCEEE0",
    borderRadius: 14,
  },
  mapMarkerWrap: {
    position: "absolute",
    alignItems: "center",
    transform: [{ translateX: -14 }, { translateY: -14 }],
  },
  mapPin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.textSecondary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.white,
    shadowColor: "#1B1F3B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  mapPinPrimary: {
    backgroundColor: COLORS.primary,
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  mapMarkerPulse: {
    position: "absolute",
    top: -6,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(45,63,224,0.15)",
  },
  mapPinLabelWrap: {
    marginTop: 4,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    maxWidth: 100,
  },
  mapPinLabel: {
    fontSize: 9,
    fontWeight: "600",
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  currentLocationButton: {
    position: "absolute",
    right: 14,
    bottom: 14,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
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

  stackedCards: {
    paddingHorizontal: H_PADDING,
  },

  // ---------------- SHARED CHIP / BADGE ----------------
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
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 5,
  },
  statusChipText: {
    fontSize: 10.5,
    fontWeight: "600",
  },

  // ---------------- STUDY SPOT CARD ----------------
  spotCard: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: CARD_GAP,
    ...SHADOW,
  },
  spotIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  spotInfo: {
    flex: 1,
  },
  spotTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  spotName: {
    fontSize: 14.5,
    fontWeight: "700",
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  spotDescription: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  spotFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  spotDistanceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  spotDistanceText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 5,
  },
  directionsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  directionsButtonText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: COLORS.primary,
    marginLeft: 5,
  },

  // ---------------- MEETING LOCATION CARD ----------------
  meetingCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: CARD_GAP,
    ...SHADOW,
  },
  meetingTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  viewOnMapButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  viewOnMapButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.white,
    marginLeft: 5,
  },
  meetingTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginTop: 12,
    marginBottom: 8,
  },
  meetingMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  meetingMetaText: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },

  // ---------------- NEARBY ON CAMPUS ----------------
  nearbyScroll: {
    paddingHorizontal: H_PADDING,
    paddingBottom: 4,
  },
  nearbyCard: {
    width: 96,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginRight: CARD_GAP,
    alignItems: "center",
    ...SHADOW,
  },
  nearbyIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  nearbyLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  nearbyDistance: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    marginTop: 3,
  },

  // ---------------- EMPTY STATE ----------------
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: H_PADDING,
    paddingVertical: 40,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 19,
    maxWidth: 260,
  },
  emptyShowAllButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 12,
    marginTop: 18,
  },
  emptyShowAllButtonText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: COLORS.white,
  },
  });
}
