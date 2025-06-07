'use client'

import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export const predefinedThemes = {
  dark: {
    name: 'Dark',
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
    name: 'Light',
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
  },
  blue: {
    name: 'Blue',
    primary: '#2563EB',
    background: '#0F172A',
    secondary: '#1E293B',
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    border: '#334155',
    accent: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444'
  },
  green: {
    name: 'Green',
    primary: '#059669',
    background: '#064E3B',
    secondary: '#065F46',
    text: '#ECFDF5',
    textSecondary: '#A7F3D0',
    border: '#10B981',
    accent: '#059669',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444'
  },
  purple: {
    name: 'Purple',
    primary: '#7C3AED',
    background: '#581C87',
    secondary: '#6B21A8',
    text: '#F3E8FF',
    textSecondary: '#C4B5FD',
    border: '#8B5CF6',
    accent: '#7C3AED',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444'
  }
}

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState('dark')
  const [customThemes, setCustomThemes] = useState({})
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    highContrast: false,
    fontSize: 'medium',
    focusIndicators: false,
    reducedMotion: false,
    largerClickTargets: false,
    stickyFocus: false,
    voiceNavigation: false,
    soundEffects: false
  })

  // Load settings from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('privacyguard-theme')
      const savedCustomThemes = localStorage.getItem('privacyguard-custom-themes')
      const savedAccessibility = localStorage.getItem('privacyguard-accessibility')

      if (savedTheme) {
        setCurrentTheme(savedTheme)
      }
      if (savedCustomThemes) {
        try {
          setCustomThemes(JSON.parse(savedCustomThemes))
        } catch (e) {
          console.error('Failed to parse custom themes:', e)
        }
      }
      if (savedAccessibility) {
        try {
          setAccessibilitySettings(JSON.parse(savedAccessibility))
        } catch (e) {
          console.error('Failed to parse accessibility settings:', e)
        }
      }
    }
  }, [])
  // Apply theme and accessibility settings
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement
      const body = document.body
      const allThemes = { ...predefinedThemes, ...customThemes }
      const theme = allThemes[currentTheme]

      if (theme) {
        // Apply theme CSS variables
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
      }

      // Apply accessibility settings
      
      // High contrast
      if (accessibilitySettings.highContrast) {
        body.classList.add('high-contrast')
      } else {
        body.classList.remove('high-contrast')
      }

      // Font size
      body.classList.remove('font-small', 'font-medium', 'font-large', 'font-xl')
      body.classList.add(`font-${accessibilitySettings.fontSize}`)

      // Focus indicators
      if (accessibilitySettings.focusIndicators) {
        body.classList.add('focus-indicators')
      } else {
        body.classList.remove('focus-indicators')
      }

      // Larger click targets
      if (accessibilitySettings.largerClickTargets) {
        body.classList.add('larger-targets')
      } else {
        body.classList.remove('larger-targets')
      }

      // Sticky focus
      if (accessibilitySettings.stickyFocus) {
        body.classList.add('sticky-focus')
      } else {
        body.classList.remove('sticky-focus')
      }

      // Reduced motion
      if (accessibilitySettings.reducedMotion) {
        root.style.setProperty('--motion-duration', '0.01ms')
        body.classList.add('reduced-motion')
      } else {
        root.style.setProperty('--motion-duration', '0.3s')
        body.classList.remove('reduced-motion')
      }
    }
  }, [currentTheme, customThemes, accessibilitySettings])
  const saveTheme = (themeId) => {
    setCurrentTheme(themeId)
    localStorage.setItem('privacyguard-theme', themeId)
  }
  const updateAccessibilitySettings = (newSettings) => {
    setAccessibilitySettings(newSettings)
    localStorage.setItem('privacyguard-accessibility', JSON.stringify(newSettings))
  }

  const saveCustomTheme = (themeData) => {
    const themeId = themeData.id || `custom-${Date.now()}`
    const newCustomThemes = {
      ...customThemes,
      [themeId]: themeData
    }
    setCustomThemes(newCustomThemes)
    localStorage.setItem('privacyguard-custom-themes', JSON.stringify(newCustomThemes))
    return themeId
  }

  const deleteCustomTheme = (themeId) => {
    const newCustomThemes = { ...customThemes }
    delete newCustomThemes[themeId]
    setCustomThemes(newCustomThemes)
    localStorage.setItem('privacyguard-custom-themes', JSON.stringify(newCustomThemes))
    
    // If we're deleting the current theme, switch to default
    if (currentTheme === themeId) {
      saveTheme('dark')
    }
  }

  const updateTheme = (themeData) => {
    if (themeData.id) {
      // If it has an ID, save it as a custom theme and apply it
      const themeId = saveCustomTheme(themeData)
      saveTheme(themeId)
    } else {
      // Apply the theme temporarily (for preview)
      const root = document.documentElement
      if (typeof window !== 'undefined' && themeData) {
        root.style.setProperty('--color-primary', themeData.primary)
        root.style.setProperty('--color-background', themeData.background)
        root.style.setProperty('--color-secondary', themeData.secondary)
        root.style.setProperty('--color-text', themeData.text)
        root.style.setProperty('--color-textSecondary', themeData.textSecondary)
        root.style.setProperty('--color-border', themeData.border)
        root.style.setProperty('--color-accent', themeData.accent)
        root.style.setProperty('--color-success', themeData.success)
        root.style.setProperty('--color-warning', themeData.warning)
        root.style.setProperty('--color-error', themeData.error)
      }
    }
  }

  const exportTheme = (themeId) => {
    const allThemes = { ...predefinedThemes, ...customThemes }
    const theme = allThemes[themeId]
    if (theme) {
      const dataStr = JSON.stringify(theme, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
      
      const exportFileDefaultName = `${theme.name}-theme.json`
      
      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', exportFileDefaultName)
      linkElement.click()
    }
  }

  const importTheme = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const theme = JSON.parse(e.target.result)
          const themeId = `custom-${Date.now()}`
          saveCustomTheme(themeId, theme)
          resolve(themeId)
        } catch (error) {
          reject(error)
        }
      }
      reader.readAsText(file)
    })
  }
  const value = {
    currentTheme,
    predefinedThemes,
    customThemes,
    accessibilitySettings,
    saveTheme,
    updateTheme,
    saveCustomTheme,
    deleteCustomTheme,
    updateAccessibilitySettings,
    exportTheme,
    importTheme
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
