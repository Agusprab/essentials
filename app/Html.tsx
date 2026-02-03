'use client';

import { ReactNode, useEffect } from 'react';

interface HtmlProps {
  children: ReactNode;
  lang?: string;
}

export default function Html({ children, lang }: HtmlProps) {
  useEffect(() => {
    if (lang) {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  return (
    <html>
      {children}
    </html>
  );
}