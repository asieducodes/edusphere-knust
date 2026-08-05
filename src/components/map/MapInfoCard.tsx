/**
 * EduSphere — components/map/MapInfoCard.tsx
 * -----------------------------------------------------------------------
 * Floating glassmorphic card for the selected study spot: the real photo
 * on top (falling back to the marker art for uncurated spots), then
 * details, status chip, distance/walk time (when the server computed
 * distanceKm), and the Directions / Report CTAs. Slides up over the
 * search bar with Reanimated.
 * -----------------------------------------------------------------------
 */

import React, { memo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { ThemeColors, SHADOW } from '../../theme/colors';
import { CampusLocation, LocationStatus } from '../../types/location';
import { getCampusBuilding, MARKER_IMAGES } from '../../data/campusBuildings';

const AVERAGE_WALK_KMH = 4.6;

interface MapInfoCardProps {
  location: CampusLocation;
  onClose: () => void;
  onGetDirections: (location: CampusLocation) => void;
  onReportStatus: (location: CampusLocation) => void;
}

const MapInfoCard: React.FC<MapInfoCardProps> = ({
  location,
  onClose,
  onGetDirections,
  onReportStatus,
}) => {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const building = getCampusBuilding(location.name);

  const statusStyles: Record<LocationStatus, { bg: string; color: string; label: string }> = {
    open: { bg: colors.successLight, color: colors.success, label: t('map.statusOpen') },
    available: { bg: colors.primaryLight, color: colors.primary, label: t('map.statusAvailable') },
    busy: { bg: colors.dangerLight, color: colors.danger, label: t('map.statusBusy') },
    closed: { bg: colors.chipBg, color: colors.textMuted, label: t('map.statusClosed') },
  };
  const status = location.status ? statusStyles[location.status] : null;

  const walkMinutes =
    location.distanceKm != null ? Math.max(1, Math.round((location.distanceKm / AVERAGE_WALK_KMH) * 60)) : null;

  return (
    <Animated.View entering={FadeInDown.springify().damping(18)} exiting={FadeOutDown.duration(180)} style={styles.wrapper}>
      <View style={styles.cardBody}>
        <View style={styles.dragHandleWrap}>
          <View style={styles.dragHandle} />
        </View>

        <View style={styles.hero}>
          <LinearGradient
            colors={isDark ? [colors.primaryLight, colors.card] : [colors.primarySoft, colors.card]}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.85, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <Image
            source={building.heroImage ?? MARKER_IMAGES[building.modelKey]}
            style={styles.heroImage}
            resizeMode={building.heroImage ? 'cover' : 'contain'}
          />
          <LinearGradient
            colors={['transparent', colors.card]}
            style={styles.heroScrim}
            pointerEvents="none"
          />
        </View>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="x" size={16} color={colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.body}>
            <View style={styles.titleRow}>
              {building.heroImage && <Image source={building.heroImage} style={styles.heroThumb} />}
              <View style={styles.titleTexts}>
                <Text style={styles.name} numberOfLines={2}>
                  {location.name}
                </Text>
                <View style={styles.chipsRow}>
                  <View style={styles.collegeTag}>
                    <Text style={styles.college} numberOfLines={1}>
                      {location.college ?? t('map.filterCampusWide')}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.metaRow}>
              <TouchableOpacity
                style={[styles.statusChip, { backgroundColor: status?.bg ?? colors.chipBg }]}
                activeOpacity={0.8}
                onPress={() => onReportStatus(location)}
              >
                <View style={[styles.statusDot, { backgroundColor: status?.color ?? colors.textMuted }]} />
                <Text style={[styles.statusChipText, { color: status?.color ?? colors.textMuted }]}>
                  {status?.label ?? t('map.statusUnknown')}
                </Text>
              </TouchableOpacity>

              {location.distanceKm != null && walkMinutes != null && (
                <View style={styles.distanceWrap}>
                  <Feather name="map-pin" size={12} color={colors.textMuted} />
                  <Text style={styles.distanceText}>
                    {t('map.kmAway', { km: location.distanceKm.toFixed(1) })} · {t('map.minWalk', { min: String(walkMinutes) })}
                  </Text>
                </View>
              )}
            </View>

            {location.description ? (
              <Text style={styles.description} numberOfLines={3}>
                {location.description}
              </Text>
            ) : null}

            {building.attribution ? <Text style={styles.attribution}>{building.attribution}</Text> : null}

            <View style={styles.ctaRow}>
              <TouchableOpacity
                style={styles.primaryCta}
                activeOpacity={0.85}
                onPress={() => onGetDirections(location)}
              >
                <Feather name="navigation" size={15} color={colors.white} />
                <Text style={styles.primaryCtaText}>{t('map.getDirections')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryCta}
                activeOpacity={0.85}
                onPress={() => onReportStatus(location)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                accessibilityLabel={t('map.reportStatus')}
              >
                <Feather name="edit-2" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
    </Animated.View>
  );
};

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    wrapper: {
      borderRadius: 28,
      overflow: 'hidden',
      ...SHADOW,
      shadowOpacity: 0.2,
      shadowRadius: 20,
    },
    cardBody: {
      backgroundColor: colors.card,
    },
    dragHandleWrap: {
      position: 'absolute',
      top: 9,
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 2,
    },
    dragHandle: {
      width: 36,
      height: 4.5,
      borderRadius: 3,
      backgroundColor: 'rgba(120,120,128,0.4)',
    },
    hero: {
      height: 178,
      overflow: 'hidden',
    },
    heroImage: {
      width: '100%',
      height: '100%',
    },
    heroScrim: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: 46,
    },
    closeButton: {
      position: 'absolute',
      top: 14,
      right: 14,
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2,
      ...SHADOW,
      shadowOpacity: 0.14,
    },
    body: {
      paddingHorizontal: 18,
      paddingTop: 14,
      paddingBottom: 16,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    heroThumb: {
      width: 52,
      height: 52,
      borderRadius: 14,
      marginRight: 12,
    },
    titleTexts: {
      flex: 1,
    },
    name: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
      letterSpacing: -0.2,
    },
    chipsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 5,
    },
    collegeTag: {
      backgroundColor: colors.chipBg,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      maxWidth: '100%',
    },
    college: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
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
    distanceWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 12,
      flexShrink: 1,
    },
    distanceText: {
      fontSize: 12,
      color: colors.textMuted,
      marginLeft: 4,
    },
    description: {
      fontSize: 12.5,
      lineHeight: 18,
      color: colors.textSecondary,
      marginTop: 10,
    },
    attribution: {
      fontSize: 10,
      color: colors.textMuted,
      marginTop: 8,
    },
    ctaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 14,
    },
    primaryCta: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingVertical: 13,
      marginRight: 10,
      ...SHADOW,
      shadowColor: colors.primary,
      shadowOpacity: 0.3,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 10,
    },
    primaryCtaText: {
      fontSize: 13.5,
      fontWeight: '700',
      color: colors.white,
      marginLeft: 7,
    },
    secondaryCta: {
      width: 46,
      height: 46,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.chipBg,
      borderRadius: 16,
    },
  });
}

export default memo(MapInfoCard);
