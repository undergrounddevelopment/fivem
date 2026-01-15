"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, Code, Package, Server, Coffee } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

interface ForumCategory {
  id: string
  name: string
  slug?: string
  description: string
  icon: string
  color: string
  thread_count: number
  post_count: number
  is_active: boolean
}

export function CategoriesSection() {
  const [categories, setCategories] = useState<ForumCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/forum/categories")
      if (!res.ok) throw new Error("Failed to fetch")

      const data = await res.json()
      // Handle both array response and object with categories property
      const categoriesData = Array.isArray(data) ? data : (data.categories || [])

      setCategories(categoriesData.slice(0, 6))
      setError(false)
    } catch (err) {
      console.error("Failed to fetch categories:", err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "MessageSquare":
        return <MessageSquare className="h-6 w-6" />
      case "Code":
        return <Code className="h-6 w-6" />
      case "Package":
        return <Package className="h-6 w-6" />
      case "Server":
        return <Server className="h-6 w-6" />
      case "Coffee":
        return <Coffee className="h-6 w-6" />
      default:
        return <MessageSquare className="h-6 w-6" />
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Forum Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-gray-300 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <p className="text-red-600 mb-2">Failed to load forum categories</p>
          <Button onClick={fetchCategories} variant="outline" size="sm">
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Maintenance Mode Logic (Dynamic)
  if (categories.length === 0) {
    return (
      <div className="relative group overflow-hidden rounded-[2rem] bg-white/[0.02] border border-white/5 p-12 flex flex-col items-center justify-center text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 group-hover:border-primary/20 transition-all duration-300 group-hover:scale-105">
            <MessageSquare className="h-10 w-10 text-primary/50" />
          </div>
          <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-3">Forum Under Construction</h3>
          <p className="text-sm font-medium text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Our elite communication hub is currently being synchronized. Prepare for strategic coordination shortly.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-3 h-10 bg-primary rounded-full shadow-[0_0_20px_rgba(var(--primary-rgb),0.6)]" />
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Intelligence Hub</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-40">Operational Forum Categories</p>
          </div>
        </div>
        <Link href="/forum">
          <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-primary hover:text-black hover:border-primary font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-xl transition-all">
            Enter Protocol
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            whileHover={{ y: -3, transition: { duration: 0.15 } }}
          >
            <Link href={category.slug ? `/forum/category/${category.slug}` : `/forum/category/${category.id}`}>
              <div className="relative group h-full overflow-hidden rounded-2xl bg-white/[0.03] border border-white/10 p-6 hover:bg-white/[0.05] hover:border-primary/20 transition-all duration-200 cursor-pointer">
                {/* Visual Flair */}
                <div
                  className="absolute -right-8 -top-8 w-32 h-32 rounded-full blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity duration-500"
                  style={{ backgroundColor: category.color }}
                />

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-6">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 group-hover:scale-105"
                      style={{
                        backgroundColor: `${category.color}15`,
                        color: category.color,
                        borderColor: `${category.color}30`
                      }}
                    >
                      {getIcon(category.icon)}
                    </div>
                    <div className="flex flex-col items-end gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-black uppercase tracking-widest">Sector</span>
                      <span className="text-[10px] font-black text-primary">{String(index + 1).padStart(2, '0')}</span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-xs font-medium text-muted-foreground line-clamp-2 leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity">
                      {category.description}
                    </p>
                  </div>

                  <div className="mt-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Threads</span>
                        <span className="text-sm font-black text-white">{category.thread_count}</span>
                      </div>
                      <div className="w-[1px] h-6 bg-white/10" />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Intel</span>
                        <span className="text-sm font-black text-white">{category.post_count}</span>
                      </div>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-4 transition-all duration-300">
                      <Code className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                </div>

                {/* Interaction Glow */}
                <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/10 rounded-2xl transition-colors duration-300" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}