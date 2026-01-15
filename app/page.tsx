import type { Metadata } from "next"
import { TrendingSection } from "@/components/trending-section"
import { RecentAssets } from "@/components/recent-assets"
import { ActivityFeed } from "@/components/activity-feed"
import { LinkvertiseAd } from "@/components/linkvertise-ad"
import { StatsSection } from "@/components/stats-section"
import { ModernFeatures } from "@/components/modern-features"
import { ModernHero } from "@/components/modern-hero"
import { CategoriesSection } from "@/components/categories-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { CommunityBanners } from "@/components/community-banners"

export const metadata: Metadata = {
  title: "FiveM Tools V7 - #1 Automatic Leaks, Scripts, MLO, Decrypt CFX, Upvotes",
  description:
    "The World's #1 FiveM Leaks Community. Download premium Scripts, MLOs, Vehicles, EUP for Free. Automatic updates, instant access. Unlock QBCore, ESX, QBox resources now. #FiveMLeaks #FiveMFree",
  keywords: [
    "fivem leaks",
    "fivem automatic leak",
    "fivem scripts free",
    "fivem mlo leak",
    "fivem vehicles",
    "fivem decrypt",
    "cfx decrypt",
    "fivem upvotes",
    "fivem leak",
    "qbcore leaks",
    "esx scripts",
    "fivem resources",
    "fivem download",
    "gta v fivem",
    "fivem roleplay",
    "fivem server",
    "fivem global",
  ],
  openGraph: {
    title: "FiveM Tools V7 - #1 Free FiveM Leaks & Resource Hub",
    description: "Free FiveM Scripts, MLO, Vehicles, EUP, Decrypt CFX V7, Upvotes. QBCore, ESX, QBox Resources. #1 Global Leaks.",
  },
}

export default function HomePage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <ModernHero />

      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Categories */}
        <CategoriesSection />

        {/* Main Content Grid - Clean 2/3 + 1/3 Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-12">
            <TrendingSection />
            <RecentAssets />
          </div>
          <aside className="lg:sticky lg:top-20 h-fit">
            <ActivityFeed />
          </aside>
        </div>

        {/* Additional Sections - Lighter Spacing */}
        <StatsSection />
        <TestimonialsSection />
        <CommunityBanners />
        <LinkvertiseAd />
        <ModernFeatures />
      </div>
    </div>
  )
}

