"use client"

import Link from "next/link"
import { Code, MapPin, Car, Shirt, ChevronRight, Sparkles } from "lucide-react"
import { useStatsStore } from "@/lib/store"

const categories = [
  {
    name: "Scripts",
    description: "Lua scripts for your server",
    icon: Code,
    href: "/scripts",
    color: "from-primary/20 to-primary/5",
    iconColor: "text-primary",
    borderColor: "border-primary/20 hover:border-primary/40",
  },
  {
    name: "Maps & MLO",
    description: "Custom interiors and maps",
    icon: MapPin,
    href: "/mlo",
    color: "from-chart-5/20 to-chart-5/5",
    iconColor: "text-chart-5",
    borderColor: "border-chart-5/20 hover:border-chart-5/40",
  },
  {
    name: "Vehicles",
    description: "Cars, bikes, and more",
    icon: Car,
    href: "/vehicles",
    color: "from-info/20 to-info/5",
    iconColor: "text-info",
    borderColor: "border-info/20 hover:border-info/40",
  },
  {
    name: "EUP & Clothing",
    description: "Uniforms and outfits",
    icon: Shirt,
    href: "/clothing",
    color: "from-warning/20 to-warning/5",
    iconColor: "text-warning",
    borderColor: "border-warning/20 hover:border-warning/40",
  },
]

export function CategoriesSection() {
  const { stats } = useStatsStore()

  // Distribute assets across categories roughly
  const assetCounts = {
    Scripts: Math.floor(stats.totalAssets * 0.35),
    "Maps & MLO": Math.floor(stats.totalAssets * 0.15),
    Vehicles: Math.floor(stats.totalAssets * 0.3),
    "EUP & Clothing": Math.floor(stats.totalAssets * 0.2),
  }

  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-accent/20 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Browse Categories</h2>
            <p className="text-sm text-muted-foreground">Find the perfect resource</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {categories.map((category) => (
          <Link
            key={category.name}
            href={category.href}
            className={`group relative overflow-hidden rounded-2xl glass p-5 card-hover ${category.borderColor}`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-50 group-hover:opacity-80 transition-opacity`}
            />

            <div className="relative flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-background/50 backdrop-blur flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <category.icon className={`h-7 w-7 ${category.iconColor}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{category.description}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  <span className="font-semibold text-foreground">
                    {assetCounts[category.name as keyof typeof assetCounts] || 0}+
                  </span>{" "}
                  resources
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
