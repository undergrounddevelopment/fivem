import { useState, useEffect, useCallback } from 'react'

// Breakpoints matching CSS
const BREAKPOINTS = {
  xs: 320,
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

type Breakpoint = keyof typeof BREAKPOINTS

interface PlatformInfo {
  // Device type
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  
  // Operating System
  isIOS: boolean
  isAndroid: boolean
  isWindows: boolean
  isMac: boolean
  isLinux: boolean
  
  // Browser
  isSafari: boolean
  isChrome: boolean
  isFirefox: boolean
  isEdge: boolean
  
  // Screen info
  screenWidth: number
  screenHeight: number
  isPortrait: boolean
  isLandscape: boolean
  
  // Breakpoint
  breakpoint: Breakpoint
  isAbove: (bp: Breakpoint) => boolean
  isBelow: (bp: Breakpoint) => boolean
  
  // Features
  isTouchDevice: boolean
  isRetina: boolean
  prefersReducedMotion: boolean
  prefersDarkMode: boolean
  
  // PWA
  isStandalone: boolean
  
  // Safe areas (for notched devices)
  safeAreaTop: number
  safeAreaBottom: number
  safeAreaLeft: number
  safeAreaRight: number
}

export function usePlatform(): PlatformInfo {
  const [platform, setPlatform] = useState<PlatformInfo>(() => getInitialPlatform())

  const updatePlatform = useCallback(() => {
    setPlatform(getPlatformInfo())
  }, [])

  useEffect(() => {
    // Update on mount
    updatePlatform()

    // Listen for resize
    window.addEventListener('resize', updatePlatform)
    
    // Listen for orientation change
    window.addEventListener('orientationchange', updatePlatform)
    
    // Listen for media query changes
    const mediaQueries = [
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(prefers-color-scheme: dark)'),
    ]
    
    mediaQueries.forEach(mq => {
      mq.addEventListener('change', updatePlatform)
    })

    return () => {
      window.removeEventListener('resize', updatePlatform)
      window.removeEventListener('orientationchange', updatePlatform)
      mediaQueries.forEach(mq => {
        mq.removeEventListener('change', updatePlatform)
      })
    }
  }, [updatePlatform])

  return platform
}

function getInitialPlatform(): PlatformInfo {
  // SSR-safe initial values
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isIOS: false,
      isAndroid: false,
      isWindows: false,
      isMac: false,
      isLinux: false,
      isSafari: false,
      isChrome: false,
      isFirefox: false,
      isEdge: false,
      screenWidth: 1920,
      screenHeight: 1080,
      isPortrait: false,
      isLandscape: true,
      breakpoint: 'xl',
      isAbove: () => true,
      isBelow: () => false,
      isTouchDevice: false,
      isRetina: false,
      prefersReducedMotion: false,
      prefersDarkMode: true,
      isStandalone: false,
      safeAreaTop: 0,
      safeAreaBottom: 0,
      safeAreaLeft: 0,
      safeAreaRight: 0,
    }
  }
  
  return getPlatformInfo()
}

function getPlatformInfo(): PlatformInfo {
  const ua = navigator.userAgent.toLowerCase()
  const screenWidth = window.innerWidth
  const screenHeight = window.innerHeight
  
  // Device detection
  const isIOS = /iphone|ipad|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const isAndroid = /android/.test(ua)
  const isWindows = /windows/.test(ua)
  const isMac = /macintosh|mac os x/.test(ua) && !isIOS
  const isLinux = /linux/.test(ua) && !isAndroid
  
  // Browser detection
  const isSafari = /safari/.test(ua) && !/chrome/.test(ua)
  const isChrome = /chrome/.test(ua) && !/edge/.test(ua)
  const isFirefox = /firefox/.test(ua)
  const isEdge = /edge|edg/.test(ua)
  
  // Screen type
  const isMobile = screenWidth < BREAKPOINTS.md
  const isTablet = screenWidth >= BREAKPOINTS.md && screenWidth < BREAKPOINTS.lg
  const isDesktop = screenWidth >= BREAKPOINTS.lg
  
  // Orientation
  const isPortrait = screenHeight > screenWidth
  const isLandscape = screenWidth >= screenHeight
  
  // Current breakpoint
  const breakpoint = getBreakpoint(screenWidth)
  
  // Feature detection
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  const isRetina = window.devicePixelRatio > 1
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
  
  // PWA detection
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  
  // Safe areas
  const safeAreaTop = getSafeAreaValue('top')
  const safeAreaBottom = getSafeAreaValue('bottom')
  const safeAreaLeft = getSafeAreaValue('left')
  const safeAreaRight = getSafeAreaValue('right')
  
  // Breakpoint helpers
  const isAbove = (bp: Breakpoint) => screenWidth >= BREAKPOINTS[bp]
  const isBelow = (bp: Breakpoint) => screenWidth < BREAKPOINTS[bp]
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    isIOS,
    isAndroid,
    isWindows,
    isMac,
    isLinux,
    isSafari,
    isChrome,
    isFirefox,
    isEdge,
    screenWidth,
    screenHeight,
    isPortrait,
    isLandscape,
    breakpoint,
    isAbove,
    isBelow,
    isTouchDevice,
    isRetina,
    prefersReducedMotion,
    prefersDarkMode,
    isStandalone,
    safeAreaTop,
    safeAreaBottom,
    safeAreaLeft,
    safeAreaRight,
  }
}

function getBreakpoint(width: number): Breakpoint {
  if (width < BREAKPOINTS.xs) return 'xs'
  if (width < BREAKPOINTS.sm) return 'xs'
  if (width < BREAKPOINTS.md) return 'sm'
  if (width < BREAKPOINTS.lg) return 'md'
  if (width < BREAKPOINTS.xl) return 'lg'
  if (width < BREAKPOINTS['2xl']) return 'xl'
  return '2xl'
}

function getSafeAreaValue(position: 'top' | 'bottom' | 'left' | 'right'): number {
  if (typeof window === 'undefined') return 0
  
  const div = document.createElement('div')
  div.style.position = 'fixed'
  div.style[position] = '0'
  div.style.height = '0'
  div.style.width = '0'
  
  // Use env() for safe area
  const envValue = `env(safe-area-inset-${position}, 0px)`
  div.style.paddingTop = envValue
  
  document.body.appendChild(div)
  const value = parseInt(getComputedStyle(div).paddingTop) || 0
  document.body.removeChild(div)
  
  return value
}

// Export breakpoints for use in other components
export { BREAKPOINTS }
export type { Breakpoint, PlatformInfo }
