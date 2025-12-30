import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = createAdminClient()
    
    // Insert forum categories
    const categories = [
      { name: 'General Discussion', description: 'General FiveM discussions', slug: 'general', icon: 'message-circle', color: '#22C55E', sort_order: 1, is_active: true },
      { name: 'Help & Support', description: 'Get help with scripts', slug: 'help', icon: 'help-circle', color: '#F59E0B', sort_order: 2, is_active: true },
      { name: 'Script Requests', description: 'Request new scripts', slug: 'requests', icon: 'code', color: '#3B82F6', sort_order: 3, is_active: true },
      { name: 'Showcase', description: 'Show off your servers', slug: 'showcase', icon: 'star', color: '#EC4899', sort_order: 4, is_active: true },
    ]
    
    for (const cat of categories) {
      await supabase.from('forum_categories').upsert(cat, { onConflict: 'slug' })
    }
    
    // Insert sample assets
    const assets = [
      {
        title: 'QB Banking System',
        description: 'Advanced banking system',
        category: 'scripts',
        framework: 'qbcore',
        version: '1.0.0',
        coin_price: 0,
        status: 'active',
        downloads: 1250,
        likes: 89,
        is_verified: true,
        tags: ['banking', 'qbcore']
      }
    ]
    
    for (const asset of assets) {
      await supabase.from('assets').insert(asset)
    }
    
    // Insert spin prizes
    const prizes = [
      { name: '50 Coins', type: 'coins', value: 50, probability: 30, color: '#22C55E', sort_order: 1, is_active: true },
      { name: '100 Coins', type: 'coins', value: 100, probability: 25, color: '#3B82F6', sort_order: 2, is_active: true },
      { name: '250 Coins', type: 'coins', value: 250, probability: 15, color: '#8B5CF6', sort_order: 3, is_active: true },
      { name: '500 Coins', type: 'coins', value: 500, probability: 10, color: '#EC4899', sort_order: 4, is_active: true },
      { name: '1000 Coins', type: 'coins', value: 1000, probability: 5, color: '#EF4444', sort_order: 5, is_active: true },
      { name: 'Free Spin', type: 'ticket', value: 1, probability: 10, color: '#F59E0B', sort_order: 6, is_active: true },
      { name: 'Better Luck', type: 'nothing', value: 0, probability: 5, color: '#6B7280', sort_order: 7, is_active: true },
    ]
    
    for (const prize of prizes) {
      await supabase.from('spin_wheel_prizes').upsert(prize, { onConflict: 'name' })
    }
    
    return NextResponse.json({ success: true, message: 'Database seeded successfully' })
  } catch (error: any) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
