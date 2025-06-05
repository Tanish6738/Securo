'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

export default function BreachMonitorPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')

  const checkEmailBreach = async (e) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    setError('')
    setResults(null)

    try {
      const response = await fetch('/api/breach-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check email')
      }

      console.log('Breach check results:', data);

      setResults(data)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Breach Monitor</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Check if your email addresses have been compromised in known data breaches.
            </p>
          </div>

          {/* Email Checker */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShieldCheckIcon className="h-6 w-6 mr-2 text-blue-600 dark:text-blue-400" />
                Email Breach Check
              </CardTitle>
              <CardDescription>
                Enter your email address to check against our database of known breaches.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={checkEmailBreach} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full"
                    required
                  />
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
              )}

              {results && (
                <div className="mt-6">
                  <div className={`p-4 rounded-md ${
                    results.isBreached 
                      ? 'bg-red-50 dark:bg-red-900/20' 
                      : 'bg-green-50 dark:bg-green-900/20'
                  }`}>
                    <div className="flex">
                      {results.isBreached ? (
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                      ) : (
                        <CheckCircleIcon className="h-5 w-5 text-green-400" />
                      )}
                      <div className="ml-3">
                        <h3 className={`text-sm font-medium ${
                          results.isBreached 
                            ? 'text-red-800 dark:text-red-200' 
                            : 'text-green-800 dark:text-green-200'
                        }`}>
                          {results.isBreached ? 'Breach Detected!' : 'No Breaches Found'}
                        </h3>                        <p className={`text-sm mt-1 ${
                          results.isBreached 
                            ? 'text-red-700 dark:text-red-300' 
                            : 'text-green-700 dark:text-green-300'
                        }`}>
                          {results.isBreached 
                            ? `This email appears in ${results.breachCount || results.breaches.length} known data breach(es).`
                            : 'This email address has not been found in any known data breaches.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {results.isBreached && results.breaches && results.breaches.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Affected Breaches
                      </h4>                      <div className="space-y-3">
                        {results.breaches.map((breachName, index) => (
                          <Card key={index} className="border-l-4 border-red-400">
                            <CardContent className="pt-6">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900 dark:text-white">
                                    {breachName}
                                  </h5>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Your email was found in this data breach. Consider changing passwords for any accounts associated with this service.
                                  </p>
                                </div>
                                <div className="ml-4 text-right flex-shrink-0">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                    Compromised
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>What should I do if my email is breached?</CardTitle>
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
                      Update passwords for all accounts associated with this email address.
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
                      Add an extra layer of security to your important accounts.
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
                      Keep an eye on your bank statements and credit reports for unusual activity.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
