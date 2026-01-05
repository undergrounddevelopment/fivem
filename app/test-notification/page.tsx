"use client"

import { Toast } from "@/components/modern-toast"
import { useState } from "react"

export default function TestPage() {
  const [showDemo, setShowDemo] = useState(false)

  const triggerAll = () => {
    Toast.success("Saved", "Changes applied successfully")
    setTimeout(() => Toast.xp("+50 XP", "Level up bonus!"), 300)
    setTimeout(() => Toast.achievement("Unlocked", "First Download Badge"), 600)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">⚡ Lightning Notification Test</h1>
        <p className="text-white/60 mb-8">Click buttons to see the electric lightning border effect</p>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button onClick={() => Toast.success("Saved", "Changes applied")} className="px-5 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-medium transition-all shadow-lg shadow-emerald-500/25">
            ✓ Success
          </button>
          <button onClick={() => Toast.error("Failed", "Check your connection")} className="px-5 py-4 rounded-xl bg-gradient-to-r from-red-600 to-pink-500 hover:from-red-500 hover:to-pink-400 text-white font-medium transition-all shadow-lg shadow-red-500/25">
            ✕ Error
          </button>
          <button onClick={() => Toast.warning("Heads up", "Session expires soon")} className="px-5 py-4 rounded-xl bg-gradient-to-r from-yellow-600 to-orange-500 hover:from-yellow-500 hover:to-orange-400 text-white font-medium transition-all shadow-lg shadow-yellow-500/25">
            ⚠ Warning
          </button>
          <button onClick={() => Toast.info("Tip", "Press Ctrl+S to save")} className="px-5 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-medium transition-all shadow-lg shadow-blue-500/25">
            ℹ Info
          </button>
          <button onClick={() => Toast.xp("+25 XP", "Nice work!")} className="px-5 py-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-400 hover:from-green-500 hover:to-emerald-300 text-white font-medium transition-all shadow-lg shadow-green-500/25">
            ⚡ XP Gain
          </button>
          <button onClick={() => Toast.reward("Bonus!", "50 coins added")} className="px-5 py-4 rounded-xl bg-gradient-to-r from-pink-600 to-rose-400 hover:from-pink-500 hover:to-rose-300 text-white font-medium transition-all shadow-lg shadow-pink-500/25">
            🎁 Reward
          </button>
          <button onClick={() => Toast.achievement("Unlocked", "First Download")} className="px-5 py-4 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-400 hover:from-amber-500 hover:to-yellow-300 text-white font-medium transition-all shadow-lg shadow-amber-500/25">
            🏆 Achievement
          </button>
          <button onClick={() => {
            const id = Toast.loading("Uploading...")
            setTimeout(() => Toast.update(id, { type: "success", title: "Uploaded!" }), 2500)
          }} className="px-5 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-purple-400 hover:from-violet-500 hover:to-purple-300 text-white font-medium transition-all shadow-lg shadow-violet-500/25">
            ⏳ Loading
          </button>
        </div>

        <button 
          onClick={triggerAll}
          className="w-full px-6 py-5 rounded-xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-400 hover:via-purple-400 hover:to-pink-400 text-white font-bold text-lg transition-all shadow-xl shadow-purple-500/30"
        >
          ⚡ TRIGGER ALL NOTIFICATIONS ⚡
        </button>

        <div className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-3">Lightning Effect Features:</h2>
          <ul className="space-y-2 text-white/70 text-sm">
            <li>• Animated electric border with noise-based displacement</li>
            <li>• Multiple glow layers for depth effect</li>
            <li>• White hot core for realistic lightning look</li>
            <li>• Random spark flashes for extra energy</li>
            <li>• Colors match forum theme (neon green, cyan, pink, etc.)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
