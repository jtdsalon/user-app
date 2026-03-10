export const NOTIFICATION_STRINGS = {
  view: {
    activity: 'ACTIVITY',
    subtitle: 'Your Aesthetic Interactions',
    unread: 'UNREAD',
    markAllRead: 'MARK ALL READ',
    clearArchive: 'CLEAR ARCHIVE',
    loading: 'Loading...',
    emptyMessage: 'Silence is beautiful. No notifications to show.',
    new: 'NEW',
  },

  tabs: {
    all: 'ALL',
    bookings: 'BOOKINGS',
    jobs: 'JOBS',
    reviews: 'REVIEWS',
    other: 'OTHER',
  },

  popover: {
    title: 'NOTIFICATIONS',
    noUpdates: 'No new updates',
    viewAllActivity: 'View All Activity',
  },

  fallbacks: {
    someone: 'Someone',
    justNow: 'Just now',
  },
};

export const NOTIFICATION_LOCALES: Record<string, typeof NOTIFICATION_STRINGS> = {
  en: NOTIFICATION_STRINGS,
};

let currentLocale = 'en';

export function setNotificationLocale(locale: string) {
  if (NOTIFICATION_LOCALES[locale]) currentLocale = locale;
}

export function getNotificationStrings(locale?: string) {
  const key = locale || currentLocale || 'en';
  return NOTIFICATION_LOCALES[key] || NOTIFICATION_STRINGS;
}
