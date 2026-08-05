/**
 * EduSphere — screens/MapScreen.tsx
 * -----------------------------------------------------------------------
 * Campus Study Group & Resource Finder — Study Spaces Map
 *
 * A real Google/Apple map (react-native-maps) with every curated study
 * spot shown as a miniature-building marker — a small pre-rendered image
 * (assets/markers/) passed as each Marker's `image` prop, not a live JS
 * view. That's deliberate: react-native-maps markers built from JS view
 * children can fail to rasterize into a visible bitmap on Android, so a
 * static image is the reliable choice. Locations outside the registry in
 * data/campusBuildings.ts fall back to a generic marker.
 *
 * Tapping a building animates the camera to it and opens a glassmorphic
 * card with the real photo, description, distance/walk time, and the
 * Directions / status-report actions.
 *
 * Status (Open/Busy/Available/Closed) is entirely student-reported — there
 * is no live feed, so whatever the last person tapped is what's shown.
 * -----------------------------------------------------------------------
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Linking, Modal, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeColors, SHADOW } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useTabBarHeight } from '../navigation/useTabBarHeight';
import { ErrorView, LoadingView } from '../components/common';
import { useLocations, useReportLocationStatus } from '../hooks/useLocations';
import { CampusLocation, LocationStatus } from '../types/location';
import { getCampusBuilding, MARKER_IMAGES } from '../data/campusBuildings';
import MapInfoCard from '../components/map/MapInfoCard';
import FloatingSearchBar, { FilterOption } from '../components/map/FloatingSearchBar';
import MapControls from '../components/map/MapControls';

// -----------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------
const CAMPUS_WIDE_KEY = '__campus_wide__';

const COLLEGE_SHORT_LABELS: Record<string, string> = {
  'College of Humanities and Social Sciences': 'Humanities & Social Sciences',
  'College of Health Sciences': 'Health Sciences',
  'College of Engineering': 'Engineering',
  'College of Science': 'Science',
  'College of Agriculture and Natural Resources': 'Agriculture & Natural Resources',
  'College of Art and Built Environment': 'Art & Built Environment',
};

function collegeShortLabel(college: string): string {
  return COLLEGE_SHORT_LABELS[college] ?? college;
}

/** Prempeh II Library anchors the walkable main-campus cluster. */
const CAMPUS_CENTER = { latitude: 6.6745, longitude: -1.5716 };
const CAMPUS_REGION: Region = {
  ...CAMPUS_CENTER,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};
const BUILDING_FOCUS_DELTA = 0.0035;

// Simple, well-known "muted dark" Google Maps style (static JSON, no
// runtime cost) so dark theme doesn't hand you a blindingly bright map.
const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1d2129' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1d2129' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8a94a6' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#333f4f' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#263042' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a323f' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#6b7488' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17202c' }] },
];

/** Haversine distance in km — used only to flag the couple of seeded
 *  spots (Boadi, KATH) that sit well outside the walkable main campus. */
