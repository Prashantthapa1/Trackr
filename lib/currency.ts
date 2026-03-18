/**
 * lib/currency.ts
 *
 * Currency utilities for Trackr. NPR (Nepalese Rupee) is the default currency.
 * FREE users only get NPR + USD; PRO users get the full list. The `formatCurrency`
 * function formats any amount with the correct locale symbol, while `formatNPR`
 * is a shorthand for the most common case.
 */

export interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
  locale: string;
}

export const ALL_CURRENCIES: CurrencyOption[] = [
  { code: "NPR", name: "Nepalese Rupee", symbol: "रू", locale: "ne-NP" },
  { code: "USD", name: "US Dollar", symbol: "$", locale: "en-US" },
  { code: "EUR", name: "Euro", symbol: "€", locale: "de-DE" },
  { code: "GBP", name: "British Pound", symbol: "£", locale: "en-GB" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", locale: "en-IN" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", locale: "ja-JP" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", locale: "en-AU" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", locale: "en-CA" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", locale: "de-CH" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", locale: "zh-CN" },
];

export const FREE_CURRENCIES: CurrencyOption[] = ALL_CURRENCIES.filter((c) =>
  ["NPR", "USD"].includes(c.code)
);

export function getCurrenciesForPlan(plan: string): CurrencyOption[] {
  return plan === "FREE" ? FREE_CURRENCIES : ALL_CURRENCIES;
}

export function formatCurrency(amount: number, currencyCode: string): string {
  // Special handling for NPR to always show "NPR 1,234.00" format
  if (currencyCode === "NPR") {
    return formatNPR(amount);
  }

  const currency = ALL_CURRENCIES.find((c) => c.code === currencyCode);
  const locale = currency?.locale ?? "en-US";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNPR(amount: number): string {
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `NPR ${formatted}`;
}
