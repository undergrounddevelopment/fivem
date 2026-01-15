"use client"

import { useRef, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface BentoCardProps {
    children: React.ReactNode
    className?: string
    noGlass?: boolean
}

export function BentoCard({ children, className, noGlass = false }: BentoCardProps) {
    const mouseX = useRef(0)
    const mouseY = useRef(0)
    const cardRef = useRef<HTMLDivElement>(null)
    const [isHovered, setIsHovered] = useState(false)

    const handleMouseMove = ({ currentTarget, clientX, clientY }: React.MouseEvent) => {
        const { left, top } = currentTarget.getBoundingClientRect()
        mouseX.current = clientX - left
        mouseY.current = clientY - top
    }

    return (
        <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={cn(
                "relative overflow-hidden rounded-[2rem] border transition-all duration-500",
                noGlass ? "" : "glass border-white/5 bg-white/[0.01] backdrop-blur-[20px]",
                className
            )}
            style={{
                "--mouse-x": `${mouseX.current}px`,
                "--mouse-y": `${mouseY.current}px`,
            } as React.CSSProperties}
        >
            <div
                className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                    background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.06), transparent 40%)`,
                    opacity: isHovered ? 1 : 0
                }}
            />
            <div className="relative z-10 h-full">
                {children}
            </div>
        </motion.div>
    )
}
