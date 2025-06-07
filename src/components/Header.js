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
} from "@heroicons/react/24/outline";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  return (
    <header className="bg-theme-background/95 backdrop-blur-sm shadow-sm border-b border-theme-border sticky top-0 z-50">
      <div className="absolute inset-0 bg-gradient-to-r from-theme-primary via-transparent to-theme-accent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <motion.div
            className="flex items-center flex-shrink-0"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
              <ShieldCheckIcon className="h-6 w-6 sm:h-8 sm:w-8 text-theme-primary" />
            </motion.div>
            <span className="ml-2 text-lg sm:text-xl font-bold text-theme-text">
              <Link href="/" className="hover:text-theme-primary transition-colors duration-200">
                <span className="hidden sm:inline">PrivacyGuard</span>
                <span className="inline sm:hidden">PG</span>
              </Link>
            </span>
          </motion.div>

          <div className="hidden lg:flex w-full max-w-2xl justify-center gap-4 items-center">
            <SignedOut>
              {["#features", "#testimonials", "#pricing", "#faq"].map((href, i) => (
                <motion.a
                  key={href}
                  href={href}
                  className="text-theme-text-secondary hover:text-theme-primary px-2 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-theme-secondary"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {href.replace("#", "").replace(/\b\w/g, (l) => l.toUpperCase())}
                </motion.a>
              ))}
            </SignedOut>
            <SignedIn>
              {["dashboard", "breach-monitor", "password-checker", "fake-data", "temp-email", "vault", "privacy-news", "profile", "theme-settings"].map((page) => (
                <motion.div key={page}>
                  <Link
                    href={`/${page}`}
                    className="text-theme-text hover:text-theme-primary px-2 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-theme-secondary"
                  >
                    <motion.span whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }} className="block">
                      {page.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </motion.span>
                  </Link>
                </motion.div>
              ))}
            </SignedIn>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            <SignedOut>
              <SignInButton mode="modal">
                <motion.button
                  className="text-theme-text hover:text-theme-primary px-3 py-1 text-xs sm:text-sm rounded-lg hover:bg-theme-secondary transition duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Sign In
                </motion.button>
              </SignInButton>
              <SignUpButton mode="modal">
                <motion.button
                  className="btn-primary px-4 py-1 text-xs sm:text-sm rounded-lg shadow hover:shadow-lg transition duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Sign Up
                </motion.button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "h-7 w-7 sm:h-9 sm:w-9 ring-2 ring-theme-primary/20 hover:ring-theme-primary/40 transition-all duration-200",
                      userButtonPopoverCard: "bg-theme-background border border-theme-border shadow-xl",
                      userButtonPopoverActionButton: "hover:bg-theme-secondary text-theme-text",
                      userButtonPopoverActionButtonText: "text-theme-text",
                      userButtonPopoverFooter: "hidden",
                    },
                  }}
                />
              </motion.div>
            </SignedIn>

            <motion.button
              className="block lg:hidden p-2 rounded-lg text-theme-text-secondary hover:bg-theme-secondary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          className={`${mobileMenuOpen ? "block" : "hidden"} lg:hidden max-h-[70vh] overflow-y-auto rounded-lg bg-theme-secondary/50 mt-2 px-2 py-4 space-y-1`}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: mobileMenuOpen ? 1 : 0, height: mobileMenuOpen ? "auto" : 0 }}
          transition={{ duration: 0.3 }}
        >
          <SignedOut>
            {["#features", "#testimonials", "#pricing", "#faq"].map((href, index) => (
              <motion.a
                key={href}
                href={href}
                className="flex items-center px-3 py-2 text-base font-medium text-theme-text-secondary hover:text-theme-primary hover:bg-theme-background rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 5 }}
              >
                {href.replace("#", "").replace(/\b\w/g, (l) => l.toUpperCase())}
              </motion.a>
            ))}
          </SignedOut>
          <SignedIn>
            {["dashboard", "breach-monitor", "password-checker", "fake-data", "temp-email", "vault", "privacy-news", "profile", "theme-settings"].map((page, index) => (
              <motion.div key={page}>
                <Link
                  href={`/${page}`}
                  className="flex items-center px-3 py-2 text-base font-medium text-theme-text-secondary hover:text-theme-primary hover:bg-theme-background rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <motion.span
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 5 }}
                    className="w-full"
                  >
                    {page.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </motion.span>
                </Link>
              </motion.div>
            ))}
          </SignedIn>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-theme-primary/20 to-transparent"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    </header>
  );
}
