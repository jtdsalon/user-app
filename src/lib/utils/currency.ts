/**
 * Centralized currency formatting for Sri Lankan Rupees (LKR).
 * Use this utility for all monetary values across the app.
 */
import { DEFAULT_CURRENCY, DEFAULT_LOCALE } from '../constants/currency'

/**
 * Format amount as LKR with consistent decimal precision.
 * Handles null/undefined, zero, negative values, and prevents NaN.
 */
export const formatLKR = (amount: number | string): string => {
  if (amount !== 0 && !amount) return 'LKR 0.00'
  const num = Number(amount)
  if (Number.isNaN(num)) return 'LKR 0.00'
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: 'currency',
    currency: DEFAULT_CURRENCY,
    minimumFractionDigits: 2,
  }).format(num)
}

/**
 * Future-ready formatter for multi-currency support.
 */
export const formatCurrency = (
  amount: number | string,
  currency = DEFAULT_CURRENCY,
  locale = DEFAULT_LOCALE
): string => {
  if (amount !== 0 && !amount) return `${currency} 0.00`
  const num = Number(amount)
  if (Number.isNaN(num)) return `${currency} 0.00`
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(num)
}
