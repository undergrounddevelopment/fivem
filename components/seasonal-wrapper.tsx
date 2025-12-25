"use client"

import { useEffect, useState } from "react"
import { getCurrentHoliday } from "@/lib/seasonal-theme"

export function SeasonalWrapper({ children }: { children: React.ReactNode }) {
  const [season, setSeason] = useState(getCurrentHoliday())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setSeason(getCurrentHoliday())
    setMounted(true)
  }, [])

  if (!season || !mounted) return <>{children}</>

  return (
    <>
      <div className="seasonal-particles">
        {Array.from({ length: Math.min(season.particles.count, 12) }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDuration: `${8 + Math.random() * 4}s`,
              animationDelay: `${i * 0.3}s`,
            }}
          >
            {season.effects[i % season.effects.length]}
          </div>
        ))}
      </div>

      <style jsx global>{`
        :root {
          --seasonal-primary: ${season.theme.primary};
          --seasonal-secondary: ${season.theme.secondary};
          --seasonal-accent: ${season.theme.accent};
        }

        .seasonal-particles {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 9999;
          overflow: hidden;
        }

        .particle {
          position: absolute;
          top: -50px;
          font-size: 18px;
          opacity: 0.7;
          animation: fall linear infinite;
          filter: drop-shadow(0 0 8px ${season.theme.primary});
          will-change: transform, opacity;
        }

        @keyframes fall {
          0% {
            transform: translateY(-50px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        .card, .modern-card, [class*="card"] {
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .card:hover, .modern-card:hover, [class*="card"]:hover {
          border-color: ${season.theme.primary}60 !important;
          box-shadow: 0 8px 30px ${season.theme.primary}30, 0 0 0 1px ${season.theme.primary}20 !important;
        }

        .button-primary, [class*="btn-primary"] {
          background: linear-gradient(135deg, ${season.theme.primary}, ${season.theme.secondary}) !important;
        }

        .accent-glow {
          box-shadow: 0 0 30px ${season.theme.accent}40 !important;
        }
      `}</style>

      {children}
    </>
  )
}
