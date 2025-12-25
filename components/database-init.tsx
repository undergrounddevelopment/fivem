"use client"

import { useEffect, useRef, useState } from "react"

export function DatabaseInit() {
  const initialized = useRef(false)
  const [status, setStatus] = useState<string>("")

  useEffect(() => {
    // Only run once
    if (initialized.current) return
    initialized.current = true

    const initDb = async () => {
      try {
        console.log("[v0] Starting database auto-initialization...")
        setStatus("Initializing database...")

        const response = await fetch("/api/auto-setup-db")
        const data = await response.json()

        if (data.success) {
          console.log("[v0] Database initialized successfully:", data.message)
          setStatus("")
        } else {
          console.log("[v0] Database initialization note:", data.message)
          if (data.instructions) {
            console.log("[v0] Instructions:", data.instructions)
          }
          setStatus("")
        }
      } catch (error) {
        console.error("[v0] Database init error:", error)
        setStatus("")
      }
    }

    // Run with small delay to ensure app is ready
    setTimeout(initDb, 1000)
  }, [])

  // Show loading indicator only briefly
  if (status) {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-background/80 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
        <div className="flex items-center gap-2 text-sm">
          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
          <span>{status}</span>
        </div>
      </div>
    )
  }

  return null
}
