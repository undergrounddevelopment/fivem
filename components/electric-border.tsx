"use client"

import { useEffect, useRef, useCallback } from "react"

interface ElectricBorderProps {
  width?: number
  height?: number
  color?: string
  className?: string
  children?: React.ReactNode
}

export function ElectricBorder({
  width = 354,
  height = 120,
  color = "#00ff88",
  className = "",
  children
}: ElectricBorderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const timeRef = useRef(0)
  const lastFrameTimeRef = useRef(0)

  // Configuration
  const config = {
    octaves: 10,
    lacunarity: 1.6,
    gain: 0.7,
    amplitude: 0.075,
    frequency: 10,
    baseFlatness: 0,
    displacement: 40,
    speed: 1.5,
    borderOffset: 30,
    borderRadius: 16,
    lineWidth: 1.5
  }

  const random = useCallback((x: number) => {
    return (Math.sin(x * 12.9898) * 43758.5453) % 1
  }, [])

  const noise2D = useCallback((x: number, y: number) => {
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
  }, [random])

  const octavedNoise = useCallback((
    x: number,
    octaves: number,
    lacunarity: number,
    gain: number,
    baseAmplitude: number,
    baseFrequency: number,
    time: number,
    seed: number,
    baseFlatness: number
  ) => {
    let y = 0
    let amplitude = baseAmplitude
    let frequency = baseFrequency

    for (let i = 0; i < octaves; i++) {
      let octaveAmplitude = amplitude
      if (i === 0) octaveAmplitude *= baseFlatness
      y += octaveAmplitude * noise2D(frequency * x + seed * 100, time * frequency * 0.3)
      frequency *= lacunarity
      amplitude *= gain
    }
    return y
  }, [noise2D])

  const getCornerPoint = useCallback((
    centerX: number,
    centerY: number,
    radius: number,
    startAngle: number,
    arcLength: number,
    progress: number
  ) => {
    const angle = startAngle + progress * arcLength
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    }
  }, [])

  const getRoundedRectPoint = useCallback((
    t: number,
    left: number,
    top: number,
    w: number,
    h: number,
    radius: number
  ) => {
    const straightWidth = w - 2 * radius
    const straightHeight = h - 2 * radius
    const cornerArc = (Math.PI * radius) / 2
    const totalPerimeter = 2 * straightWidth + 2 * straightHeight + 4 * cornerArc
    const distance = t * totalPerimeter
    let accumulated = 0

    // Top edge
    if (distance <= accumulated + straightWidth) {
      const progress = (distance - accumulated) / straightWidth
      return { x: left + radius + progress * straightWidth, y: top }
    }
    accumulated += straightWidth

    // Top-right corner
    if (distance <= accumulated + cornerArc) {
      const progress = (distance - accumulated) / cornerArc
      return getCornerPoint(left + w - radius, top + radius, radius, -Math.PI / 2, Math.PI / 2, progress)
    }
    accumulated += cornerArc

    // Right edge
    if (distance <= accumulated + straightHeight) {
      const progress = (distance - accumulated) / straightHeight
      return { x: left + w, y: top + radius + progress * straightHeight }
    }
    accumulated += straightHeight

    // Bottom-right corner
    if (distance <= accumulated + cornerArc) {
      const progress = (distance - accumulated) / cornerArc
      return getCornerPoint(left + w - radius, top + h - radius, radius, 0, Math.PI / 2, progress)
    }
    accumulated += cornerArc

    // Bottom edge
    if (distance <= accumulated + straightWidth) {
      const progress = (distance - accumulated) / straightWidth
      return { x: left + w - radius - progress * straightWidth, y: top + h }
    }
    accumulated += straightWidth

    // Bottom-left corner
    if (distance <= accumulated + cornerArc) {
      const progress = (distance - accumulated) / cornerArc
      return getCornerPoint(left + radius, top + h - radius, radius, Math.PI / 2, Math.PI / 2, progress)
    }
    accumulated += cornerArc

    // Left edge
    if (distance <= accumulated + straightHeight) {
      const progress = (distance - accumulated) / straightHeight
      return { x: left, y: top + h - radius - progress * straightHeight }
    }
    accumulated += straightHeight

    // Top-left corner
    const progress = (distance - accumulated) / cornerArc
    return getCornerPoint(left + radius, top + radius, radius, Math.PI, Math.PI / 2, progress)
  }, [getCornerPoint])

  const drawElectricBorder = useCallback((currentTime: number) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const deltaTime = (currentTime - lastFrameTimeRef.current) / 1000
    timeRef.current += deltaTime * config.speed
    lastFrameTimeRef.current = currentTime

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = color
    ctx.lineWidth = config.lineWidth
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    // Add glow effect
    ctx.shadowColor = color
    ctx.shadowBlur = 8

    const scale = config.displacement
    const left = config.borderOffset
    const top = config.borderOffset
    const borderWidth = canvas.width - 2 * config.borderOffset
    const borderHeight = canvas.height - 2 * config.borderOffset
    const maxRadius = Math.min(borderWidth, borderHeight) / 2
    const radius = Math.min(config.borderRadius, maxRadius)
    const approximatePerimeter = 2 * (borderWidth + borderHeight) + 2 * Math.PI * radius
    const sampleCount = Math.floor(approximatePerimeter / 2)

    ctx.beginPath()

    for (let i = 0; i <= sampleCount; i++) {
      const progress = i / sampleCount
      const point = getRoundedRectPoint(progress, left, top, borderWidth, borderHeight, radius)

      const xNoise = octavedNoise(
        progress * 8,
        config.octaves,
        config.lacunarity,
        config.gain,
        config.amplitude,
        config.frequency,
        timeRef.current,
        0,
        config.baseFlatness
      )

      const yNoise = octavedNoise(
        progress * 8,
        config.octaves,
        config.lacunarity,
        config.gain,
        config.amplitude,
        config.frequency,
        timeRef.current,
        1,
        config.baseFlatness
      )

      const displacedX = point.x + xNoise * scale
      const displacedY = point.y + yNoise * scale

      if (i === 0) {
        ctx.moveTo(displacedX, displacedY)
      } else {
        ctx.lineTo(displacedX, displacedY)
      }
    }

    ctx.closePath()
    ctx.stroke()

    animationRef.current = requestAnimationFrame(drawElectricBorder)
  }, [color, config, getRoundedRectPoint, octavedNoise])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = width + 60
    canvas.height = height + 60

    animationRef.current = requestAnimationFrame(drawElectricBorder)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [width, height, drawElectricBorder])

  return (
    <div 
      className={`relative ${className}`}
      style={{ 
        width, 
        height,
        "--electric-color": color 
      } as React.CSSProperties}
    >
      {/* Background glow */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-30 blur-xl -z-10"
        style={{
          background: `linear-gradient(-30deg, ${color}, transparent, ${color})`,
          transform: "scale(1.1)"
        }}
      />

      {/* Glow layers */}
      <div 
        className="absolute inset-0 rounded-2xl blur-[1px]"
        style={{ border: `2px solid ${color}40` }}
      />
      <div 
        className="absolute inset-0 rounded-2xl blur-[4px]"
        style={{ border: `2px solid ${color}60` }}
      />

      {/* Electric canvas */}
      <canvas
        ref={canvasRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ width: width + 60, height: height + 60 }}
      />

      {/* Content */}
      <div className="relative z-10 h-full w-full rounded-2xl bg-neutral-900/80 backdrop-blur-sm overflow-hidden">
        {/* Gradient overlay */}
        <div 
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            background: `linear-gradient(-30deg, ${color}20, transparent, ${color}20)`
          }}
        />
        
        {/* Inner content */}
        <div className="relative z-10 h-full w-full">
          {children}
        </div>
      </div>
    </div>
  )
}
