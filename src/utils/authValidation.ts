const KNUST_EMAIL_DOMAINS = ['knust.edu.gh', 'st.knust.edu.gh'];

export function getEmailDomain(email: string): string {
  const parts = email.trim().toLowerCase().split('@');
  return parts.length === 2 ? parts[1] : '';
}

export function isValidKnustEmail(email: string): boolean {
  if (!email || !email.includes('@')) return false;
  return KNUST_EMAIL_DOMAINS.includes(getEmailDomain(email));
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateLoginForm(email: string, password: string): ValidationResult {
  const errors: Record<string, string> = {};

  if (!email) {
    errors.email = 'Email is required';
  } else if (!isValidKnustEmail(email)) {
    errors.email = 'Use your KNUST email (@knust.edu.gh or @st.knust.edu.gh)';
  }

  if (!password) {
    errors.password = 'Password is required';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateSignupForm(
  fullName: string,
  email: string,
  password: string,
  confirmPassword: string,
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!fullName || fullName.trim().length < 2) {
    errors.fullName = 'Enter your full name';
  }

  if (!email) {
    errors.email = 'Email is required';
  } else if (!isValidKnustEmail(email)) {
    errors.email = 'Use your KNUST email (@knust.edu.gh or @st.knust.edu.gh)';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }

  if (confirmPassword !== password) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateForgotPasswordForm(email: string): ValidationResult {
  const errors: Record<string, string> = {};

  if (!email) {
    errors.email = 'Email is required';
  } else if (!isValidKnustEmail(email)) {
    errors.email = 'Use your KNUST email (@knust.edu.gh or @st.knust.edu.gh)';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}
