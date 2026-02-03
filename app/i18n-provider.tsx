'use client';

import { ReactNode, useEffect } from 'react';
import './i18n'; // Import i18n config

interface I18nProviderProps {
  children: ReactNode;
  locale?: string;
}

export default function I18nProvider({ children, locale }: I18nProviderProps) {
  useEffect(() => {
    if (locale) {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  return <>{children}</>;
}