"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

interface Banner {
    id: string
    title: string
    image_url: string
    link?: string
    position: string
    sort_order: number
}

export function AdminBanner({ position, className = "" }: { position: string, className?: string }) {
    const [banners, setBanners] = useState<Banner[]>([])
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const res = await fetch('/api/admin/banners')
                const data = await res.json()
                if (data.banners) {
                    // Filter by position and sort
                    const relevant = data.banners
                        .filter((b: any) => b.position === position && b.is_active)
                        .sort((a: any, b: any) => a.sort_order - b.sort_order)
                    setBanners(relevant)
                }
            } catch (e) {
                console.error("Failed to load banners", e)
            }
        }
        fetchBanners()
    }, [position])

    if (banners.length === 0 || !isVisible) return null

    // For now, show the first/top priority banner
    const banner = banners[0]

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`relative rounded-xl overflow-hidden shadow-lg group ${className}`}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-10 pointer-events-none" />
                <img
                    src={banner.image_url}
                    alt={banner.title}
                    className="w-full h-32 md:h-40 object-cover"
                />
                <div className="absolute inset-0 z-20 flex flex-col justify-center p-6 md:px-8">
                    <motion.h3
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="text-2xl font-bold text-white mb-2 drop-shadow-md"
                    >
                        {banner.title}
                    </motion.h3>
                    {banner.link && (
                        <a
                            href={banner.link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center px-4 py-2 rounded-full bg-white text-black font-medium text-sm w-fit hover:bg-white/90 transition-colors"
                        >
                            Learn More
                        </a>
                    )}
                </div>
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute top-2 right-2 z-30 p-1 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors opacity-0 group-hover:opacity-100"
                >
                    <X className="h-4 w-4" />
                </button>
            </motion.div>
        </AnimatePresence>
    )
}
