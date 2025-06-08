'use client'

import { WifiIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function OfflinePage() {
  const handleRetry = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-theme-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-theme-primary/10 border border-theme-primary/30 rounded-full mb-6">
          <WifiIcon className="h-10 w-10 text-theme-primary" />
        </div>
          <h1 className="text-3xl font-bold text-theme-text mb-4">
          You&apos;re Offline
        </h1>
        
        <p className="text-theme-text-secondary mb-8 leading-relaxed">
          Some features may not be available while you&apos;re offline. Please check your internet connection and try again.
        </p>
        
        <div className="space-y-4">
          <Button 
            onClick={handleRetry}
            className="w-full"
          >
            Try Again
          </Button>
          
          <Link href="/" className="block text-theme-primary hover:underline transition-colors">
            Go to Homepage
          </Link>
        </div>
        
        <div className="mt-8 p-4 bg-theme-secondary/50 rounded-lg border border-theme-border/30">
          <h3 className="text-sm font-medium text-theme-text mb-2">Offline Features Available:</h3>
          <ul className="text-xs text-theme-text-secondary space-y-1">
            <li>• View cached security reports</li>
            <li>• Access saved vault items</li>
            <li>• Review privacy settings</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
