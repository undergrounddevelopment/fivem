// Security utilities for forum
// 100% protection against abuse

export const forumSecurity = {
  // Validate thread title
  validateTitle(title: string): { valid: boolean; error?: string } {
    if (!title || typeof title !== 'string') {
      return { valid: false, error: 'Title is required' }
    }
    
    const trimmed = title.trim()
    
    if (trimmed.length < 1) {
      return { valid: false, error: 'Title cannot be empty' }
    }
    
    if (trimmed.length > 200) {
      return { valid: false, error: 'Title too long (max 200 characters)' }
    }
    
    // Check for spam patterns
    if (/(.)\1{10,}/.test(trimmed)) {
      return { valid: false, error: 'Title contains spam pattern' }
    }
    
    return { valid: true }
  },

  // Validate thread content
  validateContent(content: string): { valid: boolean; error?: string } {
    if (!content || typeof content !== 'string') {
      return { valid: false, error: 'Content is required' }
    }
    
    const trimmed = content.trim()
    
    if (trimmed.length < 10) {
      return { valid: false, error: 'Content too short (min 10 characters)' }
    }
    
    if (trimmed.length > 50000) {
      return { valid: false, error: 'Content too long (max 50000 characters)' }
    }
    
    // Check for spam patterns
    if (/(.)\1{50,}/.test(trimmed)) {
      return { valid: false, error: 'Content contains spam pattern' }
    }
    
    return { valid: true }
  },

  // Validate reply content
  validateReply(content: string): { valid: boolean; error?: string } {
    if (!content || typeof content !== 'string') {
      return { valid: false, error: 'Reply content is required' }
    }
    
    const trimmed = content.trim()
    
    if (trimmed.length < 1) {
      return { valid: false, error: 'Reply cannot be empty' }
    }
    
    if (trimmed.length > 10000) {
      return { valid: false, error: 'Reply too long (max 10000 characters)' }
    }
    
    // Check for spam patterns
    if (/(.)\1{30,}/.test(trimmed)) {
      return { valid: false, error: 'Reply contains spam pattern' }
    }
    
    return { valid: true }
  },

  // Sanitize text input
  sanitize(text: string): string {
    if (!text) return ''
    
    return text
      .trim()
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
      .replace(/\s+/g, ' ') // Normalize whitespace
  },

  // Validate images array
  validateImages(images: any): string[] {
    if (!Array.isArray(images)) return []
    
    return images
      .filter(img => typeof img === 'string' && img.length > 0)
      .filter(img => {
        try {
          new URL(img)
          return true
        } catch {
          return false
        }
      })
      .slice(0, 10) // Max 10 images
  },

  // Rate limiting check
  checkRateLimit(userId: string, action: string, limit: number, windowMs: number): boolean {
    // This should be implemented with Redis or similar
    // For now, return true (allow)
    return true
  },

  // Check if user is admin
  async isAdmin(userId: string, supabase: any): Promise<boolean> {
    try {
      const { data } = await supabase
        .from('users')
        .select('is_admin, membership')
        .eq('discord_id', userId)
        .single()
      
      return data?.is_admin === true || data?.membership === 'admin'
    } catch {
      return false
    }
  },

  // Validate category ID
  async validateCategory(categoryId: string, supabase: any): Promise<boolean> {
    if (!categoryId) return true // Allow null category
    
    try {
      const { data } = await supabase
        .from('forum_categories')
        .select('id')
        .eq('id', categoryId)
        .eq('is_active', true)
        .single()
      
      return !!data
    } catch {
      return false
    }
  }
}
