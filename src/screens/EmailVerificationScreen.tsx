import React, { useState } from 'react';
import { Image, Linking, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Input } from '../components/common';
import { authService } from '../services/auth';
import { colors, spacing, typography } from '../theme/colors';
import { AuthStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'EmailVerification'>;

export default function EmailVerificationScreen({ route, navigation }: Props) {
  const { email } = route.params;
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!code || code.length < 4) {
      setError('Enter the verification code from your email');
      return;
    }
    setError(undefined);
    setIsSubmitting(true);
    try {
      await authService.verifyEmail({ email, code });
      navigation.getParent()?.goBack();
    } catch {
      setError('Invalid or expired code. Try resending.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setResendMessage(null);
    try {
      await authService.resendVerification(email);
      setResendMessage('A new code has been sent.');
    } catch {
      setResendMessage('Could not resend. Try again shortly.');
    } finally {
      setIsResending(false);
    }
  };

  const openOutlook = () => {
    Linking.openURL('ms-outlook://').catch(() => Linking.openURL('https://outlook.office.com'));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify your email</Text>
      <Text style={styles.subtitle}>We sent a code to {email}</Text>

      <View style={styles.outlookRow}>
        <Image
          source={require('../../assets/icons/outlook-logo.png')}
          style={styles.outlookLogo}
          resizeMode="contain"
        />
        <Text style={styles.outlookText} onPress={openOutlook}>
          Open Outlook
        </Text>
      </View>

      <Input
        label="Verification Code"
        placeholder="6-digit code"
        keyboardType="number-pad"
        value={code}
        onChangeText={setCode}
        error={error}
      />

      <Button label="Verify" onPress={handleVerify} loading={isSubmitting} style={styles.button} />
      <Button label="Resend Code" variant="ghost" onPress={handleResend} loading={isResending} />
      {resendMessage ? <Text style={styles.resendMessage}>{resendMessage}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, justifyContent: 'center' },
  title: { ...typography.h1, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.lg },
  outlookRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  outlookLogo: { width: 24, height: 24, marginRight: spacing.sm },
  outlookText: { ...typography.body, color: colors.primary, fontWeight: '600' },
  button: { marginTop: spacing.sm },
  resendMessage: { ...typography.bodySmall, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm },
});