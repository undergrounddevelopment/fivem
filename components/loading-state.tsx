"use client"

import { cn } from "@/lib/utils"

type LoadingVariant = "card" | "list" | "grid" | "page" | "stats"

interface LoadingStateProps {
  variant: LoadingVariant
  count?: number
  className?: string
}

function SkeletonBox({ className }: { className?: string }) {
  return (
    <div className={cn(
      "skeleton bg-muted/30 rounded-lg",
      className
    )} />
  )
}

function CardSkeleton() {
  return (
    <div className="glass rounded-xl p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <SkeletonBox className="h-4 w-24" />
          <SkeletonBox className="h-8 w-32" />
          <SkeletonBox className="h-3 w-20" />
        </div>
        <SkeletonBox className="h-12 w-12 rounded-xl" />
      </div>
    </div>
  )
}

function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-secondary/20 p-4">
      <SkeletonBox className="h-11 w-11 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonBox className="h-4 w-2/3" />
        <SkeletonBox className="h-3 w-1/3" />
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <SkeletonBox className="h-4 w-12" />
        <SkeletonBox className="h-4 w-12" />
      </div>
    </div>
  )
}

function StatSkeleton() {
  return (
    <div className="glass rounded-xl p-4 flex items-center gap-4">
      <SkeletonBox className="h-12 w-12 rounded-xl shrink-0" />
      <div className="space-y-2 flex-1">
        <SkeletonBox className="h-6 w-20" />
        <SkeletonBox className="h-3 w-16" />
      </div>
    </div>
  )
}

function GridItemSkeleton() {
  return (
    <div className="glass rounded-xl overflow-hidden">
      <SkeletonBox className="h-40 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <SkeletonBox className="h-5 w-3/4" />
        <SkeletonBox className="h-3 w-full" />
        <SkeletonBox className="h-3 w-2/3" />
        <div className="flex items-center gap-2 pt-2">
          <SkeletonBox className="h-6 w-16 rounded-full" />
          <SkeletonBox className="h-6 w-16 rounded-full" />
        </div>
      </div>
    </div>
  )
}

function PageSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <SkeletonBox className="h-14 w-14 rounded-2xl" />
        <div className="space-y-2">
          <SkeletonBox className="h-8 w-48" />
          <SkeletonBox className="h-4 w-64" />
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatSkeleton key={i} />
        ))}
      </div>
      
      {/* Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <ListItemSkeleton key={i} />
          ))}
        </div>
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  )
}

export function LoadingState({ variant, count = 3, className }: LoadingStateProps) {
  return (
    <div className={cn("animate-pulse", className)}>
      {variant === "card" && (
        <div className="space-y-4">
          {Array.from({ length: count }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}
      
      {variant === "list" && (
        <div className="space-y-3">
          {Array.from({ length: count }).map((_, i) => (
            <ListItemSkeleton key={i} />
          ))}
        </div>
      )}
      
      {variant === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: count }).map((_, i) => (
            <GridItemSkeleton key={i} />
          ))}
        </div>
      )}
      
      {variant === "stats" && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: count }).map((_, i) => (
            <StatSkeleton key={i} />
          ))}
        </div>
      )}
      
      {variant === "page" && <PageSkeleton />}
    </div>
  )
}

// Individual skeleton components for custom layouts
export { SkeletonBox, CardSkeleton, ListItemSkeleton, StatSkeleton, GridItemSkeleton }
