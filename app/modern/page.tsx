import { ModernNavbar } from "@/components/modern-navbar"
import { ModernHero } from "@/components/modern-hero"
import { ModernStats } from "@/components/modern-stats"
import { ModernFeatures } from "@/components/modern-features"
import { ModernFooter } from "@/components/modern-footer"

export default function ModernHomePage() {
  return (
    <div className="min-h-screen relative">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <ModernNavbar />

      <main className="container mx-auto px-4 py-12 space-y-16">
        <ModernHero />
        <ModernStats />
        <ModernFeatures />
      </main>

      <ModernFooter />
    </div>
  )
}
