"use client"

import { useEffect } from 'react'

export function LinkvertiseScript() {
  useEffect(() => {
    const loadLinkvertise = () => {
      if (window.linkvertise) return

      const script = document.createElement('script')
      script.src = 'https://publisher.linkvertise.com/cdn/linkvertise.js'
      script.async = true
      
      script.onload = () => {
        if (typeof window.linkvertise === 'function') {
          window.linkvertise(1461354, { whitelist: [], blacklist: [""] })
          console.log('✅ Linkvertise loaded')
        }
      }

      document.head.appendChild(script)
    }

    const timer = setTimeout(loadLinkvertise, 100)
    return () => clearTimeout(timer)
  }, [])

  return null
}

declare global {
  interface Window {
    linkvertise?: (userId: number, options: { whitelist: string[], blacklist: string[] }) => void
  }
}
