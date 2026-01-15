import { NextRequest, NextResponse } from 'next/server';
import { verifyLinkvertiseHash, logDownloadAttempt } from '@/lib/linkvertise';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const hash = req.nextUrl.searchParams.get('hash');
  const supabase = await createClient();

  const { data: asset } = await supabase
    .from('assets')
    .select('*, require_linkvertise')
    .eq('id', id)
    .single();

  if (!asset) {
    return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
  }

  const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';

  // Check global settings
  const { data: settings } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'linkvertise')
    .single();

  const isGlobalEnabled = settings?.value?.enabled;
  
  // Only enforce if globally enabled
  if (isGlobalEnabled && asset.require_linkvertise) {
    if (hash) {
      const verified = await verifyLinkvertiseHash(hash);

      await logDownloadAttempt(
        id,
        session.user.id as string,
        Boolean(verified),
        hash,
        'Linkvertise verification'
      );

      if (!verified) {
        return NextResponse.json({ error: 'Invalid or expired hash' }, { status: 403 });
      }
    } else {
      await logDownloadAttempt(
        id,
        session.user.id,
        false,
        null,
        `Missing hash (IP: ${ipAddress})`
      );
      return NextResponse.json({ error: 'Hash required' }, { status: 403 });
    }
  }

  // Generate signed download token
  const { generateDownloadToken } = await import('@/lib/token');
  const token = generateDownloadToken(session.user.id, id);

  return NextResponse.redirect(new URL(`/api/download/${id}?token=${token}`, req.url));
}
