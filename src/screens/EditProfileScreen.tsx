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
import { ThemeColors } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { RootStackParamList } from '../navigation/types';
import { ScreenHeader, AppTextInput, SelectableChip, SectionCard, PrimaryButton, LoadingView, ErrorView } from '../components/common';
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
  const { colors: COLORS, isDark } = useTheme();
  const { t } = useLanguage();
  const styles = React.useMemo(() => createStyles(COLORS), [COLORS]);

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

  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const [activeDropdown, setActiveDropdown] = useState<'programme' | 'level' | null>(null);

  const departments = departmentsQuery.data?.items ?? [];
  const avatarUploading = uploadAvatarMutation.isPending;
  const isSaving = updateProfileMutation.isPending;

  const initial = React.useRef<{
    fullName: string;
    bio: string;
    interests: string[];
    skills: string[];
    availability: string[];
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

    initial.current = {
      fullName: user.fullName,
      bio: user.bio || '',
      interests: user.interests || [],
      skills: user.skills || [],
      availability: user.availability || [],
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
      JSON.stringify(availability) !== JSON.stringify(base.availability)
    );
  }, [fullName, bio, interests, skills, availability]);

  const toggleFromList = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const ACADEMIC_FIELDS: {
    field: 'programme' | 'level';
    label: string;
    value: string;
    icon: keyof typeof Feather.glyphMap;
    options: string[];
  }[] = [
    { field: 'programme', label: t('editProfile.programme'), value: programme || t('editProfile.notSet'), icon: 'book-open', options: PROGRAMME_OPTIONS },
    { field: 'level', label: t('editProfile.level'), value: level || t('editProfile.notSet'), icon: 'bar-chart-2', options: LEVEL_OPTIONS },
  ];

  const activeField = ACADEMIC_FIELDS.find((f) => f.field === activeDropdown);

  const handleSelectAcademicOption = (option: string) => {
    if (activeDropdown === 'programme') {
      setProgramme(option);
      // Department is fully derived from the chosen programme — not a
      // separately pickable field — so students can't set a department
      // that doesn't match their programme.
      const matchedDeptName = PROGRAMME_TO_DEPARTMENT[option];
      const matchedDept = matchedDeptName ? departments.find((d) => d.name === matchedDeptName) : undefined;
      setDepartmentId(matchedDept?.id ?? null);
    }
    if (activeDropdown === 'level') setLevel(option);
    setActiveDropdown(null);
  };

  const handleChangePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t('editProfile.permissionNeededTitle'), t('editProfile.permissionNeededBody'));
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
          const message = (err as { message?: string })?.message ?? t('editProfile.uploadFailedBody');
          Alert.alert(t('editProfile.uploadFailedTitle'), message);
        },
      }
    );
  };

  const nameError = submitted && fullName.trim().length === 0 ? t('editProfile.fullNameRequired') : undefined;

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
      },
      {
        onSuccess: () => {
          setSaved(true);
          setTimeout(() => {
            navigation.goBack();
          }, 900);
        },
        onError: (err) => {
          const message = (err as { message?: string })?.message ?? t('common.somethingWentWrong');
          setServerError(message);
        },
      }
    );
  };

  if (profileQuery.isLoading || departmentsQuery.isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={COLORS.background} />
        <ScreenHeader title={t('editProfile.title')} onBack={() => navigation.goBack()} />
        <LoadingView message={t('editProfile.loading')} />
      </SafeAreaView>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={COLORS.background} />
        <ScreenHeader title={t('editProfile.title')} onBack={() => navigation.goBack()} />
        <ErrorView onRetry={() => profileQuery.refetch()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={COLORS.background} />

      <ScreenHeader
        title={t('editProfile.title')}
        onBack={() => navigation.goBack()}
        rightText={t('editProfile.save')}
        onPressRight={handleSave}
      />

      {hasUnsavedChanges && !saved && (
        <View style={styles.unsavedBanner}>
          <Feather name="edit-3" size={13} color={COLORS.warning} />
          <Text style={styles.unsavedBannerText}>{t('editProfile.unsavedChanges')}</Text>
        </View>
      )}

      {saved && (
        <View style={styles.savedBanner}>
          <Feather name="check-circle" size={13} color={COLORS.success} />
          <Text style={styles.savedBannerText}>{t('editProfile.profileUpdated')}</Text>
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
            <Text style={styles.changePhotoText}>{avatarUploading ? t('editProfile.uploading') : t('editProfile.changePhoto')}</Text>
          </TouchableOpacity>
        </View>

        {/* ---------------------------------------------------------- */}
        {/* BASIC INFORMATION                                           */}
        {/* ---------------------------------------------------------- */}
        <SectionCard title={t('editProfile.basicInformation')}>
          <AppTextInput label={t('editProfile.fullNameLabel')} value={fullName} onChangeText={setFullName} error={nameError} />
          <AppTextInput label={t('editProfile.studentEmailLabel')} value={studentEmail} editable={false} disabled />
          <AppTextInput
            label={t('editProfile.bioLabel')}
            placeholder={t('editProfile.bioPlaceholder')}
            value={bio}
            onChangeText={setBio}
            multiline
            style={{ marginBottom: 0 }}
          />
        </SectionCard>

        {/* ---------------------------------------------------------- */}
        {/* ACADEMIC INFORMATION                                        */}
        {/* ---------------------------------------------------------- */}
        <SectionCard title={t('editProfile.academicInformation')}>
          {/* Programme — the only academic field the student picks directly. */}
          <TouchableOpacity
            style={[styles.dropdownRow, styles.rowDivider]}
            activeOpacity={0.7}
            onPress={() => setActiveDropdown('programme')}
          >
            <View style={styles.dropdownIconWrap}>
              <Feather name="book-open" size={15} color={COLORS.primary} />
            </View>
            <View style={styles.dropdownTextBlock}>
              <Text style={styles.dropdownLabel}>{t('editProfile.programme')}</Text>
              <Text style={styles.dropdownValue}>{programme || t('editProfile.notSet')}</Text>
            </View>
            <Feather name="chevron-down" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          {/* Department is derived from Programme — never picked on its own. */}
          <View style={[styles.dropdownRow, styles.rowDivider]}>
            <View style={styles.dropdownIconWrap}>
              <Feather name="layers" size={15} color={COLORS.primary} />
            </View>
            <View style={styles.dropdownTextBlock}>
              <Text style={styles.dropdownLabel}>{t('editProfile.department')}</Text>
              <Text style={styles.dropdownValue}>{selectedDepartment?.name || t('editProfile.notSet')}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.dropdownRow}
            activeOpacity={0.7}
            onPress={() => setActiveDropdown('level')}
          >
            <View style={styles.dropdownIconWrap}>
              <Feather name="bar-chart-2" size={15} color={COLORS.primary} />
            </View>
            <View style={styles.dropdownTextBlock}>
              <Text style={styles.dropdownLabel}>{t('editProfile.level')}</Text>
              <Text style={styles.dropdownValue}>{level || t('editProfile.notSet')}</Text>
            </View>
            <Feather name="chevron-down" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          {/* College is derived server-side from the selected department —
              shown read-only rather than as an independently editable field. */}
          <View style={[styles.dropdownRow, styles.rowDivider]}>
            <View style={styles.dropdownIconWrap}>
              <Feather name="home" size={15} color={COLORS.primary} />
            </View>
            <View style={styles.dropdownTextBlock}>
              <Text style={styles.dropdownLabel}>{t('editProfile.college')}</Text>
              <Text style={styles.dropdownValue}>{selectedDepartment?.college || t('editProfile.selectDepartment')}</Text>
            </View>
          </View>
        </SectionCard>

        {/* ---------------------------------------------------------- */}
        {/* STUDY INTERESTS                                             */}
        {/* ---------------------------------------------------------- */}
        <SectionCard title={t('editProfile.studyInterests')}>
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
        <SectionCard title={t('editProfile.skillsCanHelpWith')}>
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
        <SectionCard title={t('editProfile.availability')}>
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
        {/* SAVE BUTTON                                                 */}
        {/* ---------------------------------------------------------- */}
        <View style={styles.saveButtonWrap}>
          <PrimaryButton
            label={t('editProfile.saveChanges')}
            onPress={handleSave}
            disabled={submitted && !isFormValid}
            loading={isSaving}
          />
          {submitted && !isFormValid && (
            <Text style={styles.formErrorText}>{t('editProfile.enterFullNameBeforeSaving')}</Text>
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
            <Text style={styles.modalTitle}>{t('editProfile.selectOption', { label: activeField?.label ?? '' })}</Text>
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
    backgroundColor: COLORS.card,
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
}
