/**
 * EduSphere — components/map/MapControls.tsx
 * -----------------------------------------------------------------------
 * Solid white circular buttons floating on the map: recenter to the
 * campus overview and jump to the student's own location (when granted).
 * -----------------------------------------------------------------------
 */

import React, { memo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { ThemeColors, SHADOW } from '../../theme/colors';

interface MapControlsProps {
  onRecenter: () => void;
  onLocateMe?: () => void;
}

const MapControls: React.FC<MapControlsProps> = ({ onRecenter, onLocateMe }) => {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <Animated.View entering={FadeInDown.delay(200).springify().damping(16)} style={styles.capsule}>
      <TouchableOpacity style={styles.button} activeOpacity={0.75} onPress={onRecenter} hitSlop={4}>
        <Feather name="compass" size={19} color={colors.textPrimary} />
      </TouchableOpacity>
      {onLocateMe && (
        <>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.button} activeOpacity={0.75} onPress={onLocateMe} hitSlop={4}>
            <Feather name="crosshair" size={19} color={colors.primary} />
          </TouchableOpacity>
        </>
      )}
    </Animated.View>
  );
};

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    capsule: {
      backgroundColor: colors.card,
      borderRadius: 24,
      ...SHADOW,
      shadowOpacity: 0.16,
    },
    divider: {
      height: 1,
      marginHorizontal: 10,
      backgroundColor: colors.border,
    },
    button: {
      width: 48,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}

export default memo(MapControls);