function distanceKmBetween(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLng = ((b.longitude - a.longitude) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.latitude * Math.PI) / 180) * Math.cos((b.latitude * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}
const MAIN_CAMPUS_RADIUS_KM = 2.4;
function isOnMainCampus(location: CampusLocation): boolean {
  return distanceKmBetween(CAMPUS_CENTER, location) < MAIN_CAMPUS_RADIUS_KM;
}

const STATUS_ORDER: LocationStatus[] = ['open', 'available', 'busy', 'closed'];

// -----------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------
const MapScreen: React.FC = () => {
  const { colors: COLORS, isDark } = useTheme();
  const { t } = useLanguage();
  const styles = React.useMemo(() => createStyles(COLORS), [COLORS]);
  const tabBarHeight = useTabBarHeight();
  const insets = useSafeAreaInsets();

  const mapRef = useRef<MapView>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCollege, setActiveCollege] = useState<string>('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reportTarget, setReportTarget] = useState<CampusLocation | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  // With permission, the backend gets our coords and returns distanceKm.
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setUserCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
    })().catch(() => undefined);
  }, []);

  const locationsQuery = useLocations(userCoords ?? {});
  const reportStatusMutation = useReportLocationStatus();
  const locations = useMemo(() => locationsQuery.data?.items ?? [], [locationsQuery.data]);

  const collegeOptions = useMemo<FilterOption[]>(() => {
    const seen = new Set<string>();
    let hasCampusWide = false;
    for (const loc of locations) {
      if (loc.college) seen.add(loc.college);
      else hasCampusWide = true;
    }
    const colleges = Array.from(seen).sort((a, b) => a.localeCompare(b));
    return [
      { key: 'All', label: t('map.filterAll') },
      ...(hasCampusWide ? [{ key: CAMPUS_WIDE_KEY, label: t('map.filterCampusWide') }] : []),
      ...colleges.map((c) => ({ key: c, label: collegeShortLabel(c) })),
    ];
  }, [locations, t]);

  const filteredLocations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return locations.filter((loc) => {
      const matchesCollege =
        activeCollege === 'All' ||
        (activeCollege === CAMPUS_WIDE_KEY ? !loc.college : loc.college === activeCollege);
      const matchesSearch =
        !q || loc.name.toLowerCase().includes(q) || (loc.description ?? '').toLowerCase().includes(q);
      return matchesCollege && matchesSearch;
    });
  }, [locations, activeCollege, searchQuery]);

  const onCampusLocations = useMemo(() => filteredLocations.filter(isOnMainCampus), [filteredLocations]);
  const offCampusLocations = useMemo(() => filteredLocations.filter((l) => !isOnMainCampus(l)), [filteredLocations]);

  const selectedLocation = filteredLocations.find((loc) => loc.id === selectedId) ?? null;

  const handleSelect = (location: CampusLocation) => {
    setSelectedId(location.id);
    mapRef.current?.animateToRegion(
      {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: BUILDING_FOCUS_DELTA,
        longitudeDelta: BUILDING_FOCUS_DELTA,
      },
      500
    );
  };

  const handleDeselect = () => {
    setSelectedId(null);
  };

  const handleRecenter = () => {
    setSelectedId(null);
    mapRef.current?.animateToRegion(CAMPUS_REGION, 500);
  };

  const handleSubmitReport = (status: LocationStatus) => {
    if (!reportTarget) return;
    reportStatusMutation.mutate(
      { locationId: reportTarget.id, status },
      { onSuccess: () => setReportTarget(null) }
    );
  };

  const handleGetDirections = (location: CampusLocation) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
    Linking.openURL(url).catch(() => undefined);
  };

  const handleLocateMe = () => {
    if (!userCoords) return;
    setSelectedId(null);
    mapRef.current?.animateToRegion(
      { latitude: userCoords.lat, longitude: userCoords.lng, latitudeDelta: 0.006, longitudeDelta: 0.006 },
      500
    );
  };

  const isLoading = locationsQuery.isLoading;
  const isError = !locationsQuery.data && locationsQuery.isError;

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        translucent
        backgroundColor="transparent"
      />

      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={CAMPUS_REGION}
        customMapStyle={isDark ? DARK_MAP_STYLE : undefined}
        userInterfaceStyle={isDark ? 'dark' : 'light'}
        onPress={handleDeselect}
        showsUserLocation={!!userCoords}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        rotateEnabled
        pitchEnabled
      >
        {onCampusLocations.map((location) => {
          const building = getCampusBuilding(location.name);
          return (
            <Marker
              key={location.id}
              coordinate={{ latitude: location.latitude, longitude: location.longitude }}
              image={MARKER_IMAGES[building.modelKey]}
              onPress={(e) => {
                e.stopPropagation();
                handleSelect(location);
              }}
            />
          );
        })}
      </MapView>

      {/* Floating title */}
      <View style={[styles.titleWrap, { top: insets.top + 12 }]} pointerEvents="none">
        <View style={styles.titlePill}>
          <Text style={styles.title}>{t('map.title')}</Text>
          <Text style={styles.subtitle}>{t('map.subtitle')}</Text>
        </View>
      </View>

      {/* Floating controls (top right) */}
      <View style={[styles.controlsWrap, { top: insets.top + 12 }]}>
        <MapControls onRecenter={handleRecenter} onLocateMe={userCoords ? handleLocateMe : undefined} />
      </View>

      {/* Loading / error overlays */}
      {isLoading && (
        <View style={styles.overlayCenter} pointerEvents="none">
          <View style={styles.overlayCard}>
            <LoadingView message={t('map.loading')} />
          </View>
        </View>
      )}
      {isError && (
        <View style={styles.overlayCenter}>
          <View style={styles.overlayCard}>
            <ErrorView message={t('map.loadError')} onRetry={() => locationsQuery.refetch()} />
          </View>
        </View>
      )}

      {/* Bottom stack: info card replaces the search bar while open */}
      <View style={[styles.bottomStack, { bottom: tabBarHeight + 14 }]}>
        {selectedLocation ? (
          <MapInfoCard
            location={selectedLocation}
            onClose={handleDeselect}
            onGetDirections={handleGetDirections}
            onReportStatus={setReportTarget}
          />
        ) : (
          !isLoading &&
          !isError && (
            <>
              {offCampusLocations.length > 0 && (
                <View style={styles.offCampusRow}>
                  {offCampusLocations.map((loc) => (
                    <TouchableOpacity
                      key={loc.id}
                      style={styles.offCampusChip}
                      activeOpacity={0.85}
                      onPress={() => setSelectedId(loc.id)}
                    >
                      <View style={styles.offCampusDot} />
                      <Text style={styles.offCampusChipText} numberOfLines={1}>
                        {loc.name} · {t('map.offMainCampus')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <FloatingSearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                filterOptions={collegeOptions}
                activeFilter={activeCollege}
                onSelectFilter={setActiveCollege}
              />
            </>
          )
        )}
      </View>

      {/* ---------------------------------------------------------- */}
      {/* STATUS REPORT MODAL                                         */}
      {/* ---------------------------------------------------------- */}
      <Modal visible={!!reportTarget} transparent animationType="fade" onRequestClose={() => setReportTarget(null)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setReportTarget(null)}>
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>
              {reportTarget ? t('map.reportStatusTitle', { name: reportTarget.name }) : ''}
            </Text>
            <View style={styles.statusOptionsGrid}>
              {STATUS_ORDER.map((status) => {
                const info = {
                  open: { bg: COLORS.successLight, color: COLORS.success, label: t('map.statusOpen') },
                  available: { bg: COLORS.primaryLight, color: COLORS.primary, label: t('map.statusAvailable') },
                  busy: { bg: COLORS.dangerLight, color: COLORS.danger, label: t('map.statusBusy') },
                  closed: { bg: COLORS.chipBg, color: COLORS.textMuted, label: t('map.statusClosed') },
                }[status];
                return (
                  <TouchableOpacity
                    key={status}
                    style={[styles.statusOption, { backgroundColor: info.bg }]}
                    activeOpacity={0.85}
                    disabled={reportStatusMutation.isPending}
                    onPress={() => handleSubmitReport(status)}
                  >
                    <View style={[styles.statusDot, { backgroundColor: info.color }]} />
                    <Text style={[styles.statusOptionText, { color: info.color }]}>{info.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity style={styles.modalCancelButton} onPress={() => setReportTarget(null)}>
              <Text style={styles.modalCancelButtonText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default MapScreen;

// -----------------------------------------------------------------------
// STYLES
// -----------------------------------------------------------------------
const H_PADDING = 18;

function createStyles(COLORS: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },

    // ---------------- FLOATING TITLE ----------------
    titleWrap: {
      position: 'absolute',
      left: H_PADDING,
      maxWidth: '68%',
      alignItems: 'flex-start',
    },
    titlePill: {
      backgroundColor: COLORS.card,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 10,
      ...SHADOW,
      shadowOpacity: 0.14,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: COLORS.textPrimary,
      letterSpacing: -0.3,
    },
    subtitle: {
      fontSize: 11.5,
      color: COLORS.textSecondary,
      marginTop: 1,
    },

    // ---------------- CONTROLS ----------------
    controlsWrap: {
      position: 'absolute',
      right: H_PADDING,
      alignItems: 'flex-end',
    },

    // ---------------- OVERLAYS ----------------
    overlayCenter: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
    },
    overlayCard: {
      width: '82%',
      backgroundColor: COLORS.card,
      borderRadius: 22,
      paddingVertical: 8,
      overflow: 'hidden',
    },

    // ---------------- BOTTOM STACK ----------------
    bottomStack: {
      position: 'absolute',
      left: H_PADDING,
      right: H_PADDING,
    },
    offCampusRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 10,
    },
    offCampusChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.card,
      paddingHorizontal: 13,
      paddingVertical: 9,
      borderRadius: 16,
      maxWidth: 240,
      ...SHADOW,
      shadowOpacity: 0.1,
    },
    offCampusDot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: COLORS.textMuted,
      marginRight: 7,
    },
    offCampusChipText: {
      fontSize: 11.5,
      fontWeight: '600',
      color: COLORS.textSecondary,
    },

    // ---------------- STATUS REPORT MODAL ----------------
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(17,17,17,0.4)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    modalSheet: {
      width: '100%',
      backgroundColor: COLORS.card,
      borderRadius: 26,
      padding: 22,
      ...SHADOW,
      shadowOpacity: 0.24,
      shadowRadius: 24,
    },
    modalTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: COLORS.textPrimary,
      marginBottom: 18,
      textAlign: 'center',
      letterSpacing: -0.2,
    },
    statusOptionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    statusOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      flexBasis: '48%',
      flexGrow: 1,
      paddingVertical: 13,
      borderRadius: 16,
    },
    statusOptionText: {
      fontSize: 13,
      fontWeight: '700',
      marginLeft: 6,
    },
    modalCancelButton: {
      alignItems: 'center',
      paddingVertical: 14,
      marginTop: 8,
    },
    modalCancelButtonText: {
      fontSize: 13.5,
      fontWeight: '600',
      color: COLORS.textMuted,
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 6,
    },
  });
}
