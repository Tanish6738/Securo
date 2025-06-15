// RedesignedHeader.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import {
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useTheme } from "@/components/ThemeProvider";

const navigationGroups = [
  {
    label: "Dashboard",
    href: "/dashboard",
    type: "link",
  },  {
    label: "Security Tools",
    type: "dropdown",
    items: [
      { href: "/breach-monitor", label: "Breach Monitor" },
      { href: "/password-checker", label: "Password Checker" },
      { href: "/vault", label: "Personal Vault" },
      { href: "/shared-vault", label: "Shared Vault" },
      { href: "/encrypt-files", label: "Encrypt Files" },
    ],
  },
  {
    label: "Privacy Tools",
    type: "dropdown",
    items: [
      { href: "/fake-data", label: "Fake Data Generator" },
      { href: "/temp-email", label: "Temporary Email" },
      { href: "/image-enhancer", label: "Image Enhancer" },
    ],
  },  {
    label: "News",
    href: "/privacy-news",
    type: "link",
  },
  {
    label: "Dev Tools",
    type: "dropdown",
    items: [
      { href: "/user-sync-test", label: "User Sync Test" },
    ],
  },
  {
    label: "Settings",
    type: "dropdown",
    items: [
      { href: "/profile", label: "Profile" },
      { href: "/theme-settings", label: "Theme Settings" },
    ],
  },
];

