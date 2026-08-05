/**
 * EduSphere — components/map/FloatingSearchBar.tsx
 * -----------------------------------------------------------------------
 * Solid white pill search bar floating above the tab bar on the Map
 * screen, with the college filter chips in a horizontal rail above it.
 * Animates in from the bottom on mount.
 * -----------------------------------------------------------------------
 */

import React, { memo } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { ThemeColors, SHADOW } from '../../theme/colors';

export interface FilterOption {
  key: string;
  label: string;
}

interface FloatingSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  filterOptions: FilterOption[];
  activeFilter: string;
  onSelectFilter: (key: string) => void;
}

const FloatingSearchBar: React.FC<FloatingSearchBarProps> = ({
  value,
  onChangeText,
  filterOptions,
  activeFilter,
  onSelectFilter,
}) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <Animated.View entering={FadeInDown.delay(120).springify().damping(16)}>
      {filterOptions.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRail}
          keyboardShouldPersistTaps="handled"
        >
          {filterOptions.map((option) => {
            const isActive = option.key === activeFilter;
            return (
              <TouchableOpacity
                key={option.key}
                activeOpacity={0.85}
                onPress={() => onSelectFilter(option.key)}
                style={[styles.chip, isActive && styles.chipActive]}
              >
                {isActive && <View style={styles.chipActiveDot} />}
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{option.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      <View style={styles.pill}>
        <View style={styles.searchIconWrap}>
          <Feather name="search" size={16} color={colors.textMuted} />
        </View>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={t('map.searchPlaceholder')}
          placeholderTextColor={colors.textMuted}
          returnKeyType="search"
        />
        {value.length > 0 && (
          <TouchableOpacity
            onPress={() => onChangeText('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="x" size={15} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    chipRail: {
      paddingHorizontal: 2,
      paddingBottom: 10,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      paddingHorizontal: 14,
      paddingVertical: 8.5,
      borderRadius: 20,
      marginRight: 8,
      ...SHADOW,
      shadowOpacity: 0.08,
    },
    chipActive: {
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOpacity: 0.35,
      shadowOffset: { width: 0, height: 3 },
      shadowRadius: 8,
    },
    chipActiveDot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: colors.white,
      marginRight: 6,
    },
    chipText: {
      fontSize: 12.5,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    chipTextActive: {
      color: colors.white,
      fontWeight: '700',
    },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 28,
      height: 56,
      paddingHorizontal: 16,
      ...SHADOW,
      shadowOpacity: 0.16,
      shadowRadius: 16,
    },
    searchIconWrap: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.chipBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    input: {
      flex: 1,
      marginLeft: 10,
      marginRight: 8,
      fontSize: 14.5,
      fontWeight: '500',
      color: colors.textPrimary,
    },
  });
}

export default memo(FloatingSearchBar);
