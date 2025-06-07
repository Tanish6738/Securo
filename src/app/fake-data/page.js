"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Card, {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
  UserIcon,
  BuildingOfficeIcon,
  CreditCardIcon,
  GlobeAltIcon,
  DocumentDuplicateIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

export default function FakeDataPage() {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [generatedData, setGeneratedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  const categories = [
    {
      id: "personal",
      name: "Personal Information",
      icon: UserIcon,
      description: "Names, addresses, phone numbers, emails",
    },
    {
      id: "company",
      name: "Company Information",
      icon: BuildingOfficeIcon,
      description: "Business names, departments, job titles",
    },
    {
      id: "financial",
      name: "Financial Data",
      icon: CreditCardIcon,
      description: "Credit card numbers, bank accounts, transactions",
    },
    {
      id: "internet",
      name: "Internet Data",
      icon: GlobeAltIcon,
      description: "URLs, domains, IP addresses, user agents",
    },
  ];

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const generateFakeData = async () => {
    if (selectedCategories.length === 0) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/fake-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ categories: selectedCategories }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate fake data");
      }

      const data = await response.json();
      setGeneratedData(data);
    } catch (error) {
      console.error("Error generating fake data:", error);
      alert("Failed to generate fake data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  const renderGeneratedData = () => {
    if (!generatedData) return null;

    return (
      <div className="space-y-6">
        {Object.entries(generatedData).map(([category, data]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="capitalize">
                {category.replace(/([A-Z])/g, " $1").trim()} Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              {" "}
              <div className="grid gap-4">
                {Object.entries(data).map(([field, value]) => (
                  <div
                    key={field}
                    className="flex items-center justify-between p-3 bg-theme-surface rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-theme-text-secondary capitalize">
                        {field.replace(/([A-Z])/g, " $1").trim()}
                      </div>
                      <div className="text-theme-text font-mono">
                        {typeof value === "object"
                          ? JSON.stringify(value, null, 2)
                          : value}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(
                          typeof value === "object"
                            ? JSON.stringify(value, null, 2)
                            : value,
                          `${category}-${field}`
                        )
                      }
                      className="ml-4"
                    >
                      {copiedField === `${category}-${field}` ? (
                        <CheckIcon className="h-4 w-4" />
                      ) : (
                        <DocumentDuplicateIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-theme py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            {" "}
            <h1 className="text-3xl font-bold text-theme-text">
              Fake Data Generator
            </h1>
            <p className="mt-2 text-theme-text-secondary">
              Generate realistic fake data for testing, privacy protection, and
              development purposes.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Category Selection */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Data Categories</CardTitle>
                  <CardDescription>
                    Select the types of data you want to generate
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categories.map((category) => {
                      const Icon = category.icon;
                      const isSelected = selectedCategories.includes(
                        category.id
                      );

                      return (
                        <div
                          key={category.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            isSelected
                              ? "border-theme-primary bg-theme-primary/10"
                              : "border-theme-border hover:border-theme-border-hover"
                          }`}
                          onClick={() => handleCategoryToggle(category.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <Icon
                              className={`h-6 w-6 mt-1 ${
                                isSelected
                                  ? "text-theme-primary"
                                  : "text-theme-text-secondary"
                              }`}
                            />
                            <div className="flex-1">
                              <h3
                                className={`font-medium ${
                                  isSelected
                                    ? "text-theme-primary"
                                    : "text-theme-text"
                                }`}
                              >
                                {category.name}
                              </h3>
                              <p className="text-sm text-theme-text-secondary mt-1">
                                {category.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6">
                    <Button
                      onClick={generateFakeData}
                      disabled={selectedCategories.length === 0 || isLoading}
                      className="w-full"
                    >
                      {" "}
                      {isLoading ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-theme-text border-t-transparent rounded-full mr-2" />
                          Generating...
                        </>
                      ) : (
                        "Generate Fake Data"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Generated Data Display */}
            <div className="lg:col-span-2">
              {generatedData ? (
                renderGeneratedData()
              ) : (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center">
                      <DocumentDuplicateIcon className="h-12 w-12 text-theme-text-secondary mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-theme-text mb-2">
                        No Data Generated Yet
                      </h3>
                      <p className="text-theme-text-secondary">
                        Select one or more categories and click &quot;Generate
                        Fake Data&quot; to get started.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Usage Guidelines */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Usage Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              {" "}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-theme-text mb-2">
                    Appropriate Uses
                  </h4>
                  <ul className="text-sm text-theme-text-secondary space-y-1">
                    <li>• Software testing and development</li>
                    <li>• Database population for demos</li>
                    <li>• Privacy protection when sharing examples</li>
                    <li>• Training datasets for non-production environments</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-theme-text mb-2">
                    Important Notes
                  </h4>
                  <ul className="text-sm text-theme-text-secondary space-y-1">
                    <li>• Data is randomly generated and not real</li>
                    <li>• Do not use for illegal or fraudulent purposes</li>
                    <li>
                      • Credit card numbers are not valid for transactions
                    </li>
                    <li>• Generated emails may belong to real people</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
