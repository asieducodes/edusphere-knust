/**
 * EduSphere — screens/UploadResourceScreen.tsx
 * -----------------------------------------------------------------------
 * Form screen for uploading a new academic resource. Opens on top of the
 * tabs (see navigation/AppNavigator.tsx). Uses expo-document-picker for
 * real file selection and uploads via resourceService.uploadResource,
 * with real course/group pickers sourced from the backend.
 * -----------------------------------------------------------------------
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ThemeColors, SHADOW } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { RootStackParamList } from '../navigation/types';
import { ScreenHeader, AppTextInput, SelectableChip, SectionCard, PrimaryButton } from '../components/common';
import { useUploadResource } from '../hooks/useResources';
import { useMyGroups } from '../hooks/useGroups';
import { LocalFile, ResourceVisibility } from '../types/resource';

type Props = NativeStackScreenProps<RootStackParamList, 'UploadResource'>;

// -----------------------------------------------------------------------
// STATIC SAMPLE DATA
// -----------------------------------------------------------------------
const CATEGORY_OPTIONS = [
  'Past Questions',
  'Lecture Notes',
  'Slides',
  'Assignment',
  'Study Guide',
  'Tutorial Questions',
  'Summary Notes',
];

const CATEGORY_LABEL_KEYS: Record<string, string> = {
  'Past Questions': 'uploadResource.categoryPastQuestions',
  'Lecture Notes': 'uploadResource.categoryLectureNotes',
  Slides: 'uploadResource.categorySlides',
  Assignment: 'uploadResource.categoryAssignment',
  'Study Guide': 'uploadResource.categoryStudyGuide',
  'Tutorial Questions': 'uploadResource.categoryTutorialQuestions',
  'Summary Notes': 'uploadResource.categorySummaryNotes',
};

const VISIBILITY_OPTIONS: { key: ResourceVisibility; labelKey: string; subtitleKey: string; icon: keyof typeof Feather.glyphMap }[] = [
  { key: 'Public', labelKey: 'uploadResource.visibilityPublic', subtitleKey: 'uploadResource.visibilityPublicSubtitle', icon: 'globe' },
  { key: 'Group Only', labelKey: 'uploadResource.visibilityGroupOnly', subtitleKey: 'uploadResource.visibilityGroupOnlySubtitle', icon: 'users' },
  { key: 'Private', labelKey: 'uploadResource.visibilityPrivate', subtitleKey: 'uploadResource.visibilityPrivateSubtitle', icon: 'lock' },
];

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

// Mirrors the backend's MAX_UPLOAD_SIZE_MB — checked client-side too so a
// student finds out immediately instead of waiting on a doomed upload.
const MAX_FILE_SIZE_MB = 20;

// Guesses a file's `type` field for the multipart upload from its
// extension when expo-document-picker's own mimeType comes back empty.
function inferMimeType(name: string, mimeType?: string | null): string {
  if (mimeType) return mimeType;
  const ext = name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return 'application/pdf';
    case 'doc':
      return 'application/msword';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'ppt':
      return 'application/vnd.ms-powerpoint';
    case 'pptx':
      return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    case 'zip':
      return 'application/zip';
    default:
      return 'application/octet-stream';
  }
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return '';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  const kb = bytes / 1024;
  return `${kb.toFixed(0)} KB`;
}

const UploadResourceScreen: React.FC<Props> = ({ navigation }) => {
  const { colors: COLORS, isDark } = useTheme();
  const { t } = useLanguage();
  const styles = React.useMemo(() => createStyles(COLORS), [COLORS]);

  const [pickedFile, setPickedFile] = useState<LocalFile | null>(null);
  const [pickedFileLabel, setPickedFileLabel] = useState<{ name: string; size: string } | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<ResourceVisibility>('Public');

  const [courseCode, setCourseCode] = useState('');

  const [groupId, setGroupId] = useState<string | null>(null);

  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const myGroupsQuery = useMyGroups();
  const myGroups = myGroupsQuery.data?.items ?? [];
  const uploadMutation = useUploadResource();

  const handleChooseFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/zip',
        'application/x-zip-compressed',
      ],
      copyToCacheDirectory: true,
    });

    if (result.canceled || result.assets.length === 0) return;

    const asset = result.assets[0];
    if (asset.size && asset.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      Alert.alert(t('uploadResource.fileTooLargeTitle'), t('uploadResource.fileTooLargeBody', { size: MAX_FILE_SIZE_MB }));
      return;
    }

    setPickedFile({
      uri: asset.uri,
      name: asset.name,
      type: inferMimeType(asset.name, asset.mimeType),
    });
    setPickedFileLabel({ name: asset.name, size: formatFileSize(asset.size ?? undefined) });
  };

  const handleRemoveFile = () => {
    setPickedFile(null);
    setPickedFileLabel(null);
  };

  const isFormValid =
    pickedFile !== null && title.trim().length > 0 && courseCode.trim().length > 0 && category !== null;

  const handleUpload = () => {
    if (!isFormValid || !pickedFile || !category) {
      setUploadState('error');
      setErrorMessage(t('uploadResource.fillRequiredFields'));
      return;
    }

    setUploadState('uploading');
    setProgress(0);
    setErrorMessage(null);

    uploadMutation.mutate(
      {
        payload: {
          file: pickedFile,
          title: title.trim(),
          description: description.trim(),
          courseCode: courseCode.trim(),
          category,
          visibility,
          groupId: groupId ?? undefined,
        },
        onUploadProgress: (event) => {
          if (event.total) {
            setProgress(Math.round((event.loaded / event.total) * 100));
          }
        },
      },
      {
        onSuccess: () => {
          setProgress(100);
          setUploadState('success');
        },
        onError: (err) => {
          const message = (err as { message?: string })?.message ?? t('common.somethingWentWrong');
          setErrorMessage(message);
          setUploadState('error');
        },
      }
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={COLORS.background} />

      <ScreenHeader
        title={t('uploadResource.title')}
        subtitle={t('uploadResource.subtitle')}
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
            <Feather name="upload-cloud" size={20} color={COLORS.white} />
          </View>
          <Text style={styles.introText}>
            {t('uploadResource.introText')}
          </Text>
        </View>

        {/* ---------------------------------------------------------- */}
        {/* FILE UPLOAD AREA                                            */}
        {/* ---------------------------------------------------------- */}
        {pickedFileLabel ? (
          <View style={styles.selectedFileCard}>
            <View style={styles.selectedFileIconWrap}>
              <Feather name="file-text" size={18} color={COLORS.primary} />
            </View>
            <View style={styles.selectedFileInfo}>
              <Text style={styles.selectedFileName} numberOfLines={1}>
                {pickedFileLabel.name}
              </Text>
              {pickedFileLabel.size ? <Text style={styles.selectedFileSize}>{pickedFileLabel.size}</Text> : null}
            </View>
            <TouchableOpacity onPress={handleRemoveFile} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name="x-circle" size={20} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.uploadDropzone} activeOpacity={0.8} onPress={handleChooseFile}>
            <View style={styles.uploadDropzoneIconWrap}>
              <Feather name="upload" size={22} color={COLORS.primary} />
            </View>
            <Text style={styles.uploadDropzoneTitle}>{t('uploadResource.tapToChoose')}</Text>
            <Text style={styles.uploadDropzoneSubtitle}>{t('uploadResource.fileTypesHint', { size: MAX_FILE_SIZE_MB })}</Text>
          </TouchableOpacity>
        )}

        {/* ---------------------------------------------------------- */}
        {/* RESOURCE DETAILS FORM                                       */}
        {/* ---------------------------------------------------------- */}
        <SectionCard title={t('uploadResource.resourceDetails')}>
          <AppTextInput
            label={t('uploadResource.resourceTitleLabel')}
            placeholder={t('uploadResource.resourceTitlePlaceholder')}
            value={title}
            onChangeText={setTitle}
          />
          <AppTextInput
            label={t('uploadResource.courseCodeLabel')}
            placeholder={t('uploadResource.courseCodePlaceholder')}
            value={courseCode}
            onChangeText={setCourseCode}
            autoCapitalize="characters"
          />
          <AppTextInput
            label={t('uploadResource.descriptionLabel')}
            placeholder={t('uploadResource.descriptionPlaceholder')}
            value={description}
            onChangeText={setDescription}
            multiline
            style={{ marginBottom: 0 }}
          />
        </SectionCard>

        {/* ---------------------------------------------------------- */}
        {/* CATEGORY                                                    */}
        {/* ---------------------------------------------------------- */}
        <SectionCard title={t('uploadResource.category')}>
          <View style={styles.chipsWrap}>
            {CATEGORY_OPTIONS.map((cat) => (
              <SelectableChip key={cat} label={t(CATEGORY_LABEL_KEYS[cat])} selected={category === cat} onPress={() => setCategory(cat)} />
            ))}
          </View>
        </SectionCard>

        {/* ---------------------------------------------------------- */}
        {/* VISIBILITY                                                  */}
        {/* ---------------------------------------------------------- */}
        <SectionCard title={t('uploadResource.visibility')}>
          {VISIBILITY_OPTIONS.map((option, index) => {
            const isActive = visibility === option.key;
            return (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.visibilityRow,
                  index !== VISIBILITY_OPTIONS.length - 1 && styles.visibilityRowSpacing,
                  isActive && styles.visibilityRowActive,
                ]}
                activeOpacity={0.8}
                onPress={() => setVisibility(option.key)}
              >
                <View style={[styles.radioOuter, isActive && styles.radioOuterActive]}>
                  {isActive && <View style={styles.radioInner} />}
                </View>
                <Feather
                  name={option.icon}
                  size={16}
                  color={isActive ? COLORS.primary : COLORS.textSecondary}
                  style={{ marginHorizontal: 10 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.visibilityLabel, isActive && styles.visibilityLabelActive]}>
                    {t(option.labelKey)}
                  </Text>
                  <Text style={styles.visibilitySubtitle}>{t(option.subtitleKey)}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </SectionCard>

        {/* ---------------------------------------------------------- */}
        {/* RELATED GROUP (optional)                                    */}
        {/* ---------------------------------------------------------- */}
        {myGroups.length > 0 && (
          <SectionCard title={t('uploadResource.relatedGroup')}>
            {myGroups.map((group, index) => {
              const isActive = groupId === group.id;
              return (
                <TouchableOpacity
                  key={group.id}
                  style={[styles.groupOptionRow, index !== myGroups.length - 1 && styles.infoRowDivider]}
                  activeOpacity={0.7}
                  onPress={() => setGroupId(isActive ? null : group.id)}
                >
                  <Text style={styles.groupOptionText}>{group.name}</Text>
                  {isActive ? (
                    <Feather name="check-circle" size={18} color={COLORS.primary} />
                  ) : (
                    <View style={styles.groupOptionCircle} />
                  )}
                </TouchableOpacity>
              );
            })}
          </SectionCard>
        )}

        {/* ---------------------------------------------------------- */}
        {/* UPLOAD GUIDELINES                                           */}
        {/* ---------------------------------------------------------- */}
        <View style={styles.guidelinesCard}>
          <Feather name="alert-triangle" size={16} color={COLORS.warning} />
          <Text style={styles.guidelinesText}>
            {t('uploadResource.guidelinesText')}
          </Text>
        </View>

        {/* ---------------------------------------------------------- */}
        {/* UPLOAD STATE UI                                             */}
        {/* ---------------------------------------------------------- */}
        {uploadState === 'uploading' && (
          <View style={styles.stateCard}>
            <View style={styles.stateRow}>
              <Feather name="upload-cloud" size={16} color={COLORS.primary} />
              <Text style={styles.stateUploadingText}>{t('uploadResource.uploading', { progress })}</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          </View>
        )}

        {uploadState === 'success' && (
          <View style={[styles.stateCard, styles.stateSuccessCard]}>
            <Feather name="check-circle" size={18} color={COLORS.success} />
            <Text style={styles.stateSuccessText}>{t('uploadResource.uploadedSuccess')}</Text>
          </View>
        )}

        {uploadState === 'error' && (
          <View style={[styles.stateCard, styles.stateErrorCard]}>
            <Feather name="alert-circle" size={18} color={COLORS.danger} />
            <Text style={styles.stateErrorText}>
              {errorMessage ?? t('uploadResource.fillRequiredFields')}
            </Text>
          </View>
        )}

        {/* ---------------------------------------------------------- */}
        {/* UPLOAD BUTTON                                               */}
        {/* ---------------------------------------------------------- */}
        <View style={styles.uploadButtonWrap}>
          <PrimaryButton
            label={
              uploadState === 'uploading'
                ? t('uploadResource.uploadingButton')
                : uploadState === 'success'
                ? t('uploadResource.done')
                : t('uploadResource.uploadButton')
            }
            onPress={uploadState === 'success' ? () => navigation.goBack() : handleUpload}
            loading={uploadState === 'uploading'}
            icon={uploadState !== 'uploading' ? 'upload' : undefined}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default UploadResourceScreen;

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

  // Upload dropzone
  uploadDropzone: {
    borderWidth: 1.5,
    borderColor: COLORS.primarySoft,
    borderStyle: 'dashed',
    borderRadius: 18,
    marginHorizontal: H_PADDING,
    marginBottom: 20,
    paddingVertical: 32,
    alignItems: 'center',
    backgroundColor: COLORS.card,
  },
  uploadDropzoneIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  uploadDropzoneTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  uploadDropzoneSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
  },

  // Selected file card
  selectedFileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginHorizontal: H_PADDING,
    marginBottom: 20,
    padding: 14,
    ...SHADOW,
  },
  selectedFileIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  selectedFileInfo: {
    flex: 1,
    marginRight: 8,
  },
  selectedFileName: {
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  selectedFileSize: {
    fontSize: 11.5,
    color: COLORS.textMuted,
  },

  // Chips
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  // Visibility options
  visibilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  visibilityRowSpacing: {
    marginBottom: 10,
  },
  visibilityRowActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: COLORS.primary,
  },
  visibilityLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  visibilityLabelActive: {
    color: COLORS.primary,
  },
  visibilitySubtitle: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
  },

  // Related group
  groupOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
  },
  infoRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  groupOptionText: {
    fontSize: 13.5,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  groupOptionCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },

  // Guidelines
  guidelinesCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.warningLight,
    marginHorizontal: H_PADDING,
    marginBottom: 20,
    borderRadius: 14,
    padding: 14,
  },
  guidelinesText: {
    flex: 1,
    fontSize: 12,
    color: '#92600F',
    lineHeight: 17,
    marginLeft: 10,
  },

  // Upload state UI
  stateCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: H_PADDING,
    marginBottom: 20,
    borderRadius: 14,
    padding: 14,
    ...SHADOW,
  },
  stateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  stateUploadingText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.chipBg,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  stateSuccessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
  },
  stateSuccessText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.success,
    marginLeft: 10,
  },
  stateErrorCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.dangerLight,
  },
  stateErrorText: {
    flex: 1,
    fontSize: 12.5,
    color: COLORS.danger,
    marginLeft: 10,
    lineHeight: 18,
  },

  // Upload button
  uploadButtonWrap: {
    paddingHorizontal: H_PADDING,
  },
  });
}
