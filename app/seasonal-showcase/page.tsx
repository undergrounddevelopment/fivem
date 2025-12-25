"use client"

import { useState } from "react"
import { HOLIDAYS, type Holiday } from "@/lib/seasonal-theme"

export default function SeasonalShowcase() {
  const [selectedSeason, setSelectedSeason] = useState<Holiday | null>(null)

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">🎨 12 Seasonal Themes</h1>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {HOLIDAYS.map((holiday) => (
            <button
              key={holiday.name}
              onClick={() => setSelectedSeason(holiday)}
              className="p-6 rounded-xl border-2 transition-all hover:scale-105 hover:shadow-2xl"
              style={{
                borderColor: holiday.theme.primary,
                background: `linear-gradient(135deg, ${holiday.theme.primary}20, ${holiday.theme.secondary}20)`,
                boxShadow: `0 10px 40px ${holiday.theme.primary}30`
              }}
            >
              <div className="text-3xl mb-2">{holiday.effects[0]}</div>
              <div className="font-bold text-lg">{holiday.name}</div>
              <div className="text-xs opacity-60 mt-1">{holiday.start} - {holiday.end}</div>
              <div className="flex gap-1 mt-2 justify-center">
                {holiday.effects.slice(0, 4).map((e, i) => (
                  <span key={i} className="text-sm">{e}</span>
                ))}
              </div>
            </button>
          ))}
        </div>

        {selectedSeason && (
          <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
            <button
              onClick={() => setSelectedSeason(null)}
              className="absolute top-8 right-8 text-white text-5xl hover:scale-110 transition-transform z-10"
            >
              ×
            </button>
            <div className="text-center">
              <h2 className="text-6xl mb-4">{selectedSeason.theme.text}</h2>
              <div className="flex gap-4 text-6xl justify-center">
                {selectedSeason.effects.map((e, i) => (
                  <span key={i} className="animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>{e}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
