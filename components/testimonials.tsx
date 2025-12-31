"use client"

import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import useSWR from "swr"

type Testimonial = {
  id: string
  username: string
  avatar: string | null
  content: string
  server_name?: string | null
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch testimonials: ${res.status}`)
  }
  return res.json()
}

export function Testimonials() {
  const { data, error, isLoading } = useSWR("/api/testimonials", fetcher)

  if (error) return <div>Failed to load testimonials.</div>
  if (isLoading) return <div>Loading testimonials...</div>

  const testimonials: Testimonial[] = Array.isArray(data) ? data : []
  if (testimonials.length === 0) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {testimonials.map((testimonial) => (
        <Card key={testimonial.id}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <Image
                src={testimonial.avatar || "/placeholder-user.jpg"}
                alt={testimonial.username || "User"}
                width={48}
                height={48}
                className="rounded-full"
              />
              <div>
                <p className="font-semibold">{testimonial.username || "Anonymous"}</p>
                {testimonial.server_name ? (
                  <p className="text-sm text-muted-foreground">{testimonial.server_name}</p>
                ) : null}
              </div>
            </div>
            <p className="text-muted-foreground">{testimonial.content}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
