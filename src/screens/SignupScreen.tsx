import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Input } from '../components/common';
import { useAuth } from '../context/AuthContext';
import { validateSignupForm } from '../utils/authValidation';
import { colors, spacing, typography } from '../theme/colors';
import { AuthStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

export default function SignupScreen({ navigation }: Props) {
  const { completeSignup } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSignup = async () => {
    const result = validateSignupForm(fullName, email, password, confirmPassword);
    setErrors(result.errors);
    if (!result.isValid) return;

    setFormError(null);
    setIsSubmitting(true);
    try {
      await completeSignup(fullName, email, password);
      navigation.navigate('EmailVerification', { email });
    } catch (err: any) {
      setFormError(err?.response?.data?.detail ?? 'Signup failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Verified KNUST students only</Text>

        <View style={styles.form}>
          <Input label="Full Name" placeholder="Kwame Nkrumah" value={fullName} onChangeText={setFullName} error={errors.fullName} />
          <Input
            label="KNUST Email"
            placeholder="you@st.knust.edu.gh"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
          />
          <Input label="Password" placeholder="At least 8 characters" secureTextEntry value={password} onChangeText={setPassword} error={errors.password} />
          <Input
            label="Confirm Password"
            placeholder="Re-enter password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={errors.confirmPassword}
          />

          {formError ? <Text style={styles.formError}>{formError}</Text> : null}

          <Button label="Sign Up" onPress={handleSignup} loading={isSubmitting} style={styles.button} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Text style={styles.footerLink} onPress={() => navigation.navigate('Login')}>
            Log in
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