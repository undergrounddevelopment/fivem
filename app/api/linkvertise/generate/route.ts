import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateLinkvertiseUrl } from '@/lib/linkvertise';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  let assetId: string | undefined
  let sessionUserId: string | undefined

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    sessionUserId = (session.user as any)?.id

    const body = await req.json();
    assetId = body?.assetId
    const supabase = await createClient();

    const { data: settings } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'linkvertise')
      .single();

    const targetUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/linkvertise/download/${assetId}`;

    if (!settings?.value?.enabled || !settings?.value?.userId) {
       // Fallback: If disabled, return the target URL directly (which will skip verification if we update that route too)
       return NextResponse.json({ url: targetUrl });
    }
    const linkvertiseUrl = generateLinkvertiseUrl(settings.value.userId, targetUrl);

    return NextResponse.json({ url: linkvertiseUrl });
  } catch (error) {
    console.error('Error generating Linkvertise URL:', error);
    
    // Report error to Sentry
    import('@sentry/nextjs').then(Sentry => {
      Sentry.captureException(error, {
        contexts: {
          linkvertise: {
            assetId,
            userId: sessionUserId,
            action: 'generateLink'
          }
        }
      });
    });
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
