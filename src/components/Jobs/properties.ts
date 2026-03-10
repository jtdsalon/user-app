/** All string labels and text for Jobs components */

export const JOBS_PROPERTIES = {
  // Page header
  pageTitle: 'Artisan',
  pageTitleHighlight: 'Careers',
  pageSubtitle: 'Join the elite network of master artisans. Discover opportunities within the world\'s most prestigious sanctuaries.',

  // Search
  searchPlaceholder: 'Search by role, salon, or expertise...',

  // Job card
  postedPrefix: 'Posted',
  appliedChip: 'APPLIED',

  // Section headers
  responsibilities: 'RESPONSIBILITIES',
  qualifications: 'QUALIFICATIONS',
  sanctuaryExperience: 'THE SANCTUARY EXPERIENCE',

  // Buttons
  submitPortfolio: 'SUBMIT PORTFOLIO',
  applicationSent: 'APPLICATION SENT',
  loadMoreOpportunities: 'LOAD MORE OPPORTUNITIES',

  // Disclaimer
  applicationsDisclaimer: '* All applications are handled with absolute discretion and artistic integrity.',

  // Empty state
  noPositionsFound: 'No positions found for this query.',
  tryRefiningSearch: 'Try refining your search terms.',

  // End of list
  viewedAllPositions: 'YOU HAVE VIEWED ALL ARCHIVED POSITIONS',
} as const;

export const JOB_APPLICATION_PROPERTIES = {
  // Success state
  successTitle: 'APPLICATION SENT',
  successMessage: (salonName: string) => `Your portfolio has been submitted to ${salonName}.`,
  successSubtext: 'We will review your work with absolute discretion.',

  // Header
  headerLabel: 'ARTISAN APPLICATION',
  atSalonPrefix: 'at',

  // Form fields
  fullNameLabel: 'Full Name',
  fullNamePlaceholder: 'Enter your professional name',
  emailLabel: 'Email Address',
  emailPlaceholder: 'your@email.com',
  portfolioLabel: 'Digital Portfolio Link',
  portfolioPlaceholder: 'https://portfolio.com or Instagram',
  resumeLabel: 'CV / Resume Link (Optional)',
  resumePlaceholder: 'Link to your CV',
  artisticStatementLabel: 'Artistic Statement',
  artisticStatementPlaceholder: 'Tell us about your creative vision...',

  // Submit button
  submitting: 'SUBMITTING...',
  submitApplication: 'SUBMIT APPLICATION',
} as const;
