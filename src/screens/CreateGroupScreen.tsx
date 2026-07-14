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
import { COLORS, SHADOW } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';
import {
  ScreenHeader,
  AppTextInput,
  SelectableChip,
  SectionCard,
  ToggleRow,
  PrimaryButton,
} from '../components/common';

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

type GroupType = 'Public' | 'Private';

const CreateGroupScreen: React.FC<Props> = ({ navigation }) => {
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
      groupName: groupName.trim().length === 0 ? 'Group name is required' : undefined,
      courseCode: courseCode.trim().length === 0 ? 'Course code is required' : undefined,
      courseTitle: courseTitle.trim().length === 0 ? 'Course title is required' : undefined,
    };
  }, [submitted, groupName, courseCode, courseTitle]);

  const isFormValid =
    groupName.trim().length > 0 && courseCode.trim().length > 0 && courseTitle.trim().length > 0;

  const handleCreate = () => {
    setSubmitted(true);
    if (!isFormValid) return;

    // Placeholder action — replace with a real API call, then either
    // go back to the Groups list or push straight into GroupDetails
    // for the newly created group:
    //   navigation.navigate('GroupDetails', { group: newGroup });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScreenHeader
        title="Create Group"
        subtitle="Start a study group for your course"
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
            Create a group, invite classmates, share resources, and schedule study sessions.
          </Text>
        </View>

        {/* ---------------------------------------------------------- */}
        {/* GROUP INFORMATION                                           */}
        {/* ---------------------------------------------------------- */}
        <SectionCard title="Group Information">
          <AppTextInput
            label="Group Name"
            placeholder="e.g. CSM 351 Data Structures"
            value={groupName}
            onChangeText={setGroupName}
            error={errors.groupName}
          />
          <AppTextInput
            label="Course Code"
            placeholder="e.g. CSM 351"
            value={courseCode}
            onChangeText={setCourseCode}
            autoCapitalize="characters"
            error={errors.courseCode}
          />
          <AppTextInput
            label="Course Title"
            placeholder="e.g. Data Structures and Algorithms"
            value={courseTitle}
            onChangeText={setCourseTitle}
            error={errors.courseTitle}
          />
          <AppTextInput
            label="Description"
            placeholder="Tell students what this group is about..."
            value={description}
            onChangeText={setDescription}
            multiline
            style={{ marginBottom: 0 }}
          />
        </SectionCard>

        {/* ---------------------------------------------------------- */}
        {/* CATEGORY / TAGS                                             */}
        {/* ---------------------------------------------------------- */}
        <SectionCard title="Group Category">
          <View style={styles.chipsWrap}>
            {TAG_OPTIONS.map((tag) => (
              <SelectableChip
                key={tag}
                label={tag}
                selected={selectedTags.includes(tag)}
                onPress={() => toggleTag(tag)}
              />
            ))}
          </View>
        </SectionCard>

        {/* ---------------------------------------------------------- */}
        {/* GROUP SETTINGS                                              */}
        {/* ---------------------------------------------------------- */}
        <SectionCard title="Group Settings">
          <Text style={styles.inlineLabel}>Group Type</Text>
          <View style={styles.groupTypeRow}>
            {(['Public', 'Private'] as GroupType[]).map((type) => {
              const isActive = groupType === type;
              return (
                <View key={type} style={styles.groupTypeOptionWrap}>
                  <SelectableChip
                    label={type}
                    selected={isActive}
                    onPress={() => setGroupType(type)}
                  />
                </View>
              );
            })}
          </View>

          <AppTextInput
            label="Maximum Members"
            placeholder="e.g. 30"
            value={maxMembers}
            onChangeText={setMaxMembers}
            keyboardType="number-pad"
            style={{ marginTop: 4 }}
          />

          <ToggleRow
            label="Allow members to upload resources"
            value={allowUploads}
            onValueChange={setAllowUploads}
          />
          <ToggleRow
            label="Allow members to invite others"
            value={allowInvites}
            onValueChange={setAllowInvites}
            isLast
          />
        </SectionCard>

        {/* ---------------------------------------------------------- */}
        {/* MEETING DETAILS (optional)                                  */}
        {/* ---------------------------------------------------------- */}
        <SectionCard title="Meeting Details (optional)">
          <AppTextInput
            label="Preferred Meeting Location"
            placeholder="e.g. KNUST Main Library"
            value={meetingLocation}
            onChangeText={setMeetingLocation}
          />
          <View style={styles.meetingRow}>
            <View style={styles.meetingHalf}>
              <AppTextInput
                label="Meeting Day"
                placeholder="e.g. Fridays"
                value={meetingDay}
                onChangeText={setMeetingDay}
                style={{ marginBottom: 0 }}
              />
            </View>
            <View style={styles.meetingHalf}>
              <AppTextInput
                label="Meeting Time"
                placeholder="e.g. 4:00 PM"
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
            label="Create Study Group"
            onPress={handleCreate}
            disabled={submitted && !isFormValid}
          />
          {submitted && !isFormValid && (
            <Text style={styles.formErrorText}>
              Please fill in all required fields above before creating your group.
            </Text>
          )}
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

const styles = StyleSheet.create({
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
