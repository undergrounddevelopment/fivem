"use client"

import { useEffect, useState } from "react"
import { getCurrentHoliday } from "@/lib/seasonal-theme"
import Link from "next/link"

export function SeasonalHero() {
  const [season, setSeason] = useState(getCurrentHoliday())

  useEffect(() => {
    setSeason(getCurrentHoliday())
  }, [])

  if (!season) return null

  const templates = {
    "New Year": (
      <div className="relative overflow-hidden rounded-3xl p-12 text-center" style={{ background: `linear-gradient(135deg, ${season.theme.primary}30, ${season.theme.secondary}30)` }}>
        <div className="text-6xl mb-4">🎉✨🎆</div>
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
          {season.theme.text}
        </h1>
        <p className="text-xl opacity-80 mb-6">Start the year with amazing FiveM resources!</p>
        <Link href="/assets" className="inline-block px-8 py-3 rounded-full font-bold" style={{ background: `linear-gradient(135deg, ${season.theme.primary}, ${season.theme.secondary})` }}>
          Explore Now
        </Link>
      </div>
    ),
    "Valentine": (
      <div className="relative overflow-hidden rounded-3xl p-12 text-center" style={{ background: `linear-gradient(135deg, ${season.theme.primary}20, ${season.theme.secondary}20)` }}>
        <div className="text-6xl mb-4">💝❤️💕</div>
        <h1 className="text-5xl font-bold mb-4 text-red-400">
          {season.theme.text}
        </h1>
        <p className="text-xl opacity-80 mb-6">Share the love with premium scripts!</p>
        <Link href="/assets" className="inline-block px-8 py-3 rounded-full font-bold bg-gradient-to-r from-red-500 to-pink-500">
          Browse Resources
        </Link>
      </div>
    ),
    "Halloween": (
      <div className="relative overflow-hidden rounded-3xl p-12 text-center bg-gradient-to-br from-orange-900/40 via-purple-900/40 to-black/40">
        <div className="text-6xl mb-4">🎃👻🦇</div>
        <h1 className="text-5xl font-bold mb-4 text-orange-400 drop-shadow-[0_0_20px_rgba(249,115,22,0.5)]">
          {season.theme.text}
        </h1>
        <p className="text-xl opacity-80 mb-6">Spooky scripts for your server!</p>
        <Link href="/assets" className="inline-block px-8 py-3 rounded-full font-bold bg-gradient-to-r from-orange-600 to-purple-600">
          Get Spooked
        </Link>
      </div>
    ),
    "Christmas": (
      <div className="relative overflow-hidden rounded-3xl p-12 text-center" style={{ background: `linear-gradient(135deg, ${season.theme.primary}30, ${season.theme.secondary}30)` }}>
        <div className="text-6xl mb-4">🎄❄️🎅</div>
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-red-400 via-green-400 to-red-400 bg-clip-text text-transparent">
          {season.theme.text}
        </h1>
        <p className="text-xl opacity-80 mb-6">Unwrap amazing FiveM gifts!</p>
        <Link href="/assets" className="inline-block px-8 py-3 rounded-full font-bold bg-gradient-to-r from-red-600 to-green-600">
          Open Gifts
        </Link>
      </div>
    ),
  }

  return templates[season.name as keyof typeof templates] || (
    <div className="relative overflow-hidden rounded-3xl p-12 text-center" style={{ background: `linear-gradient(135deg, ${season.theme.primary}30, ${season.theme.secondary}30)` }}>
      <div className="text-6xl mb-4">{season.effects.slice(0, 3).join("")}</div>
      <h1 className="text-5xl font-bold mb-4" style={{ color: season.theme.primary }}>
        {season.theme.text}
      </h1>
      <p className="text-xl opacity-80 mb-6">Discover premium FiveM resources!</p>
      <Link href="/assets" className="inline-block px-8 py-3 rounded-full font-bold" style={{ background: `linear-gradient(135deg, ${season.theme.primary}, ${season.theme.secondary})` }}>
        Explore
      </Link>
    </div>
  )
}
