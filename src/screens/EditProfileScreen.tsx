/**
 * EduSphere — screens/EditProfileScreen.tsx
 * -----------------------------------------------------------------------
 * Form screen for editing the student's profile. Opens on top of the tabs
 * (see navigation/AppNavigator.tsx). Uses shared components from
 * components/common.tsx for inputs, chips, toggles, and buttons.
 * -----------------------------------------------------------------------
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { COLORS, SHADOW } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';
import { ScreenHeader, AppTextInput, SelectableChip, SectionCard, ToggleRow, PrimaryButton } from '../components/common';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

// -----------------------------------------------------------------------
// STATIC SAMPLE DATA
// -----------------------------------------------------------------------
const INTEREST_OPTIONS = [
  'Data Structures',
  'Database Systems',
  'Artificial Intelligence',
  'Calculus',
  'Web Development',
  'Cybersecurity',
  'Mobile App Development',
  'Networking',
  'Software Engineering',
];

const SKILL_OPTIONS = [
  'Programming',
  'Mathematics',
  'Algorithms',
  'UI Design',
  'Database Design',
  'Exam Preparation',
  'Research',
  'Group Tutorials',
];

const AVAILABILITY_OPTIONS = [
  'Weekday Evenings',
  'Weekend Mornings',
  'Weekend Afternoons',
  'Online Sessions',
  'In-person Sessions',
];

// A simple regex good enough for UI-level format validation — not meant
// to be exhaustive, just to demonstrate the invalid-format message.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  // ---- Form state (pre-filled with the student's current profile) ----
  const [fullName, setFullName] = useState('Nii Nortey');
  const studentEmail = 'student@knust.edu.gh'; // read-only
  const [bio, setBio] = useState('');

  const [programme, setProgramme] = useState('BSc Computer Science');
  const [department, setDepartment] = useState('Computer Science');
  const [college, setCollege] = useState('College of Science');
  const [level, setLevel] = useState('Level 300');

  const [interests, setInterests] = useState<string[]>(['Data Structures', 'Artificial Intelligence']);
  const [skills, setSkills] = useState<string[]>(['Programming', 'Algorithms']);
  const [availability, setAvailability] = useState<string[]>(['Weekday Evenings']);

  const [showProfile, setShowProfile] = useState(true);
  const [allowInvitations, setAllowInvitations] = useState(true);
  const [showRatings, setShowRatings] = useState(true);
  const [allowStudyRequests, setAllowStudyRequests] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);

  // Track whether anything has actually changed from the initial values,
  // to demonstrate the "unsaved changes" state requested in the spec.
  const initial = useMemo(
    () => ({
      fullName: 'Nii Nortey',
      bio: '',
      interests: ['Data Structures', 'Artificial Intelligence'],
      skills: ['Programming', 'Algorithms'],
      availability: ['Weekday Evenings'],
      showProfile: true,
      allowInvitations: true,
      showRatings: true,
      allowStudyRequests: false,
    }),
    []
  );

  const hasUnsavedChanges =
    fullName !== initial.fullName ||
    bio !== initial.bio ||
    JSON.stringify(interests) !== JSON.stringify(initial.interests) ||
    JSON.stringify(skills) !== JSON.stringify(initial.skills) ||
    JSON.stringify(availability) !== JSON.stringify(initial.availability) ||
    showProfile !== initial.showProfile ||
    allowInvitations !== initial.allowInvitations ||
    showRatings !== initial.showRatings ||
    allowStudyRequests !== initial.allowStudyRequests;

  const toggleFromList = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const nameError = submitted && fullName.trim().length === 0 ? 'Full name is required' : undefined;
  // Shown purely for demonstration — the field is read-only, so this
  // message would only ever appear if pre-filled data were malformed.
  const emailError = !EMAIL_REGEX.test(studentEmail) ? 'Invalid email format' : undefined;

  const isFormValid = fullName.trim().length > 0;

  const handleSave = () => {
    setSubmitted(true);
    if (!isFormValid) return;

    // Placeholder action — replace with a real API call.
    setSaved(true);
    setTimeout(() => {
      navigation.goBack();
    }, 900);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScreenHeader
        title="Edit Profile"
        onBack={() => navigation.goBack()}
        rightText="Save"
        onPressRight={handleSave}
      />

      {hasUnsavedChanges && !saved && (
        <View style={styles.unsavedBanner}>
          <Feather name="edit-3" size={13} color={COLORS.warning} />
          <Text style={styles.unsavedBannerText}>You have unsaved changes</Text>
        </View>
      )}

      {saved && (
        <View style={styles.savedBanner}>
          <Feather name="check-circle" size={13} color={COLORS.success} />
          <Text style={styles.savedBannerText}>Profile updated successfully</Text>
        </View>
      )}

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ---------------------------------------------------------- */}
        {/* PROFILE PHOTO                                               */}
        {/* ---------------------------------------------------------- */}
        <View style={styles.photoSection}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: 'https://i.pravatar.cc/150?img=12' }} style={styles.avatar} />
            <TouchableOpacity style={styles.avatarEditBadge} activeOpacity={0.85}>
              <Feather name="camera" size={14} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* ---------------------------------------------------------- */}
        {/* BASIC INFORMATION                                           */}
        {/* ---------------------------------------------------------- */}
        <SectionCard title="Basic Information">
          <AppTextInput label="Full Name" value={fullName} onChangeText={setFullName} error={nameError} />
          <AppTextInput label="Student Email" value={studentEmail} editable={false} disabled error={emailError} />
          <AppTextInput
            label="Bio"
            placeholder="Write a short bio about yourself..."
            value={bio}
            onChangeText={setBio}
            multiline
            style={{ marginBottom: 0 }}
          />
        </SectionCard>

        {/* ---------------------------------------------------------- */}
        {/* ACADEMIC INFORMATION                                        */}
        {/* ---------------------------------------------------------- */}
        <SectionCard title="Academic Information">
          {/* Real dropdowns aren't wired up yet — these rows behave like
              selectable list items styled to preview as dropdowns. */}
          {[
            { label: 'Programme', value: programme, setValue: setProgramme, icon: 'book-open' as const },
            { label: 'Department', value: department, setValue: setDepartment, icon: 'layers' as const },
            { label: 'College', value: college, setValue: setCollege, icon: 'home' as const },
            { label: 'Level', value: level, setValue: setLevel, icon: 'bar-chart-2' as const },
          ].map((field, index, arr) => (
            <TouchableOpacity
              key={field.label}
              style={[styles.dropdownRow, index !== arr.length - 1 && styles.rowDivider]}
              activeOpacity={0.7}
            >
              <View style={styles.dropdownIconWrap}>
                <Feather name={field.icon} size={15} color={COLORS.primary} />
              </View>
              <View style={styles.dropdownTextBlock}>
                <Text style={styles.dropdownLabel}>{field.label}</Text>
                <Text style={styles.dropdownValue}>{field.value}</Text>
              </View>
              <Feather name="chevron-down" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))}
        </SectionCard>

        {/* ---------------------------------------------------------- */}
        {/* STUDY INTERESTS                                             */}
        {/* ---------------------------------------------------------- */}
        <SectionCard title="Study Interests">
          <View style={styles.chipsWrap}>
            {INTEREST_OPTIONS.map((item) => (
              <SelectableChip
                key={item}
                label={item}
                selected={interests.includes(item)}
                onPress={() => toggleFromList(interests, setInterests, item)}
              />
            ))}
          </View>
        </SectionCard>

        {/* ---------------------------------------------------------- */}
        {/* SKILLS / CAN HELP WITH                                      */}
        {/* ---------------------------------------------------------- */}
        <SectionCard title="Skills / Can Help With">
          <View style={styles.chipsWrap}>
            {SKILL_OPTIONS.map((item) => (
              <SelectableChip
                key={item}
                label={item}
                selected={skills.includes(item)}
                onPress={() => toggleFromList(skills, setSkills, item)}
              />
            ))}
          </View>
        </SectionCard>

        {/* ---------------------------------------------------------- */}
        {/* AVAILABILITY                                                */}
        {/* ---------------------------------------------------------- */}
        <SectionCard title="Availability">
          <View style={styles.chipsWrap}>
            {AVAILABILITY_OPTIONS.map((item) => (
              <SelectableChip
                key={item}
                label={item}
                selected={availability.includes(item)}
                onPress={() => toggleFromList(availability, setAvailability, item)}
              />
            ))}
          </View>
        </SectionCard>

        {/* ---------------------------------------------------------- */}
        {/* PRIVACY SETTINGS                                            */}
        {/* ---------------------------------------------------------- */}
        <SectionCard title="Privacy Settings">
          <ToggleRow
            icon="eye"
            label="Show my profile to other students"
            value={showProfile}
            onValueChange={setShowProfile}
          />
          <ToggleRow
            icon="user-plus"
            label="Allow group invitations"
            value={allowInvitations}
            onValueChange={setAllowInvitations}
          />
          <ToggleRow icon="star" label="Show my ratings" value={showRatings} onValueChange={setShowRatings} />
          <ToggleRow
            icon="message-circle"
            label="Allow direct study requests"
            value={allowStudyRequests}
            onValueChange={setAllowStudyRequests}
            isLast
          />
        </SectionCard>

        {/* ---------------------------------------------------------- */}
        {/* SAVE BUTTON                                                 */}
        {/* ---------------------------------------------------------- */}
        <View style={styles.saveButtonWrap}>
          <PrimaryButton label="Save Changes" onPress={handleSave} disabled={submitted && !isFormValid} />
          {submitted && !isFormValid && (
            <Text style={styles.formErrorText}>Please enter your full name before saving.</Text>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProfileScreen;

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

  // Unsaved / saved banners
  unsavedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.warningLight,
    marginHorizontal: H_PADDING,
    marginBottom: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  unsavedBannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.warning,
    marginLeft: 6,
  },
  savedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.successLight,
    marginHorizontal: H_PADDING,
    marginBottom: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  savedBannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.success,
    marginLeft: 6,
  },

  // Profile photo
  photoSection: {
    alignItems: 'center',
    marginBottom: 22,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 3,
    borderColor: COLORS.primaryLight,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  changePhotoText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // Chips
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  // Academic info "dropdown" rows
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dropdownIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dropdownTextBlock: {
    flex: 1,
  },
  dropdownLabel: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  dropdownValue: {
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  // Save button
  saveButtonWrap: {
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
