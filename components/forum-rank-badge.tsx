import Image from 'next/image';

const ranks = [
  { level: 1, name: 'Newbie', badge_url: '/badges/rank_1.png' },
  { level: 2, name: 'Member', badge_url: '/badges/rank_2.png' },
  { level: 3, name: 'Active Member', badge_url: '/badges/rank_3.png' },
  { level: 4, name: 'Veteran', badge_url: '/badges/rank_4.png' },
  { level: 5, name: 'Legend', badge_url: '/badges/rank_5.png' },
];

interface ForumRankBadgeProps {
  level: number;
}

export function ForumRankBadge({ level }: ForumRankBadgeProps) {
  const rank = ranks.find(r => r.level === level) || ranks[0];

  return (
    <div className="flex items-center" title={`${rank.name} (Level ${rank.level})`}>
      <Image src={rank.badge_url} alt={rank.name} width={20} height={20} className="h-5 w-5" />
    </div>
  );
}
