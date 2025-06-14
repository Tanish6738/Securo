"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isLoaded && user && isClient) {
      // Simulate loading dashboard data with fixed timestamps to avoid hydration mismatch
      const baseDate = new Date('2024-01-01T10:00:00Z');
      setStats({
        totalBreaches: 0,
        compromisedPasswords: 0,
        tempEmailsCreated: 3,
        lastScanDate: baseDate.toISOString(),
        riskLevel: "low",
      });

      setRecentActivity([
        {
          id: 1,
          type: "temp_email",
          description: "Created temporary email address",
          timestamp: new Date(baseDate.getTime() - 2 * 60 * 60 * 1000).toISOString(),
          status: "success",
        },
        {
          id: 2,
          type: "password_check",
          description: "Checked password strength",
          timestamp: new Date(baseDate.getTime() - 4 * 60 * 60 * 1000).toISOString(),
          status: "info",
        },
        {
          id: 3,
          type: "breach_scan",
          description: "Completed breach monitoring scan",
          timestamp: new Date(baseDate.getTime() - 6 * 60 * 60 * 1000).toISOString(),
          status: "success",
        },
      ]);
    }
  }, [isLoaded, user, isClient]);
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
  };  if (!isLoaded || !isClient) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-theme flex items-center justify-center relative overflow-hidden mt-20">
          <div className="flex flex-col items-center space-y-8 relative z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-primary"></div>
            <h2 className="text-2xl font-bold text-theme-text">
              Initializing Dashboard
            </h2>
            <p className="text-theme-text-secondary text-lg">
              Setting up your privacy tools...
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-theme relative overflow-hidden mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          {/* Welcome Section */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-theme-text">
              Welcome back, {user?.firstName || "User"}! 👋
            </h1>
            <p className="text-xl text-theme-text-secondary max-w-2xl mx-auto">
              Here's your comprehensive <span className="text-theme-primary font-semibold">privacy protection</span> overview and insights
            </p>
            
            {/* Trust indicators */}
            <div className="flex justify-center items-center space-x-8 mt-8">
              <div className="flex items-center space-x-2 text-sm text-theme-text-secondary">
                <ShieldCheckIcon className="h-5 w-5 text-theme-success" />
                <span className="font-medium">99.9% Secure</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-theme-text-secondary">
                <SparklesIcon className="h-5 w-5 text-theme-success" />
                <span className="font-medium">24/7 Protected</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-theme-text-secondary">
                <CheckCircleIcon className="h-5 w-5 text-theme-success" />
                <span className="font-medium">✓ Verified</span>
              </div>
            </div>
          </div>          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              {
                title: "Risk Level",
                value: stats.riskLevel,
                description: "Based on recent scans",
                icon: ShieldCheckIcon,
                color: getRiskLevelColor(stats.riskLevel),
                isSpecial: true,
              },
              {
                title: "Known Breaches",
                value: stats.totalBreaches,
                description: "Affecting your accounts",
                icon: ExclamationTriangleIcon,
                color: "text-theme-text",
              },
              {
                title: "Compromised Passwords",
                value: stats.compromisedPasswords,
                description: "Need immediate attention",
                icon: KeyIcon,
                color: "text-theme-text",
              },
              {
                title: "Temp Emails",
                value: stats.tempEmailsCreated,
                description: "Created this month",
                icon: EyeIcon,
                color: "text-theme-text",
              },
            ].map((stat, index) => (
              <Card key={stat.title} className="bg-theme-surface border-theme-border hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-theme-text-secondary">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-6 w-6 text-theme-text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${stat.color} mb-2`}>
                    {stat.isSpecial ? (
                      <span className="capitalize">{stat.value}</span>
                    ) : (
                      stat.value
                    )}
                  </div>
                  <p className="text-sm text-theme-text-secondary">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <Card className="bg-theme-surface border-theme-border shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-theme-text flex items-center">
                    ⚡ Quick Actions
                  </CardTitle>
                  <CardDescription className="text-theme-text-secondary">
                    Common privacy protection tasks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 flex flex-col gap-6 ">
                  {[
                    {
                      href: "/breach-monitor",
                      icon: ShieldCheckIcon,
                      label: "Run Breach Scan",
                      description: "Check for data breaches",
                    },
                    {
                      href: "/password-checker",
                      icon: KeyIcon,
                      label: "Check Password",
                      description: "Verify password strength",
                    },
                    {
                      href: "/temp-email",
                      icon: EyeIcon,
                      label: "Create Temp Email",
                      description: "Generate temporary email",
                    },
                    {
                      href: "/vault",
                      icon: LockClosedIcon,
                      label: "Secure Vault",
                      description: "Access secure storage",
                    },
                    {
                      href: "/fake-data",
                      icon: DocumentDuplicateIcon,
                      label: "Generate Fake Data",
                      description: "Create test information",
                    },
                    {
                      href: "/privacy-news",
                      icon: NewspaperIcon,
                      label: "Privacy News",
                      description: "Latest privacy updates",
                    },
                  ].map((action) => (
                    <Link key={action.href} href={action.href}>
                      <Button
                        className="w-full justify-between hover:bg-theme-surface-hover border-theme-border"
                        variant="outline"
                      >
                        <div className="flex items-center">
                          <action.icon className="h-5 w-5 mr-3" />
                          <div className="text-left">
                            <div className="font-medium">{action.label}</div>
                            <div className="text-xs text-theme-text-secondary">
                              {action.description}
                            </div>
                          </div>
                        </div>
                        <ArrowRightIcon className="h-4 w-4" />
                      </Button>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </div>            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <Card className="bg-theme-surface border-theme-border shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-theme-text flex items-center">
                    📊 Recent Activity
                    <div className="ml-auto w-2 h-2 bg-theme-success rounded-full"></div>
                  </CardTitle>
                  <CardDescription className="text-theme-text-secondary">
                    Your latest privacy protection actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={activity.id} className="flex items-center space-x-4 p-4 rounded-xl hover:bg-theme-surface-hover transition-colors duration-200">
                        <div className="flex-shrink-0">
                          <div className="p-3 rounded-full bg-theme-primary/10">
                            {getActivityIcon(activity.type)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-theme-text">
                            {activity.description}
                          </p>
                          <p className="text-sm text-theme-text-secondary">
                            {formatDate(activity.timestamp)}
                          </p>
                          <span className="inline-block mt-2 px-2 py-1 text-xs rounded-full bg-theme-surface text-theme-text-secondary">
                            {activity.type.replace("_", " ").toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-shrink-0">
                          <CheckCircleIcon className="h-6 w-6 text-theme-success" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-theme-border">
                    <button className="w-full text-center text-sm font-medium text-theme-primary hover:text-theme-primary-hover transition-colors duration-200 py-2">
                      View All Activities →
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>          {/* Security Recommendations */}
          <div className="mt-12">
            <Card className="bg-theme-surface border-theme-border shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-theme-text flex items-center">
                  🔒 Security Recommendations
                  <div className="ml-auto px-3 py-1 text-xs font-semibold bg-gradient-to-r from-theme-warning to-theme-error text-white rounded-full">
                    3 Actions
                  </div>
                </CardTitle>
                <CardDescription className="text-theme-text-secondary text-lg">
                  Suggested actions to improve your privacy protection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    {
                      icon: ShieldCheckIcon,
                      title: "Enable Two-Factor Authentication",
                      description: "Add an extra layer of security to your most important accounts. This reduces breach risk by 99.9%.",
                      priority: "High",
                      time: "5 min",
                      bgColor: "bg-blue-50 dark:bg-blue-900/20",
                      iconColor: "text-blue-600 dark:text-blue-400",
                      priorityColor: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                    },
                    {
                      icon: KeyIcon,
                      title: "Update Weak Passwords",
                      description: "Use our password checker to identify and update weak passwords across all your accounts.",
                      priority: "Medium",
                      time: "15 min",
                      bgColor: "bg-green-50 dark:bg-green-900/20",
                      iconColor: "text-green-600 dark:text-green-400",
                      priorityColor: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                    },
                    {
                      icon: EyeIcon,
                      title: "Review Data Sharing",
                      description: "Check which services have access to your personal data and revoke unnecessary permissions.",
                      priority: "Low",
                      time: "10 min",
                      bgColor: "bg-purple-50 dark:bg-purple-900/20",
                      iconColor: "text-purple-600 dark:text-purple-400",
                      priorityColor: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                    },
                  ].map((recommendation) => (
                    <div
                      key={recommendation.title}
                      className={`flex items-start space-x-4 p-6 rounded-2xl ${recommendation.bgColor} hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02]`}
                    >
                      <div className={`absolute top-4 right-4 px-2 py-1 text-xs font-bold rounded-full ${recommendation.priorityColor}`}>
                        {recommendation.priority}
                      </div>
                      <div className="flex-shrink-0">
                        <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-lg">
                          <recommendation.icon className={`h-8 w-8 ${recommendation.iconColor}`} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                            {recommendation.title}
                          </h4>
                          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            ~{recommendation.time}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                          {recommendation.description}
                        </p>
                        <button className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-xl bg-theme-primary text-white hover:bg-theme-primary-hover transition-colors duration-300">
                          <span>Take Action</span>
                          <ArrowRightIcon className="h-4 w-4 ml-2" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
