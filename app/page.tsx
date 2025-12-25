import type { Metadata } from "next"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { AnnouncementBar } from "@/components/announcement-bar"
import { ModernHero } from "@/components/modern-hero"
import { ModernStats } from "@/components/modern-stats"
import { ModernFeatures } from "@/components/modern-features"
import { TrendingSection } from "@/components/trending-section"
import { RecentAssets } from "@/components/recent-assets"
import { ActivityFeed } from "@/components/activity-feed"
import { TestimonialsSection } from "@/components/testimonials-section"
import { ScrollToTop } from "@/components/scroll-to-top"

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
    <div className="min-h-screen relative">
      {/* Modern Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <Sidebar />
      <main className="md:ml-72 transition-all duration-300 relative z-10">
        <AnnouncementBar />
        <Header />
        <div className="p-6 space-y-12">
          <ModernHero />
          <ModernStats />
          <ModernFeatures />
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-8">
              <TrendingSection />
              <RecentAssets />
            </div>
            <div className="space-y-6">
              <ActivityFeed />
            </div>
          </div>
          <TestimonialsSection />
        </div>
      </main>
      
      <ScrollToTop />
    </div>
  )
}
