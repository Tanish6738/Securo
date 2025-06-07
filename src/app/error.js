'use client'

import { useEffect } from 'react'
import Button from '@/components/ui/Button'
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])
  return (
    <div className="min-h-screen bg-theme-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-theme-primary/10 border border-theme-primary/30 rounded-full mb-6">
          <ExclamationTriangleIcon className="h-10 w-10 text-theme-primary" />
        </div>
        
        <h1 className="text-3xl font-bold text-theme-text mb-4">
          Security Alert
        </h1>
          <p className="text-theme-text-secondary mb-8 leading-relaxed">
          We&apos;ve encountered a security anomaly. Don&apos;t worry - your data remains protected. 
          Our systems are automatically recovering.
        </p>
        
        <div className="space-y-4">
          <Button 
            onClick={reset}
            className="btn-primary w-full"
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Restore Security Dashboard
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'}
            className="btn-outline-primary w-full"
          >
            Return to Safety
          </Button>
        </div>
        
        <p className="text-xs text-theme-text-secondary mt-6">
          Error ID: {error?.digest || 'UNKNOWN'} • Time: {new Date().toISOString()}
        </p>
      </div>
    </div>
  )
}
