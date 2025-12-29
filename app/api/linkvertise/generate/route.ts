import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateLinkvertiseUrl } from '@/lib/linkvertise';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { assetId } = await req.json();
    const supabase = await createClient();

    const { data: settings } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'linkvertise')
      .single();

    if (!settings?.value?.enabled || !settings?.value?.userId) {
      // Report to Sentry
      import('@sentry/nextjs').then(Sentry => {
        Sentry.captureMessage('Linkvertise not configured properly', {
          contexts: {
            linkvertise: {
              assetId,
              userId: session.user.id,
              action: 'generateLink'
            }
          }
        });
      });
      
      return NextResponse.json({ error: 'Linkvertise not configured' }, { status: 400 });
    }

    const targetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/linkvertise/download/${assetId}`;
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
            userId: session?.user?.id,
            action: 'generateLink'
          }
        }
      });
    });
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}