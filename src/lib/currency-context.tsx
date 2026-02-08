"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { formatCurrency as formatCurrencyUtil, getCurrencySymbol, getCountryByCode, DEFAULT_COUNTRY, type Country } from "./currency";

interface CurrencyContextType {
  countryCode: string;
  currency: string;
  symbol: string;
  country: Country;
  fc: (amount: number) => string;
  refresh: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY);

  const fetchCurrency = useCallback(async () => {
    try {
      const res = await fetch("/api/settings/currency");
      if (res.ok) {
        const data = await res.json();
        if (data.countryCode) {
          setCountryCode(data.countryCode);
        }
      }
    } catch {
      // Fallback to default
    }
  }, []);

  useEffect(() => {
    fetchCurrency();
  }, [fetchCurrency]);

  const country = getCountryByCode(countryCode);

  const fc = useCallback(
    (amount: number) => formatCurrencyUtil(amount, countryCode),
    [countryCode]
  );

  return (
    <CurrencyContext.Provider
      value={{
        countryCode,
        currency: country.currency,
        symbol: getCurrencySymbol(countryCode),
        country,
        fc,
        refresh: fetchCurrency,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
