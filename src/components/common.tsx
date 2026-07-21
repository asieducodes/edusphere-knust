/**
 * EduSphere — components/common.tsx
 * -----------------------------------------------------------------------
 * Shared, screen-agnostic UI building blocks used across the app's form
 * and detail screens (CreateGroupScreen, ResourceDetailsScreen,
 * UploadResourceScreen, EditProfileScreen, and future screens).
 *
 * These are intentionally generic — they don't know about groups,
 * resources, or profiles specifically. Screens compose them with their
 * own data and copy.
 *
 * Styles are built per-render from useTheme()'s resolved colors rather
 * than a module-scope StyleSheet.create — colors get baked into a style
 * object the moment it's created, so a static StyleSheet.create can never
 * react to a later Light/Dark/System change (see theme/colors.ts).
 * -----------------------------------------------------------------------
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
  TextInputProps,
  ActivityIndicator,
  Animated,
  Easing,
  DimensionValue,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { ThemeColors } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

function useCommonStyles() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return { styles, COLORS: colors };
}

// -----------------------------------------------------------------------
// ScreenHeader — back button + title (+ optional subtitle/right icon)
// -----------------------------------------------------------------------
interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  rightIcon?: keyof typeof Feather.glyphMap;
  onPressRight?: () => void;
  rightText?: string; // e.g. "Save" as a text button instead of an icon
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  onBack,
  rightIcon,
  onPressRight,
  rightText,
}) => {
  const { styles, COLORS } = useCommonStyles();
  return (
    <View style={styles.headerWrap}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.headerIconButton} activeOpacity={0.7} onPress={onBack}>
          <Feather name="arrow-left" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>

        {rightText ? (
          <TouchableOpacity onPress={onPressRight} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.headerRightText}>{rightText}</Text>
          </TouchableOpacity>
        ) : rightIcon ? (
          <TouchableOpacity style={styles.headerIconButton} activeOpacity={0.7} onPress={onPressRight}>
            <Feather name={rightIcon} size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
        ) : (
          // Empty spacer keeps the title visually centered when there's no right element
          <View style={styles.headerIconButton} />
        )}
      </View>
      {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
    </View>
  );
};

// -----------------------------------------------------------------------
// AppTextInput — labeled input with optional multiline + error state
// -----------------------------------------------------------------------
interface AppTextInputProps extends TextInputProps {
  label: string;
  error?: string;
  disabled?: boolean;
}

export const AppTextInput: React.FC<AppTextInputProps> = ({
  label,
  error,
  disabled,
  multiline,
  style,
  ...rest
}) => {
  const { styles, COLORS } = useCommonStyles();
  return (
    <View style={styles.inputWrap}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[
          styles.textInput,
          multiline && styles.textInputMultiline,
          disabled && styles.textInputDisabled,
          error && styles.textInputError,
          style,
        ]}
        placeholderTextColor={COLORS.textMuted}
        multiline={multiline}
        editable={!disabled}
        {...rest}
      />
      {error ? (
        <View style={styles.errorRow}>
          <Feather name="alert-circle" size={12} color={COLORS.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
};

// -----------------------------------------------------------------------
// SelectableChip — toggleable pill used for categories, tags, interests
// -----------------------------------------------------------------------
interface SelectableChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export const SelectableChip: React.FC<SelectableChipProps> = ({ label, selected, onPress }) => {
  const { styles } = useCommonStyles();
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
};

// -----------------------------------------------------------------------
// SectionCard — white rounded card wrapper with optional title
// -----------------------------------------------------------------------
interface SectionCardProps {
  title?: string;
  children: React.ReactNode;
  style?: object;
}

export const SectionCard: React.FC<SectionCardProps> = ({ title, children, style }) => {
  const { styles } = useCommonStyles();
  return (
    <View style={[styles.sectionCard, style]}>
      {title ? <Text style={styles.sectionCardTitle}>{title}</Text> : null}
      {children}
    </View>
  );
};

// -----------------------------------------------------------------------
// InfoRow — icon + label + value, used in metadata/detail lists
// -----------------------------------------------------------------------
interface InfoRowProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  isLast?: boolean;
}

export const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value, isLast }) => {
  const { styles, COLORS } = useCommonStyles();
  return (
    <View style={[styles.infoRow, !isLast && styles.infoRowDivider]}>
      <View style={styles.infoIconWrap}>
        <Feather name={icon} size={15} color={COLORS.primary} />
      </View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
};

// -----------------------------------------------------------------------
// ToggleRow — icon + label (+ subtitle) + switch
// -----------------------------------------------------------------------
interface ToggleRowProps {
  icon?: keyof typeof Feather.glyphMap;
  label: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  isLast?: boolean;
}

export const ToggleRow: React.FC<ToggleRowProps> = ({
  icon,
  label,
  subtitle,
  value,
  onValueChange,
  isLast,
}) => {
  const { styles, COLORS } = useCommonStyles();
  return (
    <View style={[styles.toggleRow, !isLast && styles.infoRowDivider]}>
      {icon ? (
        <View style={styles.infoIconWrap}>
          <Feather name={icon} size={15} color={COLORS.primary} />
        </View>
      ) : null}
      <View style={styles.toggleTextBlock}>
        <Text style={styles.toggleLabel}>{label}</Text>
        {subtitle ? <Text style={styles.toggleSubtitle}>{subtitle}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: COLORS.chipBg, true: COLORS.primarySoft }}
        thumbColor={value ? COLORS.primary : '#FFFFFF'}
        ios_backgroundColor={COLORS.chipBg}
      />
    </View>
  );
};

// -----------------------------------------------------------------------
// FileTypeBadge — color-coded PDF / DOCX / PPTX / ZIP badge
// -----------------------------------------------------------------------
type FileType = 'PDF' | 'DOCX' | 'PPTX' | 'ZIP';

const FILE_TYPE_STYLES: Record<FileType, { bg: string; color: string }> = {
  PDF: { bg: '#FDEAEA', color: '#D93A3A' },
  DOCX: { bg: '#E7EEFD', color: '#2D3FE0' },
  PPTX: { bg: '#FEF0E2', color: '#E08A1F' },
  ZIP: { bg: '#F1F2F8', color: '#5B6172' },
};

export const FileTypeBadge: React.FC<{ type: FileType }> = ({ type }) => {
  const { styles } = useCommonStyles();
  const style = FILE_TYPE_STYLES[type];
  return (
    <View style={[styles.fileBadge, { backgroundColor: style.bg }]}>
      <Text style={[styles.fileBadgeText, { color: style.color }]}>{type}</Text>
    </View>
  );
};

// -----------------------------------------------------------------------
// EmptyState — generic empty state, icon + title + subtitle (+ action)
// -----------------------------------------------------------------------
interface EmptyStateProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
}) => {
  const { styles, COLORS } = useCommonStyles();
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconWrap}>
        <Feather name={icon} size={24} color={COLORS.primary} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
      {actionLabel && onAction ? (
        <TouchableOpacity style={styles.emptyActionButton} onPress={onAction} activeOpacity={0.85}>
          <Text style={styles.emptyActionButtonText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

// -----------------------------------------------------------------------
// Shimmer — a single skeleton block with a light sweeping highlight, the
// building block LoadingView (below) composes into a placeholder layout.
// Plain Animated (no Reanimated in this project) driving a translateX
// loop, same approach as SplashScreen's animations.
// -----------------------------------------------------------------------
interface ShimmerProps {
  width: DimensionValue;
  height: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export const Shimmer: React.FC<ShimmerProps> = ({ width, height, borderRadius = 8, style }) => {
  const { colors: COLORS, isDark } = useTheme();
  const sweepAnim = useRef(new Animated.Value(0)).current;
  const [measuredWidth, setMeasuredWidth] = useState(0);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(sweepAnim, {
        toValue: 1,
        duration: 1100,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [sweepAnim]);

  // Falls back to a generous fixed distance until the first onLayout
  // reports the real width — the loop just runs once with a slightly-off
  // sweep before self-correcting, not worth blocking the animation on.
  const sweepDistance = measuredWidth || 200;
  const translateX = sweepAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-sweepDistance, sweepDistance],
  });

  return (
    <View
      onLayout={(e) => setMeasuredWidth(e.nativeEvent.layout.width)}
      style={[{ width, height, borderRadius, backgroundColor: COLORS.chipBg, overflow: 'hidden' }, style]}
    >
      <Animated.View style={[StyleSheet.absoluteFillObject, { width: sweepDistance, transform: [{ translateX }] }]}>
        <LinearGradient
          colors={isDark ? ['transparent', 'rgba(255,255,255,0.06)', 'transparent'] : ['transparent', 'rgba(255,255,255,0.7)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>
    </View>
  );
};

// -----------------------------------------------------------------------
// LoadingView — shimmering skeleton placeholder (+ optional message),
// fills its parent. Used everywhere a screen/section is fetching data.
// -----------------------------------------------------------------------
interface LoadingViewProps {
  message?: string;
}

export const LoadingView: React.FC<LoadingViewProps> = ({ message }) => {
  const { styles } = useCommonStyles();
  return (
    <View style={styles.loadingView}>
      <View style={styles.loadingShimmerBlock}>
        <Shimmer width="70%" height={14} style={{ marginBottom: 10 }} />
        <Shimmer width="100%" height={14} style={{ marginBottom: 10 }} />
        <Shimmer width="85%" height={14} />
      </View>
      {message ? <Text style={styles.loadingMessage}>{message}</Text> : null}
    </View>
  );
};

// -----------------------------------------------------------------------
// ErrorView — message + retry button, used when a fetch fails
// -----------------------------------------------------------------------
interface ErrorViewProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorView: React.FC<ErrorViewProps> = ({ message, onRetry }) => {
  const { styles, COLORS } = useCommonStyles();
  const { t } = useLanguage();
  return (
    <View style={styles.errorView}>
      <View style={styles.errorIconWrap}>
        <Feather name="alert-triangle" size={24} color={COLORS.danger} />
      </View>
      <Text style={styles.errorViewMessage}>{message ?? t('common.somethingWentWrong')}</Text>
      {onRetry ? (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.85}>
          <Feather name="refresh-cw" size={14} color={COLORS.white} />
          <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

// -----------------------------------------------------------------------
// PrimaryButton — main call-to-action, filled with primary color
// -----------------------------------------------------------------------
interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Feather.glyphMap;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  onPress,
  disabled,
  loading,
  icon,
}) => {
  const { styles, COLORS } = useCommonStyles();
  return (
    <TouchableOpacity
      style={[styles.primaryButton, (disabled || loading) && styles.primaryButtonDisabled]}
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.white} size="small" />
      ) : (
        <>
          {icon ? <Feather name={icon} size={17} color={COLORS.white} style={{ marginRight: 8 }} /> : null}
          <Text style={styles.primaryButtonText}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

// -----------------------------------------------------------------------
// SecondaryButton — outlined / soft-background secondary action
// -----------------------------------------------------------------------
interface SecondaryButtonProps {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Feather.glyphMap;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({ label, onPress, icon }) => {
  const { styles, COLORS } = useCommonStyles();
  return (
    <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.85} onPress={onPress}>
      {icon ? <Feather name={icon} size={16} color={COLORS.primary} style={{ marginRight: 8 }} /> : null}
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </TouchableOpacity>
  );
};

// -----------------------------------------------------------------------
// STYLES
// -----------------------------------------------------------------------
const H_PADDING = 20;

function createStyles(COLORS: ThemeColors) {
  const SHADOW = {
    shadowColor: '#1B1F3B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  };

  return StyleSheet.create({
    // ScreenHeader
    headerWrap: {
      paddingHorizontal: H_PADDING,
      paddingTop: 12,
      paddingBottom: 8,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerIconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: COLORS.card,
      alignItems: 'center',
      justifyContent: 'center',
      ...SHADOW,
    },
    headerTitle: {
      flex: 1,
      fontSize: 17,
      fontWeight: '700',
      color: COLORS.textPrimary,
      textAlign: 'center',
      marginHorizontal: 8,
    },
    headerRightText: {
      fontSize: 14,
      fontWeight: '700',
      color: COLORS.primary,
      minWidth: 40,
      textAlign: 'right',
    },
    headerSubtitle: {
      fontSize: 13,
      color: COLORS.textSecondary,
      textAlign: 'center',
      marginTop: 6,
    },

    // AppTextInput
    inputWrap: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 12.5,
      fontWeight: '600',
      color: COLORS.textPrimary,
      marginBottom: 7,
    },
    textInput: {
      backgroundColor: COLORS.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: COLORS.border,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 14,
      color: COLORS.textPrimary,
    },
    textInputMultiline: {
      minHeight: 90,
      textAlignVertical: 'top',
    },
    textInputDisabled: {
      backgroundColor: COLORS.chipBg,
      color: COLORS.textMuted,
    },
    textInputError: {
      borderColor: COLORS.danger,
    },
    errorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 6,
    },
    errorText: {
      fontSize: 11.5,
      color: COLORS.danger,
      marginLeft: 5,
    },

    // SelectableChip
    chip: {
      backgroundColor: COLORS.chipBg,
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 20,
      marginRight: 8,
      marginBottom: 8,
    },
    chipSelected: {
      backgroundColor: COLORS.primary,
    },
    chipText: {
      fontSize: 12.5,
      fontWeight: '600',
      color: COLORS.textSecondary,
    },
    chipTextSelected: {
      color: COLORS.white,
    },

    // SectionCard
    sectionCard: {
      backgroundColor: COLORS.card,
      borderRadius: 18,
      padding: 16,
      marginHorizontal: H_PADDING,
      marginBottom: 16,
      ...SHADOW,
    },
    sectionCardTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: COLORS.textPrimary,
      marginBottom: 12,
    },

    // InfoRow / ToggleRow (share the row + divider)
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 13,
    },
    infoRowDivider: {
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
    },
    infoIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: COLORS.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    infoLabel: {
      flex: 1,
      fontSize: 13,
      color: COLORS.textSecondary,
    },
    infoValue: {
      fontSize: 13,
      fontWeight: '600',
      color: COLORS.textPrimary,
      maxWidth: '50%',
      textAlign: 'right',
    },

    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 13,
    },
    toggleTextBlock: {
      flex: 1,
    },
    toggleLabel: {
      fontSize: 13.5,
      fontWeight: '600',
      color: COLORS.textPrimary,
    },
    toggleSubtitle: {
      fontSize: 11.5,
      color: COLORS.textMuted,
      marginTop: 2,
    },

    // FileTypeBadge
    fileBadge: {
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 8,
    },
    fileBadgeText: {
      fontSize: 10.5,
      fontWeight: '700',
    },

    // EmptyState
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 28,
      paddingHorizontal: 16,
    },
    emptyIconWrap: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: COLORS.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
    },
    emptyTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: COLORS.textPrimary,
      marginBottom: 5,
    },
    emptySubtitle: {
      fontSize: 12.5,
      color: COLORS.textSecondary,
      textAlign: 'center',
      lineHeight: 18,
      maxWidth: 260,
    },
    emptyActionButton: {
      backgroundColor: COLORS.primary,
      paddingHorizontal: 18,
      paddingVertical: 11,
      borderRadius: 12,
      marginTop: 16,
    },
    emptyActionButtonText: {
      fontSize: 13,
      fontWeight: '700',
      color: COLORS.white,
    },

    // LoadingView
    loadingView: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 48,
    },
    loadingShimmerBlock: {
      width: '70%',
    },
    loadingMessage: {
      fontSize: 13,
      color: COLORS.textSecondary,
      marginTop: 12,
    },

    // ErrorView
    errorView: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
      paddingHorizontal: 24,
    },
    errorIconWrap: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: COLORS.dangerLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
    },
    errorViewMessage: {
      fontSize: 13,
      color: COLORS.textSecondary,
      textAlign: 'center',
      lineHeight: 18,
      maxWidth: 260,
    },
    retryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.primary,
      paddingHorizontal: 18,
      paddingVertical: 11,
      borderRadius: 12,
      marginTop: 16,
    },
    retryButtonText: {
      fontSize: 13,
      fontWeight: '700',
      color: COLORS.white,
      marginLeft: 8,
    },

    // PrimaryButton
    primaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: COLORS.primary,
      borderRadius: 14,
      paddingVertical: 16,
    },
    primaryButtonDisabled: {
      backgroundColor: COLORS.primarySoft,
    },
    primaryButtonText: {
      fontSize: 14.5,
      fontWeight: '700',
      color: COLORS.white,
    },

    // SecondaryButton
    secondaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: COLORS.primaryLight,
      borderRadius: 14,
      paddingVertical: 15,
    },
    secondaryButtonText: {
      fontSize: 14,
      fontWeight: '700',
      color: COLORS.primary,
    },
  });
}
