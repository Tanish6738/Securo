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
  KeyIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export default function PasswordCheckerPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [strength, setStrength] = useState({
    score: 0,
    feedback: [],
    suggestions: [],
  });

  // Simple password strength calculator
  const calculateStrength = (password) => {
    let score = 0;
    const feedback = [];
    const suggestions = [];

    if (password.length >= 8) {
      score += 1;
    } else {
      suggestions.push("Use at least 8 characters");
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      suggestions.push("Add lowercase letters");
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      suggestions.push("Add uppercase letters");
    }

    if (/[0-9]/.test(password)) {
      score += 1;
    } else {
      suggestions.push("Add numbers");
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
    } else {
      suggestions.push("Add special characters (!@#$%^&*)");
    }

    // Feedback based on score
    if (score <= 2) {
      feedback.push("Weak password");
    } else if (score <= 3) {
      feedback.push("Fair password");
    } else if (score <= 4) {
      feedback.push("Good password");
    } else {
      feedback.push("Strong password");
    }

    return { score, feedback, suggestions };
  };

  useEffect(() => {
    if (password) {
      const newStrength = calculateStrength(password);
      setStrength(newStrength);
    } else {
      setStrength({ score: 0, feedback: [], suggestions: [] });
    }
  }, [password]);

  const checkPasswordBreach = async (e) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    setError("");
    setResults(null);

    try {
      const response = await fetch("/api/password-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to check password");
      }

      setResults(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  const getStrengthColor = (score) => {
    if (score <= 2) return "bg-theme-error";
    if (score <= 3) return "bg-theme-warning";
    if (score <= 4) return "bg-theme-primary";
    return "bg-theme-success";
  };

  const getStrengthText = (score) => {
    if (score <= 2) return "Weak";
    if (score <= 3) return "Fair";
    if (score <= 4) return "Good";
    return "Strong";
  };
  return (
    <>
      <Header />
      <div className="min-h-screen bg-theme-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20 ">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-theme-text">
              Password Checker
            </h1>
            <p className="text-theme-text-secondary">
              Analyze your password strength and check if it has been
              compromised in data breaches.
            </p>
          </div>

          {/* Password Input */}
          <Card className="mb-8">
            {" "}
            <CardHeader>
              <CardTitle className="flex items-center">
                <KeyIcon className="h-6 w-6 mr-2 text-theme-primary" />
                Password Analysis
              </CardTitle>
              <CardDescription>
                Enter a password to check its strength and breach status. Your
                password is hashed before being checked against breach
                databases. We never store it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={checkPasswordBreach} className="space-y-6">
                <div className="relative">
                  {" "}
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password to analyze"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pr-10 input-theme"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-theme-text-secondary" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-theme-text-secondary" />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-theme-text">
                          Password Strength: {getStrengthText(strength.score)}
                        </span>
                        <span className="text-sm text-theme-text-secondary">
                          {strength.score}/5
                        </span>
                      </div>
                      <div className="w-full bg-theme-secondary rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(strength.score)}`}
                          style={{ width: `${(strength.score / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>{" "}
                    {strength.suggestions.length > 0 && (
                      <div className="bg-theme-warning/10 p-3 rounded-md">
                        <h4 className="text-sm font-medium text-theme-warning mb-2">
                          Suggestions to improve your password:
                        </h4>
                        <ul className="text-sm text-theme-warning space-y-1">
                          {strength.suggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-center">
                              <span className="w-1.5 h-1.5 bg-theme-warning rounded-full mr-2"></span>
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading || !password}
                  className="w-full sm:w-auto"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Checking...
                    </>
                  ) : (
                    <>
                      <ShieldCheckIcon className="h-4 w-4 mr-2" />
                      Check for Breaches
                    </>
                  )}
                </Button>
              </form>{" "}
              {error && (
                <div className="mt-4 p-4 bg-theme-error/10 rounded-md">
                  <div className="flex">
                    <ExclamationTriangleIcon className="h-5 w-5 text-theme-error" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-theme-error">
                        Error
                      </h3>
                      <p className="text-sm text-theme-error mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              {results && results.isCompromised !== undefined && (
                <div className="mt-6">
                  {" "}
                  <div
                    className={`p-4 rounded-md ${
                      results.isCompromised
                        ? "bg-theme-error/10"
                        : "bg-theme-success/10"
                    }`}
                  >
                    <div className="flex">
                      {results.isCompromised ? (
                        <ExclamationTriangleIcon className="h-5 w-5 text-theme-error" />
                      ) : (
                        <CheckCircleIcon className="h-5 w-5 text-theme-success" />
                      )}
                      <div className="ml-3">
                        <h3
                          className={`text-sm font-medium ${
                            results.isCompromised
                              ? "text-theme-error"
                              : "text-theme-success"
                          }`}
                        >
                          {results.isCompromised
                            ? "Password Compromised!"
                            : "Password Secure"}
                        </h3>
                        <p
                          className={`text-sm mt-1 ${
                            results.isCompromised
                              ? "text-theme-error"
                              : "text-theme-success"
                          }`}
                        >
                          {results.isCompromised
                            ? `This password has been found in ${results.occurrences} data breach(es). You should change it immediately.`
                            : "This password has not been found in any known data breaches."}
                        </p>{" "}
                        {results.note && (
                          <div className="mt-3 p-3 bg-theme-warning/10 rounded-md border border-theme-warning/20">
                            <p className="text-sm text-theme-warning">
                              <span className="font-medium">Note:</span>{" "}
                              {results.note}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>{" "}
                    {results.characteristics && (
                      <div className="mt-4 p-4 bg-theme-primary/10 rounded-md">
                        <h4 className="text-sm font-medium text-theme-primary mb-2">
                          Password Characteristics (from breach data):
                        </h4>
                        <ul className="text-sm text-theme-primary space-y-1">
                          {results.characteristics
                            .split(";")
                            .map((item, idx) => {
                              const [labelCode, value] = item.split(":");
                              const labelMap = {
                                D: "Digits",
                                A: "Alphabets",
                                S: "Special Characters",
                                L: "Length",
                              };
                              return (
                                <li key={idx} className="flex items-center">
                                  <span className="w-1.5 h-1.5 bg-theme-primary rounded-full mr-2"></span>
                                  {labelMap[labelCode] || labelCode}: {value}
                                </li>
                              );
                            })}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Password Security Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Password Security Best Practices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {" "}
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircleIcon className="h-5 w-5 text-theme-success mt-0.5" />
                    <div>
                      <h4 className="font-medium text-theme-text">
                        Use long passwords
                      </h4>
                      <p className="text-sm text-theme-text-secondary">
                        Aim for at least 12-15 characters for better security.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <CheckCircleIcon className="h-5 w-5 text-theme-success mt-0.5" />
                    <div>
                      <h4 className="font-medium text-theme-text">
                        Mix character types
                      </h4>
                      <p className="text-sm text-theme-text-secondary">
                        Combine uppercase, lowercase, numbers, and symbols.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <CheckCircleIcon className="h-5 w-5 text-theme-success mt-0.5" />
                    <div>
                      <h4 className="font-medium text-theme-text">
                        Avoid personal information
                      </h4>
                      <p className="text-sm text-theme-text-secondary">
                        Don&apos;t use names, birthdays, or other personal
                        details.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircleIcon className="h-5 w-5 text-theme-success mt-0.5" />
                    <div>
                      <h4 className="font-medium text-theme-text">
                        Use unique passwords
                      </h4>
                      <p className="text-sm text-theme-text-secondary">
                        Never reuse passwords across multiple accounts.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <CheckCircleIcon className="h-5 w-5 text-theme-success mt-0.5" />
                    <div>
                      <h4 className="font-medium text-theme-text">
                        Consider a password manager
                      </h4>
                      <p className="text-sm text-theme-text-secondary">
                        Use tools to generate and store strong, unique
                        passwords.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <CheckCircleIcon className="h-5 w-5 text-theme-success mt-0.5" />
                    <div>
                      <h4 className="font-medium text-theme-text">
                        Enable 2FA
                      </h4>
                      <p className="text-sm text-theme-text-secondary">
                        Add two-factor authentication for extra security.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
