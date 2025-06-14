import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { dark } from "@clerk/themes";
import { ThemeProvider } from "@/components/ThemeProvider";
import ThemeInitializer from "@/components/ThemeInitializer";

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
  description:
    "Advanced cybersecurity platform protecting millions from data breaches. Monitor email security, check password breaches, generate fake data, create temporary emails, and track your digital footprint with military-grade encryption.",
  keywords: [
    "data breach monitoring",
    "password security",
    "digital privacy",
    "cybersecurity",
    "temporary email",
    "fake data generator",
    "privacy protection",
    "online security",
  ],
  authors: [{ name: "PrivacyGuard Team" }],
  creator: "PrivacyGuard",
  publisher: "PrivacyGuard",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://privacyguard.app"),
  alternates: {
    canonical: "/",
    title: "PrivacyGuard",
  },
  openGraph: {
    title: "PrivacyGuard - Your Digital Privacy Command Center",
    description:
      "Advanced cybersecurity platform protecting millions from data breaches. Monitor, secure, and protect your digital identity.",
    url: "https://privacyguard.app",
    siteName: "PrivacyGuard",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PrivacyGuard - Digital Privacy Protection",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PrivacyGuard - Your Digital Privacy Command Center",
    description:
      "Advanced cybersecurity platform protecting millions from data breaches.",
    images: ["/twitter-image.png"],
    creator: "@privacyguard",
  },
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
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#00A99D",
          colorBackground: "#1B212C",
          colorInputBackground: "#151B24",
          colorInputText: "#E1E6EB",
        },
        elements: {
          formButtonPrimary:
            "bg-theme-primary hover:bg-theme-primary/90 text-sm normal-case",
          card: "bg-theme-secondary border border-theme-border/20",
          headerTitle: "text-theme-text",
          headerSubtitle: "text-theme-text-secondary",
        },
      }}
    >
      <html lang="en" className="h-full">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen font-sans`}
        >
          <ThemeInitializer />
          <ThemeProvider>
            <div className="min-h-screen flex flex-col bg-theme-background text-theme-text">
              <main className="flex-1">{children}</main>
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
