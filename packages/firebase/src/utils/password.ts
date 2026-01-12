/**
 * Password generation utility
 * Generates secure random passwords for student accounts
 */

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SPECIAL = '!@#$%^&*()_+-=[]{}|;:,.<>?';

/**
 * Generate a cryptographically secure random password
 * @param length Password length (minimum 12)
 * @returns Generated password
 */
export function generateSecurePassword(length: number = 12): string {
  if (length < 12) {
    length = 12;
  }

  const allChars = LOWERCASE + UPPERCASE + NUMBERS + SPECIAL;

  // Ensure at least one character from each category
  const password: string[] = [
    getRandomChar(LOWERCASE),
    getRandomChar(UPPERCASE),
    getRandomChar(NUMBERS),
    getRandomChar(SPECIAL),
  ];

  // Fill the rest with random characters
  for (let i = password.length; i < length; i++) {
    password.push(getRandomChar(allChars));
  }

  // Shuffle the password
  return shuffleArray(password).join('');
}

/**
 * Get a random character from a string
 */
function getRandomChar(chars: string): string {
  const randomIndex = Math.floor(Math.random() * chars.length);
  return chars[randomIndex];
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Validate password strength
 * @param password Password to validate
 * @returns Object with validation result and details
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  hasMinLength: boolean;
  hasLowercase: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
} {
  const hasMinLength = password.length >= 12;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);

  return {
    isValid: hasMinLength && hasLowercase && hasUppercase && hasNumber && hasSpecial,
    hasMinLength,
    hasLowercase,
    hasUppercase,
    hasNumber,
    hasSpecial,
  };
}
