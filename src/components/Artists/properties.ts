/** UI strings and labels for Artists / Consultant components */

export const ARTISTS_PROPERTIES = {
  vibe: {
    title: 'Define Your Vibe',
    subtitle: 'Select the aesthetic core that resonates with your vision.',
    options: ['Minimalist', 'Opulent', 'Avant-Garde'] as const,
  },

  diagnostic: {
    title: 'Deep Diagnosis',
    subtitle: 'Tell us about your aesthetic history and concerns.',
    historyLabel: 'Aesthetic History',
    historyPlaceholder: 'Past treatments, sensitivities, or specific goals...',
    initCta: 'INITIALIZE CONSULTATION',
  },

  consult: {
    welcomeMessage:
      'Welcome to the Visionary Suite. I am your aesthetic architect. Capture a selfie or upload an image, then describe the transformation you seek.',
    stylePreview: 'STYLE PREVIEW',
    downloadTooltip: 'Download Masterpiece',
    inputPlaceholder: 'Refine your vision...',
    takeSelfie: 'Take Selfie',
    uploadPhoto: 'Upload Photo',
    listening: 'Listening...',
    voiceInput: 'Voice Input',
    defaultPrompt: 'Analyze my features and suggest a transformative aesthetic change.',
    aiFallback: 'I have prepared your personalized aesthetic blueprint.',
    aiError: "My artistic intuition is momentarily clouded. Let's try another perspective.",
  },

  camera: {
    title: 'Capture Your Essence',
    captureCta: 'CAPTURE',
  },

  analytical: [
    'Analyzing facial geometry...',
    'Decoding pigment undertones...',
    'Preserving identity markers...',
    'Simulating style transformation...',
    'Synthesizing your masterpiece...',
  ] as const,

  errors: {
    cameraDenied: 'Camera access denied or unavailable.',
    imageProcessFailed: 'Failed to process visual input. Please try a different image.',
  },
} as const;
