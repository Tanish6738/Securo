'use client'

import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { WifiIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

export default function OfflineIndicator() {
  const isOnline = useNetworkStatus();
  const [showReconnected, setShowReconnected] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline && isOnline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (isOnline && !showReconnected) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 px-4 py-2 text-center text-sm z-50 transition-all duration-300 ${
      showReconnected 
        ? 'bg-green-600 text-white' 
        : 'bg-red-600 text-white'
    }`}>
      <div className="flex items-center justify-center max-w-4xl mx-auto">        {showReconnected ? (
          <>
            <WifiIcon className="h-4 w-4 mr-2" />
            You&apos;re back online! All features are now available.
          </>
        ) : (
          <>
            <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
            You&apos;re currently offline. Some features may not be available.
          </>
        )}
      </div>
    </div>
  );
}
