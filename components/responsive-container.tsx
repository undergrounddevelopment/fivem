'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ResponsiveContainerProps {
  children: ReactNode
  className?: string
  // Padding options
  noPadding?: boolean
  // Max width options
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'none'
  // Center content
  center?: boolean
  // Safe area support
  safeArea?: boolean | 'top' | 'bottom' | 'all'
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
  none: '',
}

export function ResponsiveContainer({
  children,
  className,
  noPadding = false,
  maxWidth = 'xl',
  center = true,
  safeArea = false,
}: ResponsiveContainerProps) {
  const safeAreaClass = safeArea === true || safeArea === 'all'
    ? 'safe-area-all'
    : safeArea === 'top'
    ? 'safe-area-top'
    : safeArea === 'bottom'
    ? 'safe-area-bottom'
    : ''

  return (
    <div
      className={cn(
        'w-full',
        !noPadding && 'px-3 sm:px-4 md:px-6 lg:px-8',
        maxWidthClasses[maxWidth],
        center && 'mx-auto',
        safeAreaClass,
        className
      )}
    >
      {children}
    </div>
  )
}

// Responsive Grid Component
interface ResponsiveGridProps {
  children: ReactNode
  className?: string
  // Column configuration
  cols?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    '2xl'?: number
  }
  // Gap configuration
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}

const gapClasses = {
  none: 'gap-0',
  sm: 'gap-2 sm:gap-3 md:gap-4',
  md: 'gap-3 sm:gap-4 md:gap-5 lg:gap-6',
  lg: 'gap-4 sm:gap-5 md:gap-6 lg:gap-8',
  xl: 'gap-5 sm:gap-6 md:gap-8 lg:gap-10',
}

export function ResponsiveGrid({
  children,
  className,
  cols = { xs: 1, sm: 2, md: 2, lg: 3, xl: 4 },
  gap = 'md',
}: ResponsiveGridProps) {
  const colClasses = [
    cols.xs && `grid-cols-${cols.xs}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    cols['2xl'] && `2xl:grid-cols-${cols['2xl']}`,
  ].filter(Boolean).join(' ')

  return (
    <div
      className={cn(
        'grid',
        colClasses,
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  )
}

// Responsive Stack Component (Flex column/row based on screen)
interface ResponsiveStackProps {
  children: ReactNode
  className?: string
  // Direction changes at breakpoint
  breakpoint?: 'sm' | 'md' | 'lg' | 'xl'
  // Reverse direction
  reverse?: boolean
  // Gap
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  // Alignment
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
}

const alignClasses = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
}

const justifyClasses = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
}

export function ResponsiveStack({
  children,
  className,
  breakpoint = 'md',
  reverse = false,
  gap = 'md',
  align = 'stretch',
  justify = 'start',
}: ResponsiveStackProps) {
  const directionClass = reverse
    ? `flex-col-reverse ${breakpoint}:flex-row-reverse`
    : `flex-col ${breakpoint}:flex-row`

  return (
    <div
      className={cn(
        'flex',
        directionClass,
        gapClasses[gap],
        alignClasses[align],
        justifyClasses[justify],
        className
      )}
    >
      {children}
    </div>
  )
}

// Responsive Hide/Show Component
interface ResponsiveVisibilityProps {
  children: ReactNode
  // Show only on these breakpoints
  showOn?: ('xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl')[]
  // Hide on these breakpoints
  hideOn?: ('xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl')[]
  // Show above breakpoint
  showAbove?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  // Show below breakpoint
  showBelow?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function ResponsiveVisibility({
  children,
  showOn,
  hideOn,
  showAbove,
  showBelow,
  className,
}: ResponsiveVisibilityProps) {
  let visibilityClasses = ''

  if (showAbove) {
    visibilityClasses = `hidden ${showAbove}:block`
  } else if (showBelow) {
    visibilityClasses = `block ${showBelow}:hidden`
  } else if (showOn) {
    // Start hidden, show on specific breakpoints
    const showClasses = showOn.map(bp => {
      if (bp === 'xs') return 'block sm:hidden'
      return `hidden ${bp}:block ${getNextBreakpoint(bp)}:hidden`
    }).join(' ')
    visibilityClasses = `hidden ${showClasses}`
  } else if (hideOn) {
    // Start visible, hide on specific breakpoints
    const hideClasses = hideOn.map(bp => {
      if (bp === 'xs') return 'hidden sm:block'
      return `${bp}:hidden ${getNextBreakpoint(bp)}:block`
    }).join(' ')
    visibilityClasses = hideClasses
  }

  return (
    <div className={cn(visibilityClasses, className)}>
      {children}
    </div>
  )
}

function getNextBreakpoint(bp: string): string {
  const order = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
  const index = order.indexOf(bp)
  return order[index + 1] || '2xl'
}

// Responsive Text Component
interface ResponsiveTextProps {
  children: ReactNode
  className?: string
  // Text size
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
  // Truncate on mobile
  truncateMobile?: boolean
  // Max lines
  maxLines?: number
}

const textSizeClasses = {
  xs: 'text-responsive-xs',
  sm: 'text-responsive-sm',
  base: 'text-responsive-base',
  lg: 'text-responsive-lg',
  xl: 'text-responsive-xl',
  '2xl': 'text-responsive-2xl',
  '3xl': 'text-responsive-3xl',
  '4xl': 'text-responsive-4xl',
}

export function ResponsiveText({
  children,
  className,
  size = 'base',
  truncateMobile = false,
  maxLines,
}: ResponsiveTextProps) {
  const lineClampStyle = maxLines ? {
    display: '-webkit-box',
    WebkitLineClamp: maxLines,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
  } : undefined

  return (
    <span
      className={cn(
        textSizeClasses[size],
        truncateMobile && 'truncate-xs sm:whitespace-normal sm:overflow-visible',
        className
      )}
      style={lineClampStyle}
    >
      {children}
    </span>
  )
}

// Responsive Spacer Component
interface ResponsiveSpacerProps {
  // Size at different breakpoints
  size?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  // Direction
  direction?: 'horizontal' | 'vertical'
}

export function ResponsiveSpacer({
  size = { xs: 16, md: 24, lg: 32 },
  direction = 'vertical',
}: ResponsiveSpacerProps) {
  const style = direction === 'vertical'
    ? { height: size.xs || 16 }
    : { width: size.xs || 16 }

  return (
    <div
      className="responsive-spacer"
      style={style}
      aria-hidden="true"
    />
  )
}
