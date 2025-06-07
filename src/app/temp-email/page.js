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
import {
  EnvelopeIcon,
  PlusIcon,
  TrashIcon,
  ClockIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  InboxIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { formatDate } from "@/lib/utils";
import { API_BASE } from "@/config/api";

export default function TempEmailPage() {
  const [emails, setEmails] = useState([]);
  const [activeEmail, setActiveEmail] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(null);
  const [customAddress, setCustomAddress] = useState("");
  const [serviceStatus, setServiceStatus] = useState("unknown");
  useEffect(() => {
    // Load saved emails from localStorage
    const savedEmails = localStorage.getItem("tempEmails");
    if (savedEmails) {
      try {
        const parsedEmails = JSON.parse(savedEmails);
        // Filter out emails that might be older than 24 hours
        const validEmails = parsedEmails.filter((email) => {
          const emailAge = Date.now() - new Date(email.createdAt).getTime();
          return emailAge < 24 * 60 * 60 * 1000; // 24 hours
        });
        setEmails(validEmails);

        // Update localStorage if we removed any emails
        if (validEmails.length !== parsedEmails.length) {
          localStorage.setItem("tempEmails", JSON.stringify(validEmails));
        }
      } catch (error) {
        console.error("Error parsing saved emails:", error);
        localStorage.removeItem("tempEmails");
      }
    }

    // Check MailService health
    checkServiceHealth();

    // Set up periodic health checks every 30 seconds
    const healthCheckInterval = setInterval(checkServiceHealth, 30000);

    return () => clearInterval(healthCheckInterval);
  }, []);

  useEffect(() => {
    // Save emails to localStorage whenever emails change
    localStorage.setItem("tempEmails", JSON.stringify(emails));
  }, [emails]);
  const checkServiceHealth = async () => {
    try {
      console.log('API_BASE:', API_BASE);
      console.log('NODE_ENV:', process.env.NODE_ENV);
      const response = await fetch(`${API_BASE}/health`);
      const health = await response.json();
      setServiceStatus(health.status === "healthy" ? "healthy" : "unhealthy");
    } catch (error) {
      console.error("MailService health check failed:", error);
      setServiceStatus("offline");
    }
  };
  const createTempEmail = async (customName = "") => {
    if (serviceStatus === "offline") {
      alert("MailService is currently offline. Please try again later.");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch(`${API_BASE}/api/temp-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customName: customName.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 429) {
          throw new Error(
            "Rate limit exceeded. Please wait before creating another email."
          );
        } else if (response.status >= 500) {
          throw new Error(
            "Service temporarily unavailable. Please try again later."
          );
        }
        throw new Error(
          error.details || error.error || "Failed to create email"
        );
      }

      const newEmail = await response.json();

      // Update local state
      const updatedEmails = [newEmail, ...emails];
      setEmails(updatedEmails);

      setCustomAddress("");

      // Auto-select the new email
      setActiveEmail(newEmail);
      await fetchMessages(newEmail);
    } catch (error) {
      console.error("Error creating temporary email:", error);
      alert(`Failed to create temporary email: ${error.message}`);

      // Check service health after error
      checkServiceHealth();
    } finally {
      setIsCreating(false);
    }
  };
  const deleteEmail = (emailId) => {
    setEmails((prev) => prev.filter((email) => email.id !== emailId));
    if (activeEmail && activeEmail.id === emailId) {
      setActiveEmail(null);
      setMessages([]);
    }
  };
  const fetchMessages = async (email) => {
    if (!email?.id) return;

    setIsLoadingMessages(true);
    setActiveEmail(email);

    try {
      const response = await fetch(`${API_BASE}/api/messages/${email.id}`);

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 404) {
          // Email expired or not found
          setMessages([]);
          setEmails((prev) => prev.filter((e) => e.id !== email.id));
          setActiveEmail(null);
          alert("This email has expired and has been removed.");
          return;
        } else if (response.status === 429) {
          throw new Error(
            "Rate limit exceeded. Please wait before refreshing messages."
          );
        } else if (response.status >= 500) {
          throw new Error(
            "Service temporarily unavailable. Please try again later."
          );
        }
        throw new Error(
          error.details || error.error || "Failed to fetch messages"
        );
      }

      const data = await response.json();
      setMessages(data.messages || []);

      // Update message count and last updated time
      setEmails((prev) =>
        prev.map((e) =>
          e.id === email.id
            ? {
                ...e,
                messagesCount: data.messages?.length || 0,
                lastChecked: new Date().toISOString(),
              }
            : e
        )
      );
    } catch (error) {
      console.error("Error fetching messages:", error);
      alert(`Failed to fetch messages: ${error.message}`);
      setMessages([]);

      // Check service health after error
      checkServiceHealth();
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const copyToClipboard = async (text, emailId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedEmail(emailId);
      setTimeout(() => setCopiedEmail(null), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  const refreshMessages = () => {
    if (activeEmail) {
      console.log("Fetched messages:", messages);
      fetchMessages(activeEmail);
    }
  };
  return (
    <>
      <Header />
      <div className="min-h-screen bg-theme-background py-8 mt-20 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-theme-text">
              Temporary Email
            </h1>
            <p className="mt-2 text-theme-textSecondary">
              Create disposable email addresses to protect your privacy and
              avoid spam.
            </p>
          </div>{" "}
          {/* Service Status Indicator */}
          {serviceStatus !== "healthy" && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
                serviceStatus === "offline"
                  ? "bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"
                  : "bg-yellow-50 border border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400"
              }`}
            >
              <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-medium">
                  MailService is{" "}
                  {serviceStatus === "offline"
                    ? "offline"
                    : "experiencing issues"}
                </p>
                <p className="text-sm">
                  {serviceStatus === "offline"
                    ? "Please wait for the service to come back online."
                    : "Some features may be temporarily unavailable."}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={checkServiceHealth}
                className="ml-auto"
              >
                Retry
              </Button>
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Email Management */}
            <div className="lg:col-span-1">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Create New Email</CardTitle>
                  <CardDescription>
                    Generate a temporary email address
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Input
                      placeholder="Custom name (optional)"
                      value={customAddress}
                      onChange={(e) => setCustomAddress(e.target.value)}
                    />
                    <Button
                      onClick={() => createTempEmail(customAddress)}
                      disabled={isCreating}
                      className="w-full"
                    >
                      {isCreating ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Create Email
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>{" "}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Active Emails ({emails.length})</CardTitle>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          serviceStatus === "healthy"
                            ? "bg-green-500"
                            : serviceStatus === "offline"
                              ? "bg-red-500"
                              : "bg-yellow-500"
                        }`}
                      />
                      <span className="text-xs text-theme-textSecondary">
                        {serviceStatus === "healthy"
                          ? "Online"
                          : serviceStatus === "offline"
                            ? "Offline"
                            : "Issues"}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {" "}
                  {emails.length === 0 ? (
                    <div className="text-center py-8">
                      <EnvelopeIcon className="h-12 w-12 text-theme-textSecondary mx-auto mb-4" />
                      <p className="text-theme-textSecondary">
                        No temporary emails created yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {emails.map((email) => (
                        <div
                          key={email.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            activeEmail && activeEmail.id === email.id
                              ? "border-theme-primary bg-theme-primary/10"
                              : "border-theme-border hover:border-theme-primary/50"
                          }`}
                          onClick={() => fetchMessages(email)}
                        >
                          <div className="flex items-start justify-between">
                            {" "}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-theme-text truncate">
                                {email.address}
                              </div>
                              <div className="text-xs text-theme-textSecondary mt-1">
                                Created {formatDate(email.createdAt)}
                              </div>
                              {email.lastChecked && (
                                <div className="text-xs text-theme-textSecondary">
                                  Last checked {formatDate(email.lastChecked)}
                                </div>
                              )}
                              {email.messagesCount > 0 && (
                                <div className="text-xs text-theme-primary mt-1">
                                  {email.messagesCount} message(s)
                                </div>
                              )}
                            </div>
                            <div className="flex space-x-1 ml-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(email.address, email.id);
                                }}
                              >
                                {copiedEmail === email.id ? (
                                  <CheckIcon className="h-3 w-3" />
                                ) : (
                                  <DocumentDuplicateIcon className="h-3 w-3" />
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteEmail(email.id);
                                }}
                                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                              >
                                <TrashIcon className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Messages Display */}
            <div className="lg:col-span-2">
              {activeEmail ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Inbox: {activeEmail.address}</CardTitle>
                        <CardDescription>
                          {messages.length} message(s)
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        onClick={refreshMessages}
                        disabled={isLoadingMessages}
                      >
                        <ArrowPathIcon
                          className={`h-4 w-4 ${isLoadingMessages ? "animate-spin" : ""}`}
                        />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {" "}
                    {isLoadingMessages ? (
                      <div className="text-center py-8">
                        <div className="animate-spin h-8 w-8 border-2 border-theme-primary border-t-transparent rounded-full mx-auto mb-4" />
                        <p className="text-theme-textSecondary">
                          Loading messages...
                        </p>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-8">
                        <InboxIcon className="h-12 w-12 text-theme-textSecondary mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-theme-text mb-2">
                          No Messages
                        </h3>
                        <p className="text-theme-textSecondary">
                          This inbox is empty. Messages will appear here when
                          received.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {" "}
                        {messages.map((message, index) => (
                          <div
                            key={message.id || index}
                            className={`border rounded-lg p-4 ${
                              message.seen
                                ? "border-theme-border"
                                : "border-theme-primary bg-theme-primary/5"
                            }`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h4
                                    className={`font-medium text-theme-text ${!message.seen ? "font-semibold" : ""}`}
                                  >
                                    {message.subject && message.subject.trim()
                                      ? message.subject
                                      : "(No Subject)"}
                                  </h4>
                                  {!message.seen && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-theme-primary text-white">
                                      New
                                    </span>
                                  )}
                                  {message.hasAttachments && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                                      📎 Attachment
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-theme-textSecondary">
                                  From:{" "}
                                  {typeof message.from === "object"
                                    ? message.from.name
                                      ? `${message.from.name} <${message.from.address}>`
                                      : message.from.address
                                    : message.from}
                                </p>
                                {message.intro && (
                                  <p className="text-sm text-theme-textSecondary mt-1 italic">
                                    {message.intro}
                                  </p>
                                )}
                              </div>
                              <div className="text-xs text-theme-textSecondary">
                                {formatDate(message.createdAt || message.date)}
                              </div>
                            </div>
                            <div className="prose dark:prose-invert max-w-none">
                              {message.text ||
                                message.html ||
                                message.intro ||
                                "(No content)"}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  {" "}
                  <CardContent className="py-12">
                    <div className="text-center">
                      <EnvelopeIcon className="h-12 w-12 text-theme-textSecondary mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-theme-text mb-2">
                        Select an Email
                      </h3>
                      <p className="text-theme-textSecondary">
                        Choose a temporary email from the left to view its
                        messages.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          {/* Information */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>About Temporary Emails</CardTitle>
            </CardHeader>
            <CardContent>
              {" "}
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-theme-text mb-2">
                    <ClockIcon className="h-5 w-5 inline mr-2" />
                    Temporary
                  </h4>
                  <p className="text-sm text-theme-textSecondary">
                    These email addresses are temporary and will be deleted
                    after a certain period.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-theme-text mb-2">
                    <EnvelopeIcon className="h-5 w-5 inline mr-2" />
                    Receive Only
                  </h4>
                  <p className="text-sm text-theme-textSecondary">
                    You can only receive emails with these addresses, not send
                    them.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-theme-text mb-2">
                    <DocumentDuplicateIcon className="h-5 w-5 inline mr-2" />
                    Privacy Protection
                  </h4>
                  <p className="text-sm text-theme-textSecondary">
                    Perfect for sign-ups, downloads, and one-time verifications.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
