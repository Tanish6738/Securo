'use client'

// PWA Detection and Management Utilities

export const isPWA = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
};

export const isInstallable = () => {
  if (typeof window === 'undefined') return false;
  return 'serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window;
};

export const getInstallPrompt = () => {
  return new Promise((resolve) => {
    const handler = (e) => {
      e.preventDefault();
      window.removeEventListener('beforeinstallprompt', handler);
      resolve(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
  });
};

export const registerSW = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered:', registration);
      return registration;
    } catch (error) {
      console.error('SW registration failed:', error);
      return null;
    }
  }
  return null;
};

export const unregisterSW = async () => {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
  }
};

export const updateSW = async () => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      registration.update();
    }
  }
};

export const skipWaiting = () => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
  }
};

// Notification utilities
export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

export const showNotification = (title, options = {}) => {
  if ('serviceWorker' in navigator && 'Notification' in window) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        ...options,
      });
    });
  }
};

// Background sync utilities
export const requestBackgroundSync = (tag) => {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.sync.register(tag);
    });
  }
};

// Cache management
export const clearCache = async () => {
  if ('caches' in window) {
    const names = await caches.keys();
    await Promise.all(names.map(name => caches.delete(name)));
  }
};

export const getCacheSize = async () => {
  if ('caches' in window && 'storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return estimate.usage || 0;
  }
  return 0;
};

// Connection utilities
export const getConnectionInfo = () => {
  if ('connection' in navigator) {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData,
    };
  }
  return null;
};

// Share API
export const canShare = () => {
  return 'share' in navigator;
};

export const shareContent = async (data) => {
  if (canShare()) {
    try {
      await navigator.share(data);
      return true;
    } catch (error) {
      console.error('Error sharing:', error);
      return false;
    }
  }
  return false;
};
