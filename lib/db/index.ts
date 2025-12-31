// Main database exports
export { default as db } from './queries'
export * from './queries'
export * from './types'

// Quick access exports
import queries from './queries'
export const { forum, coins, spinWheel, admin, assets } = queries
