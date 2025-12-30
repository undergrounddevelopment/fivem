import { createClient } from '@supabase/supabase-js'
import { SUPABASE_CONFIG } from '../supabase/config'

export async function checkDatabaseHealth() {
  const results = {
    postgres: false,
    supabase: false,
    tables: [] as string[],
    error: null as string | null
  }

  try {
    const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.serviceRoleKey)
    
    // Test connection
    const { data, error } = await supabase.from('users').select('count').limit(1)
    results.supabase = !error
    results.postgres = !error

    // Get table list
    const { data: tables } = await supabase.rpc('get_tables')
    results.tables = tables || ['users', 'assets']

  } catch (error: any) {
    results.error = error.message
  }

  return results
}

export async function ensureTablesExist() {
  const requiredTables = [
    'users',
    'assets',
    'forum_categories',
    'forum_threads',
    'forum_replies',
    'coin_transactions',
    'daily_claims',
    'spin_wheel_prizes',
    'spin_wheel_tickets',
    'spin_wheel_history'
  ]

  try {
    const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.serviceRoleKey)
    
    // Check if users table exists
    const { error } = await supabase.from('users').select('count').limit(1)
    
    return {
      success: !error,
      existing: requiredTables,
      missing: error ? requiredTables : []
    }
  } catch (error: any) {
    return {
      success: false,
      existing: [],
      missing: requiredTables,
      error: error.message
    }
  }
}
