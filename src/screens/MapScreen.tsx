import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography, radius } from '../theme/colors';

/**
 * NOTE: this is a UI shell only. We haven't yet verified whether
 * react-native-maps works cleanly in plain Expo Go on the current SDK,
 * or needs a custom EAS dev build — that check is still pending (see
 * project backlog). The actual <MapView> integration is intentionally
 * deferred until that's confirmed, so we don't build against an API
 * that might need to change.
 */
export default function MapScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.placeholderText}>Campus map integration pending</Text>
      </View>

      <View style={styles.controls}>
        <Pressable style={styles.controlButton} onPress={() => {}}>
          <Text style={styles.controlText}>My Location</Text>
        </Pressable>
        <Pressable style={styles.controlButton} onPress={() => {}}>
          <Text style={styles.controlText}>Recenter</Text>
        </Pressable>
      </View>

      <View style={styles.nearbyPanel}>
        <Text style={styles.nearbyTitle}>Nearby study spots</Text>
        <Text style={styles.mutedText}>Nothing to show yet — connect the backend location endpoint.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: { ...typography.body, color: colors.textSecondary },
  controls: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    gap: spacing.sm,
  },
  controlButton: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  controlText: { ...typography.caption, color: colors.primary, fontWeight: '600' },
  nearbyPanel: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  nearbyTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.xs },
  mutedText: { ...typography.bodySmall, color: colors.textSecondary },
});