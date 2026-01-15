import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// GET - Fetch recent reviews with manual joining of user and asset data
export async function GET(request: NextRequest) {
  try {
    // 1. Fetch reviews that have an asset_id
    const { data: reviews, error: reviewsError } = await supabase
      .from('testimonials')
      .select('id, rating, comment, created_at, user_id, asset_id')
      .not('asset_id', 'is', null) // Only reviews linked to an asset
      .order('created_at', { ascending: false })
      .limit(20)

    if (reviewsError) {
      console.error('[API Recent Reviews] Error fetching reviews:', reviewsError)
      return NextResponse.json({ reviews: [] })
    }

    if (!reviews || reviews.length === 0) {
      return NextResponse.json({ reviews: [] })
    }

    // 2. Extract IDs for manual join (filter out null/undefined)
    const userIds = [...new Set(reviews.map((r: any) => r.user_id).filter(Boolean))]
    const assetIds = [...new Set(reviews.map((r: any) => r.asset_id).filter(Boolean))]

    // 3. Fetch related Users and Assets in parallel
    const [usersResponse, assetsResponse] = await Promise.all([
      userIds.length > 0
        ? supabase.from('users').select('id, username, avatar').in('id', userIds)
        : Promise.resolve({ data: [] }),
      assetIds.length > 0
        ? supabase.from('assets').select('id, title, thumbnail_url').in('id', assetIds)
        : Promise.resolve({ data: [] })
    ])

    const usersMap = new Map((usersResponse.data || []).map((u: any) => [u.id, u]))
    const assetsMap = new Map((assetsResponse.data || []).map((a: any) => [a.id, a]))

    // 4. Map data back to reviews
    const formattedReviews = reviews.map((review: any) => {
      const user = review.user_id ? usersMap.get(review.user_id) : null
      const asset = review.asset_id ? assetsMap.get(review.asset_id) : null

      return {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
        user: {
          name: user?.username || 'Anonymous',
          avatar: user?.avatar
        },
        asset: {
          title: asset?.title || 'Unknown Asset',
          thumbnail: asset?.thumbnail_url
        }
      }
    })

    return NextResponse.json({ reviews: formattedReviews })
  } catch (error) {
    console.error('[API Recent Reviews] General Error:', error)
    return NextResponse.json({ reviews: [] })
  }
}

