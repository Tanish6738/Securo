'use client'

import { cn } from '@/lib/utils'

export default function Input({ 
  className, 
  type = "text", 
  ...props 
}) {
  return (
    <input
      type={type}      className={cn(
        "input-theme flex h-10 w-full disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}
