import Image from 'next/image';
import { BADGE_TIERS } from '@/lib/xp-badges';

interface ForumRankBadgeProps {
  level: number;
}

export function ForumRankBadge({ level }: ForumRankBadgeProps) {
  // Find highest tier applicable, or default to the first one
  const rank = BADGE_TIERS.slice().reverse().find(b => level >= b.tier) || BADGE_TIERS[0];

  return (
    <div className="flex items-center" title={`${rank.name} (Level ${level})`}>
      <div className="relative w-5 h-5">
        <Image 
          src={rank.icon} 
          alt={rank.name} 
          fill
          className="object-contain" // Use object-contain to preserve aspect ratio
          unoptimized
        />
      </div>
    </div>
  );
}
