'use client'

import { useState, useEffect } from 'react';
import { isPWA, getCacheSize, getConnectionInfo } from '@/utils/pwa';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export default function PWAStatus() {
  const [isInstalledPWA, setIsInstalledPWA] = useState(false);
  const [cacheSize, setCacheSize] = useState(0);
  const [connectionInfo, setConnectionInfo] = useState(null);
  const isOnline = useNetworkStatus();

  useEffect(() => {
    setIsInstalledPWA(isPWA());
    
    getCacheSize().then(setCacheSize);
    setConnectionInfo(getConnectionInfo());
  }, []);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-theme-secondary rounded-lg p-4 border border-theme-border">
      <h3 className="text-lg font-semibold text-theme-text mb-3">PWA Status</h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-theme-text-secondary">Installation:</span>
          <span className={`font-medium ${isInstalledPWA ? 'text-green-400' : 'text-yellow-400'}`}>
            {isInstalledPWA ? 'Installed' : 'Browser'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-theme-text-secondary">Network:</span>
          <span className={`font-medium ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-theme-text-secondary">Cache Size:</span>
          <span className="text-theme-text font-medium">
            {formatBytes(cacheSize)}
          </span>
        </div>
        
        {connectionInfo && (
          <div className="flex justify-between">
            <span className="text-theme-text-secondary">Connection:</span>
            <span className="text-theme-text font-medium">
              {connectionInfo.effectiveType?.toUpperCase() || 'Unknown'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
