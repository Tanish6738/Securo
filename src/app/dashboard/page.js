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
import Button from "@/components/ui/Button";
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  KeyIcon,
  DocumentDuplicateIcon,
  NewspaperIcon,
} from "@heroicons/react/24/outline";
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

  useEffect(() => {
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

  const getRiskLevelColor = (level) => {
    switch (level) {
      case "high":
        return "text-red-600 dark:text-red-400";
      case "medium":
        return "text-yellow-600 dark:text-yellow-400";
      case "low":
        return "text-green-600 dark:text-green-400";
      default:
        return "text-gray-600 dark:text-gray-400";
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome, {user?.firstName || "User"}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Here's an overview of your privacy protection status.
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Risk Level
                </CardTitle>
                <ShieldCheckIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold capitalize ${getRiskLevelColor(stats.riskLevel)}`}
                >
                  {stats.riskLevel}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Based on recent scans
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Known Breaches
                </CardTitle>
                <ExclamationTriangleIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalBreaches}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Affecting your accounts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Compromised Passwords
                </CardTitle>
                <KeyIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.compromisedPasswords}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Need immediate attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Temp Emails
                </CardTitle>
                <EyeIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.tempEmailsCreated}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Created this month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common privacy protection tasks
                  </CardDescription>
                </CardHeader>{" "}
                <CardContent className="space-y-4">
                  <Link href="/breach-monitor">
                    <Button className="w-full justify-start" variant="outline">
                      <ShieldCheckIcon className="mr-2 h-4 w-4" />
                      Run Breach Scan
                    </Button>
                  </Link>
                  <Link href="/password-checker">
                    <Button className="w-full justify-start" variant="outline">
                      <KeyIcon className="mr-2 h-4 w-4" />
                      Check Password
                    </Button>
                  </Link>
                  <Link href="/temp-email">
                    <Button className="w-full justify-start" variant="outline">
                      <EyeIcon className="mr-2 h-4 w-4" />
                      Create Temp Email
                    </Button>
                  </Link>
                  <Link href="/fake-data">
                    <Button className="w-full justify-start" variant="outline">
                      <DocumentDuplicateIcon className="mr-2 h-4 w-4" />
                      Generate Fake Data
                    </Button>
                  </Link>
                  <Link href="/privacy-news">
                    <Button className="w-full justify-start" variant="outline">
                      <NewspaperIcon className="mr-2 h-4 w-4" />
                      Privacy News
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your latest privacy protection actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center space-x-4"
                      >
                        <div className="flex-shrink-0">
                          <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                            {getActivityIcon(activity.type)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {activity.description}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(activity.timestamp)}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Security Recommendations */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Security Recommendations</CardTitle>
                <CardDescription>
                  Suggested actions to improve your privacy protection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <ShieldCheckIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        Enable Two-Factor Authentication
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Add an extra layer of security to your most important
                        accounts.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <KeyIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        Update Weak Passwords
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Use our password checker to identify and update weak
                        passwords.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <EyeIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        Review Data Sharing
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Check which services have access to your personal data.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
