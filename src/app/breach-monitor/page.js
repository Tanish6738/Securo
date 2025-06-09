"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Card, {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import AIAssistant from "@/components/AIAssistant";
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  GlobeAltIcon,
  ChartBarIcon,
  ClockIcon,
  InformationCircleIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import "./scrollbar.css";

export default function BreachMonitorPage() {
  const [email, setEmail] = useState("");
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [domainResults, setDomainResults] = useState(null);
  const [recentBreaches, setRecentBreaches] = useState([]);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("email");
  const [checkType, setCheckType] = useState("basic"); // New state variables for the two-column layout in results
  const [selectedBreachWebsite, setSelectedBreachWebsite] = useState(null);
  const [selectedDomainBreach, setSelectedDomainBreach] = useState(null);
  const [selectedRecentBreach, setSelectedRecentBreach] = useState(null);
  // AI Assistant state
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

  const checkEmailBreach = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");
    setResults(null);

    try {
      const response = await fetch("/api/breach-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, type: checkType }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to check email");
      }

      console.log("Breach check results:", data);

      setResults(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const checkDomainBreaches = async (e) => {
    e.preventDefault();
    if (!domain) return;

    setLoading(true);
    setError("");
    setDomainResults(null);

    try {
      const response = await fetch(
        `/api/breaches?domain=${encodeURIComponent(domain)}`
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Failed to check domain" }));
        throw new Error(errorData.error || "Failed to check domain");
      }

      const data = await response.json();
      setDomainResults(data);
    } catch (error) {
      console.error("Domain breach check error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentBreaches = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/breaches");

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Failed to fetch breaches" }));
        throw new Error(errorData.error || "Failed to fetch breaches");
      }

      const data = await response.json();
      setRecentBreaches(data.exposedBreaches || []);
    } catch (error) {
      console.error("Recent breaches fetch error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  // Handle breach website selection
  const handleBreachWebsiteSelect = (breach) => {
    setSelectedBreachWebsite(breach);
  };

  // Handle domain breach selection
  const handleDomainBreachSelect = (breach) => {
    setSelectedDomainBreach(breach);
  };

  // Handle recent breach selection
  const handleRecentBreachSelect = (breach) => {
    setSelectedRecentBreach(breach);
  };
  // Get breach details for a website
  const getBreachDetails = async (breachName) => {
    try {
      const response = await fetch("/api/breaches");

      if (!response.ok) {
        console.error("Failed to fetch breach details:", response.status);
        return null;
      }

      const data = await response.json();

      if (data.exposedBreaches) {
        return data.exposedBreaches.find(
          (breach) => breach.breachID.toLowerCase() === breachName.toLowerCase()
        );
      }
      return null;
    } catch (error) {
      console.error("Error fetching breach details:", error);
      return null;
    }
  };

  // Load recent breaches on component mount
  useEffect(() => {
    if (activeTab === "recent") {
      fetchRecentBreaches();
    }
  }, [activeTab]);
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20 ">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Breach Monitor
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Check if your email addresses have been compromised in known data
              breaches.
            </p>
          </div>{" "}
          {/* Tab Navigation */}
          <div className="mb-8">
            <nav className="flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("email")}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "email"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <MagnifyingGlassIcon className="h-5 w-5 inline mr-2" />
                Email Check
              </button>
              <button
                onClick={() => setActiveTab("domain")}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "domain"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <GlobeAltIcon className="h-5 w-5 inline mr-2" />
                Domain Breaches
              </button>
              <button
                onClick={() => setActiveTab("recent")}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "recent"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <ClockIcon className="h-5 w-5 inline mr-2" />
                Recent Breaches
              </button>
            </nav>
          </div>
          {/* Email Tab */}
          {activeTab === "email" && (
            <div className="space-y-8">
              {/* Check Type Selector */}
              <Card>
                {" "}
                <CardHeader>
                  <CardTitle>Check Type</CardTitle>
                  <CardDescription>
                    Choose between basic email check or detailed analytics.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="basic"
                          checked={checkType === "basic"}
                          onChange={(e) => setCheckType(e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-sm">Basic Check</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="analytics"
                          checked={checkType === "analytics"}
                          onChange={(e) => setCheckType(e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-sm">Detailed Analytics</span>
                      </label>
                    </div>

                    {/* Explanatory text */}
                    <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                      {checkType === "basic" ? (
                        <div>
                          <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Basic Check includes:
                          </p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>Simple breach detection</li>
                            <li>List of affected websites</li>
                            <li>Basic security recommendations</li>
                          </ul>
                        </div>
                      ) : (
                        <div>
                          <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Detailed Analytics includes:
                          </p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>Complete breach metrics & statistics</li>
                            <li>Paste site monitoring & exposure tracking</li>
                            <li>Risk assessment & severity scoring</li>
                            <li>Password strength analysis</li>
                            <li>Timeline analysis of exposure history</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Email Checker */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShieldCheckIcon className="h-6 w-6 mr-2 text-blue-600 dark:text-blue-400" />
                    Email Breach Check
                  </CardTitle>
                  <CardDescription>
                    Enter your email address to check against our database of
                    known breaches.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {" "}
                  <form onSubmit={checkEmailBreach} className="space-y-4">
                    <div>
                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full"
                        required
                      />{" "}
                      {checkType === "analytics" && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          💡 Try &quot;test@example.com&quot; or
                          &quot;demo@test.com&quot; to see full analytics
                          features in action
                        </p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      disabled={loading || !email}
                      className="w-full sm:w-auto"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Checking...
                        </>
                      ) : (
                        <>
                          <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                          Check Email
                        </>
                      )}
                    </Button>
                  </form>
                  {error && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
                      <div className="flex">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                            Error
                          </h3>
                          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                            {error}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}{" "}
                  {/* Results Display */}
                  {results && (
                    <div className="mt-6">
                      {" "}
                      {/* Analytics Overview (only for detailed analytics) */}
                      {checkType === "analytics" && results.isBreached && (
                        <div className="mb-6 space-y-6">
                          {/* Top Metrics Cards */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Breach Count */}
                            <Card>
                              <CardContent className="p-4">
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                    {results.ExposedBreaches?.breaches_details
                                      ?.length || 0}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Total Breaches
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Paste Exposures */}
                            <Card>
                              <CardContent className="p-4">
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                    {results.PastesSummary?.cnt || 0}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Paste Exposures
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Risk Score */}
                            {results.BreachMetrics?.risk?.[0] && (
                              <Card>
                                <CardContent className="p-4">
                                  <div className="text-center">
                                    <div
                                      className={`text-2xl font-bold ${
                                        results.BreachMetrics.risk[0]
                                          .risk_score <= 3
                                          ? "text-green-600 dark:text-green-400"
                                          : results.BreachMetrics.risk[0]
                                                .risk_score <= 6
                                            ? "text-yellow-600 dark:text-yellow-400"
                                            : "text-red-600 dark:text-red-400"
                                      }`}
                                    >
                                      {results.BreachMetrics.risk[0].risk_score}
                                      /10
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      Risk Score
                                    </div>
                                    <div
                                      className={`text-xs font-medium ${
                                        results.BreachMetrics.risk[0]
                                          .risk_score <= 3
                                          ? "text-green-600 dark:text-green-400"
                                          : results.BreachMetrics.risk[0]
                                                .risk_score <= 6
                                            ? "text-yellow-600 dark:text-yellow-400"
                                            : "text-red-600 dark:text-red-400"
                                      }`}
                                    >
                                      {results.BreachMetrics.risk[0].risk_label}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}

                            {/* Total Exposed Records */}
                            <Card>
                              <CardContent className="p-4">
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    {results.ExposedBreaches?.breaches_details
                                      ?.reduce(
                                        (total, breach) =>
                                          total + (breach.xposed_records || 0),
                                        0
                                      )
                                      ?.toLocaleString() || "0"}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Records Exposed
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Detailed Analytics Sections */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Timeline Analysis */}
                            {results.BreachMetrics?.yearwise_details?.[0] && (
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg flex items-center">
                                    <ClockIcon className="h-5 w-5 mr-2" />
                                    Breach Timeline
                                  </CardTitle>
                                  <CardDescription>
                                    Year-wise exposure history
                                  </CardDescription>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-2">
                                    {Object.entries(
                                      results.BreachMetrics.yearwise_details[0]
                                    )
                                      .filter(([year, count]) => count > 0)
                                      .sort(([a], [b]) => b.localeCompare(a))
                                      .map(([year, count]) => (
                                        <div
                                          key={year}
                                          className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                                        >
                                          <span className="text-sm font-medium">
                                            {year.replace("y", "")}
                                          </span>
                                          <div className="flex items-center">
                                            <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                                              <div
                                                className="bg-red-500 h-2 rounded-full"
                                                style={{
                                                  width: `${Math.min((count / Math.max(...Object.values(results.BreachMetrics.yearwise_details[0]))) * 100, 100)}%`,
                                                }}
                                              ></div>
                                            </div>
                                            <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                                              {count}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                </CardContent>
                              </Card>
                            )}

                            {/* Password Strength Analysis */}
                            {results.BreachMetrics?.passwords_strength?.[0] && (
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg flex items-center">
                                    <ShieldCheckIcon className="h-5 w-5 mr-2" />
                                    Password Security Analysis
                                  </CardTitle>
                                  <CardDescription>
                                    Security level of exposed passwords
                                  </CardDescription>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-3">
                                    {Object.entries(
                                      results.BreachMetrics
                                        .passwords_strength[0]
                                    ).map(([type, count]) => {
                                      if (count === 0) return null;
                                      const getTypeInfo = (type) => {
                                        switch (type) {
                                          case "StrongHash":
                                            return {
                                              color: "green",
                                              label: "Strong Hash",
                                              icon: "🔒",
                                            };
                                          case "PlainText":
                                            return {
                                              color: "red",
                                              label: "Plain Text",
                                              icon: "⚠️",
                                            };
                                          case "EasyToCrack":
                                            return {
                                              color: "orange",
                                              label: "Easy to Crack",
                                              icon: "🔓",
                                            };
                                          case "Unknown":
                                            return {
                                              color: "gray",
                                              label: "Unknown",
                                              icon: "❓",
                                            };
                                          default:
                                            return {
                                              color: "gray",
                                              label: type,
                                              icon: "📝",
                                            };
                                        }
                                      };
                                      const info = getTypeInfo(type);
                                      return (
                                        <div
                                          key={type}
                                          className={`p-3 rounded-lg bg-${info.color}-50 dark:bg-${info.color}-900/20`}
                                        >
                                          <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium flex items-center">
                                              <span className="mr-2">
                                                {info.icon}
                                              </span>
                                              {info.label}
                                            </span>
                                            <span
                                              className={`text-sm font-bold text-${info.color}-600 dark:text-${info.color}-400`}
                                            >
                                              {count}
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </CardContent>
                              </Card>
                            )}

                            {/* Industry Breakdown */}
                            {results.BreachMetrics?.industry?.[0] && (
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg flex items-center">
                                    <ChartBarIcon className="h-5 w-5 mr-2" />
                                    Industry Analysis
                                  </CardTitle>
                                  <CardDescription>
                                    Sectors affected by breaches
                                  </CardDescription>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-2">
                                    {results.BreachMetrics.industry[0]
                                      .filter(([industry, count]) => count > 0)
                                      .sort(([, a], [, b]) => b - a)
                                      .slice(0, 5)
                                      .map(([industry, count]) => {
                                        const getIndustryName = (code) => {
                                          const industryMap = {
                                            elec: "Electronics",
                                            info: "Information Technology",
                                            reta: "Retail",
                                            food: "Food & Beverage",
                                            ente: "Entertainment",
                                            fina: "Financial",
                                            heal: "Healthcare",
                                            educ: "Education",
                                            tele: "Telecommunications",
                                            govt: "Government",
                                            misc: "Miscellaneous",
                                          };
                                          return (
                                            industryMap[code] ||
                                            code.toUpperCase()
                                          );
                                        };
                                        return (
                                          <div
                                            key={industry}
                                            className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                                          >
                                            <span className="text-sm font-medium">
                                              {getIndustryName(industry)}
                                            </span>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                              {count}
                                            </span>
                                          </div>
                                        );
                                      })}
                                  </div>
                                </CardContent>
                              </Card>
                            )}

                            {/* Exposed Data Categories */}
                            {results.BreachMetrics?.xposed_data?.[0]
                              ?.children && (
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg flex items-center">
                                    <InformationCircleIcon className="h-5 w-5 mr-2" />
                                    Data Exposure Categories
                                  </CardTitle>
                                  <CardDescription>
                                    Types of information compromised
                                  </CardDescription>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-4">
                                    {results.BreachMetrics.xposed_data[0].children.map(
                                      (category, idx) => (
                                        <div
                                          key={idx}
                                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                                        >
                                          <h4 className="font-medium text-sm mb-2 text-gray-900 dark:text-white">
                                            {category.name}
                                          </h4>
                                          <div className="space-y-1">
                                            {category.children.map(
                                              (item, itemIdx) => (
                                                <div
                                                  key={itemIdx}
                                                  className="flex justify-between items-center text-xs"
                                                >
                                                  <span className="text-gray-600 dark:text-gray-400">
                                                    {item.name.replace(
                                                      "data_",
                                                      ""
                                                    )}
                                                  </span>
                                                  <span
                                                    className={`px-2 py-1 rounded text-xs font-medium ${
                                                      item.group === "A"
                                                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                                        : item.group === "D"
                                                          ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                                                          : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                                    }`}
                                                  >
                                                    {item.value} breach
                                                    {item.value !== 1
                                                      ? "es"
                                                      : ""}
                                                  </span>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </div>
                        </div>
                      )}
                      {results.isBreached ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Left: Breach List */}
                          <div className="md:col-span-1">
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center text-red-600 dark:text-red-400">
                                  <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                                  Breaches Found (
                                  {results.breachCount ||
                                    results.breaches?.length ||
                                    0}
                                  )
                                </CardTitle>
                                <CardDescription>
                                  Your email was found in these data breaches
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="overflow-y-auto max-h-[400px] pr-2 -mr-2 custom-scrollbar">
                                  <ul className="space-y-2">
                                    {(
                                      results.breaches ||
                                      results.ExposedBreaches
                                        ?.breaches_details ||
                                      []
                                    ).map((breach, index) => {
                                      const breachName =
                                        typeof breach === "string"
                                          ? breach
                                          : breach.breach;
                                      return (
                                        <li key={index}>
                                          <button
                                            onClick={async () => {
                                              const details =
                                                await getBreachDetails(
                                                  breachName
                                                );
                                              if (details) {
                                                handleBreachWebsiteSelect(
                                                  details
                                                );
                                              } else {
                                                // Create a basic breach object if details not found
                                                handleBreachWebsiteSelect({
                                                  breachID: breachName,
                                                  exposureDescription:
                                                    breach.details ||
                                                    "Data breach incident",
                                                  industry:
                                                    breach.industry ||
                                                    "Unknown",
                                                  exposedRecords:
                                                    breach.xposed_records ||
                                                    "Unknown",
                                                  breachedDate:
                                                    breach.xposed_date ||
                                                    "Unknown",
                                                  exposedData:
                                                    breach.exposedData || [],
                                                  verified:
                                                    breach.verified || false,
                                                });
                                              }
                                            }}
                                            className={`w-full hover:cursor-pointer text-left px-4 py-3 rounded-lg transition-colors ${
                                              selectedBreachWebsite &&
                                              selectedBreachWebsite.breachID ===
                                                breachName
                                                ? "bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500"
                                                : "hover:bg-gray-100 dark:hover:bg-gray-800/50 border-l-4 border-transparent"
                                            }`}
                                          >
                                            <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                              {breachName}
                                            </h3>
                                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                              Email compromised
                                            </p>
                                            {typeof breach === "object" && (
                                              <div className="flex items-center mt-1">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                  {breach.xposed_records?.toLocaleString() ||
                                                    "?"}{" "}
                                                  records
                                                </span>
                                                <span className="mx-2 text-gray-300 dark:text-gray-600">
                                                  •
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                  {breach.xposed_date ||
                                                    "Unknown date"}
                                                </span>
                                              </div>
                                            )}
                                          </button>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Right: Breach Details */}
                          <div className="md:col-span-2">
                            {selectedBreachWebsite ? (
                              <Card>
                                <CardHeader>
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <CardTitle className="text-xl text-red-600 dark:text-red-400">
                                        {selectedBreachWebsite.breachID}
                                      </CardTitle>
                                      <CardDescription>
                                        {selectedBreachWebsite.industry ||
                                          "Unknown industry"}
                                      </CardDescription>
                                    </div>
                                    <div className="flex space-x-2">
                                      {selectedBreachWebsite.verified && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                          Verified
                                        </span>
                                      )}
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                        {selectedBreachWebsite.exposedRecords?.toLocaleString() ||
                                          "?"}{" "}
                                        records
                                      </span>
                                    </div>
                                  </div>
                                </CardHeader>

                                <CardContent className="space-y-6">
                                  {/* Breach Information */}
                                  <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                      Breach Information
                                    </h3>
                                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Date of Breach
                                          </p>
                                          <p className="font-medium text-gray-900 dark:text-white">
                                            {selectedBreachWebsite.breachedDate
                                              ? new Date(
                                                  selectedBreachWebsite.breachedDate
                                                ).toLocaleDateString()
                                              : "Unknown"}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Industry
                                          </p>
                                          <p className="font-medium text-gray-900 dark:text-white">
                                            {selectedBreachWebsite.industry ||
                                              "Unknown"}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Records Exposed
                                          </p>
                                          <p className="font-medium text-gray-900 dark:text-white">
                                            {selectedBreachWebsite.exposedRecords?.toLocaleString() ||
                                              "Unknown"}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Verification
                                          </p>
                                          <p className="font-medium text-gray-900 dark:text-white">
                                            {selectedBreachWebsite.verified
                                              ? "Verified"
                                              : "Unverified"}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Description */}
                                  <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                      Description
                                    </h3>
                                    <p className="text-gray-700 dark:text-gray-300">
                                      {selectedBreachWebsite.exposureDescription ||
                                        "No description available for this breach."}
                                    </p>
                                  </div>

                                  {/* Exposed Data */}
                                  {selectedBreachWebsite.exposedData &&
                                    selectedBreachWebsite.exposedData.length >
                                      0 && (
                                      <div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                          Exposed Data Types
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                          {Array.isArray(
                                            selectedBreachWebsite.exposedData
                                          ) ? (
                                            selectedBreachWebsite.exposedData.map(
                                              (data, idx) => (
                                                <span
                                                  key={idx}
                                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                                >
                                                  {data}
                                                </span>
                                              )
                                            )
                                          ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                              {
                                                selectedBreachWebsite.exposedData
                                              }
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                  {/* Security Recommendations */}
                                  <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                      Immediate Actions Required
                                    </h3>
                                    <div className="space-y-3">
                                      <div className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                        <div className="flex-shrink-0">
                                          <div className="w-6 h-6 bg-yellow-600 dark:bg-yellow-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                            !
                                          </div>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                            Change passwords immediately
                                          </p>
                                          <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                            Update passwords for{" "}
                                            {selectedBreachWebsite.breachID} and
                                            any other accounts using the same
                                            credentials.
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <div className="flex-shrink-0">
                                          <div className="w-6 h-6 bg-blue-600 dark:bg-blue-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                            2
                                          </div>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                            Enable two-factor authentication
                                          </p>{" "}
                                          <p className="text-sm text-blue-700 dark:text-blue-300">
                                            Add an extra layer of security to
                                            prevent unauthorized access.
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  {/* Analytics-specific content */}
                                  {checkType === "analytics" &&
                                    results.ExposedPastes &&
                                    results.ExposedPastes.pastes_details &&
                                    results.ExposedPastes.pastes_details
                                      .length > 0 && (
                                      <div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                          Paste Site Exposures
                                        </h3>
                                        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                                          <div className="flex items-center mb-3">
                                            <div className="flex-shrink-0">
                                              <div className="w-8 h-8 bg-orange-600 dark:bg-orange-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                                {
                                                  results.ExposedPastes
                                                    .pastes_details.length
                                                }
                                              </div>
                                            </div>
                                            <div className="ml-3">
                                              <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                                                Data found on paste sites
                                              </p>
                                              <p className="text-sm text-orange-700 dark:text-orange-300">
                                                Your email was discovered in{" "}
                                                {
                                                  results.ExposedPastes
                                                    .pastes_details.length
                                                }{" "}
                                                paste site(s)
                                              </p>
                                            </div>
                                          </div>
                                          <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                                            {results.ExposedPastes.pastes_details
                                              .slice(0, 5)
                                              .map((paste, idx) => (
                                                <div
                                                  key={idx}
                                                  className="text-xs text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-800/30 rounded px-2 py-1"
                                                >
                                                  <span className="font-medium">
                                                    Source:
                                                  </span>{" "}
                                                  {paste.source || "Unknown"}
                                                  {paste.date && (
                                                    <span className="ml-2">
                                                      <span className="font-medium">
                                                        Date:
                                                      </span>{" "}
                                                      {new Date(
                                                        paste.date
                                                      ).toLocaleDateString()}
                                                    </span>
                                                  )}
                                                </div>
                                              ))}
                                            {results.ExposedPastes
                                              .pastes_details.length > 5 && (
                                              <div className="text-xs text-orange-600 dark:text-orange-400">
                                                +
                                                {results.ExposedPastes
                                                  .pastes_details.length -
                                                  5}{" "}
                                                more paste exposures...
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                  {/* No Paste Exposure Notification for Analytics */}
                                  {checkType === "analytics" &&
                                    results.PastesSummary?.cnt === 0 && (
                                      <div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                          Paste Site Monitoring
                                        </h3>
                                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                                          <div className="flex items-center">
                                            <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                                            <div>
                                              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                                No paste site exposures found
                                              </p>
                                              <p className="text-sm text-green-700 dark:text-green-300">
                                                Your email was not found in any
                                                monitored paste sites or data
                                                dumps.
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                  {/* Enhanced Risk Assessment (Analytics only) */}
                                  {checkType === "analytics" &&
                                    results.BreachMetrics?.risk?.[0] && (
                                      <div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                          Comprehensive Risk Assessment
                                        </h3>
                                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="text-center p-4 border border-purple-200 dark:border-purple-700 rounded-lg">
                                              <div
                                                className={`text-3xl font-bold mb-2 ${
                                                  results.BreachMetrics.risk[0]
                                                    .risk_score <= 3
                                                    ? "text-green-600 dark:text-green-400"
                                                    : results.BreachMetrics
                                                          .risk[0].risk_score <=
                                                        6
                                                      ? "text-yellow-600 dark:text-yellow-400"
                                                      : "text-red-600 dark:text-red-400"
                                                }`}
                                              >
                                                {
                                                  results.BreachMetrics.risk[0]
                                                    .risk_score
                                                }
                                                /10
                                              </div>
                                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                Overall Risk Score
                                              </p>
                                              <p
                                                className={`text-sm font-medium ${
                                                  results.BreachMetrics.risk[0]
                                                    .risk_score <= 3
                                                    ? "text-green-600 dark:text-green-400"
                                                    : results.BreachMetrics
                                                          .risk[0].risk_score <=
                                                        6
                                                      ? "text-yellow-600 dark:text-yellow-400"
                                                      : "text-red-600 dark:text-red-400"
                                                }`}
                                              >
                                                {
                                                  results.BreachMetrics.risk[0]
                                                    .risk_label
                                                }{" "}
                                                Risk
                                              </p>
                                            </div>

                                            <div className="space-y-3">
                                              <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                  Risk Factors:
                                                </p>
                                                <ul className="text-sm text-gray-700 dark:text-gray-300 mt-1 space-y-1">
                                                  <li>
                                                    •{" "}
                                                    {results.ExposedBreaches
                                                      ?.breaches_details
                                                      ?.length || 0}{" "}
                                                    confirmed breaches
                                                  </li>
                                                  <li>
                                                    •{" "}
                                                    {results.PastesSummary
                                                      ?.cnt || 0}{" "}
                                                    paste site exposures
                                                  </li>
                                                  {results.BreachMetrics
                                                    .passwords_strength?.[0]
                                                    ?.PlainText > 0 && (
                                                    <li className="text-red-600 dark:text-red-400">
                                                      • Plain text passwords
                                                      exposed
                                                    </li>
                                                  )}
                                                  {results.BreachMetrics
                                                    .passwords_strength?.[0]
                                                    ?.EasyToCrack > 0 && (
                                                    <li className="text-orange-600 dark:text-orange-400">
                                                      • Weak password hashing
                                                      detected
                                                    </li>
                                                  )}
                                                </ul>
                                              </div>

                                              <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                  Recommendation:
                                                </p>
                                                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                                                  {results.BreachMetrics.risk[0]
                                                    .risk_score <= 3
                                                    ? "Monitor regularly and maintain good security practices."
                                                    : results.BreachMetrics
                                                          .risk[0].risk_score <=
                                                        6
                                                      ? "Take immediate action to secure accounts and update passwords."
                                                      : "Urgent action required! Change all passwords and enable 2FA immediately."}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                </CardContent>
                              </Card>
                            ) : (
                              <Card className="h-full flex items-center justify-center">
                                <CardContent className="text-center py-12">
                                  <ExclamationTriangleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
                                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                                    Select a Breach
                                  </h3>
                                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                                    Choose a breach from the list to view
                                    detailed information and security
                                    recommendations.
                                  </p>
                                </CardContent>
                              </Card>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
                            <div className="flex">
                              <CheckCircleIcon className="h-5 w-5 text-green-400" />
                              <div className="ml-3">
                                <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                                  No Breaches Found
                                </h3>
                                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                  This email address has not been found in any
                                  known data breaches.
                                  {checkType === "analytics" &&
                                    " This comprehensive analysis includes checking against breach databases and paste site monitoring."}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Analytics Summary for Clean Emails */}
                          {checkType === "analytics" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg flex items-center text-green-600 dark:text-green-400">
                                    <ShieldCheckIcon className="h-5 w-5 mr-2" />
                                    Security Status
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                      <span className="text-sm font-medium">
                                        Breach Database
                                      </span>
                                      <span className="text-green-600 dark:text-green-400 font-bold">
                                        ✓ Clean
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                      <span className="text-sm font-medium">
                                        Paste Site Monitoring
                                      </span>
                                      <span className="text-green-600 dark:text-green-400 font-bold">
                                        ✓ Clean
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                      <span className="text-sm font-medium">
                                        Risk Level
                                      </span>
                                      <span className="text-green-600 dark:text-green-400 font-bold">
                                        Low
                                      </span>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>

                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg flex items-center">
                                    <InformationCircleIcon className="h-5 w-5 mr-2" />
                                    Recommendations
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-3">
                                    <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                      <div className="flex-shrink-0">
                                        <div className="w-6 h-6 bg-blue-600 dark:bg-blue-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                          1
                                        </div>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                          Continue monitoring
                                        </p>
                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                          Set up regular checks to stay informed
                                          about new breaches.
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-start space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                      <div className="flex-shrink-0">
                                        <div className="w-6 h-6 bg-purple-600 dark:bg-purple-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                          2
                                        </div>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                                          Maintain security best practices
                                        </p>
                                        <p className="text-sm text-purple-700 dark:text-purple-300">
                                          Use strong, unique passwords and
                                          enable 2FA where possible.
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          )}
                        </div>
                      )}
                      {/* AI Assistant Button - Show after detailed analytics results */}
                      {checkType === "analytics" && (
                        <div className="mt-6 text-center">
                          <Button
                            onClick={() => setIsAIAssistantOpen(true)}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                          >
                            <SparklesIcon className="h-5 w-5 mr-2" />
                            Analyze with AI
                          </Button>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Get personalized insights and recommendations from
                            our AI assistant
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          {/* Domain Tab */}
          {activeTab === "domain" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GlobeAltIcon className="h-6 w-6 mr-2 text-blue-600 dark:text-blue-400" />
                  Domain Breach Check
                </CardTitle>
                <CardDescription>
                  Check if a specific domain has been involved in any data
                  breaches.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={checkDomainBreaches} className="space-y-4">
                  <div>
                    <Input
                      type="text"
                      placeholder="Enter domain (e.g., example.com)"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      className="w-full"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading || !domain}
                    className="w-full sm:w-auto"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Checking...
                      </>
                    ) : (
                      <>
                        <GlobeAltIcon className="h-4 w-4 mr-2" />
                        Check Domain
                      </>
                    )}
                  </Button>
                </form>
                {error && (
                  <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
                    <div className="flex">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                          Error
                        </h3>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                          {error}
                        </p>
                      </div>
                    </div>
                  </div>
                )}{" "}
                {domainResults && (
                  <div className="mt-6">
                    {domainResults.exposedBreaches &&
                    domainResults.exposedBreaches.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Left: Domain Breach List */}
                        <div className="md:col-span-1">
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center text-red-600 dark:text-red-400">
                                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                                Domain Breaches Found (
                                {domainResults.exposedBreaches.length})
                              </CardTitle>
                              <CardDescription>
                                Data breaches affecting this domain
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="overflow-y-auto max-h-[400px] pr-2 -mr-2 custom-scrollbar">
                                <ul className="space-y-2">
                                  {domainResults.exposedBreaches.map(
                                    (breach, index) => (
                                      <li
                                        key={index}
                                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                          selectedDomainBreach === breach
                                            ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                                            : "border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                                        }`}
                                        onClick={() =>
                                          handleDomainBreachSelect(breach)
                                        }
                                      >
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                                              {breach.breachID}
                                            </h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                              {breach.exposedRecords?.toLocaleString()}{" "}
                                              records •{" "}
                                              {new Date(
                                                breach.breachedDate
                                              ).getFullYear()}
                                            </p>
                                          </div>
                                          <div className="flex-shrink-0">
                                            <span
                                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                breach.verified
                                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                              }`}
                                            >
                                              {breach.verified
                                                ? "Verified"
                                                : "Unverified"}
                                            </span>
                                          </div>
                                        </div>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Right: Domain Breach Details */}
                        <div className="md:col-span-2">
                          {selectedDomainBreach ? (
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center text-red-600 dark:text-red-400">
                                  <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                                  {selectedDomainBreach.breachID}
                                </CardTitle>
                                <CardDescription>
                                  Detailed information about this data breach
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-6">
                                {/* Breach Overview */}
                                <div>
                                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                                    Breach Overview
                                  </h3>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Date Breached
                                      </p>
                                      <p className="font-medium text-gray-900 dark:text-white">
                                        {new Date(
                                          selectedDomainBreach.breachedDate
                                        ).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Records Exposed
                                      </p>
                                      <p className="font-medium text-gray-900 dark:text-white">
                                        {selectedDomainBreach.exposedRecords?.toLocaleString() ||
                                          "Unknown"}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Industry
                                      </p>
                                      <p className="font-medium text-gray-900 dark:text-white">
                                        {selectedDomainBreach.industry ||
                                          "Unknown"}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Verification
                                      </p>
                                      <p className="font-medium text-gray-900 dark:text-white">
                                        {selectedDomainBreach.verified
                                          ? "Verified"
                                          : "Unverified"}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Description */}
                                <div>
                                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    Description
                                  </h3>
                                  <p className="text-gray-700 dark:text-gray-300">
                                    {selectedDomainBreach.exposureDescription ||
                                      "No description available for this breach."}
                                  </p>
                                </div>

                                {/* Exposed Data */}
                                {selectedDomainBreach.exposedData &&
                                  selectedDomainBreach.exposedData.length >
                                    0 && (
                                    <div>
                                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        Exposed Data Types
                                      </h3>
                                      <div className="flex flex-wrap gap-2">
                                        {Array.isArray(
                                          selectedDomainBreach.exposedData
                                        ) ? (
                                          selectedDomainBreach.exposedData.map(
                                            (data, idx) => (
                                              <span
                                                key={idx}
                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                              >
                                                {data}
                                              </span>
                                            )
                                          )
                                        ) : (
                                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                            {selectedDomainBreach.exposedData}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                {/* Security Recommendations */}
                                <div>
                                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    Security Recommendations
                                  </h3>
                                  <div className="space-y-3">
                                    <div className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                      <div className="flex-shrink-0">
                                        <div className="w-6 h-6 bg-yellow-600 dark:bg-yellow-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                          !
                                        </div>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                          Review domain security
                                        </p>
                                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                          Audit all accounts and services
                                          associated with {domain} for potential
                                          security gaps.
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                      <div className="flex-shrink-0">
                                        <div className="w-6 h-6 bg-blue-600 dark:bg-blue-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                          2
                                        </div>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                          Implement monitoring
                                        </p>
                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                          Set up continuous monitoring for this
                                          domain to detect future breaches
                                          early.
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ) : (
                            <Card className="h-full flex items-center justify-center">
                              <CardContent className="text-center py-12">
                                <GlobeAltIcon className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                                  Select a Domain Breach
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                                  Choose a breach from the list to view detailed
                                  information and security recommendations.
                                </p>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
                        <div className="flex">
                          <CheckCircleIcon className="h-5 w-5 text-green-400" />
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                              No Breaches Found
                            </h3>
                            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                              This domain has not been found in any known data
                              breaches.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          {/* Recent Breaches Tab */}
          {activeTab === "recent" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ClockIcon className="h-6 w-6 mr-2 text-blue-600 dark:text-blue-400" />
                  Recent Data Breaches
                </CardTitle>
                <CardDescription>
                  View the latest data breaches and security incidents.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Stay informed about recent security incidents and data
                    breaches.
                  </p>
                  <Button
                    onClick={fetchRecentBreaches}
                    disabled={loading}
                    size="sm"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Loading...
                      </>
                    ) : (
                      "Refresh"
                    )}
                  </Button>
                </div>
                {error && (
                  <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
                    <div className="flex">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                          Error
                        </h3>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                          {error}
                        </p>
                      </div>
                    </div>
                  </div>
                )}{" "}
                {recentBreaches.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left: Recent Breach List */}
                    <div className="md:col-span-1">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center text-orange-600 dark:text-orange-400">
                            <ClockIcon className="h-5 w-5 mr-2" />
                            Recent Breaches ({recentBreaches.length})
                          </CardTitle>
                          <CardDescription>
                            Latest security incidents and breaches
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-y-auto max-h-[400px] pr-2 -mr-2 custom-scrollbar">
                            <ul className="space-y-2">
                              {recentBreaches.map((breach, index) => (
                                <li
                                  key={index}
                                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                    selectedRecentBreach === breach
                                      ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                                      : "border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/10"
                                  }`}
                                  onClick={() =>
                                    handleRecentBreachSelect(breach)
                                  }
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                                        {breach.breachID}
                                      </h4>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {breach.exposedRecords?.toLocaleString()}{" "}
                                        records •{" "}
                                        {new Date(
                                          breach.breachedDate
                                        ).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <div className="flex-shrink-0">
                                      <span
                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                          breach.verified
                                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                        }`}
                                      >
                                        {breach.verified
                                          ? "Verified"
                                          : "Unverified"}
                                      </span>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Right: Recent Breach Details */}
                    <div className="md:col-span-2">
                      {selectedRecentBreach ? (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center text-orange-600 dark:text-orange-400">
                              <ClockIcon className="h-5 w-5 mr-2" />
                              {selectedRecentBreach.breachID}
                            </CardTitle>
                            <CardDescription>
                              Recent security incident details
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            {/* Breach Overview */}
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                                Breach Overview
                              </h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Date Breached
                                  </p>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {new Date(
                                      selectedRecentBreach.breachedDate
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Records Exposed
                                  </p>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {selectedRecentBreach.exposedRecords?.toLocaleString() ||
                                      "Unknown"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Industry
                                  </p>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {selectedRecentBreach.industry || "Unknown"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Verification
                                  </p>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {selectedRecentBreach.verified
                                      ? "Verified"
                                      : "Unverified"}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Description */}
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Description
                              </h3>
                              <p className="text-gray-700 dark:text-gray-300">
                                {selectedRecentBreach.exposureDescription ||
                                  "No description available for this breach."}
                              </p>
                            </div>

                            {/* Exposed Data */}
                            {selectedRecentBreach.exposedData &&
                              selectedRecentBreach.exposedData.length > 0 && (
                                <div>
                                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    Exposed Data Types
                                  </h3>
                                  <div className="flex flex-wrap gap-2">
                                    {Array.isArray(
                                      selectedRecentBreach.exposedData
                                    ) ? (
                                      selectedRecentBreach.exposedData.map(
                                        (data, idx) => (
                                          <span
                                            key={idx}
                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                                          >
                                            {data}
                                          </span>
                                        )
                                      )
                                    ) : (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                                        {selectedRecentBreach.exposedData}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}

                            {/* Security Recommendations */}
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Security Awareness
                              </h3>
                              <div className="space-y-3">
                                <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                  <div className="flex-shrink-0">
                                    <div className="w-6 h-6 bg-blue-600 dark:bg-blue-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                      i
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                      Stay informed
                                    </p>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                      This breach affects{" "}
                                      {selectedRecentBreach.breachID}. Monitor
                                      for similar patterns in your own data.
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                  <div className="flex-shrink-0">
                                    <div className="w-6 h-6 bg-yellow-600 dark:bg-yellow-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                      !
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                      Review security practices
                                    </p>
                                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                      Use this information to improve your own
                                      security measures and awareness.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        <Card className="h-full flex items-center justify-center">
                          <CardContent className="text-center py-12">
                            <ClockIcon className="h-16 w-16 text-orange-400 mx-auto mb-4" />
                            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                              Select a Recent Breach
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                              Choose a breach from the list to view detailed
                              information about recent security incidents.
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                ) : !loading ? (
                  <div className="text-center py-8">
                    <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No recent breaches available
                    </p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}{" "}
          {/* Email Check Tab */}
          {/* Information Card - Only show on email tab */}
          {activeTab === "email" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <InformationCircleIcon className="h-5 w-5 mr-2" />
                  What should I do if my email is breached?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-blue-600 dark:bg-blue-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        1
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Change your passwords immediately
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Update passwords for all accounts associated with this
                        email address.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-blue-600 dark:bg-blue-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        2
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Enable two-factor authentication
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Add an extra layer of security to your important
                        accounts.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-blue-600 dark:bg-blue-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        3
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Monitor your accounts
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Keep an eye on your bank statements and credit reports
                        for unusual activity.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}{" "}
        </div>
      </div>

      {/* AI Assistant Component */}
      <AIAssistant
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        breachData={results}
        userEmail={email}
      />
    </>
  );
}
