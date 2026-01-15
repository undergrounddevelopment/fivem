"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Users } from "lucide-react"

interface Banner {
  id: string
  title: string
  image_url: string
  link_url?: string
}

export function CommunityBanners() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBanners() {
      try {
        const res = await fetch('/api/banners?position=community')
        const data = await res.json()
        setBanners(data.banners || [])
      } catch (e) {
        console.error("Failed to load community banners", e)
      } finally {
        setLoading(false)
      }
    }
    fetchBanners()
  }, [])

  if (banners.length === 0 && !loading) return null

  return (
    <section className="py-10 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        
        {/* Uniform Grid Layout - Large Natural Height */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-center max-w-6xl mx-auto">
           {loading ? (
             [...Array(5)].map((_, i) => (
               <div key={i} className="rounded-[1rem] bg-white/5 animate-pulse h-[150px]" />
             ))
           ) : (
             banners.map((banner, index) => (
                 <motion.div
                    key={banner.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="relative group overflow-hidden flex items-center justify-center"
                 >
                    {/* Wrap in Link if available, otherwise just render div content */}
                    {banner.link_url ? (
                        <a href={banner.link_url} target="_blank" rel="noopener noreferrer" className="block w-full">
                            <img 
                                src={banner.image_url} 
                                alt={banner.title}
                                className="w-full h-auto object-contain hover:scale-105 transition-transform duration-500"
                            />
                        </a>
                    ) : (
                        <div className="w-full"> 
                            <img 
                                src={banner.image_url} 
                                alt={banner.title}
                                className="w-full h-auto object-contain hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                    )}
                 </motion.div>
             ))
           )}
        </div>
      </div>
    </section>
  )
}
