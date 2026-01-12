import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/assets/icon/favicon.ico" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Essentials AI Chat",
              "description": "Interface canggih untuk audit dan analisis performance website menggunakan kecerdasan buatan.",
              "url": "https://essentials-ai.vercel.app",
              "applicationCategory": "DeveloperApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "IDR"
              },
              "creator": {
                "@type": "Organization",
                "name": "Essentials Team"
              }
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
