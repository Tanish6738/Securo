import { ShieldCheckIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function NotFound() {  return (
    <div className="min-h-screen bg-theme-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-theme-primary/10 border border-theme-primary/30 rounded-full mb-6">
          <ShieldCheckIcon className="h-10 w-10 text-theme-primary" />
        </div>
        
        <h1 className="text-6xl font-bold text-theme-text mb-4">404</h1>
        
        <h2 className="text-2xl font-bold text-theme-text mb-4">
          Secure Zone Not Found
        </h2>
          <p className="text-theme-text-secondary mb-8 leading-relaxed">
          The digital pathway you&apos;re looking for has been secured or moved to a safer location. 
          Let&apos;s get you back to your protected dashboard.
        </p>
        
        <div className="space-y-4">
          <Link 
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 btn-primary rounded-md transition-all transform hover:scale-105"
          >
            Return to Security Dashboard
          </Link>
          
          <div className="text-sm text-theme-text-secondary">
            <p>If you believe this is a security issue, please contact our team.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
