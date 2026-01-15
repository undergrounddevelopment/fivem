// Centralized hooks exports
export { useIsMobile, useIsTablet, useIsDesktop, useBreakpoint } from './use-mobile'
export { usePlatform, BREAKPOINTS } from './use-platform'
export type { Breakpoint, PlatformInfo } from './use-platform'
export { useDebounce } from './use-debounce'
export { useToast } from './use-toast'
export { useAuth } from './use-auth'
export { useHeartbeat } from './use-heartbeat'
export { 
  useRealtimeStats, 
  useRealtimeNotifications, 
  useRealtimeThreads, 
  useRealtimeAssets,
  useRealtimeMessages,
  useRealtimeActivity,
  useRealtimeReplies 
} from './use-realtime'
export { useTranslation } from './use-translation'
