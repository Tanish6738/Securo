"use client";

import { useState } from "react";
import Card, {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function TempEmailDebugPage() {
  const [debugResults, setDebugResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [specificTestResult, setSpecificTestResult] = useState(null);

  const runDebugTests = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/temp-email/debug");
      const data = await response.json();
      setDebugResults(data);
    } catch (error) {
      console.error("Debug test failed:", error);
      setDebugResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const runSpecificTest = async (testType) => {
    setLoading(true);
    try {
      const response = await fetch("/api/temp-email/debug", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ testType }),
      });
      const data = await response.json();
      setSpecificTestResult(data);
    } catch (error) {
      console.error("Specific test failed:", error);
      setSpecificTestResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "text-green-600";
      case "failed":
        return "text-red-600";
      case "testing":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return "✅";
      case "failed":
        return "❌";
      case "testing":
        return "⏳";
      default:
        return "ℹ️";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Temp Email API Debug
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Debug your temporary email API issues between local and Vercel
            deployment.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Debug Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Debug Tests</CardTitle>
              <CardDescription>
                Run comprehensive tests to identify API issues
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={runDebugTests}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Running Tests..." : "Run All Debug Tests"}
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => runSpecificTest("domains")}
                  disabled={loading}
                  size="sm"
                >
                  Test Domains
                </Button>
                <Button
                  variant="outline"
                  onClick={() => runSpecificTest("create-account")}
                  disabled={loading}
                  size="sm"
                >
                  Test Account Creation
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Environment Info */}
          <Card>
            <CardHeader>
              <CardTitle>Environment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Environment:</span>
                  <span className="font-mono">
                    {typeof window !== "undefined" ? "client" : "server"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>User Agent:</span>
                  <span
                    className="font-mono text-xs truncate max-w-48"
                    title={
                      typeof navigator !== "undefined"
                        ? navigator.userAgent
                        : "N/A"
                    }
                  >
                    {typeof navigator !== "undefined"
                      ? navigator.userAgent.substring(0, 30) + "..."
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Current URL:</span>
                  <span
                    className="font-mono text-xs truncate max-w-48"
                    title={
                      typeof window !== "undefined"
                        ? window.location.href
                        : "N/A"
                    }
                  >
                    {typeof window !== "undefined"
                      ? window.location.href.substring(0, 30) + "..."
                      : "N/A"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Debug Results */}
        {debugResults && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Debug Results</CardTitle>
              <CardDescription>
                Comprehensive test results from {debugResults.timestamp}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {debugResults.error ? (
                <div className="text-red-600 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <strong>Error:</strong> {debugResults.error}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Environment Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Environment
                      </div>
                      <div className="font-mono text-sm">
                        {debugResults.environment}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Vercel Region
                      </div>
                      <div className="font-mono text-sm">
                        {debugResults.vercelRegion}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        API Base
                      </div>
                      <div className="font-mono text-xs">
                        {debugResults.apiBase}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Timestamp
                      </div>
                      <div className="font-mono text-xs">
                        {new Date(debugResults.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>

                  {/* Test Results */}
                  <div className="space-y-4">
                    {debugResults.checks?.map((check, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium flex items-center gap-2">
                            <span>{getStatusIcon(check.status)}</span>
                            {check.test}
                          </h4>
                          <span
                            className={`text-sm font-medium ${getStatusColor(check.status)}`}
                          >
                            {check.status}
                          </span>
                        </div>

                        {check.statusCode && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Status: {check.statusCode} {check.statusText}
                          </div>
                        )}

                        {check.availableDomains && (
                          <div className="text-sm">
                            <strong>
                              Available Domains ({check.domainsCount}):
                            </strong>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {check.availableDomains.map((domain, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-xs rounded"
                                >
                                  {domain}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {check.errorBody && (
                          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm">
                            <strong>Error Details:</strong>
                            <pre className="mt-1 text-xs overflow-x-auto">
                              {check.errorBody}
                            </pre>
                          </div>
                        )}

                        {check.testEmail && (
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Test Email: <code>{check.testEmail}</code>
                          </div>
                        )}

                        {check.ipInfo && (
                          <div className="mt-2">
                            <strong className="text-sm">IP Information:</strong>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-1 text-xs">
                              {Object.entries(check.ipInfo).map(
                                ([key, value]) => (
                                  <div key={key}>
                                    <span className="text-gray-600 dark:text-gray-400">
                                      {key}:
                                    </span>
                                    <span className="font-mono ml-1">
                                      {value || "N/A"}
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {check.MAILTM_API_BASE && (
                          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">
                                MAILTM_API_BASE:
                              </span>
                              <span className="font-mono ml-1">
                                {check.MAILTM_API_BASE}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">
                                NODE_ENV:
                              </span>
                              <span className="font-mono ml-1">
                                {check.NODE_ENV}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Specific Test Results */}
        {specificTestResult && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Specific Test Result</CardTitle>
              <CardDescription>
                {specificTestResult.testType} test from{" "}
                {specificTestResult.timestamp}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span>{specificTestResult.success ? "✅" : "❌"}</span>
                  <span className="font-medium">
                    {specificTestResult.success ? "Success" : "Failed"}
                  </span>
                  {specificTestResult.status && (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      (Status: {specificTestResult.status})
                    </span>
                  )}
                </div>

                {specificTestResult.testEmail && (
                  <div className="text-sm">
                    <strong>Test Email:</strong>{" "}
                    <code>{specificTestResult.testEmail}</code>
                  </div>
                )}

                {specificTestResult.data && (
                  <div>
                    <strong className="text-sm">Response Data:</strong>
                    <pre className="mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs overflow-x-auto">
                      {JSON.stringify(specificTestResult.data, null, 2)}
                    </pre>
                  </div>
                )}

                {specificTestResult.error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <strong className="text-red-600">Error:</strong>
                    <pre className="mt-2 text-sm text-red-600">
                      {specificTestResult.error}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Debugging Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                {" "}
                <h4 className="font-semibold mb-2">
                  📝 How to Use This Debug Tool:
                </h4>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>
                    Run &quot;All Debug Tests&quot; to get a comprehensive
                    overview
                  </li>
                  <li>Check the status of each test (✅ success, ❌ failed)</li>
                  <li>Look for specific error messages in the error details</li>
                  <li>
                    Compare results between local development and Vercel
                    deployment
                  </li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold mb-2">🔍 What to Look For:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    <strong>Network Issues:</strong> Timeout errors, connection
                    refused
                  </li>
                  <li>
                    <strong>Rate Limiting:</strong> 429 status codes
                  </li>
                  <li>
                    <strong>Access Issues:</strong> 403 forbidden errors
                  </li>
                  <li>
                    <strong>IP Blocking:</strong> Different behavior between
                    environments
                  </li>
                  <li>
                    <strong>Environment Variables:</strong> Check if
                    MAILTM_API_BASE is set correctly
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">
                  🛠️ Next Steps if Issues Found:
                </h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    Check Vercel function logs for detailed error messages
                  </li>
                  <li>Verify environment variables in Vercel dashboard</li>
                  <li>
                    Test with a different temp email service if mail.tm is
                    blocked
                  </li>
                  <li>Implement retry logic and fallback mechanisms</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
