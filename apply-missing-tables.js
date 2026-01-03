// AUTO-APPLY MISSING TABLES TO SUPABASE
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://linnqtixdfjwbrixitrb.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpbm5xdGl4ZGZqd2JyaXhpdHJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTIxMjg1MiwiZXhwIjoyMDgwNzg4ODUyfQ.Rri9zq0S-Y4nRpwkuiHp1GsZJXAsL-6-xpqJ1fAP3KE'

const SQL_QUERIES = [
  // Admin Actions
  `CREATE TABLE IF NOT EXISTS admin_actions (
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
  );`,
  
  // Security Events
  `CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    source_ip INET,
    target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'investigating')),
    automated_response BOOLEAN DEFAULT FALSE,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );`,
  
  // Firewall Rules
  `CREATE TABLE IF NOT EXISTS firewall_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('allow', 'deny', 'rate_limit')),
    source_pattern TEXT NOT NULL,
    target_pattern TEXT,
    action VARCHAR(100) NOT NULL,
    priority INTEGER DEFAULT 100,
    enabled BOOLEAN DEFAULT TRUE,
    hit_count INTEGER DEFAULT 0,
    last_hit TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );`,
  
  // Rate Limits
  `CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    identifier VARCHAR(255) NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    requests INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    blocked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(identifier, endpoint)
  );`,
  
  // User Presence
  `CREATE TABLE IF NOT EXISTS user_presence (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'away', 'busy', 'offline')),
    current_page VARCHAR(255),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );`,
  
  // Realtime Events
  `CREATE TABLE IF NOT EXISTS realtime_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    broadcast BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );`
]

async function createMissingTables() {
  console.log('🔧 CREATING MISSING ADVANCED TABLES...\n')
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  
  let success = 0
  let failed = 0
  
  for (let i = 0; i < SQL_QUERIES.length; i++) {
    const query = SQL_QUERIES[i]
    const tableName = query.match(/CREATE TABLE IF NOT EXISTS (\w+)/)[1]
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: query })
      
      if (error) {
        console.log(`❌ ${tableName}: ${error.message}`)
        failed++
      } else {
        console.log(`✅ ${tableName}: Created successfully`)
        success++
      }
    } catch (e) {
      console.log(`❌ ${tableName}: ${e.message}`)
      failed++
    }
  }
  
  console.log(`\n📊 RESULTS: ${success} success, ${failed} failed`)
  
  if (success === SQL_QUERIES.length) {
    console.log('🎉 ALL ADVANCED TABLES CREATED!')
    console.log('✅ Admin Panel: READY')
    console.log('✅ Real-time System: READY') 
    console.log('✅ Security Monitoring: READY')
  }
  
  // Verify tables exist
  console.log('\n🔍 VERIFYING TABLES...')
  const tables = ['admin_actions', 'security_events', 'firewall_rules', 'rate_limits', 'user_presence', 'realtime_events']
  
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('count').limit(1)
      console.log(`${error ? '❌' : '✅'} ${table}`)
    } catch (e) {
      console.log(`❌ ${table}`)
    }
  }
}

createMissingTables().catch(console.error)