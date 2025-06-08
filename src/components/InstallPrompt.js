'use client'

import { useState, useEffect } from 'react';
import { ArrowDownTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if it's iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    // Check if already dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) return;

    // Check if already installed
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // For iOS, show prompt after 30 seconds if not dismissed
    if (isIOSDevice) {
      const timer = setTimeout(() => {
        if (!dismissed) {
          setShowInstallPrompt(true);
        }
      }, 30000);
      return () => clearTimeout(timer);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
        localStorage.setItem('pwa-install-dismissed', 'true');
      }
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-theme-secondary border border-theme-border rounded-xl shadow-lg p-4 z-50 backdrop-blur-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <ArrowDownTrayIcon className="h-5 w-5 text-theme-primary mr-2" />
          <h3 className="font-medium text-theme-text">Install PrivacyGuard</h3>
        </div>
        <button 
          onClick={handleDismiss} 
          className="text-theme-text-secondary hover:text-theme-text transition-colors"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
      
      <p className="text-sm text-theme-text-secondary mb-4">
        {isIOS 
          ? "Tap the share button and select 'Add to Home Screen' to install."
          : "Install our app for faster access and offline features."
        }
      </p>
      
      <div className="flex space-x-2">
        {!isIOS && (
          <Button onClick={handleInstallClick} size="sm" className="flex-1">
            Install
          </Button>
        )}
        <Button variant="outline" onClick={handleDismiss} size="sm" className={isIOS ? "flex-1" : ""}>
          {isIOS ? "Got it" : "Later"}
        </Button>
      </div>
    </div>
  );
}
