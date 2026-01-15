import { Suspense, lazy } from 'react'
import { LoadingSpinner } from '@/components/loading-spinner'

interface LazyComponentProps {
  component: () => Promise<{ default: React.ComponentType<any> }>
  fallback?: React.ReactNode
  [key: string]: any
}

export function LazyComponent({ component, fallback, ...props }: LazyComponentProps) {
  const Component = lazy(component)
  
  return (
    <Suspense fallback={fallback || <LoadingSpinner />}>
      <Component {...props} />
    </Suspense>
  )
}
