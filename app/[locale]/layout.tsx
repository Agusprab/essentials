import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import I18nProvider from "../i18n-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Chat untuk Audit dan Performance Website - Essentials",
  description: "Interface canggih untuk audit dan analisis performance website menggunakan kecerdasan buatan. Dapatkan rekomendasi optimasi secara real-time.",
  keywords: ["audit website", "performance website", "AI chat", "optimasi website", "analisis website", "check website", "SEO audit", "speed test website"],
  authors: [{ name: "Essentials Team" }],
  creator: "Essentials",
  publisher: "Essentials",
  robots: "index, follow",
  openGraph: {
    title: "AI Chat untuk Audit dan Performance Website",
    description: "Interface canggih untuk audit dan analisis performance website menggunakan kecerdasan buatan.",
    url: "https://essentials-ai.vercel.app",
    siteName: "Essentials AI Chat",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Chat untuk Audit dan Performance Website",
    description: "Interface canggih untuk audit dan analisis performance website menggunakan kecerdasan buatan.",
    creator: "@essentials_ai", // if applicable
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#F8FAFC",
};

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

import Html from '../Html';

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;

  return (
    <Html lang={locale}>
      <head>
        <link rel="icon" href="/assets/icon/favicon.ico" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <I18nProvider locale={locale}>
          {children}
        </I18nProvider>
      </body>
    </Html>
  );
}