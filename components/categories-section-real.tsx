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
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from("forum_categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .limit(6)

      if (error) throw error
      
      setCategories(data || [])
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

  if (categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Forum Categories</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No forum categories available</p>
          <p className="text-sm text-muted-foreground mt-2">
            Categories will appear here once they are created
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Forum Categories</CardTitle>
        <Link href="/forum">
          <Button variant="outline" size="sm">
            View Forum
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/forum/category/${category.id}`}>
                <Card className="hover:shadow-lg transition-all cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div 
                        className="p-2 rounded-lg group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: `${category.color}20`, color: category.color }}
                      >
                        {getIcon(category.icon)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                          {category.description}
                        </p>
                        
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {category.thread_count} threads
                          </div>
                          <div className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            {category.post_count} posts
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}