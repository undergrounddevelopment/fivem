"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Download, Users, Star } from "lucide-react"
import { SITE_LOGO, FRAMEWORKS } from "@/lib/constants"
import { useStatsStore } from "@/lib/store"
import Link from "next/link"

function formatStatNumber(num: number, suffix = ""): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M${suffix}`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K${suffix}`
  }
  if (num > 0) {
    return `${num}${suffix}`
  }
  return `0${suffix}`
}

export function HeroSection() {
  const { stats } = useStatsStore()

  return (
    <section className="relative overflow-hidden rounded-2xl glass border-primary/20 mb-8">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 px-8 py-12 md:px-12 md:py-16">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-1">
            {/* Badge with Logo */}
            <div className="mb-6 flex items-center gap-4">
              <img src={SITE_LOGO || "/placeholder.svg"} alt="FiveM Tools V7" className="h-16 w-16 object-contain" />
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-2 text-sm text-primary border border-primary/30">
                <span className="font-medium">The #1 FiveM Resource Hub</span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-primary text-primary-foreground rounded-full">
                  2025
                </span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl mb-4 text-balance">
              Premium Assets for <span className="gradient-text">Next-Gen Servers</span>
            </h1>

            {/* Description */}
            <p className="text-lg text-muted-foreground md:text-xl max-w-xl mb-6">
              Access thousands of curated Scripts, MLOs, Vehicles, and EUPs. Optimized for all major frameworks.
            </p>

            {/* Framework Logos */}
            <div className="flex items-center gap-4 mb-8">
              <span className="text-sm text-muted-foreground">Supported:</span>
              <div className="flex items-center gap-3">
                {FRAMEWORKS.filter((f) => f.id !== "standalone").map((framework) => (
                  <div
                    key={framework.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/50"
                    title={framework.name}
                  >
                    <img
                      src={framework.logo || "/placeholder.svg"}
                      alt={framework.name}
                      className="h-6 w-6 object-contain rounded"
                    />
                    <span className="text-sm font-medium text-foreground hidden sm:inline">{framework.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Link href="/scripts">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 rounded-xl h-12 px-6 glow-sm"
                >
                  Browse All Assets
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/membership">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border hover:bg-secondary rounded-xl h-12 px-6 bg-transparent"
                >
                  Get Premium Access
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:gap-4">
            <div className="glass rounded-xl p-4 text-center card-hover">
              <Download className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">
                {stats.totalDownloads > 0 ? formatStatNumber(stats.totalDownloads, "+") : "0+"}
              </p>
              <p className="text-xs text-muted-foreground">Downloads</p>
            </div>
            <div className="glass rounded-xl p-4 text-center card-hover">
              <Users className="h-6 w-6 text-accent mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">
                {stats.totalMembers > 0 ? formatStatNumber(stats.totalMembers) : "0"}
              </p>
              <p className="text-xs text-muted-foreground">Members</p>
            </div>
            <div className="glass rounded-xl p-4 text-center card-hover">
              <img src={SITE_LOGO || "/placeholder.svg"} alt="Assets" className="h-6 w-6 mx-auto mb-2 object-contain" />
              <p className="text-2xl font-bold text-foreground">
                {stats.totalAssets > 0 ? `${stats.totalAssets}+` : "0+"}
              </p>
              <p className="text-xs text-muted-foreground">Assets</p>
            </div>
            <div className="glass rounded-xl p-4 text-center card-hover">
              <Star className="h-6 w-6 text-chart-5 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">4.9</p>
              <p className="text-xs text-muted-foreground">Rating</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
