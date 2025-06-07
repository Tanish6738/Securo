'use client'

import { useEffect } from 'react'

export default function ThemeInitializer() {
  useEffect(() => {
    // Apply theme immediately before any rendering
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('privacyguard-theme') || 'dark'
      const savedAccessibility = localStorage.getItem('privacyguard-accessibility')
      
      // Default themes
      const themes = {
        dark: {
          primary: '#00A99D',
          background: '#1B212C',
          secondary: '#151B24',
          text: '#E1E6EB',
          textSecondary: '#A0AEC0',
          border: '#A0AEC0',
          accent: '#00A99D',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444'
        },
        light: {
          primary: '#3B82F6',
          background: '#FFFFFF',
          secondary: '#F8F9FA',
          text: '#1F2937',
          textSecondary: '#6B7280',
          border: '#E5E7EB',
          accent: '#3B82F6',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444'
        }
      }

      // Try to get custom themes
      try {
        const customThemes = localStorage.getItem('privacyguard-custom-themes')
        if (customThemes) {
          Object.assign(themes, JSON.parse(customThemes))
        }
      } catch (e) {
        console.error('Failed to load custom themes:', e)
      }

      const theme = themes[savedTheme] || themes.dark
      
      // Apply theme variables immediately
      const root = document.documentElement
      root.style.setProperty('--color-primary', theme.primary)
      root.style.setProperty('--color-background', theme.background)
      root.style.setProperty('--color-secondary', theme.secondary)
      root.style.setProperty('--color-text', theme.text)
      root.style.setProperty('--color-textSecondary', theme.textSecondary)
      root.style.setProperty('--color-border', theme.border)
      root.style.setProperty('--color-accent', theme.accent)
      root.style.setProperty('--color-success', theme.success)
      root.style.setProperty('--color-warning', theme.warning)
      root.style.setProperty('--color-error', theme.error)

      // Apply accessibility settings
      if (savedAccessibility) {
        try {
          const accessibility = JSON.parse(savedAccessibility)
          const body = document.body
          
          if (accessibility.highContrast) body.classList.add('high-contrast')
          if (accessibility.focusIndicators) body.classList.add('focus-indicators')
          if (accessibility.largerClickTargets) body.classList.add('larger-targets')
          if (accessibility.stickyFocus) body.classList.add('sticky-focus')
          if (accessibility.reducedMotion) {
            root.style.setProperty('--motion-duration', '0.01ms')
            body.classList.add('reduced-motion')
          }
          
          body.classList.add(`font-${accessibility.fontSize || 'medium'}`)
        } catch (e) {
          console.error('Failed to apply accessibility settings:', e)
        }
      }
    }
  }, [])

  return null
}
