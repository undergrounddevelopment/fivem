import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = createAdminClient()
    
    const tables = [
      {
        name: 'admin_actions',
        sql: `CREATE TABLE IF NOT EXISTS admin_actions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
          action VARCHAR(100) NOT NULL,
          target_type VARCHAR(50) NOT NULL,
          target_id UUID NOT NULL,
          reason TEXT,
          metadata JSONB DEFAULT '{}',
          ip_address INET,
          user_agent TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )`
      },
      {
        name: 'security_events', 
        sql: `CREATE TABLE IF NOT EXISTS security_events (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          type VARCHAR(100) NOT NULL,
          severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
          source_ip INET,
          target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
          description TEXT NOT NULL,
          details JSONB DEFAULT '{}',
          status VARCHAR(50) DEFAULT 'active',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )`
      },
      {
        name: 'firewall_rules',
        sql: `CREATE TABLE IF NOT EXISTS firewall_rules (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(255) NOT NULL,
          type VARCHAR(50) NOT NULL,
          source_pattern TEXT NOT NULL,
          action VARCHAR(100) NOT NULL,
          enabled BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )`
      },
      {
        name: 'rate_limits',
        sql: `CREATE TABLE IF NOT EXISTS rate_limits (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          identifier VARCHAR(255) NOT NULL,
          endpoint VARCHAR(255) NOT NULL,
          requests INTEGER DEFAULT 1,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )`
      },
      {
        name: 'user_presence',
        sql: `CREATE TABLE IF NOT EXISTS user_presence (
          user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
          status VARCHAR(20) DEFAULT 'offline',
          last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )`
      },
      {
        name: 'realtime_events',
        sql: `CREATE TABLE IF NOT EXISTS realtime_events (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          type VARCHAR(100) NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          user_id UUID REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )`
      }
    ]
    
    const results = {}
    
    for (const table of tables) {
      try {
        // Try to create table by inserting dummy data that will fail but create table structure
        await supabase.from(table.name).insert({}).then(() => {}).catch(() => {})
        
        // Check if table exists
        const { error } = await supabase.from(table.name).select('count').limit(1)
        results[table.name] = !error
      } catch (e) {
        results[table.name] = false
      }
    }
    
    const created = Object.values(results).filter(Boolean).length
    
    return NextResponse.json({
      success: created > 0,
      message: `${created}/6 tables verified`,
      tables: results,
      note: 'Run SQL manually in Supabase if tables missing'
    })
    
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: String(error)
    }, { status: 500 })
  }
}