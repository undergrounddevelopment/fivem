"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Home, Zap } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="md:ml-72 transition-all duration-300">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-6 relative">
          {/* Background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative text-center">
            {/* 404 Number */}
            <div className="relative mb-6">
              <h1 className="text-[180px] font-bold text-muted-foreground/10 leading-none select-none">404</h1>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-24 w-24 rounded-2xl bg-primary/20 flex items-center justify-center animate-pulse-glow">
                  <Zap className="h-12 w-12 text-primary" />
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-foreground mb-3">Page Not Found</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>

            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                className="gap-2 rounded-xl bg-transparent h-11"
                onClick={() => window.history.back()}
              >
                <ChevronLeft className="h-4 w-4" />
                Go Back
              </Button>
              <Link href="/">
                <Button className="bg-primary hover:bg-primary/90 gap-2 rounded-xl h-11 glow-sm">
                  <Home className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </div>

            {/* Quick Links */}
            <div className="mt-12 pt-8 border-t border-border/50">
              <p className="text-sm text-muted-foreground mb-4">Or try these popular pages:</p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {[
                  { label: "Scripts", href: "/scripts" },
                  { label: "Forum", href: "/forum" },
                  { label: "Vehicles", href: "/vehicles" },
                  { label: "Dashboard", href: "/dashboard" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-4 py-2 rounded-xl bg-secondary/50 text-sm text-foreground hover:bg-secondary transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
