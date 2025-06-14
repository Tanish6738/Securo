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
  },
  sunset: {
    name: 'Sunset',
    primary: '#FF6B6B',
    background: '#2E1F27',
    secondary: '#3B2F3B',
    text: '#FFEFEF',
    textSecondary: '#FFB3B3',
    border: '#FF6B6B',
    accent: '#FFA07A',
    success: '#38B000',
    warning: '#FFD166',
    error: '#EF476F'
  },

  ocean: {
    name: 'Ocean',
    primary: '#00B4D8',
    background: '#03045E',
    secondary: '#023E8A',
    text: '#CAF0F8',
    textSecondary: '#90E0EF',
    border: '#00B4D8',
    accent: '#48CAE4',
    success: '#06D6A0',
    warning: '#FFD166',
    error: '#EF476F'
  },

  mocha: {
    name: 'Mocha',
    primary: '#D2691E',
    background: '#3E2723',
    secondary: '#5D4037',
    text: '#F5F5DC',
    textSecondary: '#D7CCC8',
    border: '#A1887F',
    accent: '#BF8556',
    success: '#81C784',
    warning: '#FFB74D',
    error: '#E57373'
  },

  rose: {
    name: 'Rose',
    primary: '#E11D48',
    background: '#3F0D1D',
    secondary: '#5B1D2E',
    text: '#FFE4E6',
    textSecondary: '#FBCFE8',
    border: '#BE123C',
    accent: '#F43F5E',
    success: '#22C55E',
    warning: '#FACC15',
    error: '#DC2626'
  },

  cyberpunk: {
    name: 'Cyberpunk',
    primary: '#FF00FF',
    background: '#0F0F0F',
    secondary: '#1A1A1A',
    text: '#F8F8F2',
    textSecondary: '#FF79C6',
    border: '#BD93F9',
    accent: '#50FA7B',
    success: '#50FA7B',
    warning: '#F1FA8C',
    error: '#FF5555'
  },
  midnight: {
    name: 'Midnight',
    primary: '#1E40AF',
    background: '#0B1120',
    secondary: '#1E293B',
    text: '#E2E8F0',
    textSecondary: '#94A3B8',
    border: '#334155',
    accent: '#3B82F6',
    success: '#16A34A',
    warning: '#FACC15',
    error: '#DC2626'
  },

  latte: {
    name: 'Latte',
    primary: '#C49E85',
    background: '#FFF8F0',
    secondary: '#F5E9DF',
    text: '#3E2C29',
    textSecondary: '#8B6D61',
    border: '#D3B8A3',
    accent: '#D4A373',
    success: '#81C784',
    warning: '#FFB74D',
    error: '#E57373'
  },

  forest: {
    name: 'Forest',
    primary: '#2F855A',
    background: '#1B4332',
    secondary: '#2D6A4F',
    text: '#D8F3DC',
    textSecondary: '#B7E4C7',
    border: '#95D5B2',
    accent: '#40916C',
    success: '#2F855A',
    warning: '#FFD166',
    error: '#E63946'
  },

  sky: {
    name: 'Sky',
    primary: '#0EA5E9',
    background: '#E0F7FA',
    secondary: '#B2EBF2',
    text: '#0F172A',
    textSecondary: '#0284C7',
    border: '#7DD3FC',
    accent: '#38BDF8',
    success: '#22C55E',
    warning: '#FBBF24',
    error: '#EF4444'
  },

  vintage: {
    name: 'Vintage',
    primary: '#8D6E63',
    background: '#FAF3E0',
    secondary: '#EEDFCC',
    text: '#3E2723',
    textSecondary: '#A1887F',
    border: '#D7CCC8',
    accent: '#D2B48C',
    success: '#81C784',
    warning: '#FFD54F',
    error: '#E57373'
  },

  ember: {
    name: 'Ember',
    primary: '#FF6F00',
    background: '#1A120B',
    secondary: '#261C15',
    text: '#FFE0B2',
    textSecondary: '#FFB74D',
    border: '#FF9800',
    accent: '#FB8C00',
    success: '#66BB6A',
    warning: '#FFA726',
    error: '#D32F2F'
  },

  grape: {
    name: 'Grape',
    primary: '#9D4EDD',
    background: '#240046',
    secondary: '#3C096C',
    text: '#E0AAFF',
    textSecondary: '#C77DFF',
    border: '#9D4EDD',
    accent: '#7B2CBF',
    success: '#00C896',
    warning: '#FFD60A',
    error: '#FF3E00'
  },

  silver: {
    name: 'Silver',
    primary: '#9CA3AF',
    background: '#F3F4F6',
    secondary: '#E5E7EB',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#D1D5DB',
    accent: '#A1A1AA',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171'
  },

  desert: {
    name: 'Desert',
    primary: '#D97706',
    background: '#FFF7ED',
    secondary: '#FFEBCB',
    text: '#78350F',
    textSecondary: '#B45309',
    border: '#FCD34D',
    accent: '#F59E0B',
    success: '#65A30D',
    warning: '#FACC15',
    error: '#B91C1C'
  },

  arctic: {
    name: 'Arctic',
    primary: '#60A5FA',
    background: '#E0F2FE',
    secondary: '#BFDBFE',
    text: '#0C4A6E',
    textSecondary: '#0284C7',
    border: '#93C5FD',
    accent: '#3B82F6',
    success: '#22C55E',
    warning: '#FCD34D',
    error: '#DC2626'
  },

  blush: {
    name: 'Blush',
    primary: '#EC4899',
    background: '#FFF0F6',
    secondary: '#FCE7F3',
    text: '#831843',
    textSecondary: '#DB2777',
    border: '#F9A8D4',
    accent: '#F472B6',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F43F5E'
  },

  charcoal: {
    name: 'Charcoal',
    primary: '#374151',
    background: '#111827',
    secondary: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    border: '#4B5563',
    accent: '#6B7280',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444'
  },

  neon: {
    name: 'Neon',
    primary: '#39FF14',
    background: '#0D0D0D',
    secondary: '#1A1A1A',
    text: '#CCFFCC',
    textSecondary: '#00FFEA',
    border: '#39FF14',
    accent: '#00FFFF',
    success: '#00FF7F',
    warning: '#FFFF33',
    error: '#FF073A'
  },

  storm: {
    name: 'Storm',
    primary: '#3B82F6',
    background: '#1E293B',
    secondary: '#334155',
    text: '#E2E8F0',
    textSecondary: '#94A3B8',
    border: '#475569',
    accent: '#60A5FA',
    success: '#10B981',
    warning: '#FBBF24',
    error: '#EF4444'
  },
