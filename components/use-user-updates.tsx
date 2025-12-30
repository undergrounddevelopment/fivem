"use client"

import { useEffect } from 'react'
import { useAuth } from './auth-provider'

export function useUserUpdates() {
  const { refreshUser } = useAuth()

  useEffect(() => {
    // Listen for custom events
    const handleCoinsUpdate = () => {
      refreshUser()
    }

    const handleUserUpdate = () => {
      refreshUser()
    }

    window.addEventListener('coins-updated', handleCoinsUpdate)
    window.addEventListener('user-updated', handleUserUpdate)

    return () => {
      window.removeEventListener('coins-updated', handleCoinsUpdate)
      window.removeEventListener('user-updated', handleUserUpdate)
    }
  }, [refreshUser])
}

// Helper to trigger updates
export function triggerCoinsUpdate() {
  window.dispatchEvent(new Event('coins-updated'))
}

export function triggerUserUpdate() {
  window.dispatchEvent(new Event('user-updated'))
}
