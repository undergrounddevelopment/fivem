"use client"

import { FRAMEWORKS } from "@/lib/constants"
import type { Framework } from "@/lib/types"
import { cn } from "@/lib/utils"

interface FrameworkSelectorProps {
  selected: Framework | "all"
  onSelect: (framework: Framework | "all") => void
  showAll?: boolean
}

export function FrameworkSelector({ selected, onSelect, showAll = true }: FrameworkSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {showAll && (
        <button
          onClick={() => onSelect("all")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
            selected === "all"
              ? "bg-primary text-primary-foreground glow-sm"
              : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground",
          )}
        >
          All Frameworks
        </button>
      )}
      {FRAMEWORKS.map((framework) => (
        <button
          key={framework.id}
          onClick={() => onSelect(framework.id)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
            selected === framework.id
              ? "bg-primary/20 text-primary border border-primary/30"
              : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground",
          )}
        >
          <img
            src={framework.logo || "/placeholder.svg"}
            alt={framework.name}
            className="h-5 w-5 rounded object-contain"
          />
          {framework.name}
        </button>
      ))}
    </div>
  )
}

export function FrameworkBadge({ framework }: { framework: Framework }) {
  const info = FRAMEWORKS.find((f) => f.id === framework)
  if (!info) return null

  return (
    <div
      className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium"
      style={{ backgroundColor: `${info.color}20`, color: info.color }}
    >
      <img src={info.logo || "/placeholder.svg"} alt={info.name} className="h-4 w-4 rounded object-contain" />
      {info.name}
    </div>
  )
}