crystal: {
    name: 'Crystal',
    primary: '#38BDF8',
    background: '#F0F9FF',
    secondary: '#E0F2FE',
    text: '#0C4A6E',
    textSecondary: '#0284C7',
    border: '#7DD3FC',
    accent: '#22D3EE',
    success: '#22C55E',
    warning: '#FACC15',
    error: '#EF4444'
  },

  flame: {
    name: 'Flame',
    primary: '#FF5722',
    background: '#2E0F0C',
    secondary: '#3B1E1E',
    text: '#FFE9E4',
    textSecondary: '#FFAB91',
    border: '#FF7043',
    accent: '#FF8A65',
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336'
  },

  clay: {
    name: 'Clay',
    primary: '#B08968',
    background: '#F5F1ED',
    secondary: '#E6D3C6',
    text: '#4E342E',
    textSecondary: '#A1887F',
    border: '#D7CCC8',
    accent: '#A67B5B',
    success: '#81C784',
    warning: '#FFD54F',
    error: '#E57373'
  },

  mint: {
    name: 'Mint',
    primary: '#10B981',
    background: '#F0FFF4',
    secondary: '#D1FAE5',
    text: '#065F46',
    textSecondary: '#6EE7B7',
    border: '#34D399',
    accent: '#2DD4BF',
    success: '#16A34A',
    warning: '#FBBF24',
    error: '#DC2626'
  },

  dusk: {
    name: 'Dusk',
    primary: '#7F1D1D',
    background: '#1C1C1C',
    secondary: '#2C2C2C',
    text: '#FDEDED',
    textSecondary: '#FCA5A5',
    border: '#991B1B',
    accent: '#E11D48',
    success: '#22C55E',
    warning: '#FACC15',
    error: '#DC2626'
  },

  cloud: {
    name: 'Cloud',
    primary: '#A5B4FC',
    background: '#F8FAFC',
    secondary: '#E5E7EB',
    text: '#1E293B',
    textSecondary: '#94A3B8',
    border: '#CBD5E1',
    accent: '#818CF8',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444'
  },

  firewatch: {
    name: 'Firewatch',
    primary: '#EF6C00',
    background: '#0B0C10',
    secondary: '#1F1F1F',
    text: '#FFEDD5',
    textSecondary: '#F59E0B',
    border: '#EF6C00',
    accent: '#FF8F00',
    success: '#43A047',
    warning: '#FB8C00',
    error: '#E53935'
  },

  ice: {
    name: 'Ice',
    primary: '#A0E9FD',
    background: '#E0F7FA',
    secondary: '#CCFBF1',
    text: '#0F172A',
    textSecondary: '#7DD3FC',
    border: '#67E8F9',
    accent: '#06B6D4',
    success: '#10B981',
    warning: '#FBBF24',
    error: '#F43F5E'
  },

  berry: {
    name: 'Berry',
    primary: '#BE185D',
    background: '#1E1B29',
    secondary: '#3F2C44',
    text: '#FCE7F3',
    textSecondary: '#F472B6',
    border: '#E11D48',
    accent: '#EC4899',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F43F5E'
  },

  brass: {
    name: 'Brass',
    primary: '#B8860B',
    background: '#1C1A14',
    secondary: '#292516',
    text: '#F5F5DC',
    textSecondary: '#E0C36F',
    border: '#DAA520',
    accent: '#FFD700',
    success: '#9ACD32',
    warning: '#FFD700',
    error: '#B22222'
  },

  softpink: {
    name: 'Soft Pink',
    primary: '#FFB6C1',
    background: '#FFF0F5',
    secondary: '#FFE4E1',
    text: '#6B0212',
    textSecondary: '#EC4899',
    border: '#F9A8D4',
    accent: '#F472B6',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F43F5E'
  },

  raven: {
    name: 'Raven',
    primary: '#6B7280',
    background: '#111827',
    secondary: '#1F2937',
    text: '#E5E7EB',
    textSecondary: '#9CA3AF',
    border: '#4B5563',
    accent: '#9CA3AF',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444'
  },

  lavender: {
    name: 'Lavender',
    primary: '#B4A0E5',
    background: '#F5F3FF',
    secondary: '#EDE9FE',
    text: '#4B0082',
    textSecondary: '#8B5CF6',
    border: '#C4B5FD',
    accent: '#A78BFA',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#DC2626'
  },

  steel: {
    name: 'Steel',
    primary: '#607D8B',
    background: '#ECEFF1',
    secondary: '#CFD8DC',
    text: '#263238',
    textSecondary: '#607D8B',
    border: '#B0BEC5',
    accent: '#90A4AE',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336'
  },

  lemon: {
    name: 'Lemon',
    primary: '#FCD34D',
    background: '#FFFBEB',
    secondary: '#FEF3C7',
    text: '#92400E',
    textSecondary: '#CA8A04',
    border: '#FBBF24',
    accent: '#FDE68A',
    success: '#65A30D',
    warning: '#FACC15',
    error: '#B91C1C'
  },

  noir: {
    name: 'Noir',
    primary: '#FFFFFF',
    background: '#000000',
    secondary: '#121212',
    text: '#E5E5E5',
    textSecondary: '#A1A1AA',
    border: '#27272A',
    accent: '#71717A',
    success: '#22C55E',
    warning: '#EAB308',
    error: '#EF4444'
  },

  turquoise: {
    name: 'Turquoise',
    primary: '#14B8A6',
    background: '#E0F2F1',
    secondary: '#B2DFDB',
    text: '#004D40',
    textSecondary: '#26A69A',
    border: '#80CBC4',
    accent: '#2DD4BF',
    success: '#10B981',
    warning: '#FBBF24',
    error: '#EF4444'
  },

  canyon: {
    name: 'Canyon',
    primary: '#D97706',
    background: '#FFF7ED',
    secondary: '#FFECD5',
    text: '#78350F',
    textSecondary: '#B45309',
    border: '#FDBA74',
    accent: '#F97316',
    success: '#84CC16',
    warning: '#FACC15',
    error: '#DC2626'
  },

  pearl: {
    name: 'Pearl',
    primary: '#F9FAFB',
    background: '#FFFFFF',
    secondary: '#F3F4F6',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    accent: '#E0E7FF',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444'
  },

  eclipse: {
    name: 'Eclipse',
    primary: '#4F46E5',
    background: '#0F172A',
    secondary: '#1E293B',
    text: '#E0E7FF',
    textSecondary: '#A5B4FC',
    border: '#3730A3',
    accent: '#6366F1',
    success: '#22C55E',
    warning: '#FACC15',
    error: '#EF4444'
  },sunset: {
    name: 'Sunset',
    primary: '#FB923C',
    background: '#FFF7ED',
    secondary: '#FFEDD5',
    text: '#7C2D12',
    textSecondary: '#FDBA74',
    border: '#FDBA74',
    accent: '#F97316',
    success: '#22C55E',
    warning: '#EAB308',
    error: '#DC2626'
  },

  ocean: {
    name: 'Ocean',
    primary: '#0EA5E9',
    background: '#E0F7FA',
    secondary: '#B2EBF2',
    text: '#0C4A6E',
    textSecondary: '#0284C7',
    border: '#7DD3FC',
    accent: '#22D3EE',
    success: '#10B981',
    warning: '#FBBF24',
    error: '#EF4444'
  },

  blush: {
    name: 'Blush',
    primary: '#F472B6',
    background: '#FFF1F2',
    secondary: '#FCE7F3',
    text: '#831843',
    textSecondary: '#E879F9',
    border: '#F9A8D4',
    accent: '#EC4899',
    success: '#10B981',
    warning: '#FBBF24',
    error: '#EF4444'
  },

  twilight: {
    name: 'Twilight',
    primary: '#6366F1',
    background: '#1E1B4B',
    secondary: '#312E81',
    text: '#E0E7FF',
    textSecondary: '#A5B4FC',
    border: '#4F46E5',
    accent: '#8B5CF6',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444'
  },

  carbon: {
    name: 'Carbon',
    primary: '#6B7280',
    background: '#111827',
    secondary: '#1F2937',
    text: '#E5E7EB',
    textSecondary: '#9CA3AF',
    border: '#374151',
    accent: '#9CA3AF',
    success: '#10B981',
    warning: '#EAB308',
    error: '#EF4444'
  },

  sand: {
    name: 'Sand',
    primary: '#F4A261',
    background: '#FFF5E1',
    secondary: '#FFE5B4',
    text: '#7C3A00',
    textSecondary: '#FDBA74',
    border: '#FFEDD5',
    accent: '#F97316',
    success: '#84CC16',
    warning: '#FBBF24',
    error: '#EF4444'
  },

  emerald: {
    name: 'Emerald',
    primary: '#34D399',
    background: '#D1FAE5',
    secondary: '#A7F3D0',
    text: '#064E3B',
    textSecondary: '#10B981',
    border: '#6EE7B7',
    accent: '#059669',
    success: '#16A34A',
    warning: '#FACC15',
    error: '#DC2626'
  },

  grayscale: {
    name: 'Grayscale',
    primary: '#9CA3AF',
    background: '#F9FAFB',
    secondary: '#E5E7EB',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#D1D5DB',
    accent: '#A1A1AA',
    success: '#22C55E',
    warning: '#FBBF24',
    error: '#EF4444'
  },

  gold: {
    name: 'Gold',
    primary: '#FFD700',
    background: '#FFF9DB',
    secondary: '#FAF089',
    text: '#92400E',
    textSecondary: '#D97706',
    border: '#FCD34D',
    accent: '#FBBF24',
    success: '#65A30D',
    warning: '#FACC15',
    error: '#DC2626'
  },

  iceberg: {
    name: 'Iceberg',
    primary: '#7DD3FC',
    background: '#F0F9FF',
    secondary: '#E0F2FE',
    text: '#0C4A6E',
    textSecondary: '#38BDF8',
    border: '#BAE6FD',
    accent: '#0EA5E9',
    success: '#10B981',
    warning: '#FBBF24',
    error: '#F43F5E'
  },

  rose: {
    name: 'Rose',
    primary: '#F43F5E',
    background: '#FFF1F2',
    secondary: '#FFE4E6',
    text: '#881337',
    textSecondary: '#F472B6',
    border: '#FBCFE8',
    accent: '#E11D48',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#EF4444'
  },

  cobalt: {
    name: 'Cobalt',
    primary: '#2563EB',
    background: '#EFF6FF',
    secondary: '#DBEAFE',
    text: '#1E3A8A',
    textSecondary: '#60A5FA',
    border: '#93C5FD',
    accent: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444'
  },

  pine: {
    name: 'Pine',
    primary: '#065F46',
    background: '#F0FDF4',
    secondary: '#D1FAE5',
    text: '#064E3B',
    textSecondary: '#34D399',
    border: '#A7F3D0',
    accent: '#059669',
    success: '#16A34A',
    warning: '#F59E0B',
    error: '#EF4444'
  },

  orchid: {
    name: 'Orchid',
    primary: '#C084FC',
    background: '#FAF5FF',
    secondary: '#E9D5FF',
    text: '#6B21A8',
    textSecondary: '#C4B5FD',
    border: '#D8B4FE',
    accent: '#A855F7',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444'
  },

  ink: {
    name: 'Ink',
    primary: '#1E40AF',
    background: '#0F172A',
    secondary: '#1E293B',
    text: '#CBD5E1',
    textSecondary: '#94A3B8',
    border: '#334155',
    accent: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444'
  },

  pearlGray: {
    name: 'Pearl Gray',
    primary: '#E5E7EB',
    background: '#F9FAFB',
    secondary: '#E5E7EB',
    text: '#1F2937',
    textSecondary: '#9CA3AF',
    border: '#D1D5DB',
    accent: '#D4D4D8',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444'
  },

  tangerine: {
    name: 'Tangerine',
    primary: '#FB923C',
    background: '#FFF7ED',
    secondary: '#FFE5B4',
    text: '#7C2D12',
    textSecondary: '#FDBA74',
    border: '#FDBA74',
    accent: '#F97316',
    success: '#22C55E',
    warning: '#EAB308',
    error: '#DC2626'
  },

  plum: {
    name: 'Plum',
    primary: '#9333EA',
    background: '#F3E8FF',
    secondary: '#E9D5FF',
    text: '#4C1D95',
    textSecondary: '#C084FC',
    border: '#C4B5FD',
    accent: '#A855F7',
    success: '#22C55E',
    warning: '#FACC15',
    error: '#EF4444'
  },

  navy: {
    name: 'Navy',
    primary: '#1D4ED8',
    background: '#E0E7FF',
    secondary: '#C7D2FE',
    text: '#1E3A8A',
    textSecondary: '#3B82F6',
    border: '#93C5FD',
    accent: '#2563EB',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444'
  },

  storm: {
    name: 'Storm',
    primary: '#64748B',
    background: '#F1F5F9',
    secondary: '#E2E8F0',
    text: '#0F172A',
    textSecondary: '#475569',
    border: '#CBD5E1',
    accent: '#94A3B8',
    success: '#22C55E',
    warning: '#FACC15',
    error: '#EF4444'
  },
  cocoa: {
    name: 'Cocoa',
    primary: '#6F4E37',
    background: '#3E2C29',
    secondary: '#4B3621',
    text: '#EFE2D0',
    textSecondary: '#D7CCC8',
    border: '#A1887F',
    accent: '#8B5E3C',
    success: '#81C784',
    warning: '#FFB74D',
    error: '#E57373'
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
