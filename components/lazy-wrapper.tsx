"use client"

import { Suspense, lazy, ComponentType, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

interface LazyWrapperProps {
  children: ReactNode
  fallback?: ReactNode
  className?: string
}

// Default loading component
const DefaultLoader = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-6 w-6 animate-spin text-primary" />
  </div>
)

// Lazy wrapper component
export function LazyWrapper({ 
  children, 
  fallback = <DefaultLoader />, 
  className 
}: LazyWrapperProps) {
  return (
    <div className={className}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </div>
  )
}

// HOC for lazy loading components
export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  fallback?: ReactNode
) {
  const LazyComponent = lazy(() => Promise.resolve({ default: Component }))
  
  return function WrappedComponent(props: P) {
    return (
      <Suspense fallback={fallback || <DefaultLoader />}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}

// Dynamic import helper
export function createLazyComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  fallback?: ReactNode
) {
  const LazyComponent = lazy(importFn)
  
  return function DynamicComponent(props: P) {
    return (
      <Suspense fallback={fallback || <DefaultLoader />}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}

// Preload component for critical components
export function preloadComponent(importFn: () => Promise<any>) {
  // Preload on idle
  if (typeof window !== 'undefined') {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => importFn())
    } else {
      setTimeout(() => importFn(), 100)
    }
  }
}