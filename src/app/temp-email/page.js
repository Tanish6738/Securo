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
} from "@heroicons/react/24/outline";
import { formatDate, generateId } from "@/lib/utils";

export default function TempEmailPage() {
  const [emails, setEmails] = useState([]);
  const [activeEmail, setActiveEmail] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(null);
  const [customAddress, setCustomAddress] = useState("");

  useEffect(() => {
    // Load saved emails from localStorage
    const savedEmails = localStorage.getItem("tempEmails");
    if (savedEmails) {
      setEmails(JSON.parse(savedEmails));
    }
  }, []);

  useEffect(() => {
    // Save emails to localStorage whenever emails change
    localStorage.setItem("tempEmails", JSON.stringify(emails));
  }, [emails]);

  const createTempEmail = async (customName = "") => {
    setIsCreating(true);
    try {
      const response = await fetch("/api/temp-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customName: customName || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create temporary email");
      }

      const data = await response.json();
      const newEmail = {
        id: generateId(),
        address: data.address,
        token: data.token,
        createdAt: new Date().toISOString(),
        messagesCount: 0,
      };

      setEmails((prev) => [newEmail, ...prev]);
      setCustomAddress("");
    } catch (error) {
      console.error("Error creating temporary email:", error);
      alert("Failed to create temporary email. Please try again.");
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
    setIsLoadingMessages(true);
    setActiveEmail(email);

    try {
      const response = await fetch(
        `/api/temp-email/messages?token=${email.token}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await response.json();
      setMessages(data.messages || []);

      // Update message count
      setEmails((prev) =>
        prev.map((e) =>
          e.id === email.id
            ? { ...e, messagesCount: data.messages?.length || 0 }
            : e
        )
      );
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
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
      fetchMessages(activeEmail);
    }
  };
  return (
    <>
      <Header />
      <div className="min-h-screen bg-theme-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-theme-text">
              Temporary Email
            </h1>
            <p className="mt-2 text-theme-textSecondary">
              Create disposable email addresses to protect your privacy and
              avoid spam.
            </p>
          </div>

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
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Emails ({emails.length})</CardTitle>
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
                            key={index}
                            className="border border-theme-border rounded-lg p-4"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-medium text-theme-text">
                                  {message.subject || "(No Subject)"}
                                </h4>
                                <p className="text-sm text-theme-textSecondary">
                                  From: {message.from}
                                </p>
                              </div>
                              <div className="text-xs text-theme-textSecondary">
                                {formatDate(message.date)}
                              </div>
                            </div>
                            <div className="prose dark:prose-invert max-w-none">
                              {message.text || message.html || "(No content)"}
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
