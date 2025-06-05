'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { 
  UserIcon, 
  CogIcon,
  ShieldCheckIcon,
  BellIcon,
  EyeIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckIcon
} from '@heroicons/react/24/outline'

export default function ProfilePage() {
  const { user, isLoaded } = useUser()
  const [settings, setSettings] = useState({
    notifications: {
      breachAlerts: true,
      weeklyReports: true,
      securityTips: false,
      productUpdates: false
    },
    privacy: {
      dataCollection: false,
      analytics: false,
      thirdPartySharing: false
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: 30,
      passwordChangeReminder: true
    }
  })
  const [monitoredEmails, setMonitoredEmails] = useState([])
  const [newEmail, setNewEmail] = useState('')
  const [isAddingEmail, setIsAddingEmail] = useState(false)
  const [savedChanges, setSavedChanges] = useState(false)

  useEffect(() => {
    if (isLoaded && user) {
      // Load user settings from localStorage or API
      const savedSettings = localStorage.getItem('userSettings')
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      }

      const savedEmails = localStorage.getItem('monitoredEmails')
      if (savedEmails) {
        setMonitoredEmails(JSON.parse(savedEmails))
      } else {
        // Add user's primary email by default
        setMonitoredEmails([{
          id: 'primary',
          email: user.primaryEmailAddress?.emailAddress || '',
          isPrimary: true,
          breachCount: 0,
          lastChecked: new Date().toISOString()
        }])
      }
    }
  }, [isLoaded, user])

  useEffect(() => {
    // Save settings to localStorage
    localStorage.setItem('userSettings', JSON.stringify(settings))
    localStorage.setItem('monitoredEmails', JSON.stringify(monitoredEmails))
  }, [settings, monitoredEmails])

  const updateSetting = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }))
  }

  const addEmailToMonitoring = async () => {
    if (!newEmail || !newEmail.includes('@')) return

    setIsAddingEmail(true)
    try {
      // Check if email already exists
      if (monitoredEmails.some(e => e.email.toLowerCase() === newEmail.toLowerCase())) {
        alert('This email is already being monitored.')
        return
      }

      // Check for breaches
      const response = await fetch('/api/breach-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: newEmail })
      })

      let breachCount = 0
      if (response.ok) {
        const data = await response.json()
        breachCount = data.breaches ? data.breaches.length : 0
      }

      const newMonitoredEmail = {
        id: Date.now().toString(),
        email: newEmail,
        isPrimary: false,
        breachCount,
        lastChecked: new Date().toISOString()
      }

      setMonitoredEmails(prev => [...prev, newMonitoredEmail])
      setNewEmail('')
    } catch (error) {
      console.error('Error adding email to monitoring:', error)
      alert('Failed to add email to monitoring. Please try again.')
    } finally {
      setIsAddingEmail(false)
    }
  }

  const removeEmailFromMonitoring = (emailId) => {
    if (monitoredEmails.find(e => e.id === emailId)?.isPrimary) {
      alert('Cannot remove primary email from monitoring.')
      return
    }
    setMonitoredEmails(prev => prev.filter(e => e.id !== emailId))
  }
  const saveSettings = () => {
    setSavedChanges(true)
    setTimeout(() => setSavedChanges(false), 2000)
  }

  const resetSettings = () => {
    // Reset to default settings
    setSettings({
      notifications: {
        breachAlerts: true,
        weeklyReports: true,
        securityTips: false,
        productUpdates: false
      },
      privacy: {
        dataCollection: false,
        analytics: false,
        thirdPartySharing: false
      },
      security: {
        twoFactorEnabled: false,
        sessionTimeout: 30,
        passwordChangeReminder: true
      }
    })
    // Reset monitored emails to just the primary email
    if (user?.primaryEmailAddress?.emailAddress) {
      setMonitoredEmails([{
        id: 'primary',
        email: user.primaryEmailAddress.emailAddress,
        isPrimary: true,
        breachCount: 0,
        lastChecked: new Date().toISOString()
      }])
    }
    setNewEmail('')
    setSavedChanges(false)
  }

  if (!isLoaded) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full" />
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Profile & Settings
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your account, privacy settings, and security preferences.
            </p>
          </div>

          {/* User Information */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <Input
                    value={user?.fullName || ''}
                    disabled
                    className="bg-gray-100 dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Primary Email
                  </label>
                  <Input
                    value={user?.primaryEmailAddress?.emailAddress || ''}
                    disabled
                    className="bg-gray-100 dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Member Since
                  </label>
                  <Input
                    value={new Date(user?.createdAt).toLocaleDateString() || ''}
                    disabled
                    className="bg-gray-100 dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account Status
                  </label>
                  <div className="flex items-center space-x-2">
                    <CheckIcon className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">Active</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Monitoring */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <EyeIcon className="h-5 w-5 mr-2" />
                Email Monitoring
              </CardTitle>
              <CardDescription>
                Emails being monitored for data breaches
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monitoredEmails.map((emailData) => (
                  <div key={emailData.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {emailData.email}
                        {emailData.isPrimary && (
                          <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                            Primary
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {emailData.breachCount > 0 ? (
                          <span className="text-red-600 dark:text-red-400">
                            Found in {emailData.breachCount} breach(es)
                          </span>
                        ) : (
                          <span className="text-green-600 dark:text-green-400">
                            No breaches found
                          </span>
                        )}
                        <span className="ml-2">
                          • Last checked: {new Date(emailData.lastChecked).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {!emailData.isPrimary && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeEmailFromMonitoring(emailData.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex space-x-4">
                <Input
                  placeholder="Enter email address to monitor"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={addEmailToMonitoring}
                  disabled={!newEmail || isAddingEmail}
                >
                  {isAddingEmail ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Adding...
                    </>
                  ) : (
                    'Add Email'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BellIcon className="h-5 w-5 mr-2" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(settings.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {key === 'breachAlerts' && 'Get notified when your emails are found in new breaches'}
                        {key === 'weeklyReports' && 'Receive weekly security reports and summaries'}
                        {key === 'securityTips' && 'Get tips and recommendations for better security'}
                        {key === 'productUpdates' && 'Stay informed about new features and updates'}
                      </p>
                    </div>
                    <button
                      onClick={() => updateSetting('notifications', key, !value)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        value ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShieldCheckIcon className="h-5 w-5 mr-2" />
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(settings.privacy).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {key === 'dataCollection' && 'Allow collection of usage data for service improvement'}
                        {key === 'analytics' && 'Enable analytics to help us understand user behavior'}
                        {key === 'thirdPartySharing' && 'Allow sharing anonymized data with security partners'}
                      </p>
                    </div>
                    <button
                      onClick={() => updateSetting('privacy', key, !value)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        value ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CogIcon className="h-5 w-5 mr-2" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      Two-Factor Authentication
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <button
                    onClick={() => updateSetting('security', 'twoFactorEnabled', !settings.security.twoFactorEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.security.twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.security.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Session Timeout (minutes)
                  </label>
                  <select
                    value={settings.security.sessionTimeout}
                    onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                    <option value={0}>Never</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      Password Change Reminders
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get reminded to change your password periodically
                    </p>
                  </div>
                  <button
                    onClick={() => updateSetting('security', 'passwordChangeReminder', !settings.security.passwordChangeReminder)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.security.passwordChangeReminder ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.security.passwordChangeReminder ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Settings */}
          <div className="flex justify-end space-x-4">            <Button
              variant="outline"
              onClick={resetSettings}
            >
              Reset Changes
            </Button>
            <Button onClick={saveSettings}>
              {savedChanges ? (
                <>
                  <CheckIcon className="h-4 w-4 mr-2" />
                  Saved!
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>

          {/* Danger Zone */}
          <Card className="mt-8 border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="flex items-center text-red-600 dark:text-red-400">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Delete Account
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
