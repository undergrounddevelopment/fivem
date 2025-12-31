import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ProfileView from './profile-view';
import { getSupabaseAdminClient } from '@/lib/supabase/server';

type Props = {
  params: { id: string };
};

async function getProfileData(id: string) {
  const supabase = getSupabaseAdminClient();

  const { data: user, error: userError } = await supabase.from("users").select("*").eq("discord_id", id).single();
  if (userError || !user) return null;

  const { data: ranks, error: ranksError } = await supabase.from("forum_ranks").select("*").order('level', { ascending: true });
  const currentRank = ranks?.find(r => r.level === user.level) || { name: 'Newbie', badge_url: '/badges/rank_1.png' };

  const [assetsRes, threadsRes, assetCountRes, downloadCountRes, threadCountRes, likeCountRes] = await Promise.all([
    supabase.from('assets').select('*').eq('author_id', id).eq('status', 'active').order('created_at', { ascending: false }).limit(10),
    supabase.from('forum_threads').select('*').eq('author_id', id).eq('is_deleted', false).order('created_at', { ascending: false }).limit(10),
    supabase.from('assets').select('*', { count: 'exact', head: true }).eq('author_id', id).eq('status', 'active'),
    supabase.from('downloads').select('*', { count: 'exact', head: true }).eq('user_id', id),
    supabase.from('forum_threads').select('*', { count: 'exact', head: true }).eq('author_id', id),
    supabase.from('likes').select('*', { count: 'exact', head: true }).eq('user_id', id),
  ]);

  return {
    user: { ...user, rank: currentRank },
    assets: assetsRes.data || [],
    threads: threadsRes.data || [],
    stats: {
      totalUploads: assetCountRes.count || 0,
      totalDownloads: downloadCountRes.count || 0,
      totalPosts: threadCountRes.count || 0,
      likeCount: likeCountRes.count || 0,
    },
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profileData = await getProfileData(params.id);

  if (!profileData?.user) {
    return { title: 'User Not Found' };
  }

  return {
    title: `${profileData.user.username}'s Profile - FiveM Tools`,
    description: `View the profile, assets, and forum activity of ${profileData.user.username}.`,
  };
}

export default async function ProfilePage({ params }: Props) {
  const profileData = await getProfileData(params.id);

  if (!profileData) {
    notFound();
  }

  return <ProfileView profileData={profileData} />;
}
