"use client";

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import {
  ShieldCheckIcon,
  Bars3Icon,
  XMarkIcon,
  PaintBrushIcon,
  SunIcon,
  MoonIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentTheme, setTheme, predefinedThemes } = useTheme();

  const toggleTheme = () => {
    // Quick toggle between dark and light themes
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  return (
    <header className="bg-theme-background/95 backdrop-blur-sm shadow-sm border-b border-theme-border sticky top-0 z-50">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-theme-primary via-transparent to-theme-accent" />{" "}
      <div className="relative max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {" "}
          {/* Logo */}
          <motion.div
            className="flex items-center flex-shrink-0"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <ShieldCheckIcon className="h-6 w-6 sm:h-8 sm:w-8 text-theme-primary" />
            </motion.div>
            <span className="ml-1 sm:ml-2 text-lg sm:text-xl font-bold text-theme-text">
              <Link
                href="/"
                className="hover:text-theme-primary transition-colors duration-200"
              >
                <span className="hidden xs:inline">PrivacyGuard</span>
                <span className="xs:hidden">PG</span>
              </Link>
            </span>
          </motion.div>{" "}
          {/* Desktop Navigation */}
          <SignedOut>
            <nav className="lg:flex space-x-1 flex w-2/3 gap-4 justify-around items-center">
              {[
                { href: "#features", text: "Features" },
                { href: "#testimonials", text: "Testimonials" },
                { href: "#pricing", text: "Pricing" },
                { href: "#faq", text: "FAQ" },
              ].map((item) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  className="text-theme-text-secondary hover:text-theme-primary px-2 lg:px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-theme-secondary"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {item.text}
                </motion.a>
              ))}
            </nav>
          </SignedOut>{" "}
          <SignedIn>
            {/* Desktop Navigation - Responsive Grid */}
            <nav className="xl:flex space-x-1 flex w-2/3 gap-4 justify-around items-center">
              {[
                { href: "/dashboard", text: "Dashboard" },
                { href: "/breach-monitor", text: "Monitor" },
                { href: "/password-checker", text: "Password" },
                { href: "/fake-data", text: "Data" },
                { href: "/temp-email", text: "Email" },
                { href: "/vault", text: "Vault" },
                { href: "/privacy-news", text: "News" },
                { href: "/profile", text: "Profile" },
                { href: "/theme-settings", text: "Theme" },
              ].map((item) => (
                <motion.div key={item.href}>
                  <Link
                    href={item.href}
                    className="text-theme-text hover:text-theme-primary px-2 py-2 text-xs xl:text-sm font-medium rounded-lg transition-all duration-200 hover:bg-theme-secondary"
                  >
                    <motion.span
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      className="block"
                    >
                      {item.text}
                    </motion.span>
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Tablet Navigation - Compact */}
            <nav className="hidden lg:flex xl:hidden space-x-1">
              {[
                { href: "/dashboard", text: "Dashboard", icon: "🏠" },
                { href: "/breach-monitor", text: "Monitor", icon: "🛡️" },
                { href: "/vault", text: "Vault", icon: "🔐" },
                { href: "/profile", text: "Profile", icon: "👤" },
              ].map((item) => (
                <motion.div key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center text-theme-text hover:text-theme-primary px-2 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-theme-secondary"
                    title={item.text}
                  >
                    <motion.span
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      className="block"
                    >
                      <span className="mr-1">{item.icon}</span>
                      <span className="hidden lg:inline">{item.text}</span>
                    </motion.span>
                  </Link>
                </motion.div>
              ))}
            </nav>
          </SignedIn>{" "}
          {/* Auth Buttons */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            <SignedOut>
              <SignInButton mode="modal">
                <motion.button
                  className="relative text-theme-text hover:text-theme-primary px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 hover:bg-theme-secondary group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10">Sign In</span>
                  <motion.div
                    className="absolute inset-0 bg-theme-primary/10 rounded-lg opacity-0 group-hover:opacity-100"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.button>
              </SignInButton>
              <SignUpButton mode="modal">
                <motion.button
                  className="relative btn-primary px-3 sm:px-6 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10">Sign Up</span>

                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />

                  {/* Glow effect */}
                  <motion.div
                    className="absolute inset-0 bg-theme-primary/50 rounded-lg blur-lg opacity-0 group-hover:opacity-75"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 0.75 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              </SignUpButton>{" "}
            </SignedOut>
            <SignedIn>
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox:
                        "h-7 w-7 sm:h-9 sm:w-9 ring-2 ring-theme-primary/20 hover:ring-theme-primary/40 transition-all duration-200",
                      userButtonPopoverCard:
                        "bg-theme-background border border-theme-border shadow-xl",
                      userButtonPopoverActionButton:
                        "hover:bg-theme-secondary text-theme-text",
                      userButtonPopoverActionButtonText: "text-theme-text",
                      userButtonPopoverFooter: "hidden",
                    },
                  }}
                />
              </motion.div>
            </SignedIn>

            {/* Mobile menu button */}
            <motion.button
              className="lg:hidden xl:hidden p-1 sm:p-2 rounded-lg text-theme-text-secondary hover:bg-theme-secondary transition-colors duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: mobileMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                ) : (
                  <Bars3Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                )}
              </motion.div>
            </motion.button>
          </div>
        </div>{" "}
        {/* Mobile Navigation */}
        <SignedOut>
          <motion.div
            className={mobileMenuOpen ? "lg:hidden block" : "lg:hidden hidden"}
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: mobileMenuOpen ? 1 : 0,
              height: mobileMenuOpen ? "auto" : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="pt-2 pb-3 space-y-1 bg-theme-secondary/50 rounded-lg mx-2 sm:mx-4 mb-4">
              {[
                { href: "#features", text: "Features", icon: "✨" },
                { href: "#testimonials", text: "Testimonials", icon: "💬" },
                { href: "#pricing", text: "Pricing", icon: "💰" },
                { href: "#faq", text: "FAQ", icon: "❓" },
              ].map((item, index) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  className="flex items-center px-3 sm:px-4 py-3 text-base font-medium text-theme-text-secondary hover:text-theme-primary hover:bg-theme-background rounded-lg transition-all duration-200"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 5 }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.text}
                </motion.a>
              ))}
            </div>
          </motion.div>
        </SignedOut>
        <SignedIn>
          <motion.div
            className={
              mobileMenuOpen
                ? "lg:hidden xl:hidden block"
                : "lg:hidden xl:hidden hidden"
            }
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: mobileMenuOpen ? 1 : 0,
              height: mobileMenuOpen ? "auto" : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="pt-2 pb-3 space-y-1 bg-theme-secondary/50 rounded-lg mx-2 sm:mx-4 mb-4 max-h-[70vh] overflow-y-auto">
              {[
                { href: "/dashboard", text: "Dashboard", icon: "🏠" },
                { href: "/breach-monitor", text: "Breach Monitor", icon: "🛡️" },
                {
                  href: "/password-checker",
                  text: "Password Checker",
                  icon: "🔐",
                },
                { href: "/fake-data", text: "Fake Data", icon: "🎭" },
                { href: "/temp-email", text: "Temp Email", icon: "📧" },
                { href: "/vault", text: "Vault", icon: "🗄️" },
                { href: "/privacy-news", text: "Privacy News", icon: "📰" },
                { href: "/profile", text: "Profile", icon: "👤" },
                { href: "/theme-settings", text: "Theme Settings", icon: "🎨" },
              ].map((item, index) => (
                <motion.div key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center px-3 sm:px-4 py-3 text-base font-medium text-theme-text-secondary hover:text-theme-primary hover:bg-theme-background rounded-lg transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <motion.span
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 5 }}
                      className="flex items-center w-full"
                    >
                      <span className="mr-3 text-lg">{item.icon}</span>
                      {item.text}
                    </motion.span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </SignedIn>
      </div>{" "}
      {/* Bottom border glow effect */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-theme-primary/20 to-transparent"
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </header>
  );
}
