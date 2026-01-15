"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function CleanScriptPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin?callbackUrl=/clean-script")
    }
    if (status === "authenticated" && session?.user) {
      fetch('/api/clean-script/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'opened' })
      })
    }
  }, [status, router, session])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0f1a] to-[#1a1a2e]">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f1a] to-[#1a1a2e] p-4">
      <div className="max-w-[1800px] mx-auto">
        <div className="mb-4 flex items-center justify-between bg-gradient-to-r from-pink-500/10 to-purple-500/10 backdrop-blur-lg rounded-xl p-4 border border-pink-500/20">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              FiveM Tools V7.0 - Clean Script
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <img src={session.user?.image || ''} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-pink-500" />
            <div className="text-right">
              <p className="text-white font-medium text-sm">{session.user?.name}</p>
              <p className="text-gray-400 text-xs">Logged in</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-900/50 to-purple-900/20 backdrop-blur-lg rounded-xl border border-pink-500/20 overflow-hidden" style={{height: 'calc(100vh - 140px)'}}>
          <iframe
            src="/clean-script-tool.html"
            className="w-full h-full border-0"
            title="FiveM Tools V7 Clean Script"
            allow="clipboard-write"
          />
        </div>
      </div>
    </div>
  )
}
