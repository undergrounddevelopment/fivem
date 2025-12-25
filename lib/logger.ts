type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  data?: any
  stack?: string
  userId?: string
  ip?: string
  endpoint?: string
}

class Logger {
  private formatLog(entry: LogEntry): string {
    return JSON.stringify(entry)
  }

  info(message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message,
      data
    }
    if (process.env.NODE_ENV === 'development') {
      console.log(`[INFO] ${message}`, data || '')
    }
  }

  warn(message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'WARN',
      message,
      data
    }
    console.warn(`[WARN] ${message}`, data || '')
  }

  error(message: string, error?: any, context?: { userId?: string; ip?: string; endpoint?: string }) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message,
      data: error?.message || error,
      stack: error?.stack,
      ...context
    }
    console.error(`[ERROR] ${message}`, error)
  }

  critical(message: string, error?: any, context?: { userId?: string; ip?: string; endpoint?: string }) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'CRITICAL',
      message,
      data: error?.message || error,
      stack: error?.stack,
      ...context
    }
    console.error(`[CRITICAL] ${message}`, error)
  }
}

export const logger = new Logger()
