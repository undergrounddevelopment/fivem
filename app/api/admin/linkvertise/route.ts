import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'linkvertise')
      .single();

    if (error) {
      console.error("Error fetching linkvertise settings:", error);
      
      // Capture error ke Sentry
      import('@sentry/nextjs').then(Sentry => {
        Sentry.captureException(error, {
          contexts: {
            admin: {
              userId: session.user.id,
              action: 'fetchLinkvertiseSettings'
            }
          }
        });
      });
      
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ settings: data?.value || { enabled: false, userId: '', authToken: '' } });
  } catch (error) {
    console.error("Error in GET linkvertise settings:", error);
    
    // Capture error ke Sentry
    import('@sentry/nextjs').then(Sentry => {
      Sentry.captureException(error, {
        contexts: {
          admin: {
            action: 'fetchLinkvertiseSettings'
          }
        }
      });
    });
    
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await req.json();
    const supabase = await createClient();

    const { error } = await supabase
      .from('site_settings')
      .upsert({
        key: 'linkvertise',
        value: settings,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error("Error updating linkvertise settings:", error);
      
      // Capture error ke Sentry
      import('@sentry/nextjs').then(Sentry => {
        Sentry.captureException(error, {
          contexts: {
            admin: {
              userId: session.user.id,
              action: 'updateLinkvertiseSettings'
            }
          }
        });
      });
      
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in POST linkvertise settings:", error);
    
    // Capture error ke Sentry
    import('@sentry/nextjs').then(Sentry => {
      Sentry.captureException(error, {
        contexts: {
          admin: {
            action: 'updateLinkvertiseSettings'
          }
        }
      });
    });
    
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}