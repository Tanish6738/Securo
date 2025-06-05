import { ShieldCheckIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-900/50 border border-blue-500/30 rounded-full mb-6">
          <ShieldCheckIcon className="h-10 w-10 text-blue-400" />
        </div>
        
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        
        <h2 className="text-2xl font-bold text-white mb-4">
          Secure Zone Not Found
        </h2>
          <p className="text-gray-400 mb-8 leading-relaxed">
          The digital pathway you&apos;re looking for has been secured or moved to a safer location. 
          Let&apos;s get you back to your protected dashboard.
        </p>
        
        <div className="space-y-4">
          <Link 
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-md transition-all transform hover:scale-105"
          >
            Return to Security Dashboard
          </Link>
          
          <div className="text-sm text-gray-500">
            <p>If you believe this is a security issue, please contact our team.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
