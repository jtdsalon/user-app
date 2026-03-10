export const AUTH_STRINGS = {
  leftPanel: {
    title: 'Your Beauty, Simplified.',
    description:
      'Book the best hair, skin, and spa services in the city. Find top stylists and manage your appointments easily.',
    stats: {
      salons: '500+',
      salonsLabel: 'SALONS',
      stylists: '1.2k',
      stylistsLabel: 'STYLISTS',
      rating: '4.9/5',
      ratingLabel: 'AVG RATING',
    },
  },

  form: {
    googleLogin: 'Continue with Google',
    appleLogin: 'Continue with Apple',
    orUse: 'OR USE EMAIL/PHONE',
    loginTab: 'LOGIN',
    signupTab: 'SIGN UP',
    login: 'LOGIN',
    createAccount: 'CREATE ACCOUNT',
    forgotPassword: 'Forgot Password?',
    contactLabel: 'Email or Phone Number',
    firstName: 'First Name',
    lastName: 'Last Name',
    password: 'Password',
    sendLink: 'SEND LINK',
    backToLogin: 'BACK TO LOGIN',
  },

  errors: {
    firstNameRequired: 'First name is required',
    lastNameRequired: 'Last name is required',
    contactRequired: 'Email or Phone is required',
    contactInvalid: 'Please enter a valid email or phone number',
    passwordRequired: 'Password is required',
    passwordShort: 'Password must be at least 6 characters',
    generic: 'An error occurred. Please try again.',
    contactValidRequired: 'Valid contact required',

    // Map backend machine codes to friendly messages
    codeMap: {
      INVALID_CREDENTIALS: 'Invalid email or password',
      USER_NOT_FOUND: 'User not found',
      ACCOUNT_LOCKED: 'Your account has been locked. Contact support.',
      TOO_MANY_REQUESTS: 'Too many attempts. Please try again later.',
      VALIDATION_ERROR: 'Invalid input. Please check your details and try again.',
      EMAIL_EXISTS: 'An account with this email already exists.',
      WEAK_PASSWORD: 'Password is too weak. Choose a stronger password.',
      INVALID_TOKEN: 'Invalid or expired token. Please request a new one.',
      TOKEN_EXPIRED: 'Session expired. Please login again.',
      REFRESH_TOKEN_INVALID: 'Refresh token invalid. Please login again.',
    },
  },

  forgot: {
    resetTitle: 'Reset Password',
    resetDescription: 'Enter your email or phone to get reset instructions.',
    linkSentTitle: 'Link Sent',
    linkSentDescription: 'Instructions have been sent to {contact}. Please check your inbox.',
  },

  legal: {
    terms: 'Terms',
    privacy: 'Privacy Policy',
    termsTitle: 'Terms & Privacy',
    termsContent:
      'By using this service you agree to the terms and conditions. This is a placeholder — replace with the real legal text.',
    privacyContent:
      'We respect your privacy. This is a placeholder — replace with the real privacy policy.',
    close: 'Close',
  },
};

// Export supported locales (for future translations)
export const AUTH_LOCALES: Record<string, typeof AUTH_STRINGS> = {
  en: AUTH_STRINGS,
};

let currentLocale = 'en'

export function setAuthLocale(locale: string) {
  if (AUTH_LOCALES[locale]) currentLocale = locale
}

export function getAuthStrings(locale?: string) {
  const key = locale || currentLocale || 'en'
  return AUTH_LOCALES[key] || AUTH_STRINGS
}
