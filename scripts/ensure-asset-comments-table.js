require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function ensureTable() {
  console.log('🔍 Checking asset_comments table...\n')
  
  // Check if table exists
  const { data, error } = await supabase
    .from('asset_comments')
    .select('id')
    .limit(1)
  
  if (error && error.message.includes('does not exist')) {
    console.log('❌ Table does not exist!')
    console.log('\n📋 Run this SQL in Supabase SQL Editor:\n')
    console.log(`
-- Create asset_comments table
CREATE TABLE IF NOT EXISTS asset_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL,
  user_id TEXT NOT NULL,
  comment TEXT,
  content TEXT,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_asset_comments_asset_id ON asset_comments(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_comments_user_id ON asset_comments(user_id);
    `)
    return
  }
  
  if (error) {
    console.log('❌ Error:', error.message)
    return
  }
  
  console.log('✅ Table exists!')
  
  // Check columns
  const { data: sample } = await supabase
    .from('asset_comments')
    .select('*')
    .limit(1)
  
  if (sample && sample.length > 0) {
    console.log('\n📋 Table columns:', Object.keys(sample[0]).join(', '))
  } else {
    console.log('\n📋 Table is empty (no sample data)')
  }
  
  console.log('\n✅ asset_comments table is ready!')
}

ensureTable().catch(console.error)
