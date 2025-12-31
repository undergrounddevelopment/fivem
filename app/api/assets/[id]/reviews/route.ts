import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// GET handler for fetching reviews
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('asset_reviews')
    .select('*')
    .eq('asset_id', params.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }

  const rows = data || []
  const userIds = Array.from(new Set(rows.map((r: any) => r.user_id).filter(Boolean)))

  const { data: users } = userIds.length
    ? await supabase.from('users').select('discord_id, username, avatar').in('discord_id', userIds)
    : { data: [] as any[] }

  const usersByDiscordId = new Map<string, any>()
  for (const u of users || []) usersByDiscordId.set(u.discord_id, u)

  const hydrated = rows.map((r: any) => ({
    ...r,
    users: usersByDiscordId.get(r.user_id) || { username: 'Unknown', avatar: null },
  }))

  return NextResponse.json({ reviews: hydrated });
}

// POST handler for submitting a new review
const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10).max(1000),
});

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const validation = reviewSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ error: validation.error.errors }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();

  // Check if user has downloaded the asset
  const { data: download } = await supabase
    .from('downloads')
    .select('id')
    .eq('user_id', session.user.id)
    .eq('asset_id', params.id)
    .limit(1)
    .single();

  if (!download) {
    return NextResponse.json({ error: 'You must download the asset to leave a review.' }, { status: 403 });
  }

  const { error } = await supabase.from('asset_reviews').upsert({
    asset_id: params.id,
    user_id: session.user.id,
    rating: validation.data.rating,
    comment: validation.data.comment,
  });

  if (error) {
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }

  // Create a notification for the asset author
  const { data: asset } = await supabase.from('assets').select('author_id, title').eq('id', params.id).single();
  if (asset && asset.author_id !== session.user.id) {
    const primaryPayload: any = {
      user_id: asset.author_id,
      type: 'system',
      title: 'New Review',
      message: `Your asset "${asset.title || 'your asset'}" received a new review.`,
      link: `/asset/${params.id}`,
      is_read: false,
    }

    const { error: notifError } = await supabase.from('notifications').insert(primaryPayload)

    if (notifError) {
      // ignore notification failure
    }
  }

  return NextResponse.json({ success: true });
}
