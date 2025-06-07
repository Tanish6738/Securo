"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheckIcon,
  Bars3Icon,
  XMarkIcon,
  SparklesIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { useTheme } from "@/components/ThemeProvider";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { currentTheme, setTheme } = useTheme();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (mobileMenuOpen) setMobileMenuOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [mobileMenuOpen]);

  const navigationItems = [
    { href: "#features", text: "Features", icon: "✨" },
    { href: "#testimonials", text: "Testimonials", icon: "💬" },
    { href: "#pricing", text: "Pricing", icon: "💰" },
    { href: "#faq", text: "FAQ", icon: "❓" },
  ];

  const authenticatedNavItems = [
    { href: "/dashboard", text: "Dashboard", icon: "🏠", shortText: "Home" },
    { href: "/breach-monitor", text: "Breach Monitor", icon: "🛡️", shortText: "Monitor" },
    { href: "/password-checker", text: "Password Checker", icon: "🔐", shortText: "Password" },
    { href: "/fake-data", text: "Fake Data", icon: "🎭", shortText: "Data" },
    { href: "/temp-email", text: "Temp Email", icon: "📧", shortText: "Email" },
    { href: "/vault", text: "Vault", icon: "🗄️", shortText: "Vault" },
    { href: "/privacy-news", text: "Privacy News", icon: "📰", shortText: "News" },
    { href: "/profile", text: "Profile", icon: "👤", shortText: "Profile" },
    { href: "/theme-settings", text: "Theme Settings", icon: "🎨", shortText: "Theme" },
  ];

  const headerVariants = {
    initial: { y: -100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -100, opacity: 0 }
  };

  const logoVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    hover: { scale: 1.05 }
  };

  const navItemVariants = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    hover: { 
      scale: 1.05, 
      y: -2,
      transition: { type: "spring", stiffness: 400, damping: 10 }
    }
  };

  const mobileMenuVariants = {
    initial: { opacity: 0, height: 0, y: -20 },
    animate: { 
      opacity: 1, 
      height: "auto", 
      y: 0,
      transition: { 
        duration: 0.3,
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      height: 0, 
      y: -20,
      transition: { duration: 0.2 }
    }
  };

  const mobileItemVariants = {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  return (
    <motion.header
      variants={headerVariants}
      initial="initial"
      animate="animate"
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out
        ${scrolled 
          ? 'bg-theme-background/90 backdrop-blur-xl shadow-xl border-b border-theme-border/50' 
          : 'bg-theme-background/70 backdrop-blur-md shadow-lg border-b border-theme-border/30'
        }
      `}
    >
      {/* Dynamic gradient overlay */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-theme-primary/5 via-transparent to-theme-accent/5"
        animate={{
          background: scrolled 
            ? "linear-gradient(90deg, var(--theme-primary-rgb, 59 130 246) / 0.02, transparent, var(--theme-accent-rgb, 168 85 247) / 0.02)"
            : "linear-gradient(90deg, var(--theme-primary-rgb, 59 130 246) / 0.05, transparent, var(--theme-accent-rgb, 168 85 247) / 0.05)"
        }}
        transition={{ duration: 0.5 }}
      />

      <div className="relative max-w-7xl mx-auto">
        <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 h-16 lg:h-20">
          
          {/* Logo Section */}
          <motion.div
            variants={logoVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            className="flex items-center space-x-3 flex-shrink-0"
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="relative"
            >
              <ShieldCheckIcon className="h-8 w-8 lg:h-10 lg:w-10 text-theme-primary" />
              <motion.div
                className="absolute inset-0 rounded-full bg-theme-primary/20"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
            
            <Link href="/" className="group">
              <motion.span 
                className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-theme-primary to-theme-accent bg-clip-text text-transparent group-hover:from-theme-accent group-hover:to-theme-primary transition-all duration-300"
                whileHover={{ scale: 1.02 }}
              >
                <span className="hidden sm:inline">PrivacyGuard</span>
                <span className="sm:hidden">PG</span>
              </motion.span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <SignedOut>
            <nav className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item, index) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  variants={navItemVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  transition={{ delay: index * 0.1 }}
                  className="relative px-4 py-2 text-sm font-medium text-theme-text-secondary hover:text-theme-primary rounded-xl transition-all duration-300 group"
                >
                  <span className="relative z-10">{item.text}</span>
                  <motion.div
                    className="absolute inset-0 bg-theme-secondary/50 rounded-xl opacity-0 group-hover:opacity-100"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  />
                  <motion.div
                    className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-theme-primary group-hover:w-1/2 group-hover:left-1/4"
                    transition={{ duration: 0.3 }}
                  />
                </motion.a>
              ))}
            </nav>
          </SignedOut>

          <SignedIn>
            {/* Full Desktop Navigation */}
            <nav className="hidden 2xl:flex items-center space-x-1">
              {authenticatedNavItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  variants={navItemVariants}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={item.href}
                    className="relative px-3 py-2 text-sm font-medium text-theme-text hover:text-theme-primary rounded-xl transition-all duration-300 group"
                  >
                    <motion.span
                      whileHover="hover"
                      variants={navItemVariants}
                      className="relative z-10 flex items-center space-x-1"
                    >
                      <span className="text-xs">{item.icon}</span>
                      <span>{item.shortText}</span>
                    </motion.span>
                    <motion.div
                      className="absolute inset-0 bg-theme-secondary/50 rounded-xl opacity-0 group-hover:opacity-100"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    />
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Compact Desktop Navigation */}
            <nav className="hidden lg:flex 2xl:hidden items-center space-x-1">
              {authenticatedNavItems.slice(0, 5).map((item, index) => (
                <motion.div
                  key={item.href}
                  variants={navItemVariants}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={item.href}
                    className="relative px-3 py-2 text-sm font-medium text-theme-text hover:text-theme-primary rounded-xl transition-all duration-300 group"
                    title={item.text}
                  >
                    <motion.span
                      whileHover="hover"
                      variants={navItemVariants}
                      className="relative z-10 flex items-center space-x-1"
                    >
                      <span>{item.icon}</span>
                      <span className="hidden xl:inline">{item.shortText}</span>
                    </motion.span>
                    <motion.div
                      className="absolute inset-0 bg-theme-secondary/50 rounded-xl opacity-0 group-hover:opacity-100"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    />
                  </Link>
                </motion.div>
              ))}
            </nav>
          </SignedIn>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Auth Buttons */}
            <SignedOut>
              <div className="hidden sm:flex items-center space-x-3">
                <SignInButton mode="modal">
                  <motion.button
                    className="relative px-4 py-2 text-sm font-medium text-theme-text hover:text-theme-primary rounded-xl transition-all duration-300 group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="relative z-10">Sign In</span>
                    <motion.div
                      className="absolute inset-0 bg-theme-secondary/50 rounded-xl opacity-0 group-hover:opacity-100"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    />
                  </motion.button>
                </SignInButton>

                <SignUpButton mode="modal">
                  <motion.button
                    className="relative bg-gradient-to-r from-theme-primary to-theme-accent text-white px-6 py-2 rounded-xl text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="relative z-10 flex items-center space-x-1">
                      <SparklesIcon className="h-4 w-4" />
                      <span>Get Started</span>
                    </span>

                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.8 }}
                    />

                    {/* Glow effect */}
                    <motion.div
                      className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 blur-sm"
                      transition={{ duration: 0.3 }}
                    />
                  </motion.button>
                </SignUpButton>
              </div>
            </SignedOut>

            <SignedIn>
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "h-10 w-10 ring-2 ring-theme-primary/30 hover:ring-theme-primary/60 transition-all duration-300 shadow-lg",
                      userButtonPopoverCard: "bg-theme-background/95 backdrop-blur-xl border border-theme-border/50 shadow-2xl rounded-2xl",
                      userButtonPopoverActionButton: "hover:bg-theme-secondary/50 text-theme-text rounded-xl transition-all duration-200",
                      userButtonPopoverActionButtonText: "text-theme-text",
                      userButtonPopoverFooter: "hidden",
                    },
                  }}
                />
                
                {/* Status indicator */}
                <motion.div
                  className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-theme-background"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            </SignedIn>

            {/* Mobile menu button */}
            <motion.button
              className="lg:hidden p-2 rounded-xl text-theme-text-secondary hover:text-theme-primary hover:bg-theme-secondary/50 transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
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
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              variants={mobileMenuVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="lg:hidden overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-theme-background/95 backdrop-blur-xl border-t border-theme-border/50 mx-4 mb-4 rounded-2xl shadow-2xl">
                <SignedOut>
                  <div className="py-4 space-y-1">
                    {navigationItems.map((item, index) => (
                      <motion.a
                        key={item.href}
                        href={item.href}
                        variants={mobileItemVariants}
                        className="flex items-center px-6 py-4 text-base font-medium text-theme-text-secondary hover:text-theme-primary hover:bg-theme-secondary/30 rounded-xl mx-3 transition-all duration-300 group"
                        onClick={() => setMobileMenuOpen(false)}
                        whileHover={{ x: 5 }}
                      >
                        <span className="mr-4 text-xl">{item.icon}</span>
                        <span className="flex-1">{item.text}</span>
                        <ChevronDownIcon className="h-4 w-4 transform -rotate-90 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                      </motion.a>
                    ))}
                    
                    {/* Mobile Auth Buttons */}
                    <div className="px-3 pt-4 pb-2 space-y-3 border-t border-theme-border/30 mt-4">
                      <SignInButton mode="modal">
                        <motion.button
                          className="w-full px-4 py-3 text-center text-theme-text hover:text-theme-primary bg-theme-secondary/30 hover:bg-theme-secondary/50 rounded-xl transition-all duration-300"
                          whileTap={{ scale: 0.98 }}
                        >
                          Sign In
                        </motion.button>
                      </SignInButton>
                      
                      <SignUpButton mode="modal">
                        <motion.button
                          className="w-full bg-gradient-to-r from-theme-primary to-theme-accent text-white px-4 py-3 rounded-xl font-medium shadow-lg"
                          whileTap={{ scale: 0.98 }}
                        >
                          <span className="flex items-center justify-center space-x-2">
                            <SparklesIcon className="h-4 w-4" />
                            <span>Get Started</span>
                          </span>
                        </motion.button>
                      </SignUpButton>
                    </div>
                  </div>
                </SignedOut>

                <SignedIn>
                  <div className="py-4 space-y-1 max-h-[70vh] overflow-y-auto">
                    {authenticatedNavItems.map((item, index) => (
                      <motion.div key={item.href} variants={mobileItemVariants}>
                        <Link
                          href={item.href}
                          className="flex items-center px-6 py-4 text-base font-medium text-theme-text-secondary hover:text-theme-primary hover:bg-theme-secondary/30 rounded-xl mx-3 transition-all duration-300 group"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <motion.span 
                            className="flex items-center w-full"
                            whileHover={{ x: 5 }}
                          >
                            <span className="mr-4 text-xl">{item.icon}</span>
                            <span className="flex-1">{item.text}</span>
                            <ChevronDownIcon className="h-4 w-4 transform -rotate-90 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                          </motion.span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </SignedIn>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Animated bottom border */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-theme-primary/30 to-transparent"
        animate={{
          opacity: [0.3, 0.8, 0.3],
          scaleX: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Floating particles effect */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-theme-primary/20 rounded-full"
          animate={{
            x: [0, 100, 0],
            y: [0, -20, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 6 + i * 2,
            repeat: Infinity,
            delay: i * 2,
          }}
          style={{
            left: `${20 + i * 30}%`,
            top: '50%',
          }}
        />
      ))}
    </motion.header>
  );
}