const guestLinks = [
  { href: "#features", label: "Features" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export default function RedesignedHeader() {  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDesktopDropdown, setActiveDesktopDropdown] = useState(null);

  const { currentTheme } = useTheme();
  useEffect(() => {
    const scrollHandler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", scrollHandler);
    return () => window.removeEventListener("scroll", scrollHandler);
  }, []);  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setActiveDesktopDropdown(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleDesktopDropdownToggle = (index) => {
    setActiveDesktopDropdown(activeDesktopDropdown === index ? null : index);
  };

  const closeDesktopDropdown = () => {
    setActiveDesktopDropdown(null);
  };
  return (
    <header
      className={`fixed w-full top-0 z-50 transition-all duration-500 ease-out ${
        scrolled
          ? "shadow-2xl shadow-theme-primary/10 bg-theme-background/95 backdrop-blur-xl border-b border-theme-border/50"
          : "bg-gradient-to-r from-theme-background/80 via-theme-background/70 to-theme-background/80 backdrop-blur-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 relative text-theme-primary ">
        <Link href="/" className="group flex items-center space-x-2">
          <div className="relative">
            <div className=""></div>
            <div className="">
              <span className="text-xl font-bold bg-clip-text ">
                PrivacyGuard
              </span>
            </div>
          </div>{" "}
        </Link>
        <nav className="hidden lg:flex items-center space-x-8">
          <SignedOut>
            {guestLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-sm font-medium text-theme-text hover:text-theme-primary transition-all duration-300 group"
              >
                <span className="relative z-10">{link.label}</span>
                <div className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-theme-primary to-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </Link>
            ))}
          </SignedOut>

          <SignedIn>
            {navigationGroups.map((item, index) =>
              item.type === "link" ? (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative text-sm font-medium text-theme-text hover:text-theme-primary transition-all duration-300 group"
                >
                  <span className="relative z-10">{item.label}</span>
                  <div className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-theme-primary to-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </Link>
              ) : (                <div key={index} className="relative dropdown-container group">
                  <button
                    onClick={() => handleDesktopDropdownToggle(index)}
                    className="flex items-center space-x-1 text-sm font-medium text-theme-text hover:text-theme-primary transition-all duration-300 relative"
                  >
                    <span className="relative z-10">{item.label}</span>
                    <ChevronDownIcon
                      className={`h-4 w-4 transition-all duration-300 ${activeDesktopDropdown === index ? "rotate-180 text-theme-primary" : "group-hover:text-theme-primary"}`}
                    />
                    <div className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-theme-primary to-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  </button>

                  {activeDesktopDropdown === index && (
                    <div className="absolute top-full left-0 mt-3 w-56 bg-theme-background backdrop-blur-xl border border-theme-border rounded-2xl shadow-2xl shadow-theme-primary py-3 z-50 animate-in slide-in-from-top-2 duration-300">
                      <div className="absolute -top-2 left-6 w-4 h-4 bg-theme-background/95 border-l border-t border-theme-border/50 rotate-45"></div>
                      {item.items.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className="group/item flex items-center px-4 py-3 text-sm text-theme-text hover:text-theme-primary hover:bg-gradient-to-r hover:from-theme-primary/10 hover:to-purple-500/10 transition-all duration-300 relative overflow-hidden"
                          onClick={closeDesktopDropdown}
                        >
                          <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-theme-primary to-purple-500 scale-y-0 group-hover/item:scale-y-100 transition-transform duration-300 origin-top"></div>
                          <span className="relative z-10 group-hover/item:translate-x-1 transition-transform duration-300">
                            {subItem.label}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            )}
          </SignedIn>
        </nav>{" "}
        <div className="flex items-center space-x-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="relative text-sm px-5 py-2.5 rounded-xl text-theme-text hover:text-theme-primary transition-all duration-300 group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-theme-primary/10 to-purple-500/10 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-xl"></div>
                <span className="relative z-10">Sign In</span>
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="relative text-sm px-5 py-2.5 bg-gradient-to-r from-theme-primary to-purple-500 text-white rounded-xl hover:shadow-lg hover:shadow-theme-primary/25 transition-all duration-300 group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-theme-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 group-hover:scale-105 transition-transform duration-300">
                  Get Started
                </span>
              </button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-theme-primary to-purple-500 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox:
                      "relative h-10 w-10 ring-2 ring-theme-primary/50 hover:ring-theme-primary transition-all duration-300",
                  },
                }}
              />
            </div>
          </SignedIn>

          <button
            className="lg:hidden p-2.5 text-theme-text hover:text-theme-primary rounded-xl hover:bg-theme-primary/10 transition-all duration-300 group"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {" "}
            {mobileOpen ? (
              <XMarkIcon className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
            ) : (
              <Bars3Icon className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
            )}
          </button>
        </div>
      </div>{" "}
      {mobileOpen && (
        <div className="lg:hidden bg-gradient-to-b from-theme-background/95 to-theme-background/90 backdrop-blur-xl border-t border-theme-border/50 px-6 py-6 space-y-4 shadow-2xl shadow-theme-primary/10">
          <SignedOut>
            {guestLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-theme-text hover:text-theme-primary py-3 px-4 rounded-xl hover:bg-gradient-to-r hover:from-theme-primary/10 hover:to-purple-500/10 transition-all duration-300 relative group"
              >
                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-theme-primary to-purple-500 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top rounded-r"></div>
                <span className="relative z-10 group-hover:translate-x-2 transition-transform duration-300">
                  {link.label}
                </span>
              </Link>
            ))}
          </SignedOut>

          <SignedIn>
            {navigationGroups.map((item, index) =>
              item.type === "link" ? (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block text-theme-text hover:text-theme-primary py-3 px-4 rounded-xl hover:bg-gradient-to-r hover:from-theme-primary/10 hover:to-purple-500/10 transition-all duration-300 relative group"
                  onClick={() => setMobileOpen(false)}
                >
                  <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-theme-primary to-purple-500 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top rounded-r"></div>
                  <span className="relative z-10 group-hover:translate-x-2 transition-transform duration-300">
                    {item.label}
                  </span>
                </Link>              ) : (
                <div key={index}>
                  {item.items.map((subItem) => (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      className="block text-theme-text hover:text-theme-primary py-3 px-4 rounded-xl hover:bg-gradient-to-r hover:from-theme-primary/10 hover:to-purple-500/10 transition-all duration-300 relative group"
                      onClick={() => setMobileOpen(false)}
                    >
                      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-theme-primary to-purple-500 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top rounded-r"></div>
                      <span className="relative z-10 group-hover:translate-x-2 transition-transform duration-300">
                        {subItem.label}
                      </span>
                    </Link>
                  ))}
                </div>
              )
            )}
          </SignedIn>
        </div>
      )}
    </header>
  );
}
