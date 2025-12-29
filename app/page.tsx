import type { Metadata } from "next"
import { TrendingSection } from "@/components/trending-section"
import { RecentAssets } from "@/components/recent-assets"
import { ActivityFeed } from "@/components/activity-feed"
import { LinkvertiseAd } from "@/components/linkvertise-ad"
import { ModernStats } from "@/components/modern-stats"
import { ModernFeatures } from "@/components/modern-features"
import { ModernHero } from "@/components/modern-hero"
import { CategoriesSection } from "@/components/categories-section"

export const metadata: Metadata = {
  title: "FiveM Tools V7 - Free Scripts, MLO, Vehicles, Decrypt CFX, Upvotes Bot",
  description:
    "Download Free FiveM Scripts, MLO Maps, Vehicles, EUP Clothing. CFX V7 Decrypt Tool, FiveM Upvotes Bot, Leak Scripts. QBCore, ESX, QBox Framework. #1 FiveM Resource Hub.",
  keywords: [
    "fivem tools",
    "fivem scripts free",
    "fivem mlo free",
    "fivem vehicles",
    "fivem decrypt",
    "cfx decrypt",
    "fivem upvotes",
    "fivem leak",
    "qbcore scripts",
    "esx scripts",
    "fivem resources",
    "fivem download",
    "gta v fivem",
    "fivem roleplay",
    "fivem server",
  ],
  openGraph: {
    title: "FiveM Tools V7 - #1 Free FiveM Resource Hub",
    description: "Free FiveM Scripts, MLO, Vehicles, EUP, Decrypt CFX V7, Upvotes. QBCore, ESX, QBox Resources.",
  },
}

export default function HomePage() {
  return (
    <div className="relative">
      {/* Hero Section with Modern Design */}
      <ModernHero />
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-8">
            <CategoriesSection />
            <TrendingSection />
            <RecentAssets />
          </div>
          <div className="space-y-6">
            <ActivityFeed />
          </div>
        </div>
        
        <div className="mt-12 space-y-8">
          <ModernStats />
          <LinkvertiseAd />
          <ModernFeatures />
        </div>
      </div>
    </div>
  )
}