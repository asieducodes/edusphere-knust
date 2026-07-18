/**
 * EduSphere — screens/CallScreen.tsx
 * -----------------------------------------------------------------------
 * Live group voice/video room (LiveKit) — one persistent room per group,
 * reached from GroupDetailsScreen's "Join Call" action. Fetches a scoped
 * token from callService on mount, then renders the LiveKit room: video
 * tiles for every participant, mic/camera toggles, a reconnect banner,
 * and a distinct "removed from call" state when the disconnect reason is
 * PARTICIPANT_REMOVED (the frontend counterpart to group.service.ts's
 * removeMember/leaveGroup calling RoomServiceClient.removeParticipant).
 * -----------------------------------------------------------------------
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  Platform,
  PermissionsAndroid,
  Linking,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  LiveKitRoom,
  VideoTrack,
  useTracks,
  useParticipants,
  useLocalParticipant,
  useConnectionState,
  useRoomContext,
  useIsMuted,
  AudioSession,
} from '@livekit/react-native';
import { Track, ConnectionState, RoomEvent, DisconnectReason, Participant, LocalVideoTrack } from 'livekit-client';
import type { TrackReferenceOrPlaceholder } from '@livekit/react-native';
import { ThemeColors } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { RootStackParamList } from '../navigation/types';
import { LoadingView, ErrorView } from '../components/common';
import { useJoinCall } from '../hooks/useCall';
import { CallToken } from '../types/call';

type Props = NativeStackScreenProps<RootStackParamList, 'Call'>;

async function requestAndroidCallPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  const results = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.CAMERA,
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
  ]);
  return (
    results[PermissionsAndroid.PERMISSIONS.CAMERA] === PermissionsAndroid.RESULTS.GRANTED &&
    results[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] === PermissionsAndroid.RESULTS.GRANTED
  );
}

const CallScreen: React.FC<Props> = ({ navigation, route }) => {
  const { groupId } = route.params;
  const { colors: COLORS, isDark } = useTheme();
  const { t } = useLanguage();
  const styles = React.useMemo(() => createStyles(COLORS), [COLORS]);

  const joinCallMutation = useJoinCall(groupId);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [removedFromCall, setRemovedFromCall] = useState(false);
  const [callData, setCallData] = useState<CallToken | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const granted = await requestAndroidCallPermissions();
      if (cancelled) return;
      if (!granted) {
        setPermissionDenied(true);
        return;
      }
      joinCallMutation.mutate(undefined, {
        onSuccess: (data) => {
          if (!cancelled) setCallData(data);
        },
      });
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    AudioSession.startAudioSession().catch(() => undefined);
    return () => {
      AudioSession.stopAudioSession().catch(() => undefined);
    };
  }, []);

  if (permissionDenied) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={COLORS.background} />
        <View style={styles.centerState}>
          <View style={styles.centerIconWrap}>
            <Feather name="video-off" size={28} color={COLORS.danger} />
          </View>
          <Text style={styles.centerTitle}>{t('call.permissionNeededTitle')}</Text>
          <Text style={styles.centerBody}>{t('call.permissionNeededBody')}</Text>
          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.85} onPress={() => Linking.openSettings()}>
            <Text style={styles.primaryButtonText}>{t('call.openSettings')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.textButton} activeOpacity={0.7} onPress={() => navigation.goBack()}>
            <Text style={styles.textButtonLabel}>{t('common.cancel')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (removedFromCall) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={COLORS.background} />
        <View style={styles.centerState}>
          <View style={styles.centerIconWrap}>
            <Feather name="user-x" size={28} color={COLORS.danger} />
          </View>
          <Text style={styles.centerTitle}>{t('call.removedTitle')}</Text>
          <Text style={styles.centerBody}>{t('call.removedBody')}</Text>
          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.85} onPress={() => navigation.goBack()}>
            <Text style={styles.primaryButtonText}>{t('common.ok')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (joinCallMutation.isError) {
    const status = (joinCallMutation.error as { status?: number })?.status;
    const message =
      status === 403
        ? t('call.notAMemberBody')
        : (joinCallMutation.error as { message?: string })?.message ?? t('call.somethingWentWrongBody');
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={COLORS.background} />
        <ErrorView message={message} onRetry={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  if (!callData) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={COLORS.background} />
        <LoadingView message={t('call.connecting')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <LiveKitRoom
        serverUrl={callData.url}
        token={callData.token}
        connect
        audio
        video
        onDisconnected={() => navigation.goBack()}
      >
        <CallRoomContent
          styles={styles}
          COLORS={COLORS}
          t={t}
          onLeave={() => navigation.goBack()}
          onRemoved={() => setRemovedFromCall(true)}
        />
      </LiveKitRoom>
    </SafeAreaView>
  );
};

// -----------------------------------------------------------------------
// CallRoomContent — everything that needs the LiveKitRoom context
// -----------------------------------------------------------------------
interface CallRoomContentProps {
  styles: ReturnType<typeof createStyles>;
  COLORS: ThemeColors;
  t: (path: string, options?: Record<string, string | number>) => string;
  onLeave: () => void;
  onRemoved: () => void;
}

const CallRoomContent: React.FC<CallRoomContentProps> = ({ styles, COLORS, t, onLeave, onRemoved }) => {
  const room = useRoomContext();
  const connectionState = useConnectionState();
  const participants = useParticipants();
  const cameraTracks = useTracks([Track.Source.Camera]);
  const { isMicrophoneEnabled, isCameraEnabled, localParticipant, cameraTrack } = useLocalParticipant();
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isFlippingCamera, setIsFlippingCamera] = useState(false);

  useEffect(() => {
    const handleDisconnected = (reason?: DisconnectReason) => {
      if (reason === DisconnectReason.PARTICIPANT_REMOVED) onRemoved();
    };
    room.on(RoomEvent.Disconnected, handleDisconnected);
    return () => {
      room.off(RoomEvent.Disconnected, handleDisconnected);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room]);

  const isReconnecting =
    connectionState === ConnectionState.Reconnecting || connectionState === ConnectionState.SignalReconnecting;

  const cameraTrackByIdentity = new Map<string, TrackReferenceOrPlaceholder>();
  cameraTracks.forEach((track) => {
    cameraTrackByIdentity.set(track.participant.identity, track);
  });

  const handleLeave = () => {
    room.disconnect().catch(() => undefined);
    onLeave();
  };

  const handleFlipCamera = async () => {
    const videoTrack = cameraTrack?.videoTrack;
    if (!videoTrack || isFlippingCamera) return;
    const nextFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setIsFlippingCamera(true);
    try {
      await (videoTrack as LocalVideoTrack).restartTrack({ facingMode: nextFacingMode });
      setFacingMode(nextFacingMode);
    } catch {
      // Some devices only expose one camera — leave facingMode as-is.
    } finally {
      setIsFlippingCamera(false);
    }
  };

  return (
    <View style={styles.roomFlex}>
      {isReconnecting && (
        <View style={styles.reconnectBanner}>
          <Text style={styles.reconnectBannerText}>{t('call.reconnecting')}</Text>
        </View>
      )}

      <FlatList
        data={participants}
        keyExtractor={(p) => p.identity}
        numColumns={2}
        contentContainerStyle={styles.tilesGrid}
        ListHeaderComponent={
          participants.length === 1 ? (
            <View style={styles.waitingBanner}>
              <Feather name="users" size={14} color={COLORS.textMuted} />
              <Text style={styles.waitingText}>{t('call.waitingForOthers')}</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <ParticipantTile
            participant={item}
            trackRef={cameraTrackByIdentity.get(item.identity)}
            mirror={item.identity === localParticipant.identity && facingMode === 'user'}
            styles={styles}
            COLORS={COLORS}
          />
        )}
      />

      <View style={styles.participantCountBadge}>
        <Feather name="users" size={12} color={COLORS.white} />
        <Text style={styles.participantCountText}>{t('call.participantsCount', { count: participants.length })}</Text>
      </View>

      <View style={styles.controlBar}>
        <TouchableOpacity
          style={[styles.controlButton, !isMicrophoneEnabled && styles.controlButtonOff]}
          activeOpacity={0.85}
          onPress={() => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)}
        >
          <Feather name={isMicrophoneEnabled ? 'mic' : 'mic-off'} size={22} color={COLORS.white} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlButton, !isCameraEnabled && styles.controlButtonOff]}
          activeOpacity={0.85}
          onPress={() => localParticipant.setCameraEnabled(!isCameraEnabled)}
        >
          <Feather name={isCameraEnabled ? 'video' : 'video-off'} size={22} color={COLORS.white} />
        </TouchableOpacity>
        {isCameraEnabled && (
          <TouchableOpacity
            style={styles.controlButton}
            activeOpacity={0.85}
            disabled={isFlippingCamera}
            onPress={handleFlipCamera}
          >
            <Feather name="refresh-cw" size={22} color={COLORS.white} />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.leaveButton} activeOpacity={0.85} onPress={handleLeave}>
          <Feather name="phone-off" size={22} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// -----------------------------------------------------------------------
// ParticipantTile — video if publishing camera, avatar placeholder otherwise
// -----------------------------------------------------------------------
const ParticipantTile: React.FC<{
  participant: Participant;
  trackRef: TrackReferenceOrPlaceholder | undefined;
  mirror: boolean;
  styles: ReturnType<typeof createStyles>;
  COLORS: ThemeColors;
}> = ({ participant, trackRef, mirror, styles, COLORS }) => {
  const isMuted = useIsMuted(
    trackRef ?? { participant, source: Track.Source.Microphone }
  );
  const hasVideo = trackRef && trackRef.publication;

  return (
    <View style={styles.tile}>
      {hasVideo ? (
        <VideoTrack trackRef={trackRef} style={styles.tileVideo} objectFit="cover" mirror={mirror} />
      ) : (
        <View style={styles.tileAvatarWrap}>
          <Text style={styles.tileAvatarInitial}>{participant.name?.[0]?.toUpperCase() ?? '?'}</Text>
        </View>
      )}
      <View style={styles.tileNameRow}>
        {isMuted ? <Feather name="mic-off" size={11} color={COLORS.white} style={{ marginRight: 4 }} /> : null}
        <Text style={styles.tileNameText} numberOfLines={1}>
          {participant.name || participant.identity}
        </Text>
      </View>
    </View>
  );
};

export default CallScreen;

// -----------------------------------------------------------------------
// STYLES
// -----------------------------------------------------------------------
function createStyles(COLORS: ThemeColors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#0E0F14',
    },
    roomFlex: {
      flex: 1,
    },
    centerState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
    },
    centerIconWrap: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: COLORS.dangerLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    centerTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: '#F2F3F7',
      textAlign: 'center',
      marginBottom: 8,
    },
    centerBody: {
      fontSize: 13.5,
      color: '#9CA3AF',
      textAlign: 'center',
      lineHeight: 19,
      marginBottom: 24,
    },
    waitingBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
    },
    waitingText: {
      fontSize: 13.5,
      color: '#9CA3AF',
      marginLeft: 8,
    },
    primaryButton: {
      backgroundColor: COLORS.primary,
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 28,
      marginBottom: 12,
    },
    primaryButtonText: {
      fontSize: 14,
      fontWeight: '700',
      color: COLORS.white,
    },
    textButton: {
      paddingVertical: 8,
    },
    textButtonLabel: {
      fontSize: 13.5,
      color: '#9CA3AF',
    },
    reconnectBanner: {
      position: 'absolute',
      top: 12,
      left: 20,
      right: 20,
      zIndex: 10,
      backgroundColor: COLORS.warning,
      borderRadius: 10,
      paddingVertical: 8,
      alignItems: 'center',
    },
    reconnectBannerText: {
      fontSize: 12.5,
      fontWeight: '700',
      color: '#12131A',
    },
    tilesGrid: {
      padding: 8,
    },
    tile: {
      flex: 1,
      aspectRatio: 3 / 4,
      margin: 4,
      borderRadius: 14,
      overflow: 'hidden',
      backgroundColor: '#191B22',
      justifyContent: 'flex-end',
    },
    tileVideo: {
      ...StyleSheet.absoluteFillObject,
    },
    tileAvatarWrap: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: COLORS.primaryLight,
    },
    tileAvatarInitial: {
      fontSize: 32,
      fontWeight: '700',
      color: COLORS.primary,
    },
    tileNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.45)',
      paddingHorizontal: 8,
      paddingVertical: 5,
    },
    tileNameText: {
      fontSize: 11.5,
      fontWeight: '600',
      color: '#FFFFFF',
      flexShrink: 1,
    },
    participantCountBadge: {
      position: 'absolute',
      top: 12,
      right: 16,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    participantCountText: {
      fontSize: 11.5,
      fontWeight: '600',
      color: '#FFFFFF',
      marginLeft: 5,
    },
    controlBar: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 18,
      gap: 18,
    },
    controlButton: {
      width: 54,
      height: 54,
      borderRadius: 27,
      backgroundColor: 'rgba(255,255,255,0.15)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    controlButtonOff: {
      backgroundColor: 'rgba(255,255,255,0.35)',
    },
    leaveButton: {
      width: 54,
      height: 54,
      borderRadius: 27,
      backgroundColor: COLORS.danger,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
