import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme/colors';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>EduSphere</Text>
      <Text style={styles.tagline}>Find your people. Find your notes.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  logo: { ...typography.h1, color: colors.textInverse, fontSize: 34 },
  tagline: { ...typography.body, color: colors.textInverse, marginTop: spacing.sm, opacity: 0.85 },
});