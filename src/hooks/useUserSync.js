'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useEffect, useCallback } from 'react'

export function useUserSync() {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser()
  const [dbUser, setDbUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isUserSynced, setIsUserSynced] = useState(false)

  const fetchDbUser = useCallback(async () => {
    if (!isClerkLoaded || !clerkUser) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // First try to get existing user
      const getResponse = await fetch('/api/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (getResponse.ok) {
        const result = await getResponse.json()
        setDbUser(result.user)
        setIsUserSynced(true)
      } else {
        // If user doesn't exist, create them
        const createResponse = await fetch('/api/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clerkId: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress,
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
            imageUrl: clerkUser.imageUrl,
          })
        })

        if (createResponse.ok) {
          const result = await createResponse.json()
          setDbUser(result.user)
          setIsUserSynced(true)
        } else {
          throw new Error('Failed to create user in database')
        }
      }
    } catch (err) {
      console.error('❌ Error syncing user:', err)
      setError(err.message)
      setIsUserSynced(false)
    } finally {
      setIsLoading(false)
    }
  }, [clerkUser, isClerkLoaded])

  useEffect(() => {
    fetchDbUser()
  }, [fetchDbUser])

  const refreshUser = useCallback(() => {
    fetchDbUser()
  }, [fetchDbUser])

  const updateUserSettings = useCallback(async (settings) => {
    if (!clerkUser) return null

    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings })
      })

      if (response.ok) {
        const result = await response.json()
        setDbUser(result.user)
        return result.user
      } else {
        throw new Error('Failed to update user settings')
      }
    } catch (err) {
      console.error('❌ Error updating settings:', err)
      setError(err.message)
      return null
    }
  }, [clerkUser])

  return {
    clerkUser,
    dbUser,
    isLoading: isLoading || !isClerkLoaded,
    error,
    isUserSynced,
    refreshUser,
    updateUserSettings
  }
}
