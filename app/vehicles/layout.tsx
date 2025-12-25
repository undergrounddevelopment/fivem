import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "FiveM Vehicles Free Download - Cars, Bikes, Aircraft Pack",
  description:
    "Download free FiveM vehicles. Premium car packs, police vehicles, supercars, bikes, aircraft. FiveM addon vehicles, vehicle leak, car mods. Best FiveM vehicle collection.",
  keywords: [
    "fivem vehicles",
    "fivem cars",
    "fivem vehicles free",
    "fivem car pack",
    "fivem vehicle download",
    "fivem addon vehicles",
    "fivem car mods",
    "fivem police cars",
    "fivem supercars",
    "fivem bikes",
    "fivem aircraft",
    "gta v vehicles fivem",
    "fivem vehicle leak",
    "fivem car leak",
  ],
  openGraph: {
    title: "FiveM Vehicles Free - Cars, Bikes, Aircraft Downloads",
    description: "Free FiveM vehicles download. Car packs, police vehicles, supercars, bikes.",
  },
}

export default function VehiclesLayout({ children }: { children: React.ReactNode }) {
  return children
}
