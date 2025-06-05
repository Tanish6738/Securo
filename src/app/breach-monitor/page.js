'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  GlobeAltIcon,
  ChartBarIcon,
  ClockIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

export default function BreachMonitorPage() {
  const [email, setEmail] = useState('')
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [domainResults, setDomainResults] = useState(null)
  const [recentBreaches, setRecentBreaches] = useState([])
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('email') // 'email', 'domain', 'recent'
  const [checkType, setCheckType] = useState('basic') // 'basic', 'analytics'

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
        body: JSON.stringify({ email, type: checkType }),
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

  const checkDomainBreaches = async (e) => {
    e.preventDefault()
    if (!domain) return

    setLoading(true)
    setError('')
    setDomainResults(null)

    try {
      const response = await fetch(`/api/breaches?domain=${encodeURIComponent(domain)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check domain')
      }

      setDomainResults(data)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentBreaches = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/breaches')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch breaches')
      }

      setRecentBreaches(data.exposedBreaches || [])
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }  // Load recent breaches on component mount
  useEffect(() => {
    if (activeTab === 'recent') {
      fetchRecentBreaches()
    }
  }, [activeTab])
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Breach Monitor</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Check if your email addresses have been compromised in known data breaches.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8">
            <nav className="flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('email')}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'email'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <MagnifyingGlassIcon className="h-5 w-5 inline mr-2" />
                Email Check
              </button>
              <button
                onClick={() => setActiveTab('domain')}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'domain'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <GlobeAltIcon className="h-5 w-5 inline mr-2" />
                Domain Breaches
              </button>
              <button
                onClick={() => setActiveTab('recent')}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'recent'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <ClockIcon className="h-5 w-5 inline mr-2" />
                Recent Breaches
              </button>
            </nav>
          </div>

          {/* Email Tab */}
          {activeTab === 'email' && (
            <div className="space-y-8">
              {/* Check Type Selector */}
              <Card>
                <CardHeader>
                  <CardTitle>Check Type</CardTitle>
                  <CardDescription>
                    Choose between basic email check or detailed analytics.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="basic"
                        checked={checkType === 'basic'}
                        onChange={(e) => setCheckType(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm">Basic Check</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="analytics"
                        checked={checkType === 'analytics'}
                        onChange={(e) => setCheckType(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm">Detailed Analytics</span>
                    </label>
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

                  {/* Results Display */}
                  {results && (
                    <div className="mt-6">
                      {checkType === 'basic' ? (
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
                              </h3>
                              <p className={`text-sm mt-1 ${
                                results.isBreached 
                                  ? 'text-red-700 dark:text-red-300' 
                                  : 'text-green-700 dark:text-green-300'
                              }`}>
                                {results.isBreached 
                                  ? `This email appears in ${results.breachCount || results.breaches?.length || 0} known data breach(es).`
                                  : 'This email address has not been found in any known data breaches.'
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Analytics Results
                        <div className="space-y-6">
                          {/* Risk Score */}
                          {results.BreachMetrics?.risk && (
                            <Card className="border-l-4 border-blue-400">
                              <CardHeader>
                                <CardTitle className="flex items-center">
                                  <ChartBarIcon className="h-5 w-5 mr-2" />
                                  Risk Assessment
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                      {results.BreachMetrics.risk[0]?.risk_label || 'Unknown'}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      Risk Level
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                      {results.BreachMetrics.risk[0]?.risk_score || 0}/10
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      Risk Score
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Password Strength */}
                          {results.BreachMetrics?.passwords_strength && (
                            <Card>
                              <CardHeader>
                                <CardTitle>Password Security Analysis</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  {Object.entries(results.BreachMetrics.passwords_strength[0] || {}).map(([key, value]) => (
                                    <div key={key} className="text-center">
                                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Exposed Breaches Details */}
                          {results.ExposedBreaches?.breaches_details && (
                            <Card>
                              <CardHeader>
                                <CardTitle>Breach Details</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  {results.ExposedBreaches.breaches_details.map((breach, index) => (
                                    <div key={index} className="border-l-4 border-red-400 pl-4">
                                      <h4 className="font-medium text-gray-900 dark:text-white">
                                        {breach.breach}
                                      </h4>
                                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {breach.details}
                                      </p>
                                      <div className="mt-2 flex flex-wrap gap-2">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                          {breach.xposed_records?.toLocaleString()} records
                                        </span>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                          {breach.xposed_date}
                                        </span>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                          {breach.industry}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      )}

                      {/* Basic Results - Breach List */}
                      {results.isBreached && results.breaches && results.breaches.length > 0 && checkType === 'basic' && (
                        <div className="mt-6">
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                            Affected Breaches
                          </h4>
                          <div className="space-y-3">
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
            </div>
          )}

          {/* Domain Tab */}
          {activeTab === 'domain' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GlobeAltIcon className="h-6 w-6 mr-2 text-blue-600 dark:text-blue-400" />
                  Domain Breach Check
                </CardTitle>
                <CardDescription>
                  Check if a specific domain has been involved in any data breaches.
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
                )}

                {domainResults && (
                  <div className="mt-6">
                    {domainResults.exposedBreaches && domainResults.exposedBreaches.length > 0 ? (
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                          Domain Breaches Found ({domainResults.exposedBreaches.length})
                        </h4>
                        <div className="space-y-4">
                          {domainResults.exposedBreaches.map((breach, index) => (
                            <Card key={index} className="border-l-4 border-red-400">
                              <CardContent className="pt-6">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <h5 className="font-medium text-gray-900 dark:text-white">
                                      {breach.breachID}
                                    </h5>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                      {breach.exposureDescription}
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                        {breach.exposedRecords?.toLocaleString()} records
                                      </span>
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                        {new Date(breach.breachedDate).getFullYear()}
                                      </span>
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                        {breach.industry}
                                      </span>
                                      {breach.verified && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                          Verified
                                        </span>
                                      )}
                                    </div>
                                    {breach.exposedData && (
                                      <div className="mt-2">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                          Exposed data: {Array.isArray(breach.exposedData) ? breach.exposedData.join(', ') : breach.exposedData}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
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
                              This domain has not been found in any known data breaches.
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
          {activeTab === 'recent' && (
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
                    Stay informed about recent security incidents and data breaches.
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
                      'Refresh'
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
                )}

                {recentBreaches.length > 0 ? (
                  <div className="space-y-4">
                    {recentBreaches.map((breach, index) => (
                      <Card key={index} className="border-l-4 border-orange-400">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900 dark:text-white">
                                {breach.breachID}
                              </h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {breach.exposureDescription}
                              </p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                                  {breach.exposedRecords?.toLocaleString()} records
                                </span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                  {new Date(breach.breachedDate).toLocaleDateString()}
                                </span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                  {breach.industry}
                                </span>
                                {breach.verified && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                    Verified
                                  </span>
                                )}
                              </div>
                              {breach.exposedData && (
                                <div className="mt-2">
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Exposed data: {Array.isArray(breach.exposedData) ? breach.exposedData.join(', ') : breach.exposedData}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
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
          )}

          {/* Information Card - Only show on email tab */}
          {activeTab === 'email' && (
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
          )}
        </div>
      </div>
    </>
  )
}
