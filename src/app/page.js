'use client'

import { SignedIn, SignedOut } from '@clerk/nextjs'
import Header from '@/components/Header'
import Button from '@/components/ui/Button'
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { 
  ShieldCheckIcon, 
  EyeIcon, 
  KeyIcon, 
  EnvelopeIcon,
  DocumentDuplicateIcon,
  NewspaperIcon
} from '@heroicons/react/24/outline'

export default function HomePage() {
  const features = [
    {
      icon: ShieldCheckIcon,
      title: "Breach Monitoring",
      description: "Monitor your email addresses against known data breaches in real-time."
    },
    {
      icon: KeyIcon,
      title: "Password Security",
      description: "Check if your passwords have been compromised in security breaches."
    },
    {
      icon: DocumentDuplicateIcon,
      title: "Fake Data Generator",
      description: "Generate realistic fake data for testing and privacy protection."
    },
    {
      icon: EnvelopeIcon,
      title: "Temporary Email",
      description: "Create disposable email addresses to protect your primary inbox."
    },
    {
      icon: NewspaperIcon,
      title: "Privacy News",
      description: "Stay updated with the latest cybersecurity and privacy news."
    },
    {
      icon: EyeIcon,
      title: "Digital Footprint",
      description: "Monitor and manage your online presence and data exposure."
    }
  ]

  return (
    <>
      <Header />
      
      <SignedOut>
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Protect Your 
                <span className="text-blue-600 dark:text-blue-400"> Digital Privacy</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
                PrivacyGuard provides comprehensive tools to monitor your digital footprint, 
                enhance online security, and protect your sensitive information.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8 py-3">
                  Get Started Free
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-24 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Comprehensive Privacy Protection
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Everything you need to secure your digital life in one powerful dashboard.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <feature.icon className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-600 dark:bg-blue-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Secure Your Privacy?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join thousands of users who trust PrivacyGuard to protect their digital identity.
              </p>
              <Button variant="outline" size="lg" className="bg-white text-blue-600 hover:bg-gray-50 border-white">
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back!</h1>
              <p className="text-gray-600 dark:text-gray-400">Access your privacy protection tools below.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <feature.icon className="h-10 w-10 text-blue-600 dark:text-blue-400 mb-3" />
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </SignedIn>
    </>
  )
}