/**
 * EduSphere — screens/PostDetailsScreen.tsx
 * -----------------------------------------------------------------------
 * The full discussion thread for one group post: the original post plus
 * every reply, with a composer to add a new one. Reached by tapping a
 * "Recent Discussions" row in GroupDetailsScreen.
 *
 * There's no GET /posts/:postId endpoint on the backend (posts are only
 * ever listed per-group), so the post itself is read out of the same
 * useGroupPosts(groupId) cache GroupDetailsScreen already populated —
 * same data source, just filtered to one id, rather than adding a
 * single-purpose endpoint for a value already in cache.
 * -----------------------------------------------------------------------
 */

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ThemeColors, SHADOW } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { RootStackParamList } from '../navigation/types';
import { ScreenHeader, LoadingView, ErrorView, EmptyState } from '../components/common';
import {
  useGroupPosts,
  useGroupMembers,
  usePostComments,
  useCreatePostComment,
  useDeletePost,
  useDeleteComment,
} from '../hooks/useGroups';
import { useCreateReport } from '../hooks/useReports';
import { useAuth } from '../context/AuthContext';
import { PostComment } from '../types/group';

type Props = NativeStackScreenProps<RootStackParamList, 'PostDetails'>;

function relativeTime(iso: string, t: (path: string, options?: Record<string, string | number>) => string): string {
  const then = new Date(iso).getTime();
  const diffMs = Date.now() - then;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return t('common.justNow');
  if (minutes < 60) return t('common.minutesAgo', { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t('common.hoursAgo', { count: hours });
  const days = Math.floor(hours / 24);
  return t('common.daysAgo', { count: days });
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

const PostDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { postId, groupId } = route.params;
  const { user } = useAuth();
  const { colors: COLORS, isDark } = useTheme();
  const { t } = useLanguage();
  const styles = React.useMemo(() => createStyles(COLORS), [COLORS]);

  const [replyText, setReplyText] = useState('');

  const postsQuery = useGroupPosts(groupId);
  const membersQuery = useGroupMembers(groupId);
  const commentsQuery = usePostComments(postId);

  const createCommentMutation = useCreatePostComment(postId, groupId);
  const deletePostMutation = useDeletePost(groupId);
  const deleteCommentMutation = useDeleteComment(postId, groupId);
  const reportMutation = useCreateReport();

  useFocusEffect(
    useCallback(() => {
      commentsQuery.refetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const post = postsQuery.data?.items.find((item) => item.id === postId);
  const comments = commentsQuery.data?.items ?? [];
  const isGroupOwner = membersQuery.data?.items.find((m) => m.id === user?.id)?.role === 'owner';
  const isMyPost = post?.authorId === user?.id;
  const canDeletePost = isMyPost || isGroupOwner;

  const canDeleteComment = useCallback(
    (comment: PostComment) => comment.authorId === user?.id || isGroupOwner,
    [user?.id, isGroupOwner]
  );

  const handleSubmitReply = () => {
    const body = replyText.trim();
    if (!body) return;
    createCommentMutation.mutate(
      { body },
      {
        onSuccess: () => setReplyText(''),
        onError: (err) => {
          const message = (err as { message?: string })?.message ?? t('common.somethingWentWrong');
          Alert.alert(t('common.error'), message);
        },
      }
    );
  };

  const handleDeleteComment = (comment: PostComment) => {
    Alert.alert(t('postDetails.deleteReplyTitle'), t('postDetails.deleteReplyBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () =>
          deleteCommentMutation.mutate(comment.id, {
            onError: (err) => {
              const message = (err as { message?: string })?.message ?? t('common.somethingWentWrong');
              Alert.alert(t('common.error'), message);
            },
          }),
      },
    ]);
  };

  const handleDeletePost = () => {
    Alert.alert(t('postDetails.deleteDiscussionTitle'), t('postDetails.deleteDiscussionBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () =>
          deletePostMutation.mutate(postId, {
            onSuccess: () => navigation.goBack(),
            onError: (err) => {
              const message = (err as { message?: string })?.message ?? t('common.somethingWentWrong');
              Alert.alert(t('common.error'), message);
            },
          }),
      },
    ]);
  };

  const handleReportPost = () => {
    Alert.alert(t('postDetails.reportDiscussionTitle'), t('groupDetails.reportGroupBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.report'),
        style: 'destructive',
        onPress: () =>
          reportMutation.mutate(
            { targetType: 'post', targetId: postId, reason: t('postDetails.reasonInappropriatePost') },
            {
              onSuccess: () => Alert.alert(t('postDetails.reported'), t('postDetails.reportedDiscussionBody')),
              onError: (err) => {
                const message = (err as { message?: string })?.message ?? t('common.somethingWentWrong');
                Alert.alert(t('common.error'), message);
              },
            }
          ),
      },
    ]);
  };

  const handlePressOptions = () => {
    if (canDeletePost) {
      Alert.alert(t('postDetails.discussionOptions'), undefined, [
        { text: t('postDetails.deleteDiscussion'), style: 'destructive', onPress: handleDeletePost },
        { text: t('common.cancel'), style: 'cancel' },
      ]);
    } else {
      Alert.alert(t('postDetails.discussionOptions'), undefined, [
        { text: t('postDetails.reportDiscussion'), style: 'destructive', onPress: handleReportPost },
        { text: t('common.cancel'), style: 'cancel' },
      ]);
    }
  };

  const isLoading = postsQuery.isLoading || membersQuery.isLoading;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={COLORS.background} />
        <ScreenHeader title={t('postDetails.discussion')} onBack={() => navigation.goBack()} />
        <LoadingView message={t('postDetails.loading')} />
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={COLORS.background} />
        <ScreenHeader title={t('postDetails.discussion')} onBack={() => navigation.goBack()} />
        <ErrorView message={t('postDetails.notFound')} onRetry={() => postsQuery.refetch()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={COLORS.background} />

      <ScreenHeader
        title={t('postDetails.discussion')}
        onBack={() => navigation.goBack()}
        rightIcon="more-vertical"
        onPressRight={handlePressOptions}
      />

      <KeyboardAvoidingView
        style={styles.flexOne}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          style={styles.flexOne}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ---------------------------------------------------------- */}
          {/* ORIGINAL POST                                               */}
          {/* ---------------------------------------------------------- */}
          <View style={styles.postCard}>
            <View style={styles.postHeaderRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitials}>{initials(post.authorName)}</Text>
              </View>
              <View style={styles.postHeaderText}>
                <Text style={styles.authorName}>{post.authorName}</Text>
                <Text style={styles.timestamp}>{relativeTime(post.createdAt, t)}</Text>
              </View>
            </View>

            <Text style={styles.postTitle}>{post.title}</Text>
            {post.body ? <Text style={styles.postBody}>{post.body}</Text> : null}
          </View>

          {/* ---------------------------------------------------------- */}
          {/* REPLIES                                                     */}
          {/* ---------------------------------------------------------- */}
          <Text style={styles.repliesHeading}>
            {post.repliesCount === 1
              ? t('postDetails.reply', { count: post.repliesCount })
              : t('postDetails.replies', { count: post.repliesCount })}
          </Text>

          {commentsQuery.isLoading ? (
            <LoadingView message={t('postDetails.loadingReplies')} />
          ) : comments.length > 0 ? (
            <View style={styles.repliesList}>
              {comments.map((comment) => (
                <View key={comment.id} style={styles.commentRow}>
                  <View style={styles.avatarCircleSmall}>
                    <Text style={styles.avatarInitialsSmall}>{initials(comment.authorName)}</Text>
                  </View>
                  <View style={styles.commentBody}>
                    <View style={styles.commentHeaderRow}>
                      <Text style={styles.commentAuthor}>{comment.authorName}</Text>
                      <Text style={styles.commentTimestamp}>{relativeTime(comment.createdAt, t)}</Text>
                      {canDeleteComment(comment) ? (
                        <TouchableOpacity
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          onPress={() => handleDeleteComment(comment)}
                        >
                          <Feather name="trash-2" size={14} color={COLORS.textMuted} />
                        </TouchableOpacity>
                      ) : null}
                    </View>
                    <Text style={styles.commentText}>{comment.body}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyRepliesCard}>
              <EmptyState
                icon="message-circle"
                title={t('postDetails.noRepliesYet')}
                subtitle={t('postDetails.beFirstToRespond')}
              />
            </View>
          )}

          <View style={{ height: 12 }} />
        </ScrollView>

        {/* ---------------------------------------------------------- */}
        {/* REPLY COMPOSER                                              */}
        {/* ---------------------------------------------------------- */}
        <View style={styles.composerRow}>
          <TextInput
            style={styles.composerInput}
            value={replyText}
            onChangeText={setReplyText}
            placeholder={t('postDetails.writeReplyPlaceholder')}
            placeholderTextColor={COLORS.textMuted}
            multiline
          />
          <TouchableOpacity
            style={[styles.composerSendButton, !replyText.trim() && styles.composerSendButtonDisabled]}
            activeOpacity={0.85}
            onPress={handleSubmitReply}
            disabled={!replyText.trim() || createCommentMutation.isPending}
          >
            {createCommentMutation.isPending ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Feather name="send" size={16} color={COLORS.white} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PostDetailsScreen;

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
  flexOne: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 12,
  },

  // ---------------- Post card ----------------
  postCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    marginHorizontal: H_PADDING,
    marginTop: 12,
    padding: 16,
    ...SHADOW,
  },
  postHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postHeaderText: {
    marginLeft: 10,
  },
  authorName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  timestamp: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  postTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  postBody: {
    fontSize: 13.5,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // ---------------- Replies ----------------
  repliesHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginHorizontal: H_PADDING,
    marginTop: 22,
    marginBottom: 12,
  },
  repliesList: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    marginHorizontal: H_PADDING,
    paddingHorizontal: 16,
    ...SHADOW,
  },
  commentRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarCircleSmall: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarInitialsSmall: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  commentBody: {
    flex: 1,
  },
  commentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentAuthor: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginRight: 8,
  },
  commentTimestamp: {
    fontSize: 11,
    color: COLORS.textMuted,
    flex: 1,
  },
  commentText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
    marginTop: 4,
  },
  emptyRepliesCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    marginHorizontal: H_PADDING,
    ...SHADOW,
  },

  // ---------------- Composer ----------------
  composerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: H_PADDING,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  composerInput: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 13.5,
    color: COLORS.textPrimary,
    marginRight: 10,
    ...SHADOW,
  },
  composerSendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  composerSendButtonDisabled: {
    opacity: 0.5,
  },
  });
}
