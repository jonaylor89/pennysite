import type { Metadata, Viewport } from "next";
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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pennysite.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Pennysite - AI Website Builder | Create Websites in Minutes",
    template: "%s | Pennysite",
  },
  description:
    "Build professional websites for pennies using AI. Describe what you want, see it instantly, and publish for free. No coding required. Pay only per generation.",
  keywords: [
    "AI website builder",
    "website generator",
    "no-code website",
    "AI web design",
    "instant website",
    "free website hosting",
    "website creator",
    "landing page generator",
    "AI powered websites",
  ],
  authors: [{ name: "Pennysite" }],
  creator: "Pennysite",
  publisher: "Pennysite",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Pennysite",
    title: "Pennysite - AI Website Builder | Create Websites in Minutes",
    description:
      "Build professional websites for pennies using AI. Describe what you want, see it instantly, and publish for free.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Pennysite - AI Website Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pennysite - AI Website Builder",
    description:
      "Build professional websites for pennies using AI. Describe what you want, see it instantly, and publish for free.",
    images: ["/og-image.png"],
    creator: "@pennysite",
  },
  alternates: {
    canonical: siteUrl,
  },
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
