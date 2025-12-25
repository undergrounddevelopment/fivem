import { SeasonalElectricCard } from "@/components/seasonal-electric-card"

export default function SeasonalCardDemo() {
  return (
    <SeasonalElectricCard>
      <div className="flex flex-col gap-4">
        <p className="text-white/80 text-sm">
          This card automatically changes theme based on the current season/holiday.
        </p>
        <p className="text-white/60 text-xs">
          Move your mouse to see 3D effects!
        </p>
      </div>
    </SeasonalElectricCard>
  )
}
