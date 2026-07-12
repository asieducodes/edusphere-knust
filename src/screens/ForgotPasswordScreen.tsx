import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Input } from '../components/common';
import { authService } from '../services/auth';
import { validateForgotPasswordForm } from '../utils/authValidation';
import { colors, spacing, typography } from '../theme/colors';
import { AuthStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    const result = validateForgotPasswordForm(email);
    setError(result.errors.email);
    if (!result.isValid) return;

    setIsSubmitting(true);
    try {
      await authService.forgotPassword({ email });
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Reset your password</Text>
        <Text style={styles.subtitle}>
          {sent ? 'Check your KNUST email for a reset link.' : "We'll send a reset link to your KNUST email."}
        </Text>

        {!sent && (
          <View style={styles.form}>
            <Input
              label="KNUST Email"
              placeholder="you@st.knust.edu.gh"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              error={error}
            />
            <Button label="Send Reset Link" onPress={handleSubmit} loading={isSubmitting} style={styles.button} />
          </View>
        )}

        <Button label="Back to Log In" variant="ghost" onPress={() => navigation.navigate('Login')} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, padding: spacing.lg, justifyContent: 'center' },
  title: { ...typography.h1, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.lg },
  form: { marginTop: spacing.md },
  button: { marginTop: spacing.sm, marginBottom: spacing.lg },
});