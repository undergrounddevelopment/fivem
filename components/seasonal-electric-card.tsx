"use client"

import { useEffect, useRef, useState } from "react"
import { getCurrentHoliday } from "@/lib/seasonal-theme"

export function SeasonalElectricCard({ children }: { children: React.ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<HTMLDivElement>(null)
  const [season, setSeason] = useState(getCurrentHoliday())
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [particles, setParticles] = useState<Array<{x: number, y: number, speed: number, emoji: string}>>([])

  useEffect(() => {
    const currentSeason = getCurrentHoliday()
    setSeason(currentSeason)
    
    if (currentSeason) {
      const newParticles = Array.from({ length: currentSeason.particles.count }, (_, i) => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        speed: Math.random() * currentSeason.particles.speed + 0.5,
        emoji: currentSeason.effects[i % currentSeason.effects.length]
      }))
      setParticles(newParticles)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number
    let time = 0

    const config = {
      width: 475,
      height: 625,
      octaves: 10,
      lacunarity: 1.6,
      gain: 0.7,
      amplitude: 0.075,
      frequency: 10,
      baseFlatness: 0,
      displacement: season?.name === "Valentine" ? 40 : season?.name === "Halloween" ? 80 : 60,
      speed: season?.name === "Christmas" ? 0.8 : season?.name === "Halloween" ? 2 : season?.name === "New Year" ? 2.5 : 1.5,
      borderOffset: 60,
      borderRadius: 24,
      lineWidth: season?.name === "Christmas" ? 2 : season?.name === "New Year" ? 1.5 : 1,
      color: season?.theme.primary || "#00ff88"
    }

    canvas.width = config.width
    canvas.height = config.height

    const random = (x: number) => (Math.sin(x * 12.9898) * 43758.5453) % 1

    const noise2D = (x: number, y: number) => {
      const i = Math.floor(x)
      const j = Math.floor(y)
      const fx = x - i
      const fy = y - j

      const a = random(i + j * 57)
      const b = random(i + 1 + j * 57)
      const c = random(i + (j + 1) * 57)
      const d = random(i + 1 + (j + 1) * 57)

      const ux = fx * fx * (3.0 - 2.0 * fx)
      const uy = fy * fy * (3.0 - 2.0 * fy)

      return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + d * ux * uy
    }

    const octavedNoise = (x: number, t: number) => {
      let y = 0
      let amplitude = config.amplitude
      let frequency = config.frequency

      for (let i = 0; i < config.octaves; i++) {
        let octaveAmplitude = amplitude
        if (i === 0) octaveAmplitude *= config.baseFlatness

        y += octaveAmplitude * noise2D(frequency * x, t * frequency * 0.3)
        frequency *= config.lacunarity
        amplitude *= config.gain
      }

      return y
    }

    const getRoundedRectPoint = (t: number) => {
      const left = config.borderOffset
      const top = config.borderOffset
      const width = config.width - 2 * config.borderOffset
      const height = config.height - 2 * config.borderOffset
      const radius = config.borderRadius

      const straightWidth = width - 2 * radius
      const straightHeight = height - 2 * radius
      const cornerArc = (Math.PI * radius) / 2
      const totalPerimeter = 2 * straightWidth + 2 * straightHeight + 4 * cornerArc

      const distance = t * totalPerimeter
      let accumulated = 0

      if (distance <= accumulated + straightWidth) {
        const progress = (distance - accumulated) / straightWidth
        return { x: left + radius + progress * straightWidth, y: top }
      }
      accumulated += straightWidth

      if (distance <= accumulated + cornerArc) {
        const progress = (distance - accumulated) / cornerArc
        const angle = -Math.PI / 2 + progress * (Math.PI / 2)
        return { x: left + width - radius + radius * Math.cos(angle), y: top + radius + radius * Math.sin(angle) }
      }
      accumulated += cornerArc

      if (distance <= accumulated + straightHeight) {
        const progress = (distance - accumulated) / straightHeight
        return { x: left + width, y: top + radius + progress * straightHeight }
      }
      accumulated += straightHeight

      if (distance <= accumulated + cornerArc) {
        const progress = (distance - accumulated) / cornerArc
        const angle = 0 + progress * (Math.PI / 2)
        return { x: left + width - radius + radius * Math.cos(angle), y: top + height - radius + radius * Math.sin(angle) }
      }
      accumulated += cornerArc

      if (distance <= accumulated + straightWidth) {
        const progress = (distance - accumulated) / straightWidth
        return { x: left + width - radius - progress * straightWidth, y: top + height }
      }
      accumulated += straightWidth

      if (distance <= accumulated + cornerArc) {
        const progress = (distance - accumulated) / cornerArc
        const angle = Math.PI / 2 + progress * (Math.PI / 2)
        return { x: left + radius + radius * Math.cos(angle), y: top + height - radius + radius * Math.sin(angle) }
      }
      accumulated += cornerArc

      if (distance <= accumulated + straightHeight) {
        const progress = (distance - accumulated) / straightHeight
        return { x: left, y: top + height - radius - progress * straightHeight }
      }
      accumulated += straightHeight

      const progress = (distance - accumulated) / cornerArc
      const angle = Math.PI + progress * (Math.PI / 2)
      return { x: left + radius + radius * Math.cos(angle), y: top + radius + radius * Math.sin(angle) }
    }

    const draw = () => {
      time += 0.016 * config.speed

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.strokeStyle = config.color
      ctx.lineWidth = config.lineWidth
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      const sampleCount = 300

      ctx.beginPath()
      for (let i = 0; i <= sampleCount; i++) {
        const progress = i / sampleCount
        const point = getRoundedRectPoint(progress)

        const xNoise = octavedNoise(progress * 8, time)
        const yNoise = octavedNoise(progress * 8 + 100, time)

        const displacedX = point.x + xNoise * config.displacement
        const displacedY = point.y + yNoise * config.displacement

        if (i === 0) ctx.moveTo(displacedX, displacedY)
        else ctx.lineTo(displacedX, displacedY)
      }

      ctx.closePath()
      ctx.stroke()

      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => cancelAnimationFrame(animationId)
  }, [season])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 30,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * -30
    })
  }

  const handleMouseLeave = () => setMousePos({ x: 0, y: 0 })

  return (
    <div 
      className="main-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: "1000px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: season?.theme.bg ? `linear-gradient(135deg, ${season.theme.bg})` : "oklch(0.145 0 0)"
      }}
    >
      <div ref={particlesRef} className="particles-container">
        {particles.map((p, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              animationDuration: `${10 / p.speed}s`,
              animationDelay: `${i * 0.2}s`,
              fontSize: season?.name === "Christmas" ? "24px" : "20px"
            }}
          >
            {p.emoji}
          </div>
        ))}
      </div>

      <div 
        className="card-container"
        style={{
          transform: `perspective(1000px) rotateX(${mousePos.y}deg) rotateY(${mousePos.x}deg) translateZ(50px)`,
          transition: "transform 0.15s cubic-bezier(0.23, 1, 0.32, 1)",
          transformStyle: "preserve-3d",
          willChange: "transform"
        }}
      >
        <div className="inner-container">
          <div className="canvas-container">
            <canvas ref={canvasRef} className="electric-border-canvas" />
            <div className="glow-layer-1" style={{ borderColor: season?.theme.primary || "#00ff88" }} />
            <div className="glow-layer-2" style={{ borderColor: season?.theme.secondary || "#00ff88" }} />
            <div className="overlay-1" />
            <div className="overlay-2" />
            <div 
              className="background-glow" 
              style={{ 
                background: `linear-gradient(-30deg, ${season?.theme.primary || "#00ff88"}, transparent, ${season?.theme.accent || "#00ff88"})` 
              }} 
            />
          </div>
          <div className="content-container">
            <div className="content-top">
              <button className="button-glass">
                {season?.name || "Default"}
              </button>
              <h1 className="title">{season?.theme.text || "Electric Card"}</h1>
              <p className="description">Auto-seasonal theme with 3D effects</p>
              <hr className="divider" />
            </div>
            <div className="content-bottom">
              {children}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .particles-container {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          overflow: hidden;
        }

        .particle {
          position: absolute;
          animation: fall linear infinite;
          opacity: 0.7;
          filter: drop-shadow(0 0 10px ${season?.theme.primary || "#00ff88"});
        }

        @keyframes fall {
          0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.7;
          }
          90% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        :global(:root) {
          --electric-border-color: ${season?.theme.primary || "#00ff88"};
          --electric-light-color: oklch(from var(--electric-border-color) l c h);
          --gradient-color: oklch(from var(--electric-border-color) 0.3 calc(c / 2) h / 0.4);
          --color-neutral-900: oklch(0.185 0 0);
        }

        .card-container {
          padding: 2px;
          border-radius: 24px;
          position: relative;
          background: linear-gradient(-30deg, var(--gradient-color), transparent, var(--gradient-color)),
                      linear-gradient(to bottom, var(--color-neutral-900), var(--color-neutral-900));
          box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.8),
                      0 30px 60px -30px ${season?.theme.primary || "#00ff88"}40,
                      inset 0 -2px 6px 0 rgba(255, 255, 255, 0.1);
        }

        .inner-container {
          position: relative;
          transform: translateZ(25px);
          transform-style: preserve-3d;
        }

        .canvas-container {
          position: relative;
          width: 354px;
          height: 504px;
        }

        .electric-border-canvas {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 475px;
          height: 625px;
        }

        .glow-layer-1 {
          border: 2px solid;
          border-radius: 24px;
          width: 100%;
          height: 100%;
          position: absolute;
          top: 0;
          left: 0;
          filter: blur(1px);
        }

        .glow-layer-2 {
          border: 2px solid;
          border-radius: 24px;
          width: 100%;
          height: 100%;
          position: absolute;
          top: 0;
          left: 0;
          filter: blur(4px);
        }

        .overlay-1 {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          border-radius: 24px;
          opacity: 1;
          mix-blend-mode: overlay;
          transform: scale(1.1);
          filter: blur(16px);
          background: linear-gradient(-30deg, white, transparent 30%, transparent 70%, white);
        }

        .overlay-2 {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          border-radius: 24px;
          opacity: 0.5;
          mix-blend-mode: overlay;
          transform: scale(1.1);
          filter: blur(16px);
          background: linear-gradient(-30deg, white, transparent 30%, transparent 70%, white);
        }

        .background-glow {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          border-radius: 24px;
          filter: blur(32px);
          transform: translateZ(-50px) scale(1.1);
          opacity: 0.3;
          z-index: -1;
        }

        .content-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          transform: translateZ(30px);
        }

        .content-top {
          display: flex;
          flex-direction: column;
          padding: 48px;
          padding-bottom: 16px;
          height: 100%;
        }

        .content-bottom {
          display: flex;
          flex-direction: column;
          padding: 48px;
          padding-top: 16px;
        }

        .button-glass {
          background: radial-gradient(47.2% 50% at 50.39% 88.37%, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 100%),
                      rgba(255, 255, 255, 0.04);
          position: relative;
          transition: all 0.3s ease;
          border-radius: 14px;
          width: fit-content;
          height: fit-content;
          padding: 8px 16px;
          text-transform: uppercase;
          font-weight: bold;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
          border: none;
          cursor: pointer;
          transform: translateZ(40px);
        }

        .button-glass:hover {
          background: radial-gradient(47.2% 50% at 50.39% 88.37%, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 100%),
                      rgba(255, 255, 255, 0.08);
        }

        .button-glass::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          padding: 1px;
          background: linear-gradient(150deg, rgba(255, 255, 255, 0.48) 16.73%, rgba(255, 255, 255, 0.08) 30.2%, 
                                      rgba(255, 255, 255, 0.08) 68.2%, rgba(255, 255, 255, 0.6) 81.89%);
          border-radius: inherit;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: xor;
          -webkit-mask-composite: xor;
          pointer-events: none;
        }

        .title {
          font-size: 36px;
          font-weight: 500;
          margin-top: auto;
          color: white;
          transform: translateZ(35px);
          text-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }

        .description {
          opacity: 0.5;
          color: white;
          transform: translateZ(30px);
        }

        .divider {
          margin-top: auto;
          border: none;
          height: 1px;
          background-color: currentColor;
          opacity: 0.1;
          mask-image: linear-gradient(to right, transparent, black, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black, transparent);
        }
      `}</style>
    </div>
  )
}
