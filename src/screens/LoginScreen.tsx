import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Input } from '../components/common';
import { useAuth } from '../context/AuthContext';
import { validateLoginForm } from '../utils/authValidation';
import { colors, spacing, typography } from '../theme/colors';
import { AuthStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleLogin = async () => {
    const result = validateLoginForm(email, password);
    setErrors(result.errors);
    if (!result.isValid) return;

    setFormError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setFormError(err?.response?.data?.detail ?? 'Login failed. Check your details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Log in with your KNUST email</Text>

        <View style={styles.form}>
          <Input
            label="KNUST Email"
            placeholder="you@st.knust.edu.gh"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
          />
          <Input
            label="Password"
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            error={errors.password}
          />

          {formError ? <Text style={styles.formError}>{formError}</Text> : null}

          <Button label="Log In" onPress={handleLogin} loading={isSubmitting} style={styles.button} />

          <Button
            label="Forgot password?"
            variant="ghost"
            onPress={() => navigation.navigate('ForgotPassword')}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don&apos;t have an account? </Text>
          <Text style={styles.footerLink} onPress={() => navigation.navigate('Signup')}>
            Sign up
          </Text>
        </View>
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
  button: { marginTop: spacing.sm },
  formError: { ...typography.bodySmall, color: colors.error, marginBottom: spacing.sm },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  footerText: { ...typography.body, color: colors.textSecondary },
  footerLink: { ...typography.body, color: colors.primary, fontWeight: '600' },
});