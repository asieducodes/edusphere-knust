/**
 * EduSphere — utils/authValidation.ts
 * -----------------------------------------------------------------------
 * Shared validation for every auth screen (Login, Signup, Forgot Password).
 * Screens should import from here instead of writing their own email-check
 * or required-field logic — that way the KNUST domain rule, and every
 * error message, only exists in one place.
 * -----------------------------------------------------------------------
 */

// The two domains KNUST issues student emails under. Update this single
// array if the accepted domains ever change — every screen reads from it.
export const KNUST_EMAIL_DOMAINS = ['@knust.edu.gh', '@st.knust.edu.gh'];

/** True if the email ends with one of the accepted KNUST domains. */
export function isValidKnustEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return KNUST_EMAIL_DOMAINS.some((domain) => normalized.endsWith(domain));
}

/** Returns the domain portion of an email (e.g. "@knust.edu.gh"), or an
 *  empty string if the input doesn't contain "@". Useful for displaying
 *  or logging which domain a student signed up with. */
export function getEmailDomain(email: string): string {
  const trimmed = email.trim();
  const atIndex = trimmed.lastIndexOf('@');
  return atIndex === -1 ? '' : trimmed.slice(atIndex).toLowerCase();
}

// -----------------------------------------------------------------------
// Shared result shape — every validate*Form function below returns this,
// so screens can handle them identically: check `isValid`, then read
// `errors.<fieldName>` for the message to show under that field.
// -----------------------------------------------------------------------
export interface FieldErrors {
  [field: string]: string | undefined;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FieldErrors;
}

const buildResult = (errors: FieldErrors): ValidationResult => ({
  isValid: Object.values(errors).every((message) => !message),
  errors,
});

// -----------------------------------------------------------------------
// LOGIN
// -----------------------------------------------------------------------
export function validateLoginForm(email: string, password: string): ValidationResult {
  const errors: FieldErrors = {};

  if (!email.trim()) {
    errors.email = 'Please enter your email address.';
  } else if (!isValidKnustEmail(email)) {
    errors.email = 'Please use a valid KNUST student email.';
  }

  if (!password.trim()) {
    errors.password = 'Please enter your password.';
  }

  return buildResult(errors);
}

// -----------------------------------------------------------------------
// SIGNUP
// -----------------------------------------------------------------------
export interface SignupFormData {
  fullName: string;
  email: string;
  programme: string;
  department: string;
  level: string;
  password: string;
  confirmPassword: string;
  agreedToTerms: boolean;
}

export function validateSignupForm(data: SignupFormData): ValidationResult {
  const errors: FieldErrors = {};

  if (!data.fullName.trim()) {
    errors.fullName = 'Please enter your full name.';
  }

  if (!data.email.trim()) {
    errors.email = 'Please enter your email address.';
  } else if (!isValidKnustEmail(data.email)) {
    errors.email = 'Please use a valid KNUST student email.';
  }

  if (!data.programme.trim()) {
    errors.programme = 'Please select your programme.';
  }

  if (!data.department.trim()) {
    errors.department = 'Please select your department.';
  }

  if (!data.level.trim()) {
    errors.level = 'Please select your level.';
  }

  if (!data.password.trim()) {
    errors.password = 'Please enter your password.';
  } else if (data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }

  if (!data.confirmPassword.trim()) {
    // Not one of the literal messages given in spec — "confirm password is
    // required" didn't have an exact wording provided, so this follows the
    // same friendly tone as the rest. Easy to swap if you want exact parity.
    errors.confirmPassword = 'Please confirm your password.';
  } else if (data.confirmPassword !== data.password) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  if (!data.agreedToTerms) {
    errors.agreedToTerms = 'Please agree to the Terms of Service and Privacy Policy to continue.';
  }

  return buildResult(errors);
}

// -----------------------------------------------------------------------
// FORGOT PASSWORD
// -----------------------------------------------------------------------
export function validateForgotPasswordForm(email: string): ValidationResult {
  const errors: FieldErrors = {};

  if (!email.trim()) {
    errors.email = 'Please enter your email address.';
  } else if (!isValidKnustEmail(email)) {
    errors.email = 'Please use a valid KNUST student email.';
  }

  return buildResult(errors);
}
