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

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <header className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-transparent to-indigo-50/50 dark:from-blue-900/10 dark:via-transparent dark:to-indigo-900/10" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {" "}
          {/* Logo */}
          <motion.div
            className="flex items-center"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <ShieldCheckIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </motion.div>
            <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
              <Link
                href="/"
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              >
                PrivacyGuard
              </Link>
            </span>
          </motion.div>{" "}
          {/* Desktop Navigation */}
          <SignedOut>
            <nav className="hidden md:flex space-x-1">
              {[
                { href: "#features", text: "Features" },
                { href: "#testimonials", text: "Testimonials" },
                { href: "#pricing", text: "Pricing" },
                { href: "#faq", text: "FAQ" },
              ].map((item) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {item.text}
                </motion.a>
              ))}
            </nav>
          </SignedOut>{" "}
          <SignedIn>
            <nav className="hidden md:flex space-x-1">
              {[
                { href: "/dashboard", text: "Dashboard" },
                { href: "/breach-monitor", text: "Breach Monitor" },
                { href: "/password-checker", text: "Password Checker" },
                { href: "/fake-data", text: "Fake Data" },
                { href: "/temp-email", text: "Temp Email" },
                { href: "/vault", text: "Vault" },
                { href: "/privacy-news", text: "Privacy News" },
                { href: "/profile", text: "Profile" },
              ].map((item) => (
                <motion.div key={item.href}>
                  <Link
                    href={item.href}
                    className="text-white dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
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
          </SignedIn>{" "}
          {/* Auth Buttons */}
          <div className="flex items-center space-x-3">
            <SignedOut>
              <SignInButton mode="modal" >
                <motion.button
                  className="relative text-white dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10">Sign In</span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg opacity-0 group-hover:opacity-100"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.button>
              </SignInButton>
              <SignUpButton mode="modal">
                <motion.button
                  className="relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
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
                    className="absolute inset-0 bg-gradient-to-r from-blue-400/50 to-indigo-400/50 rounded-lg blur-lg opacity-0 group-hover:opacity-75"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 0.75 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              </SignUpButton>
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
                        "h-9 w-9 ring-2 ring-blue-500/20 hover:ring-blue-500/40 transition-all duration-200",
                      userButtonPopoverCard:
                        "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl",
                      userButtonPopoverActionButton:
                        "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300",
                      userButtonPopoverActionButtonText:
                        "text-gray-700 dark:text-gray-300",
                      userButtonPopoverFooter: "hidden",
                    },
                  }}
                />
              </motion.div>
            </SignedIn>{" "}
            {/* Mobile menu button */}
            <motion.button
              className="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: mobileMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </motion.div>
            </motion.button>
          </div>
        </div>{" "}
        {/* Mobile Navigation */}
        <SignedOut>
          <motion.div
            className={mobileMenuOpen ? "md:hidden block" : "md:hidden hidden"}
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: mobileMenuOpen ? 1 : 0,
              height: mobileMenuOpen ? "auto" : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="pt-2 pb-3 space-y-1 bg-gray-50 dark:bg-gray-800/50 rounded-lg mx-4 mb-4">
              {[
                { href: "#features", text: "Features" },
                { href: "#testimonials", text: "Testimonials" },
                { href: "#pricing", text: "Pricing" },
                { href: "#faq", text: "FAQ" },
              ].map((item, index) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  className="block px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 5 }}
                >
                  {item.text}
                </motion.a>
              ))}
            </div>
          </motion.div>
        </SignedOut>{" "}
        <SignedIn>
          <motion.div
            className={mobileMenuOpen ? "md:hidden block" : "md:hidden hidden"}
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: mobileMenuOpen ? 1 : 0,
              height: mobileMenuOpen ? "auto" : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="pt-2 pb-3 space-y-1 bg-gray-50 dark:bg-gray-800/50 rounded-lg mx-4 mb-4">
              {[
                { href: "/dashboard", text: "Dashboard" },
                { href: "/breach-monitor", text: "Breach Monitor" },
                { href: "/password-checker", text: "Password Checker" },
                { href: "/fake-data", text: "Fake Data" },
                { href: "/temp-email", text: "Temp Email" },
                { href: "/vault", text: "Vault" },
                { href: "/privacy-news", text: "Privacy News" },
                { href: "/profile", text: "Profile" },
              ].map((item, index) => (
                <motion.div key={item.href}>
                  <Link
                    href={item.href}
                    className="block px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                  >
                    <motion.span
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 5 }}
                      className="block"
                    >
                      {item.text}
                    </motion.span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>{" "}
        </SignedIn>
      </div>

      {/* Bottom border glow effect */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"
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
