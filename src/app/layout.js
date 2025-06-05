import { ClerkProvider } from '@clerk/nextjs'
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { dark } from '@clerk/themes';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "PrivacyGuard - Your Digital Privacy Command Center",
  description: "Advanced cybersecurity platform protecting millions from data breaches. Monitor email security, check password breaches, generate fake data, create temporary emails, and track your digital footprint with military-grade encryption.",
  keywords: [
    "data breach monitoring",
    "password security",
    "digital privacy",
    "cybersecurity",
    "temporary email",
    "fake data generator",
    "privacy protection",
    "online security"
  ],
  authors: [{ name: "PrivacyGuard Team" }],
  creator: "PrivacyGuard",
  publisher: "PrivacyGuard",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://privacyguard.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "PrivacyGuard - Your Digital Privacy Command Center",
    description: "Advanced cybersecurity platform protecting millions from data breaches. Monitor, secure, and protect your digital identity.",
    url: 'https://privacyguard.app',
    siteName: 'PrivacyGuard',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PrivacyGuard - Digital Privacy Protection',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "PrivacyGuard - Your Digital Privacy Command Center",
    description: "Advanced cybersecurity platform protecting millions from data breaches.",
    images: ['/twitter-image.png'],
    creator: '@privacyguard',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  }
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#3b82f6',
          colorBackground: '#111827',
          colorInputBackground: '#1f2937',
          colorInputText: '#f9fafb',
        },
        elements: {
          formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-sm normal-case',
          card: 'bg-gray-800 border border-gray-700',
          headerTitle: 'text-white',
          headerSubtitle: 'text-gray-300',
        }
      }}
    >
      <html lang="en" className="h-full">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="theme-color" content="#111827" />
          <link rel="icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <link rel="manifest" href="/manifest.json" />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-900 text-white font-sans`}
        >
          <div className="min-h-screen flex flex-col">
            <main className="flex-1">
              {children}
            </main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
