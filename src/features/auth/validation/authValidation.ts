const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim();
  if (!trimmed) return { valid: false, error: "Email is required." };
  if (!EMAIL_REGEX.test(trimmed)) return { valid: false, error: "Enter a valid email address." };
  return { valid: true };
}

export function validatePassword(password: string): ValidationResult {
  if (!password) return { valid: false, error: "Password is required." };
  if (password.length < 8) return { valid: false, error: "Password must be at least 8 characters." };
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return { valid: false, error: "Password must contain both letters and numbers." };
  }
  return { valid: true };
}

export function validateConfirmPassword(password: string, confirm: string): ValidationResult {
  if (!confirm) return { valid: false, error: "Please confirm your password." };
  if (password !== confirm) return { valid: false, error: "Passwords do not match." };
  return { valid: true };
}

export function validateDisplayName(name: string): ValidationResult {
  const trimmed = name.trim();
  if (!trimmed) return { valid: false, error: "Name is required." };
  if (trimmed.length < 2) return { valid: false, error: "Name must be at least 2 characters." };
  return { valid: true };
}

/** Password strength on a 0-4 scale, used for the signup strength meter. */
export function passwordStrength(password: string): 0 | 1 | 2 | 3 | 4 {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 4) as 0 | 1 | 2 | 3 | 4;
}
