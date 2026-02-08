export interface Country {
  code: string;
  name: string;
  currency: string;
  symbol: string;
  locale: string;
  flag: string;
}

export const COUNTRIES: Country[] = [
  { code: "US", name: "United States", currency: "USD", symbol: "$", locale: "en-US", flag: "\ud83c\uddfa\ud83c\uddf8" },
  { code: "IN", name: "India", currency: "INR", symbol: "\u20b9", locale: "en-IN", flag: "\ud83c\uddee\ud83c\uddf3" },
  { code: "GB", name: "United Kingdom", currency: "GBP", symbol: "\u00a3", locale: "en-GB", flag: "\ud83c\uddec\ud83c\udde7" },
  { code: "EU", name: "European Union", currency: "EUR", symbol: "\u20ac", locale: "de-DE", flag: "\ud83c\uddea\ud83c\uddfa" },
  { code: "CA", name: "Canada", currency: "CAD", symbol: "CA$", locale: "en-CA", flag: "\ud83c\udde8\ud83c\udde6" },
  { code: "AU", name: "Australia", currency: "AUD", symbol: "A$", locale: "en-AU", flag: "\ud83c\udde6\ud83c\uddfa" },
  { code: "JP", name: "Japan", currency: "JPY", symbol: "\u00a5", locale: "ja-JP", flag: "\ud83c\uddef\ud83c\uddf5" },
  { code: "CN", name: "China", currency: "CNY", symbol: "\u00a5", locale: "zh-CN", flag: "\ud83c\udde8\ud83c\uddf3" },
  { code: "KR", name: "South Korea", currency: "KRW", symbol: "\u20a9", locale: "ko-KR", flag: "\ud83c\uddf0\ud83c\uddf7" },
  { code: "SG", name: "Singapore", currency: "SGD", symbol: "S$", locale: "en-SG", flag: "\ud83c\uddf8\ud83c\uddec" },
  { code: "AE", name: "United Arab Emirates", currency: "AED", symbol: "\u062f.\u0625", locale: "ar-AE", flag: "\ud83c\udde6\ud83c\uddea" },
  { code: "SA", name: "Saudi Arabia", currency: "SAR", symbol: "\ufdfc", locale: "ar-SA", flag: "\ud83c\uddf8\ud83c\udde6" },
  { code: "BR", name: "Brazil", currency: "BRL", symbol: "R$", locale: "pt-BR", flag: "\ud83c\udde7\ud83c\uddf7" },
  { code: "MX", name: "Mexico", currency: "MXN", symbol: "MX$", locale: "es-MX", flag: "\ud83c\uddf2\ud83c\uddfd" },
  { code: "ZA", name: "South Africa", currency: "ZAR", symbol: "R", locale: "en-ZA", flag: "\ud83c\uddff\ud83c\udde6" },
  { code: "NG", name: "Nigeria", currency: "NGN", symbol: "\u20a6", locale: "en-NG", flag: "\ud83c\uddf3\ud83c\uddec" },
  { code: "EG", name: "Egypt", currency: "EGP", symbol: "E\u00a3", locale: "ar-EG", flag: "\ud83c\uddea\ud83c\uddec" },
  { code: "KE", name: "Kenya", currency: "KES", symbol: "KSh", locale: "en-KE", flag: "\ud83c\uddf0\ud83c\uddea" },
  { code: "TH", name: "Thailand", currency: "THB", symbol: "\u0e3f", locale: "th-TH", flag: "\ud83c\uddf9\ud83c\udded" },
  { code: "MY", name: "Malaysia", currency: "MYR", symbol: "RM", locale: "ms-MY", flag: "\ud83c\uddf2\ud83c\uddfe" },
  { code: "ID", name: "Indonesia", currency: "IDR", symbol: "Rp", locale: "id-ID", flag: "\ud83c\uddee\ud83c\udde9" },
  { code: "PH", name: "Philippines", currency: "PHP", symbol: "\u20b1", locale: "en-PH", flag: "\ud83c\uddf5\ud83c\udded" },
  { code: "VN", name: "Vietnam", currency: "VND", symbol: "\u20ab", locale: "vi-VN", flag: "\ud83c\uddfb\ud83c\uddf3" },
  { code: "TR", name: "Turkey", currency: "TRY", symbol: "\u20ba", locale: "tr-TR", flag: "\ud83c\uddf9\ud83c\uddf7" },
  { code: "RU", name: "Russia", currency: "RUB", symbol: "\u20bd", locale: "ru-RU", flag: "\ud83c\uddf7\ud83c\uddfa" },
  { code: "CH", name: "Switzerland", currency: "CHF", symbol: "CHF", locale: "de-CH", flag: "\ud83c\udde8\ud83c\udded" },
  { code: "SE", name: "Sweden", currency: "SEK", symbol: "kr", locale: "sv-SE", flag: "\ud83c\uddf8\ud83c\uddea" },
  { code: "NO", name: "Norway", currency: "NOK", symbol: "kr", locale: "nb-NO", flag: "\ud83c\uddf3\ud83c\uddf4" },
  { code: "NZ", name: "New Zealand", currency: "NZD", symbol: "NZ$", locale: "en-NZ", flag: "\ud83c\uddf3\ud83c\uddff" },
  { code: "IL", name: "Israel", currency: "ILS", symbol: "\u20aa", locale: "he-IL", flag: "\ud83c\uddee\ud83c\uddf1" },
  { code: "PL", name: "Poland", currency: "PLN", symbol: "z\u0142", locale: "pl-PL", flag: "\ud83c\uddf5\ud83c\uddf1" },
  { code: "CL", name: "Chile", currency: "CLP", symbol: "CL$", locale: "es-CL", flag: "\ud83c\udde8\ud83c\uddf1" },
  { code: "CO", name: "Colombia", currency: "COP", symbol: "COL$", locale: "es-CO", flag: "\ud83c\udde8\ud83c\uddf4" },
  { code: "AR", name: "Argentina", currency: "ARS", symbol: "AR$", locale: "es-AR", flag: "\ud83c\udde6\ud83c\uddf7" },
  { code: "PK", name: "Pakistan", currency: "PKR", symbol: "\u20a8", locale: "en-PK", flag: "\ud83c\uddf5\ud83c\uddf0" },
  { code: "BD", name: "Bangladesh", currency: "BDT", symbol: "\u09f3", locale: "bn-BD", flag: "\ud83c\udde7\ud83c\udde9" },
  { code: "LK", name: "Sri Lanka", currency: "LKR", symbol: "Rs", locale: "si-LK", flag: "\ud83c\uddf1\ud83c\uddf0" },
  { code: "GH", name: "Ghana", currency: "GHS", symbol: "GH\u20b5", locale: "en-GH", flag: "\ud83c\uddec\ud83c\udded" },
];

export const DEFAULT_COUNTRY = "US";

export function getCountryByCode(code: string): Country {
  return COUNTRIES.find((c) => c.code === code) || COUNTRIES[0];
}

export function formatCurrency(amount: number, countryCode: string): string {
  const country = getCountryByCode(countryCode);
  try {
    return new Intl.NumberFormat(country.locale, {
      style: "currency",
      currency: country.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${country.symbol}${amount.toLocaleString()}`;
  }
}

export function formatCurrencyPrecise(amount: number, countryCode: string): string {
  const country = getCountryByCode(countryCode);
  try {
    return new Intl.NumberFormat(country.locale, {
      style: "currency",
      currency: country.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${country.symbol}${amount.toFixed(2)}`;
  }
}

export function getCurrencySymbol(countryCode: string): string {
  return getCountryByCode(countryCode).symbol;
}
