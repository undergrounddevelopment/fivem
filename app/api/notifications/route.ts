import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }

  return NextResponse.json({ notifications: (data as any[]) || [] });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { notificationId, all } = await request.json();
  const supabase = getSupabaseAdminClient();

  let query = supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', session.user.id);

  if (all) {
    // Mark all as read
    query = query.eq('is_read', false);
  } else if (notificationId) {
    // Mark single as read
    query = query.eq('id', notificationId);
  } else {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { error } = await query;

  if (error) {
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
