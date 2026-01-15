import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Ban Rules
const RULES = {
  SPAM_THRESHOLD: 5, // Max comments per minute
  PROHIBITED_WORDS: ['scam', 'cheat', 'hack', 'free money', 'discord.gg/malicious'],
  SPIN_ABUSE_THRESHOLD: 10 // Max spins per minute (unrealistic)
}

export async function checkAutoBan(userId: string, content?: string, type: 'comment' | 'spin' = 'comment') {
  try {
    // 1. Check Content for Prohibited Words
    if (content) {
      const lowerContent = content.toLowerCase()
      const hasProhibitedWord = RULES.PROHIBITED_WORDS.some(word => lowerContent.includes(word))
      
      if (hasProhibitedWord) {
        await banUser(userId, `Auto-Ban: Detected prohibited content in ${type}`)
        return true
      }
    }

    // 2. Rate Limiting (Spam Check)
    const now = new Date()
    const oneMinuteAgo = new Date(now.getTime() - 60000).toISOString()

    let count = 0
    if (type === 'comment') {
        const { count: commentCount } = await supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .gte('created_at', oneMinuteAgo)
        
        count = commentCount || 0
        if (count >= RULES.SPAM_THRESHOLD) {
            await banUser(userId, 'Auto-Ban: Comment spamming detected')
            return true
        }
    } else if (type === 'spin') {
        const { count: spinCount } = await supabase
            .from('spin_history')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .gte('created_at', oneMinuteAgo)

        count = spinCount || 0
        if (count >= RULES.SPIN_ABUSE_THRESHOLD) {
            await banUser(userId, 'Auto-Ban: Spin wheel abuse detected')
            return true
        }
    }

    return false
  } catch (error) {
    console.error('Auto-ban check error:', error)
    return false
  }
}

async function banUser(userId: string, reason: string) {
    console.log(`[Auto-Ban] Banning user ${userId} for: ${reason}`)
    
    // 1. Set user as banned
    await supabase.from('users').update({
        is_banned: true,
        ban_reason: reason,
        updated_at: new Date().toISOString()
    }).eq('id', userId)

    // 2. Log activity
    await supabase.from('activities').insert({
        user_id: userId, // Assuming activity requires user_id
        type: 'system_ban',
        description: `User auto-banned: ${reason}`,
        created_at: new Date().toISOString()
    })
}
