'use client'

import { cn } from '@/lib/utils'

export default function Button({ 
  className, 
  variant = "default", 
  size = "default", 
  children, 
  disabled,
  ...props 
}) {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
  
  const variants = {
    default: "btn-primary",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    outline: "btn-outline-primary",
    secondary: "bg-theme-secondary text-theme-text hover:bg-theme-secondary/80",
    ghost: "text-theme-text hover:bg-theme-secondary",
    link: "underline-offset-4 hover:underline text-theme-primary"
  }

  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md",
    lg: "h-11 px-8 rounded-md",
    icon: "h-10 w-10"
  }

  return (
    <button
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
