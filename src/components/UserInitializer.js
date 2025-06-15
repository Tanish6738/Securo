'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'

export default function UserInitializer() {
  const { user, isLoaded } = useUser()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initializeUser = async () => {
      // Only proceed if Clerk is loaded and user exists
      if (!isLoaded || !user || isInitialized) return

      try {
        console.log('🔄 Initializing user in database...')
        
        const response = await fetch('/api/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clerkId: user.id,
            email: user.emailAddresses[0]?.emailAddress,
            firstName: user.firstName,
            lastName: user.lastName,
            imageUrl: user.imageUrl,
          })
        })

        if (response.ok) {
          const result = await response.json()
          console.log('✅ User initialized:', result.message)
          setIsInitialized(true)
        } else {
          console.error('❌ Failed to initialize user:', response.statusText)
        }
      } catch (error) {
        console.error('❌ Error initializing user:', error)
      }
    }

    initializeUser()
  }, [user, isLoaded, isInitialized])

  // This component doesn't render anything
  return null
}
