"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Card, {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  KeyIcon,
  DocumentDuplicateIcon,
  EnvelopeIcon,
  NewspaperIcon,
  LockClosedIcon,
  SparklesIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import Button from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [stats, setStats] = useState({
    totalBreaches: 0,
    compromisedPasswords: 0,
    tempEmailsCreated: 0,
    lastScanDate: null,
    riskLevel: "low",
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    if (isLoaded && user) {
      // Simulate loading dashboard data
      setStats({
        totalBreaches: 0,
        compromisedPasswords: 0,
        tempEmailsCreated: 3,
        lastScanDate: new Date().toISOString(),
        riskLevel: "low",
      });

      setRecentActivity([
        {
          id: 1,
          type: "temp_email",
          description: "Created temporary email address",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: "success",
        },
        {
          id: 2,
          type: "password_check",
          description: "Checked password strength",
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          status: "info",
        },
        {
          id: 3,
          type: "breach_scan",
          description: "Completed breach monitoring scan",
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          status: "success",
        },
      ]);
    }
  }, [isLoaded, user]);

  // Enhanced animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const cardHoverVariants = {
    hover: {
      y: -12,
      scale: 1.02,
      rotateX: 5,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    tap: {
      scale: 0.98,
      transition: { duration: 0.2 },
    },
  };

  const shimmerVariants = {
    initial: { x: "-100%" },
    animate: {
      x: "100%",
      transition: {
        duration: 2,
        ease: "easeInOut",
        repeat: Infinity,
        repeatDelay: 3,
      },
    },
  };

  const floatingElementVariants = {
    float: {
      y: [-10, 10, -10],
      rotateX: [0, 5, 0],
      transition: {
        duration: 6,
        ease: "easeInOut",
        repeat: Infinity,
      },
    },
  };
  const getRiskLevelColor = (level) => {
    switch (level) {
      case "high":
        return "text-theme-error";
      case "medium":
        return "text-theme-warning";
      case "low":
        return "text-theme-success";
      default:
        return "text-theme-text-secondary";
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "temp_email":
        return <EyeIcon className="h-5 w-5" />;
      case "password_check":
        return <KeyIcon className="h-5 w-5" />;
      case "breach_scan":
        return <ShieldCheckIcon className="h-5 w-5" />;
      default:
        return <ClockIcon className="h-5 w-5" />;
    }
  };
  if (!isLoaded) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-theme flex items-center justify-center relative overflow-hidden">
          {/* Floating background elements */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-64 h-64 rounded-full opacity-5"
                style={{
                  background: `linear-gradient(135deg, ${i % 2 === 0 ? "var(--color-primary)" : "var(--color-accent)"}, transparent)`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  x: [0, 100, 0],
                  y: [0, -100, 0],
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 20 + i * 5,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ))}
          </motion.div>

          <motion.div
            className="flex flex-col items-center space-y-8 relative z-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Enhanced loading spinner */}
            <motion.div className="relative">
              {" "}
              <motion.div
                className="w-16 h-16 border-4 border-theme-border rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-theme-primary rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-2 w-12 h-12 border-2 border-transparent border-t-theme-accent rounded-full"
                animate={{ rotate: -360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>

            <motion.div
              className="text-center space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              {" "}
              <motion.h2
                className="text-2xl font-bold text-theme-text"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{
                  background:
                    "linear-gradient(90deg, var(--color-primary), var(--color-accent), var(--color-primary))",
                  backgroundSize: "200% 100%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Initializing Dashboard
              </motion.h2>
              <motion.p
                className="text-theme-text-secondary text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Preparing your personalized privacy insights...
              </motion.p>
              {/* Loading progress dots */}
              <motion.div className="flex justify-center space-x-2 mt-6">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 bg-theme-primary rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </>
    );
  }
  return (
    <>
      <Header />
      <motion.div
        className="min-h-screen bg-gradient-theme relative overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
      >
        {/* Enhanced floating background elements */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        >
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full opacity-[0.03] dark:opacity-[0.05]"
              style={{
                width: `${200 + i * 50}px`,
                height: `${200 + i * 50}px`,
                background: `linear-gradient(135deg, ${
                  i % 3 === 0 ? "#3B82F6" : i % 3 === 1 ? "#8B5CF6" : "#06B6D4"
                }, transparent)`,
                left: `${(i * 15) % 100}%`,
                top: `${(i * 20) % 100}%`,
              }}
              variants={floatingElementVariants}
              animate="float"
              transition={{ delay: i * 0.5 }}
            />
          ))}
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          {/* Enhanced Welcome Section */}
          <motion.div
            className="mb-12 text-center relative"
            variants={itemVariants}
          >
            {" "}
            <motion.div
              className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-theme-primary to-theme-accent rounded-full"
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ duration: 1, delay: 0.5 }}
            />
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 relative"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.span
                className="inline-block"
                style={{
                  background:
                    "linear-gradient(135deg, #1F2937 0%, #3B82F6 50%, #8B5CF6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                Welcome back,
              </motion.span>
              <br />{" "}
              <motion.span
                className="text-theme-text inline-block"
                initial={{ opacity: 0, rotateX: -90 }}
                animate={{ opacity: 1, rotateX: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                {user?.firstName || "User"}!
              </motion.span>
              <motion.span
                className="text-4xl ml-2 inline-block"
                animate={{
                  rotate: [0, 15, -10, 15, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  delay: 1,
                  repeat: Infinity,
                  repeatDelay: 5,
                }}
              >
                👋
              </motion.span>
            </motion.h1>
            <motion.p
              className="text-xl text-theme-text-secondary max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              Here&apos;s your comprehensive{" "}
              <motion.span
                className="text-theme-primary font-semibold"
                whileHover={{ scale: 1.05 }}
              >
                privacy protection
              </motion.span>{" "}
              overview and insights
            </motion.p>
            {/* Floating trust indicators */}
            <motion.div
              className="flex justify-center items-center space-x-8 mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              {[
                { icon: ShieldCheckIcon, label: "Secure", count: "99.9%" },
                { icon: SparklesIcon, label: "Protected", count: "24/7" },
                { icon: CheckCircleIcon, label: "Verified", count: "✓" },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  className="flex items-center space-x-2 text-sm text-theme-text-secondary"
                  whileHover={{ scale: 1.05, y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <item.icon className="h-5 w-5 text-theme-success" />
                  </motion.div>
                  <span className="font-medium">
                    {item.count} {item.label}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>{" "}
          {/* Enhanced Stats Overview */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
            variants={itemVariants}
          >
            {[
              {
                title: "Risk Level",
                value: stats.riskLevel,
                description: "Based on recent scans",
                icon: ShieldCheckIcon,
                color: getRiskLevelColor(stats.riskLevel),
                isSpecial: true,
                gradient: "from-theme-success to-theme-success-hover",
                bgGradient: "from-theme-surface to-theme-surface-hover",
              },
              {
                title: "Known Breaches",
                value: stats.totalBreaches,
                description: "Affecting your accounts",
                icon: ExclamationTriangleIcon,
                color: "text-theme-text",
                gradient: "from-theme-primary to-theme-primary-hover",
                bgGradient: "from-theme-surface to-theme-surface-hover",
              },
              {
                title: "Compromised Passwords",
                value: stats.compromisedPasswords,
                description: "Need immediate attention",
                icon: KeyIcon,
                color: "text-theme-text",
                gradient: "from-theme-accent to-theme-accent-hover",
                bgGradient: "from-theme-surface to-theme-surface-hover",
              },
              {
                title: "Temp Emails",
                value: stats.tempEmailsCreated,
                description: "Created this month",
                icon: EyeIcon,
                color: "text-theme-text",
                gradient: "from-theme-secondary to-theme-secondary-hover",
                bgGradient: "from-theme-surface to-theme-surface-hover",
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                variants={itemVariants}
                whileHover="hover"
                whileTap="tap"
                className="group perspective-1000"
              >
                <motion.div
                  variants={cardHoverVariants}
                  className="relative h-full"
                >
                  {" "}
                  <Card className="h-full bg-theme-surface backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
                    {/* Animated gradient background */}
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                    />

                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100"
                      variants={shimmerVariants}
                      initial="initial"
                      whileHover="animate"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12" />
                    </motion.div>

                    {/* Floating particles */}
                    <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      {" "}
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1 h-1 bg-theme-primary rounded-full"
                          style={{
                            left: `${20 + i * 30}%`,
                            top: `${30 + i * 20}%`,
                          }}
                          animate={{
                            y: [-10, -30, -10],
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.5,
                          }}
                        />
                      ))}
                    </div>

                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                      <CardTitle className="text-sm font-semibold text-theme-text-secondary group-hover:text-theme-text transition-all duration-300">
                        {stat.title}
                      </CardTitle>
                      <motion.div
                        whileHover={{
                          scale: 1.2,
                          rotate: 360,
                          y: -2,
                        }}
                        transition={{
                          duration: 0.6,
                          ease: [0.25, 0.46, 0.45, 0.94],
                        }}
                        className="relative"
                      >
                        <motion.div
                          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100"
                          style={{
                            background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                          }}
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0, 0.3, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: index * 0.2,
                          }}
                        />
                        <stat.icon className="h-6 w-6 text-theme-text-secondary group-hover:text-theme-primary transition-all duration-300 relative z-10" />
                      </motion.div>
                    </CardHeader>

                    <CardContent className="relative z-10">
                      <motion.div
                        className={`text-3xl md:text-4xl font-bold ${stat.isSpecial ? stat.color : stat.color} mb-2`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          duration: 0.6,
                          delay: 0.3 + index * 0.1,
                          ease: [0.25, 0.46, 0.45, 0.94],
                        }}
                        whileHover={{ scale: 1.05 }}
                      >
                        {stat.isSpecial ? (
                          <motion.span
                            style={{
                              background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                              backgroundClip: "text",
                            }}
                            className={`bg-gradient-to-r ${stat.gradient}`}
                          >
                            {stat.value.charAt(0).toUpperCase() +
                              stat.value.slice(1)}
                          </motion.span>
                        ) : (
                          <motion.span
                            animate={{
                              textShadow: [
                                "0 0 0px rgba(59, 130, 246, 0)",
                                "0 0 10px rgba(59, 130, 246, 0.3)",
                                "0 0 0px rgba(59, 130, 246, 0)",
                              ],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: index * 0.5,
                            }}
                          >
                            {stat.value}
                          </motion.span>
                        )}
                      </motion.div>
                      <p className="text-sm text-theme-text-secondary group-hover:text-theme-text transition-colors duration-300 leading-relaxed">
                        {stat.description}
                      </p>

                      {/* Progress indicator for special stats */}
                      {stat.isSpecial && (
                        <motion.div
                          className="mt-3 w-full bg-theme-border rounded-full h-2 overflow-hidden"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1 + index * 0.1 }}
                        >
                          <motion.div
                            className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full`}
                            initial={{ width: 0 }}
                            animate={{ width: "85%" }}
                            transition={{
                              duration: 1.5,
                              delay: 1.2 + index * 0.1,
                              ease: [0.25, 0.46, 0.45, 0.94],
                            }}
                          />
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>{" "}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            variants={itemVariants}
          >
            {/* Enhanced Quick Actions */}
            <motion.div className="lg:col-span-1" variants={itemVariants}>
              <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.3 }}>
                {" "}
                <Card className="h-full bg-theme-surface backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
                  {/* Animated border */}
                  <motion.div
                    className="absolute inset-0 rounded-lg"
                    style={{
                      background:
                        "linear-gradient(90deg, var(--color-primary), var(--color-accent), var(--color-primary))",
                      backgroundSize: "400% 100%",
                    }}
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <div className="absolute inset-[1px] bg-theme-surface rounded-lg" />
                  </motion.div>

                  <CardHeader className="relative z-10">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      {" "}
                      <CardTitle className="text-xl font-bold text-theme-text flex items-center">
                        <motion.span
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: 1,
                          }}
                        >
                          ⚡
                        </motion.span>
                        <span className="ml-2">Quick Actions</span>
                      </CardTitle>
                      <CardDescription className="text-theme-text-secondary mt-2">
                        Common privacy protection tasks
                      </CardDescription>
                    </motion.div>
                  </CardHeader>

                  <CardContent className="space-y-3 relative z-10">
                    {" "}
                    {[
                      {
                        href: "/breach-monitor",
                        icon: ShieldCheckIcon,
                        label: "Run Breach Scan",
                        color: "hover:bg-theme-error/10",
                        gradient: "from-theme-error to-theme-error-hover",
                        description: "Check for data breaches",
                      },
                      {
                        href: "/password-checker",
                        icon: KeyIcon,
                        label: "Check Password",
                        color: "hover:bg-theme-primary/10",
                        gradient: "from-theme-primary to-theme-primary-hover",
                        description: "Verify password strength",
                      },
                      {
                        href: "/temp-email",
                        icon: EyeIcon,
                        label: "Create Temp Email",
                        color: "hover:bg-theme-success/10",
                        gradient: "from-theme-success to-theme-success-hover",
                        description: "Generate temporary email",
                      },
                      {
                        href: "/vault",
                        icon: LockClosedIcon,
                        label: "Secure Vault",
                        color: "hover:bg-theme-accent/10",
                        gradient: "from-theme-accent to-theme-accent-hover",
                        description: "Access secure storage",
                      },
                      {
                        href: "/fake-data",
                        icon: DocumentDuplicateIcon,
                        label: "Generate Fake Data",
                        color: "hover:bg-theme-warning/10",
                        gradient: "from-theme-warning to-theme-warning-hover",
                        description: "Create test information",
                      },
                      {
                        href: "/privacy-news",
                        icon: NewspaperIcon,
                        label: "Privacy News",
                        color: "hover:bg-theme-secondary/10",
                        gradient:
                          "from-theme-secondary to-theme-secondary-hover",
                        description: "Latest privacy updates",
                      },
                    ].map((action, index) => (
                      <motion.div
                        key={action.href}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                        whileHover={{ x: 6, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="group/item"
                      >
                        <Link href={action.href}>
                          {" "}
                          <Button
                            className={`w-full justify-between group/button transition-all duration-400 ${action.color} border-theme-border hover:border-transparent relative overflow-hidden`}
                            variant="outline"
                          >
                            {/* Button background animation */}
                            <motion.div
                              className={`absolute inset-0 bg-gradient-to-r ${action.gradient} opacity-0 group-hover/button:opacity-10 transition-opacity duration-400`}
                            />

                            <div className="flex items-center relative z-10">
                              <motion.div
                                whileHover={{ scale: 1.2, rotate: 10 }}
                                transition={{ duration: 0.3 }}
                                className="relative"
                              >
                                <motion.div
                                  className={`absolute inset-0 bg-gradient-to-r ${action.gradient} rounded-full opacity-0 group-hover/button:opacity-20 blur-sm`}
                                  animate={{
                                    scale: [1, 1.2, 1],
                                  }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: index * 0.3,
                                  }}
                                />
                                <action.icon className="h-5 w-5 group-hover/button:text-theme-primary transition-colors duration-300 relative z-10" />
                              </motion.div>
                              <div className="ml-3 text-left">
                                <div className="font-medium group-hover/button:text-theme-primary transition-colors duration-300">
                                  {action.label}
                                </div>
                                <div className="text-xs text-theme-text-secondary group-hover/button:text-theme-text transition-colors duration-300">
                                  {action.description}
                                </div>
                              </div>
                            </div>

                            <motion.div
                              className="text-theme-text-secondary group-hover/button:text-theme-primary transition-colors duration-300"
                              whileHover={{ x: 3 }}
                            >
                              <ArrowRightIcon className="h-4 w-4" />
                            </motion.div>
                          </Button>
                        </Link>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>{" "}
            {/* Enhanced Recent Activity */}
            <motion.div className="lg:col-span-2" variants={itemVariants}>
              <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.3 }}>
                {" "}
                <Card className="h-full bg-theme-surface backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
                  {/* Animated background pattern */}
                  <motion.div
                    className="absolute inset-0 opacity-5"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23var(--color-primary)' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                    animate={{
                      x: [0, 30, 0],
                      y: [0, -30, 0],
                    }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />

                  <CardHeader className="relative z-10">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      {" "}
                      <CardTitle className="text-xl font-bold text-theme-text flex items-center">
                        <motion.span
                          animate={{
                            rotate: [0, 360],
                            scale: [1, 1.2, 1],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          📊
                        </motion.span>
                        <span className="ml-2">Recent Activity</span>
                        <motion.div
                          className="ml-auto w-2 h-2 bg-theme-success rounded-full"
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [1, 0.5, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                          }}
                        />
                      </CardTitle>
                      <CardDescription className="text-theme-text-secondary mt-2">
                        Your latest privacy protection actions
                      </CardDescription>
                    </motion.div>
                  </CardHeader>

                  <CardContent className="relative z-10">
                    <div className="space-y-4">
                      <AnimatePresence>
                        {recentActivity.map((activity, index) => (
                          <motion.div
                            key={activity.id}
                            className="relative"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{
                              duration: 0.5,
                              delay: 0.1 + index * 0.1,
                            }}
                            layout
                          >
                            <motion.div
                              className="flex items-center space-x-4 p-4 rounded-xl hover:bg-theme-surface-hover transition-all duration-300 group/activity cursor-pointer relative overflow-hidden"
                              whileHover={{
                                x: 6,
                                scale: 1.02,
                                rotateX: 2,
                              }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {/* Hover background effect */}{" "}
                              <motion.div className="absolute inset-0 bg-theme-primary/10 opacity-0 group-hover/activity:opacity-100 transition-opacity duration-300 rounded-xl" />
                              {/* Timeline line */}
                              {index < recentActivity.length - 1 && (
                                <motion.div
                                  className="absolute left-6 top-16 w-px h-8 bg-gradient-to-b from-theme-border to-transparent"
                                  initial={{ height: 0 }}
                                  animate={{ height: 32 }}
                                  transition={{
                                    duration: 0.5,
                                    delay: 0.3 + index * 0.1,
                                  }}
                                />
                              )}
                              <motion.div
                                className="flex-shrink-0 relative z-10"
                                whileHover={{ scale: 1.15, rotate: 10 }}
                                transition={{ duration: 0.3 }}
                              >
                                <motion.div
                                  className="p-3 rounded-full bg-theme-primary/10 group-hover/activity:bg-theme-primary/20 transition-all duration-300 relative"
                                  animate={{
                                    boxShadow: [
                                      "0 0 0 0 rgba(59, 130, 246, 0)",
                                      "0 0 0 8px rgba(59, 130, 246, 0.1)",
                                      "0 0 0 0 rgba(59, 130, 246, 0)",
                                    ],
                                  }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: index * 0.5,
                                  }}
                                >
                                  <motion.div
                                    whileHover={{ rotate: 360 }}
                                    transition={{ duration: 0.6 }}
                                  >
                                    {getActivityIcon(activity.type)}
                                  </motion.div>
                                </motion.div>
                              </motion.div>
                              <div className="flex-1 min-w-0 relative z-10">
                                <motion.p
                                  className="text-sm font-semibold text-theme-text group-hover/activity:text-theme-primary transition-colors duration-300"
                                  layoutId={`title-${activity.id}`}
                                >
                                  {activity.description}
                                </motion.p>
                                <motion.p
                                  className="text-sm text-theme-text-secondary mt-1"
                                  initial={{ opacity: 0.7 }}
                                  whileHover={{ opacity: 1 }}
                                >
                                  {formatDate(activity.timestamp)}
                                </motion.p>

                                {/* Activity type badge */}
                                <motion.span
                                  className="inline-block mt-2 px-2 py-1 text-xs rounded-full bg-theme-surface text-theme-text-secondary group-hover/activity:bg-theme-primary/10 group-hover/activity:text-theme-primary transition-all duration-300"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{
                                    duration: 0.3,
                                    delay: 0.4 + index * 0.1,
                                  }}
                                >
                                  {activity.type
                                    .replace("_", " ")
                                    .toUpperCase()}
                                </motion.span>
                              </div>
                              <motion.div
                                className="flex-shrink-0 relative z-10"
                                whileHover={{ scale: 1.2, rotate: 20 }}
                                transition={{ duration: 0.3 }}
                              >
                                <motion.div
                                  className="relative"
                                  animate={{
                                    rotate: [0, 5, -5, 0],
                                  }}
                                  transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    delay: index * 0.7,
                                  }}
                                >
                                  <CheckCircleIcon className="h-6 w-6 text-theme-success group-hover/activity:text-theme-success transition-colors duration-300" />
                                  <motion.div
                                    className="absolute inset-0 bg-theme-success rounded-full opacity-0 group-hover/activity:opacity-20"
                                    animate={{
                                      scale: [1, 1.5, 1],
                                      opacity: [0, 0.3, 0],
                                    }}
                                    transition={{
                                      duration: 2,
                                      repeat: Infinity,
                                      delay: index * 0.3,
                                    }}
                                  />
                                </motion.div>
                              </motion.div>
                            </motion.div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    {/* View all activities button */}
                    <motion.div
                      className="mt-6 pt-4 border-t border-theme-border"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.8 }}
                    >
                      <motion.button
                        className="w-full text-center text-sm font-medium text-theme-primary hover:text-theme-primary transition-colors duration-200 py-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        View All Activities →
                      </motion.button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </motion.div>{" "}
          {/* Enhanced Security Recommendations */}
          <motion.div className="mt-12" variants={itemVariants}>
            <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.3 }}>
              {" "}
              <Card className="bg-theme-surface/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
                {/* Animated gradient border */}
                <motion.div
                  className="absolute inset-0 bg-gradient-theme-animated"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <div className="absolute inset-[1px] bg-theme-surface rounded-lg" />
                </motion.div>

                {/* Floating security icons */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute text-theme-primary/20"
                      style={{
                        left: `${20 + i * 25}%`,
                        top: `${10 + i * 15}%`,
                      }}
                      animate={{
                        y: [-20, 20, -20],
                        rotate: [0, 360],
                        scale: [0.8, 1.2, 0.8],
                      }}
                      transition={{
                        duration: 10 + i * 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <ShieldCheckIcon className="h-8 w-8" />
                    </motion.div>
                  ))}
                </div>

                <CardHeader className="relative z-10">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <CardTitle className="text-2xl font-bold text-theme-text flex items-center">
                      <motion.span
                        animate={{
                          rotate: [0, 5, -5, 0],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        🔒
                      </motion.span>
                      <span className="ml-2">Security Recommendations</span>
                      <motion.div
                        className="ml-auto px-3 py-1 text-xs font-semibold bg-gradient-to-r from-theme-warning to-theme-error text-white rounded-full"
                        animate={{
                          scale: [1, 1.05, 1],
                          boxShadow: [
                            "0 0 0 0 rgba(251, 146, 60, 0)",
                            "0 0 0 8px rgba(251, 146, 60, 0.2)",
                            "0 0 0 0 rgba(251, 146, 60, 0)",
                          ],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                      >
                        3 Actions
                      </motion.div>
                    </CardTitle>{" "}
                    <CardDescription className="text-theme-text-secondary mt-2 text-lg">
                      Suggested actions to improve your privacy protection
                    </CardDescription>
                  </motion.div>
                </CardHeader>

                <CardContent className="relative z-10">
                  <div className="space-y-6">
                    {[
                      {
                        icon: ShieldCheckIcon,
                        title: "Enable Two-Factor Authentication",
                        description:
                          "Add an extra layer of security to your most important accounts. This reduces breach risk by 99.9%.",
                        color: "text-blue-600 dark:text-blue-400",
                        gradient: "from-blue-500 to-cyan-600",
                        bgColor:
                          "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
                        priority: "High",
                        time: "5 min",
                      },
                      {
                        icon: KeyIcon,
                        title: "Update Weak Passwords",
                        description:
                          "Use our password checker to identify and update weak passwords across all your accounts.",
                        color: "text-green-600 dark:text-green-400",
                        gradient: "from-green-500 to-emerald-600",
                        bgColor:
                          "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
                        priority: "Medium",
                        time: "15 min",
                      },
                      {
                        icon: EyeIcon,
                        title: "Review Data Sharing",
                        description:
                          "Check which services have access to your personal data and revoke unnecessary permissions.",
                        color: "text-purple-600 dark:text-purple-400",
                        gradient: "from-purple-500 to-violet-600",
                        bgColor:
                          "from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20",
                        priority: "Low",
                        time: "10 min",
                      },
                    ].map((recommendation, index) => (
                      <motion.div
                        key={recommendation.title}
                        className="relative group/rec cursor-pointer"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 + index * 0.2 }}
                        whileHover={{
                          x: 8,
                          scale: 1.02,
                          rotateY: 2,
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <motion.div
                          className={`flex items-start space-x-4 p-6 rounded-2xl bg-gradient-to-r ${recommendation.bgColor} hover:shadow-lg transition-all duration-500 relative overflow-hidden`}
                        >
                          {/* Animated background effect */}
                          <motion.div
                            className={`absolute inset-0 bg-gradient-to-r ${recommendation.gradient} opacity-0 group-hover/rec:opacity-10 transition-opacity duration-500`}
                          />

                          {/* Priority indicator */}
                          <motion.div
                            className={`absolute top-4 right-4 px-2 py-1 text-xs font-bold rounded-full ${
                              recommendation.priority === "High"
                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                : recommendation.priority === "Medium"
                                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                  : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            }`}
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{
                              duration: 0.5,
                              delay: 0.5 + index * 0.2,
                            }}
                          >
                            {recommendation.priority}
                          </motion.div>

                          <motion.div
                            className="flex-shrink-0 relative"
                            whileHover={{
                              scale: 1.2,
                              rotate: 10,
                              y: -4,
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            <motion.div
                              className={`p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-lg relative`}
                              animate={{
                                boxShadow: [
                                  "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                  "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                                  "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                ],
                              }}
                              transition={{
                                duration: 3,
                                repeat: Infinity,
                                delay: index * 0.5,
                              }}
                            >
                              <motion.div
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.8 }}
                              >
                                <recommendation.icon
                                  className={`h-8 w-8 ${recommendation.color} group-hover/rec:scale-110 transition-transform duration-300`}
                                />
                              </motion.div>

                              {/* Glowing effect */}
                              <motion.div
                                className={`absolute inset-0 bg-gradient-to-r ${recommendation.gradient} rounded-2xl opacity-0 group-hover/rec:opacity-20 blur-sm`}
                                animate={{
                                  scale: [1, 1.1, 1],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  delay: index * 0.4,
                                }}
                              />
                            </motion.div>
                          </motion.div>

                          <div className="flex-1 relative z-10">
                            <motion.div className="flex items-center justify-between mb-2">
                              <h4 className="text-lg font-bold text-gray-900 dark:text-white group-hover/rec:text-blue-600 dark:group-hover/rec:text-blue-400 transition-colors duration-300">
                                {recommendation.title}
                              </h4>
                              <motion.span
                                className="text-sm text-gray-500 dark:text-gray-400 font-medium"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.7 + index * 0.2 }}
                              >
                                ~{recommendation.time}
                              </motion.span>
                            </motion.div>

                            <p className="text-gray-600 dark:text-gray-400 group-hover/rec:text-gray-700 dark:group-hover/rec:text-gray-300 transition-colors duration-300 leading-relaxed mb-4">
                              {recommendation.description}
                            </p>

                            {/* Action button */}
                            <motion.button
                              className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r ${recommendation.gradient} text-white hover:shadow-lg transition-all duration-300 group/btn`}
                              whileHover={{ scale: 1.05, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.9 + index * 0.2 }}
                            >
                              <span>Take Action</span>
                              <motion.div
                                className="ml-2"
                                whileHover={{ x: 3 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ArrowRightIcon className="h-4 w-4" />
                              </motion.div>
                            </motion.button>
                          </div>
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
