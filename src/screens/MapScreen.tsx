/**
 * EduSphere — screens/MapScreen.tsx
 * -----------------------------------------------------------------------
 * Campus Study Group & Resource Finder — Study Spaces Screen
 *
 * Real KNUST study locations (libraries, discussion areas, reading rooms)
 * fetched from the backend and grouped by college, plus a compact visual
 * overview of the main campus cluster built from actual lat/lng — no map
 * SDK required. Two of the fourteen seeded spots (the CHS discussion
 * areas at Boadi and KATH) sit well off the main campus, so they're
 * excluded from the overview pins and flagged "Off main campus" in their
 * card instead of distorting the map's scale.
 *
 * Status (Open/Busy/Available/Closed) is entirely student-reported — there
 * is no live feed, so whatever the last person tapped is what's shown.
 * -----------------------------------------------------------------------
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Modal,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { ThemeColors, SHADOW } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useTabBarHeight } from '../navigation/useTabBarHeight';
import { EmptyState, LoadingView, ErrorView } from '../components/common';
import { useLocations, useReportLocationStatus } from '../hooks/useLocations';
import { CampusLocation, LocationStatus } from '../types/location';

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

// The overview map represents the walkable main campus — the Main
// Library's coordinates anchor that cluster. Anything more than ~2km out
// (Boadi, KATH) is a different part of Kumasi entirely and gets excluded
// from the pins so it doesn't collapse the whole main-campus cluster into
// one corner.
const MAIN_LIBRARY_COORD = { lat: 6.6745, lng: -1.5716 };
const MAIN_CAMPUS_RADIUS_DEG = 0.02;

function isOnMainCampus(location: CampusLocation): boolean {
  const dLat = location.latitude - MAIN_LIBRARY_COORD.lat;
  const dLng = location.longitude - MAIN_LIBRARY_COORD.lng;
  return Math.sqrt(dLat * dLat + dLng * dLng) < MAIN_CAMPUS_RADIUS_DEG;
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

  const STATUS_STYLES: Record<LocationStatus, { bg: string; color: string; label: string }> = {
    open: { bg: COLORS.successLight, color: COLORS.success, label: t('map.statusOpen') },
    available: { bg: COLORS.primaryLight, color: COLORS.primary, label: t('map.statusAvailable') },
    busy: { bg: COLORS.dangerLight, color: COLORS.danger, label: t('map.statusBusy') },
    closed: { bg: COLORS.chipBg, color: COLORS.textMuted, label: t('map.statusClosed') },
  };

  const locationsQuery = useLocations();
  const reportStatusMutation = useReportLocationStatus();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCollege, setActiveCollege] = useState<string>('All');
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [reportTarget, setReportTarget] = useState<CampusLocation | null>(null);

  const locations = useMemo(() => locationsQuery.data?.items ?? [], [locationsQuery.data]);

  const collegeOptions = useMemo(() => {
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

  const groupedSections = useMemo(() => {
    const groups = new Map<string, CampusLocation[]>();
    for (const loc of filteredLocations) {
      const key = loc.college ?? CAMPUS_WIDE_KEY;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(loc);
    }
    return Array.from(groups.entries()).sort(([a], [b]) => {
      if (a === CAMPUS_WIDE_KEY) return -1;
      if (b === CAMPUS_WIDE_KEY) return 1;
      return a.localeCompare(b);
    });
  }, [filteredLocations]);

  const mapPins = useMemo(() => {
    const onCampus = locations.filter(isOnMainCampus);
    if (onCampus.length === 0) return [];
    const lats = onCampus.map((l) => l.latitude);
    const lngs = onCampus.map((l) => l.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const latRange = maxLat - minLat || 1;
    const lngRange = maxLng - minLng || 1;
    const PAD = 14;
    return onCampus.map((loc) => ({
      location: loc,
      leftPct: ((loc.longitude - minLng) / lngRange) * (100 - PAD * 2) + PAD,
      topPct: (1 - (loc.latitude - minLat) / latRange) * (100 - PAD * 2) + PAD,
    }));
  }, [locations]);

  const selectedPin = mapPins.find((p) => p.location.id === selectedPinId) ?? null;

  const handleSubmitReport = (status: LocationStatus) => {
    if (!reportTarget) return;
    reportStatusMutation.mutate(
      { locationId: reportTarget.id, status },
      { onSuccess: () => setReportTarget(null) }
    );
  };

  // No maps SDK in the app, so directions hand off to whatever the phone
  // already has — Google Maps app if installed, otherwise a browser.
  const handleGetDirections = (location: CampusLocation) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
    Linking.openURL(url).catch(() => undefined);
  };

  const isLoading = locationsQuery.isLoading;
  const isError = !locationsQuery.data && locationsQuery.isError;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={COLORS.background} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ---------------------------------------------------------- */}
        {/* HEADER                                                      */}
        {/* ---------------------------------------------------------- */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('map.title')}</Text>
          <Text style={styles.headerSubtitle}>{t('map.subtitle')}</Text>
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
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name="x" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* ---------------------------------------------------------- */}
        {/* COLLEGE FILTER CHIPS                                        */}
        {/* ---------------------------------------------------------- */}
        {collegeOptions.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {collegeOptions.map((option) => {
              const isActive = activeCollege === option.key;
              return (
                <TouchableOpacity
                  key={option.key}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  activeOpacity={0.8}
                  onPress={() => setActiveCollege(option.key)}
                >
                  <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {isLoading ? (
          <LoadingView message={t('map.loading')} />
        ) : isError ? (
          <ErrorView message={t('map.loadError')} onRetry={() => locationsQuery.refetch()} />
        ) : (
          <>
            {/* -------------------------------------------------------- */}
            {/* CAMPUS OVERVIEW                                           */}
            {/* -------------------------------------------------------- */}
            {mapPins.length > 0 && (
              <View style={styles.mapSection}>
                <View style={styles.mapCard}>
                  <View style={[styles.mapRoad, { top: '30%', left: '-10%', width: '120%', transform: [{ rotate: '-6deg' }] }]} />
                  <View style={[styles.mapRoad, { top: '62%', left: '-10%', width: '120%', transform: [{ rotate: '4deg' }] }]} />
                  <View style={[styles.mapRoadVertical, { left: '35%', top: '-10%', height: '120%', transform: [{ rotate: '3deg' }] }]} />
                  <View style={[styles.mapRoadVertical, { left: '72%', top: '-10%', height: '120%', transform: [{ rotate: '-4deg' }] }]} />
                  <View style={[styles.mapGreenSpace, { top: '10%', left: '45%', width: 90, height: 60 }]} />
                  <View style={[styles.mapGreenSpace, { top: '55%', left: '8%', width: 70, height: 50 }]} />

                  {mapPins.map(({ location, leftPct, topPct }) => {
                    const isSelected = location.id === selectedPinId;
                    return (
                      <TouchableOpacity
                        key={location.id}
                        style={[styles.mapMarkerWrap, { top: `${topPct}%`, left: `${leftPct}%` }]}
                        activeOpacity={0.85}
                        onPress={() => setSelectedPinId(isSelected ? null : location.id)}
                      >
                        {isSelected && <View style={styles.mapMarkerPulse} />}
                        <View style={[styles.mapPin, isSelected && styles.mapPinSelected]}>
                          <Feather name={location.category === 'Library' ? 'book-open' : 'edit-3'} size={isSelected ? 15 : 12} color={COLORS.white} />
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {selectedPin ? (
                  <View style={styles.pinCallout}>
                    <View style={styles.pinCalloutInfo}>
                      <Text style={styles.pinCalloutName} numberOfLines={1}>
                        {selectedPin.location.name}
                      </Text>
                      <View
                        style={[
                          styles.statusChip,
                          { backgroundColor: STATUS_STYLES[selectedPin.location.status ?? 'closed'].bg, alignSelf: 'flex-start', marginTop: 6 },
                        ]}
                      >
                        <View style={[styles.statusDot, { backgroundColor: selectedPin.location.status ? STATUS_STYLES[selectedPin.location.status].color : COLORS.textMuted }]} />
                        <Text style={[styles.statusChipText, { color: selectedPin.location.status ? STATUS_STYLES[selectedPin.location.status].color : COLORS.textMuted }]}>
                          {selectedPin.location.status ? STATUS_STYLES[selectedPin.location.status].label : t('map.statusUnknown')}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.pinCalloutIconButton}
                      activeOpacity={0.85}
                      onPress={() => handleGetDirections(selectedPin.location)}
                    >
                      <Feather name="navigation" size={15} color={COLORS.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.pinCalloutReportButton}
                      activeOpacity={0.85}
                      onPress={() => setReportTarget(selectedPin.location)}
                    >
                      <Text style={styles.pinCalloutReportButtonText}>{t('map.reportStatus')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setSelectedPinId(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Feather name="x" size={16} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text style={styles.mapHint}>{t('map.tapPinHint')}</Text>
                )}
              </View>
            )}

            {/* -------------------------------------------------------- */}
            {/* STUDY SPACES, GROUPED BY COLLEGE                          */}
            {/* -------------------------------------------------------- */}
            {groupedSections.length === 0 ? (
              <EmptyState
                icon="map-pin"
                title={t('map.noLocationsFound')}
                subtitle={t('map.noLocationsSubtitle')}
                actionLabel={t('map.showAllLocations')}
                onAction={() => {
                  setSearchQuery('');
                  setActiveCollege('All');
                }}
              />
            ) : (
              groupedSections.map(([collegeKey, spots]) => (
                <View key={collegeKey} style={styles.collegeSection}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                      {collegeKey === CAMPUS_WIDE_KEY ? t('map.filterCampusWide') : collegeShortLabel(collegeKey)}
                    </Text>
                  </View>

                  <View style={styles.stackedCards}>
                    {spots.map((spot) => {
                      const statusInfo = spot.status ? STATUS_STYLES[spot.status] : null;
                      return (
                        <View key={spot.id} style={styles.spotCard}>
                          <View style={styles.spotTopRow}>
                            <View style={styles.spotIconWrap}>
                              <Feather name={spot.category === 'Library' ? 'book-open' : 'edit-3'} size={16} color={COLORS.primary} />
                            </View>
                            <View style={styles.spotInfo}>
                              <Text style={styles.spotName}>{spot.name}</Text>
                              {!isOnMainCampus(spot) && (
                                <Text style={styles.offCampusText}>{t('map.offMainCampus')}</Text>
                              )}
                            </View>
                          </View>

                          {spot.description ? <Text style={styles.spotDescription}>{spot.description}</Text> : null}

                          <View style={styles.spotFooterRow}>
                            <TouchableOpacity
                              style={[styles.statusChip, { backgroundColor: statusInfo?.bg ?? COLORS.chipBg }]}
                              activeOpacity={0.8}
                              onPress={() => setReportTarget(spot)}
                            >
                              <View style={[styles.statusDot, { backgroundColor: statusInfo?.color ?? COLORS.textMuted }]} />
                              <Text style={[styles.statusChipText, { color: statusInfo?.color ?? COLORS.textMuted }]}>
                                {statusInfo?.label ?? t('map.statusUnknown')}
                              </Text>
                            </TouchableOpacity>

                            <View style={styles.spotActionsRow}>
                              <TouchableOpacity
                                style={styles.directionsButton}
                                activeOpacity={0.85}
                                onPress={() => handleGetDirections(spot)}
                              >
                                <Feather name="navigation" size={12} color={COLORS.primary} />
                                <Text style={styles.directionsButtonText}>{t('map.getDirections')}</Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={styles.reportButton}
                                activeOpacity={0.85}
                                onPress={() => setReportTarget(spot)}
                              >
                                <Feather name="edit-2" size={12} color={COLORS.primary} />
                                <Text style={styles.reportButtonText}>{t('map.reportStatus')}</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>

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
                const info = STATUS_STYLES[status];
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
    </SafeAreaView>
  );
};

export default MapScreen;

// -----------------------------------------------------------------------
// STYLES
// -----------------------------------------------------------------------
const CARD_GAP = 14;
const H_PADDING = 20;
const MAP_HEIGHT = 240;

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

    // ---------------- MAP SECTION ----------------
    mapSection: {
      paddingHorizontal: H_PADDING,
      marginBottom: 20,
    },
    mapCard: {
      height: MAP_HEIGHT,
      borderRadius: 20,
      backgroundColor: '#EAF0FB',
      overflow: 'hidden',
      ...SHADOW,
    },
    mapRoad: {
      position: 'absolute',
      height: 10,
      backgroundColor: '#DCE3F5',
    },
    mapRoadVertical: {
      position: 'absolute',
      width: 10,
      backgroundColor: '#DCE3F5',
    },
    mapGreenSpace: {
      position: 'absolute',
      backgroundColor: '#DCEEE0',
      borderRadius: 14,
    },
    mapMarkerWrap: {
      position: 'absolute',
      alignItems: 'center',
      transform: [{ translateX: -14 }, { translateY: -14 }],
    },
    mapPin: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: COLORS.textSecondary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: COLORS.white,
      shadowColor: '#1B1F3B',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    mapPinSelected: {
      backgroundColor: COLORS.primary,
      width: 32,
      height: 32,
      borderRadius: 16,
    },
    mapMarkerPulse: {
      position: 'absolute',
      top: -6,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(45,63,224,0.15)',
    },
    mapHint: {
      textAlign: 'center',
      fontSize: 12,
      color: COLORS.textMuted,
      marginTop: 10,
    },
    pinCallout: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.card,
      borderRadius: 16,
      padding: 14,
      marginTop: 10,
      ...SHADOW,
    },
    pinCalloutInfo: {
      flex: 1,
    },
    pinCalloutName: {
      fontSize: 14,
      fontWeight: '700',
      color: COLORS.textPrimary,
    },
    pinCalloutIconButton: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: COLORS.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
    },
    pinCalloutReportButton: {
      backgroundColor: COLORS.primaryLight,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      marginRight: 10,
    },
    pinCalloutReportButtonText: {
      fontSize: 12,
      fontWeight: '700',
      color: COLORS.primary,
    },

    // ---------------- COLLEGE SECTIONS ----------------
    collegeSection: {
      marginBottom: 8,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: H_PADDING,
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 16.5,
      fontWeight: '700',
      color: COLORS.textPrimary,
    },
    stackedCards: {
      paddingHorizontal: H_PADDING,
    },

    // ---------------- STUDY SPOT CARD ----------------
    spotCard: {
      backgroundColor: COLORS.card,
      borderRadius: 18,
      padding: 16,
      marginBottom: CARD_GAP,
      ...SHADOW,
    },
    spotTopRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    spotIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: COLORS.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    spotInfo: {
      flex: 1,
    },
    spotName: {
      fontSize: 14.5,
      fontWeight: '700',
      color: COLORS.textPrimary,
    },
    offCampusText: {
      fontSize: 11,
      color: COLORS.textMuted,
      marginTop: 2,
    },
    spotDescription: {
      fontSize: 12.5,
      color: COLORS.textSecondary,
      lineHeight: 18,
      marginTop: 10,
    },
    spotFooterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 12,
    },
    statusChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 6,
    },
    statusChipText: {
      fontSize: 11.5,
      fontWeight: '700',
    },
    spotActionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    directionsButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 16,
    },
    directionsButtonText: {
      fontSize: 12,
      fontWeight: '600',
      color: COLORS.primary,
      marginLeft: 5,
    },
    reportButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    reportButtonText: {
      fontSize: 12,
      fontWeight: '600',
      color: COLORS.primary,
      marginLeft: 5,
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
      borderRadius: 20,
      padding: 20,
    },
    modalTitle: {
      fontSize: 15.5,
      fontWeight: '700',
      color: COLORS.textPrimary,
      marginBottom: 16,
      textAlign: 'center',
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
      paddingVertical: 12,
      borderRadius: 14,
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
  });
}
