/**
 * EduSphere — screens/EditProfileScreen.tsx
 * -----------------------------------------------------------------------
 * Form screen for editing the student's profile. Opens on top of the tabs
 * (see navigation/AppNavigator.tsx). Uses shared components from
 * components/common.tsx for inputs, chips, toggles, and buttons.
 * -----------------------------------------------------------------------
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar, Alert, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { COLORS } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';
import { ScreenHeader, AppTextInput, SelectableChip, SectionCard, ToggleRow, PrimaryButton, LoadingView, ErrorView } from '../components/common';
import { useMyProfile, useUpdateProfile, useUploadAvatar } from '../hooks/useProfile';
import { useDepartments } from '../hooks/useCourses';
import { PROGRAMME_OPTIONS, LEVEL_OPTIONS, PROGRAMME_TO_DEPARTMENT } from '../constants/academic';

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

const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const profileQuery = useMyProfile();
  const departmentsQuery = useDepartments();
  const updateProfileMutation = useUpdateProfile();
  const uploadAvatarMutation = useUploadAvatar();

  const [studentEmail, setStudentEmail] = useState('');

  // ---- Form state (pre-filled with the student's current profile) ----
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [programme, setProgramme] = useState('');
  const [departmentId, setDepartmentId] = useState<string | null>(null);
  const [level, setLevel] = useState('');

  const [interests, setInterests] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [availability, setAvailability] = useState<string[]>([]);

  const [showProfile, setShowProfile] = useState(true);
  const [allowInvitations, setAllowInvitations] = useState(true);
  const [showRatings, setShowRatings] = useState(true);
  const [allowStudyRequests, setAllowStudyRequests] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const [activeDropdown, setActiveDropdown] = useState<'programme' | 'department' | 'level' | null>(null);

  const departments = departmentsQuery.data?.items ?? [];
  const avatarUploading = uploadAvatarMutation.isPending;
  const isSaving = updateProfileMutation.isPending;

  const initial = React.useRef<{
    fullName: string;
    bio: string;
    interests: string[];
    skills: string[];
    availability: string[];
    showProfile: boolean;
    allowInvitations: boolean;
    showRatings: boolean;
    allowStudyRequests: boolean;
  } | null>(null);

  // Seeds the form from the fetched profile exactly once — a background
  // refetch (React Query's cache staying "fresh" while this screen sits
  // open) must never overwrite a student's in-progress, unsaved edits.
  useEffect(() => {
    if (!profileQuery.data || initial.current) return;
    const user = profileQuery.data;

    setStudentEmail(user.email);
    setFullName(user.fullName);
    setBio(user.bio || '');
    setAvatarUrl(user.avatarUrl || null);
    setProgramme(user.programme || '');
    setDepartmentId(user.departmentId || null);
    setLevel(user.level || '');
    setInterests(user.interests || []);
    setSkills(user.skills || []);
    setAvailability(user.availability || []);
    setShowProfile(user.privacy?.showProfile ?? true);
    setAllowInvitations(user.privacy?.allowGroupInvitations ?? true);
    setShowRatings(user.privacy?.showRatings ?? true);
    setAllowStudyRequests(user.privacy?.allowDirectStudyRequests ?? false);

    initial.current = {
      fullName: user.fullName,
      bio: user.bio || '',
      interests: user.interests || [],
      skills: user.skills || [],
      availability: user.availability || [],
      showProfile: user.privacy?.showProfile ?? true,
      allowInvitations: user.privacy?.allowGroupInvitations ?? true,
      showRatings: user.privacy?.showRatings ?? true,
      allowStudyRequests: user.privacy?.allowDirectStudyRequests ?? false,
    };
  }, [profileQuery.data]);

  const selectedDepartment = departments.find((d) => d.id === departmentId) ?? null;

  const hasUnsavedChanges = useMemo(() => {
    if (!initial.current) return false;
    const base = initial.current;
    return (
      fullName !== base.fullName ||
      bio !== base.bio ||
      JSON.stringify(interests) !== JSON.stringify(base.interests) ||
      JSON.stringify(skills) !== JSON.stringify(base.skills) ||
      JSON.stringify(availability) !== JSON.stringify(base.availability) ||
      showProfile !== base.showProfile ||
      allowInvitations !== base.allowInvitations ||
      showRatings !== base.showRatings ||
      allowStudyRequests !== base.allowStudyRequests
    );
  }, [fullName, bio, interests, skills, availability, showProfile, allowInvitations, showRatings, allowStudyRequests]);

  const toggleFromList = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const ACADEMIC_FIELDS: {
    field: 'programme' | 'department' | 'level';
    label: string;
    value: string;
    icon: keyof typeof Feather.glyphMap;
    options: string[];
  }[] = [
    { field: 'programme', label: 'Programme', value: programme || 'Not set', icon: 'book-open', options: PROGRAMME_OPTIONS },
    { field: 'department', label: 'Department', value: selectedDepartment?.name || 'Not set', icon: 'layers', options: departments.map((d) => d.name) },
    { field: 'level', label: 'Level', value: level || 'Not set', icon: 'bar-chart-2', options: LEVEL_OPTIONS },
  ];

  const activeField = ACADEMIC_FIELDS.find((f) => f.field === activeDropdown);

  const handleSelectAcademicOption = (option: string) => {
    if (activeDropdown === 'programme') {
      setProgramme(option);
      // Auto-select the matching department — still fully overridable via
      // the department picker itself if the match is wrong or missing.
      const matchedDeptName = PROGRAMME_TO_DEPARTMENT[option];
      const matchedDept = matchedDeptName ? departments.find((d) => d.name === matchedDeptName) : undefined;
      if (matchedDept) {
        setDepartmentId(matchedDept.id);
      }
    }
    if (activeDropdown === 'department') {
      const dept = departments.find((d) => d.name === option);
      setDepartmentId(dept?.id ?? null);
    }
    if (activeDropdown === 'level') setLevel(option);
    setActiveDropdown(null);
  };

  const handleChangePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Needed', 'Please allow photo library access to change your profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || result.assets.length === 0) return;

    const asset = result.assets[0];
    uploadAvatarMutation.mutate(
      {
        uri: asset.uri,
        name: asset.fileName || 'avatar.jpg',
        type: asset.mimeType || 'image/jpeg',
      },
      {
        onSuccess: (data) => {
          setAvatarUrl(data.avatarUrl);
        },
        onError: (err) => {
          const message = (err as { message?: string })?.message ?? 'Could not upload photo. Please try again.';
          Alert.alert('Upload Failed', message);
        },
      }
    );
  };

  const nameError = submitted && fullName.trim().length === 0 ? 'Full name is required' : undefined;

  const isFormValid = fullName.trim().length > 0;

  const handleSave = () => {
    setSubmitted(true);
    setServerError(null);
    if (!isFormValid) return;

    updateProfileMutation.mutate(
      {
        fullName: fullName.trim(),
        bio: bio.trim(),
        programme: programme || undefined,
        departmentId: departmentId || undefined,
        level: level || undefined,
        interests,
        skills,
        availability,
        privacy: {
          showProfile,
          allowGroupInvitations: allowInvitations,
          showRatings,
          allowDirectStudyRequests: allowStudyRequests,
        },
      },
      {
        onSuccess: () => {
          setSaved(true);
          setTimeout(() => {
            navigation.goBack();
          }, 900);
        },
        onError: (err) => {
          const message = (err as { message?: string })?.message ?? 'Something went wrong. Please try again.';
          setServerError(message);
        },
      }
    );
  };

  if (profileQuery.isLoading || departmentsQuery.isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <ScreenHeader title="Edit Profile" onBack={() => navigation.goBack()} />
        <LoadingView message="Loading profile..." />
      </SafeAreaView>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <ScreenHeader title="Edit Profile" onBack={() => navigation.goBack()} />
        <ErrorView onRetry={() => profileQuery.refetch()} />
      </SafeAreaView>
    );
  }

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

      {serverError ? (
        <View style={styles.unsavedBanner}>
          <Feather name="alert-circle" size={13} color={COLORS.danger} />
          <Text style={[styles.unsavedBannerText, { color: COLORS.danger }]}>{serverError}</Text>
        </View>
      ) : null}

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
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Feather name="user" size={34} color={COLORS.primary} />
              </View>
            )}
            <TouchableOpacity
              style={styles.avatarEditBadge}
              activeOpacity={0.85}
              onPress={handleChangePhoto}
              disabled={avatarUploading}
            >
              <Feather name="camera" size={14} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity activeOpacity={0.7} onPress={handleChangePhoto} disabled={avatarUploading}>
            <Text style={styles.changePhotoText}>{avatarUploading ? 'Uploading...' : 'Change Photo'}</Text>
          </TouchableOpacity>
        </View>

        {/* ---------------------------------------------------------- */}
        {/* BASIC INFORMATION                                           */}
        {/* ---------------------------------------------------------- */}
        <SectionCard title="Basic Information">
          <AppTextInput label="Full Name" value={fullName} onChangeText={setFullName} error={nameError} />
          <AppTextInput label="Student Email" value={studentEmail} editable={false} disabled />
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
          {ACADEMIC_FIELDS.map((field, index, arr) => (
            <TouchableOpacity
              key={field.field}
              style={[styles.dropdownRow, index !== arr.length - 1 && styles.rowDivider]}
              activeOpacity={0.7}
              onPress={() => setActiveDropdown(field.field)}
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

          {/* College is derived server-side from the selected department —
              shown read-only rather than as an independently editable field. */}
          <View style={[styles.dropdownRow, styles.rowDivider]}>
            <View style={styles.dropdownIconWrap}>
              <Feather name="home" size={15} color={COLORS.primary} />
            </View>
            <View style={styles.dropdownTextBlock}>
              <Text style={styles.dropdownLabel}>College</Text>
              <Text style={styles.dropdownValue}>{selectedDepartment?.college || 'Select a department'}</Text>
            </View>
          </View>
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
          <PrimaryButton
            label="Save Changes"
            onPress={handleSave}
            disabled={submitted && !isFormValid}
            loading={isSaving}
          />
          {submitted && !isFormValid && (
            <Text style={styles.formErrorText}>Please enter your full name before saving.</Text>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ---------------------------------------------------------- */}
      {/* ACADEMIC INFO PICKER MODAL — shared by all dropdown rows       */}
      {/* ---------------------------------------------------------- */}
      <Modal
        visible={activeDropdown !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveDropdown(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setActiveDropdown(null)}
        >
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select {activeField?.label}</Text>
            <FlatList
              data={activeField?.options ?? []}
              keyExtractor={(item) => item}
              style={{ maxHeight: 360 }}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalOptionRow} onPress={() => handleSelectAcademicOption(item)}>
                  <Text style={styles.modalOptionText}>{item}</Text>
                  <Feather name="chevron-right" size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
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
  avatarPlaceholder: {
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
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

  // ---------------- Academic info picker modal ----------------
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17,17,17,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  modalOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalOptionText: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
});
