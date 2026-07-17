/**
 * EduSphere — screens/CreateGroupScreen.tsx
 * -----------------------------------------------------------------------
 * Form screen for creating a new study group. Opens on top of the tabs
 * (see navigation/AppNavigator.tsx). Uses the shared components in
 * components/common.tsx so this stays visually consistent with the rest
 * of EduSphere without redefining input/chip/button styles locally.
 * -----------------------------------------------------------------------
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ThemeColors } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { RootStackParamList } from '../navigation/types';
import {
  ScreenHeader,
  AppTextInput,
  SelectableChip,
  SectionCard,
  ToggleRow,
  PrimaryButton,
} from '../components/common';
import { useCreateGroup } from '../hooks/useGroups';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateGroup'>;

// -----------------------------------------------------------------------
// STATIC SAMPLE DATA
// -----------------------------------------------------------------------
const TAG_OPTIONS = [
  'Exam Prep',
  'Assignment Help',
  'Discussion',
  'Resource Sharing',
  'Tutorial',
  'Revision',
  'Project Work',
];

const TAG_LABEL_KEYS: Record<string, string> = {
  'Exam Prep': 'groups.filterExamPrep',
  'Assignment Help': 'groups.filterAssignmentHelp',
  Discussion: 'groups.filterDiscussion',
  'Resource Sharing': 'groups.filterResourceSharing',
  Tutorial: 'groups.filterTutorial',
  Revision: 'groups.filterRevision',
  'Project Work': 'groups.filterProjectWork',
};

type GroupType = 'Public' | 'Private';

const CreateGroupScreen: React.FC<Props> = ({ navigation }) => {
  const { colors: COLORS, isDark } = useTheme();
  const { t } = useLanguage();
  const styles = React.useMemo(() => createStyles(COLORS), [COLORS]);

  // ---- Form state -------------------------------------------------
  const [groupName, setGroupName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [groupType, setGroupType] = useState<GroupType>('Public');
  const [maxMembers, setMaxMembers] = useState('');
  const [allowUploads, setAllowUploads] = useState(true);
  const [allowInvites, setAllowInvites] = useState(true);

  const [meetingLocation, setMeetingLocation] = useState('');
  const [meetingDay, setMeetingDay] = useState('');
  const [meetingTime, setMeetingTime] = useState('');

  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const createGroupMutation = useCreateGroup();
  const isSubmitting = createGroupMutation.isPending;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // ---- Validation ---------------------------------------------------
  // Required: Group Name, Course Code, Course Title. Errors only show
  // after the first submit attempt, so the form doesn't feel accusatory
  // while the student is still typing.
  const errors = useMemo(() => {
    if (!submitted) return {};
    return {
      groupName: groupName.trim().length === 0 ? t('createGroup.groupNameRequired') : undefined,
      courseCode: courseCode.trim().length === 0 ? t('createGroup.courseCodeRequired') : undefined,
      courseTitle: courseTitle.trim().length === 0 ? t('createGroup.courseTitleRequired') : undefined,
    };
  }, [submitted, groupName, courseCode, courseTitle, t]);

  const isFormValid =
    groupName.trim().length > 0 && courseCode.trim().length > 0 && courseTitle.trim().length > 0;

  const handleCreate = () => {
    setSubmitted(true);
    setServerError(null);
    if (!isFormValid) return;

    createGroupMutation.mutate(
      {
        name: groupName.trim(),
        courseCode: courseCode.trim(),
        courseTitle: courseTitle.trim(),
        description: description.trim(),
        tags: selectedTags,
        groupType,
        maxMembers: maxMembers.trim() ? parseInt(maxMembers, 10) : undefined,
        allowMemberUploads: allowUploads,
        allowMemberInvites: allowInvites,
        meetingLocation: meetingLocation.trim() || undefined,
        meetingDay: meetingDay.trim() || undefined,
        meetingTime: meetingTime.trim() || undefined,
      },
      {
        onSuccess: (group) => navigation.replace('GroupDetails', { groupId: group.id }),
        onError: (err) => {
          const message = (err as { message?: string })?.message ?? t('common.somethingWentWrong');
          setServerError(message);
        },
      }
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={COLORS.background} />

      <ScreenHeader
        title={t('createGroup.title')}
        subtitle={t('createGroup.subtitle')}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ---------------------------------------------------------- */}
        {/* INTRO CARD                                                  */}
        {/* ---------------------------------------------------------- */}
        <View style={styles.introCard}>
          <View style={styles.introIconWrap}>
            <Feather name="users" size={20} color={COLORS.white} />
          </View>
          <Text style={styles.introText}>
            {t('createGroup.introText')}
          </Text>
        </View>

        {/* ---------------------------------------------------------- */}
        {/* GROUP INFORMATION                                           */}
        {/* ---------------------------------------------------------- */}
        <SectionCard title={t('createGroup.groupInformation')}>
          <AppTextInput
            label={t('createGroup.groupNameLabel')}
            placeholder={t('createGroup.groupNamePlaceholder')}
            value={groupName}
            onChangeText={setGroupName}
            error={errors.groupName}
          />
          <AppTextInput
            label={t('createGroup.courseCodeLabel')}
            placeholder={t('createGroup.courseCodePlaceholder')}
            value={courseCode}
            onChangeText={setCourseCode}
            autoCapitalize="characters"
            error={errors.courseCode}
          />
          <AppTextInput
            label={t('createGroup.courseTitleLabel')}
            placeholder={t('createGroup.courseTitlePlaceholder')}
            value={courseTitle}
            onChangeText={setCourseTitle}
            error={errors.courseTitle}
          />
          <AppTextInput
            label={t('createGroup.descriptionLabel')}
            placeholder={t('createGroup.descriptionPlaceholder')}
            value={description}
            onChangeText={setDescription}
            multiline
            style={{ marginBottom: 0 }}
          />
        </SectionCard>

        {/* ---------------------------------------------------------- */}
        {/* CATEGORY / TAGS                                             */}
        {/* ---------------------------------------------------------- */}
        <SectionCard title={t('createGroup.groupCategory')}>
          <View style={styles.chipsWrap}>
            {TAG_OPTIONS.map((tag) => (
              <SelectableChip
                key={tag}
                label={t(TAG_LABEL_KEYS[tag])}
                selected={selectedTags.includes(tag)}
                onPress={() => toggleTag(tag)}
              />
            ))}
          </View>
        </SectionCard>

        {/* ---------------------------------------------------------- */}
        {/* GROUP SETTINGS                                              */}
        {/* ---------------------------------------------------------- */}
        <SectionCard title={t('createGroup.groupSettings')}>
          <Text style={styles.inlineLabel}>{t('createGroup.groupType')}</Text>
          <View style={styles.groupTypeRow}>
            {(['Public', 'Private'] as GroupType[]).map((type) => {
              const isActive = groupType === type;
              return (
                <View key={type} style={styles.groupTypeOptionWrap}>
                  <SelectableChip
                    label={type === 'Public' ? t('createGroup.typePublic') : t('createGroup.typePrivate')}
                    selected={isActive}
                    onPress={() => setGroupType(type)}
                  />
                </View>
              );
            })}
          </View>

          <AppTextInput
            label={t('createGroup.maxMembersLabel')}
            placeholder={t('createGroup.maxMembersPlaceholder')}
            value={maxMembers}
            onChangeText={setMaxMembers}
            keyboardType="number-pad"
            style={{ marginTop: 4 }}
          />

          <ToggleRow
            label={t('createGroup.allowUploads')}
            value={allowUploads}
            onValueChange={setAllowUploads}
          />
          <ToggleRow
            label={t('createGroup.allowInvites')}
            value={allowInvites}
            onValueChange={setAllowInvites}
            isLast
          />
        </SectionCard>

        {/* ---------------------------------------------------------- */}
        {/* MEETING DETAILS (optional)                                  */}
        {/* ---------------------------------------------------------- */}
        <SectionCard title={t('createGroup.meetingDetails')}>
          <AppTextInput
            label={t('createGroup.meetingLocationLabel')}
            placeholder={t('createGroup.meetingLocationPlaceholder')}
            value={meetingLocation}
            onChangeText={setMeetingLocation}
          />
          <View style={styles.meetingRow}>
            <View style={styles.meetingHalf}>
              <AppTextInput
                label={t('createGroup.meetingDayLabel')}
                placeholder={t('createGroup.meetingDayPlaceholder')}
                value={meetingDay}
                onChangeText={setMeetingDay}
                style={{ marginBottom: 0 }}
              />
            </View>
            <View style={styles.meetingHalf}>
              <AppTextInput
                label={t('createGroup.meetingTimeLabel')}
                placeholder={t('createGroup.meetingTimePlaceholder')}
                value={meetingTime}
                onChangeText={setMeetingTime}
                style={{ marginBottom: 0 }}
              />
            </View>
          </View>
        </SectionCard>

        {/* ---------------------------------------------------------- */}
        {/* CREATE BUTTON                                               */}
        {/* ---------------------------------------------------------- */}
        <View style={styles.createButtonWrap}>
          <PrimaryButton
            label={t('createGroup.createButton')}
            onPress={handleCreate}
            disabled={submitted && !isFormValid}
            loading={isSubmitting}
          />
          {submitted && !isFormValid && (
            <Text style={styles.formErrorText}>
              {t('createGroup.fillRequiredFields')}
            </Text>
          )}
          {serverError ? <Text style={styles.formErrorText}>{serverError}</Text> : null}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateGroupScreen;

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
    paddingTop: 4,
    paddingBottom: 12,
  },

  // Intro card
  introCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    marginHorizontal: H_PADDING,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
  },
  introIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  introText: {
    flex: 1,
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.92)',
    lineHeight: 18,
  },

  // Chips
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  // Group settings
  inlineLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 9,
  },
  groupTypeRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  groupTypeOptionWrap: {
    marginRight: 0,
  },

  // Meeting details
  meetingRow: {
    flexDirection: 'row',
    gap: 12,
  },
  meetingHalf: {
    flex: 1,
  },

  // Create button
  createButtonWrap: {
    paddingHorizontal: H_PADDING,
    marginTop: 4,
  },
  formErrorText: {
    fontSize: 12,
    color: COLORS.danger,
    textAlign: 'center',
    marginTop: 10,
  },
  });
}
