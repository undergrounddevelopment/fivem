// Automatic Webhook Triggers - Smart notification system
// Sistem otomatis untuk trigger webhook berdasarkan events dan milestones

import { createClient } from "@supabase/supabase-js"
import { notifyTrending, notifyMilestone, notifyNewMember } from "./discord-advanced-webhook"

// Initialize Supabase client
function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

// Milestone thresholds
const MILESTONE_THRESHOLDS = [100, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000]

// Trending criteria
const TRENDING_CRITERIA = {
  minDownloads: 50,
  minViews: 200,
  minRating: 4.0,
  timeWindow: 24 // hours
}

/**
 * Check dan trigger milestone notifications
 */
export async function checkMilestones(assetId: string, newDownloadCount: number): Promise<void> {
  try {
    const supabase = getSupabaseClient()
    
    // Get asset details
    const { data: asset, error } = await supabase
      .from('assets')
      .select('*, users(username)')
      .eq('id', assetId)
      .single()
    
    if (error || !asset) {
      console.error('Failed to get asset for milestone check:', error)
      return
    }

    // Check if any milestone was reached
    const previousDownloads = newDownloadCount - 1 // Assuming increment by 1
    
    for (const milestone of MILESTONE_THRESHOLDS) {
      if (previousDownloads < milestone && newDownloadCount >= milestone) {
        console.log(`🏆 Milestone reached: ${milestone} downloads for asset ${assetId}`)
        
        // Prepare asset data for webhook
        const assetData = {
          id: asset.id,
          title: asset.title,
          category: asset.category,
          author_name: asset.users?.username || 'Unknown',
          thumbnail: asset.thumbnail
        }
        
        // Send milestone notification
        await notifyMilestone(assetData, milestone)
        
        // Log milestone achievement
        await supabase.from('milestones').insert({
          asset_id: assetId,
          milestone_type: 'downloads',
          milestone_value: milestone,
          achieved_at: new Date().toISOString()
        })
        
        break // Only notify for the first milestone reached
      }
    }
  } catch (error) {
    console.error('Error checking milestones:', error)
  }
}

/**
 * Check dan trigger trending notifications
 */
export async function checkTrending(): Promise<void> {
  try {
    const supabase = getSupabaseClient()
    
    // Get assets with high activity in last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    
    const { data: trendingAssets, error } = await supabase
      .from('assets')
      .select(`
        *,
        users(username),
        asset_views(count),
        asset_downloads(count)
      `)
      .gte('created_at', twentyFourHoursAgo)
      .gte('downloads', TRENDING_CRITERIA.minDownloads)
      .gte('rating', TRENDING_CRITERIA.minRating)
      .eq('status', 'approved')
      .order('downloads', { ascending: false })
      .limit(5)
    
    if (error) {
      console.error('Failed to get trending assets:', error)
      return
    }

    for (const asset of trendingAssets || []) {
      // Check if already notified as trending today
      const { data: existingNotification } = await supabase
        .from('trending_notifications')
        .select('id')
        .eq('asset_id', asset.id)
        .gte('created_at', twentyFourHoursAgo)
        .single()
      
      if (existingNotification) {
        continue // Already notified today
      }
      
      // Calculate trending score
      const trendingScore = calculateTrendingScore(asset)
      
      if (trendingScore > 100) { // Threshold for trending
        console.log(`🔥 Asset trending: ${asset.title} (score: ${trendingScore})`)
        
        // Prepare data for webhook
        const assetData = {
          id: asset.id,
          title: asset.title,
          category: asset.category,
          coin_price: asset.coin_price,
          thumbnail: asset.thumbnail
        }
        
        const stats = {
          views: asset.views || 0,
          downloads: asset.downloads || 0,
          rating: asset.rating || 0
        }
        
        // Send trending notification
        await notifyTrending(assetData, stats)
        
        // Log trending notification
        await supabase.from('trending_notifications').insert({
          asset_id: asset.id,
          trending_score: trendingScore,
          created_at: new Date().toISOString()
        })
      }
    }
  } catch (error) {
    console.error('Error checking trending:', error)
  }
}

/**
 * Calculate trending score based on various factors
 */
function calculateTrendingScore(asset: any): number {
  const downloads = asset.downloads || 0
  const views = asset.views || 0
  const rating = asset.rating || 0
  const ratingCount = asset.rating_count || 0
  
  // Age factor (newer assets get boost)
  const ageInHours = (Date.now() - new Date(asset.created_at).getTime()) / (1000 * 60 * 60)
  const ageFactor = Math.max(0, 1 - (ageInHours / 168)) // Boost for first week
  
  // Calculate score
  let score = 0
  score += downloads * 2 // Downloads are most important
  score += views * 0.1 // Views contribute less
  score += rating * ratingCount * 5 // Rating quality matters
  score += ageFactor * 50 // New asset boost
  
  return Math.round(score)
}

/**
 * Trigger new member notification
 */
export async function triggerNewMemberNotification(userId: string): Promise<void> {
  try {
    const supabase = getSupabaseClient()
    
    // Get user details
    const { data: user, error } = await supabase
      .from('users')
      .select('username, avatar, created_at')
      .eq('id', userId)
      .single()
    
    if (error || !user) {
      console.error('Failed to get user for new member notification:', error)
      return
    }
    
    // Check if user is actually new (registered in last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    
    if (user.created_at > oneHourAgo) {
      console.log(`👋 New member joined: ${user.username}`)
      
      // Send new member notification
      await notifyNewMember({
        username: user.username,
        avatar: user.avatar
      })
    }
  } catch (error) {
    console.error('Error triggering new member notification:', error)
  }
}

/**
 * Auto-trigger system - runs periodically
 */
export async function runAutoTriggers(): Promise<void> {
  console.log('🤖 Running auto webhook triggers...')
  
  try {
    // Check for trending assets
    await checkTrending()
    
    // Additional periodic checks can be added here
    console.log('✅ Auto triggers completed')
  } catch (error) {
    console.error('❌ Auto triggers failed:', error)
  }
}

/**
 * Setup periodic triggers (call this on app startup)
 */
export function setupPeriodicTriggers(): void {
  if (typeof window !== 'undefined') {
    // Don't run on client side
    return
  }
  
  // Run trending check every hour
  setInterval(async () => {
    await runAutoTriggers()
  }, 60 * 60 * 1000) // 1 hour
  
  console.log('🤖 Periodic webhook triggers setup complete')
}

/**
 * Manual trigger for testing
 */
export async function manualTriggerTest(): Promise<void> {
  console.log('🧪 Running manual trigger test...')
  
  try {
    const supabase = getSupabaseClient()
    
    // Get a sample asset for testing
    const { data: asset } = await supabase
      .from('assets')
      .select('*, users(username)')
      .eq('status', 'approved')
      .order('downloads', { ascending: false })
      .limit(1)
      .single()
    
    if (asset) {
      // Test trending notification
      await notifyTrending(
        {
          id: asset.id,
          title: asset.title + ' (TEST)',
          category: asset.category,
          coin_price: asset.coin_price,
          thumbnail: asset.thumbnail
        },
        {
          views: asset.views || 100,
          downloads: asset.downloads || 50,
          rating: asset.rating || 4.5
        }
      )
      
      console.log('✅ Manual trigger test completed')
    }
  } catch (error) {
    console.error('❌ Manual trigger test failed:', error)
  }
}