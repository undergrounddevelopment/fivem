import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "FiveM MLO Free Download - Maps, Interiors, YMAP",
  description:
    "Download free FiveM MLO maps and interiors. Premium MLO leak, custom interiors, YMAP files. Best FiveM map mods, building interiors, police stations, hospitals, houses.",
  keywords: [
    "fivem mlo",
    "fivem mlo free",
    "fivem mlo download",
    "fivem maps",
    "fivem interior",
    "fivem mlo leak",
    "fivem ymap",
    "fivem map mods",
    "gta v mlo",
    "fivem custom maps",
    "fivem mlo pack",
    "fivem buildings",
    "fivem police station mlo",
    "fivem hospital mlo",
    "fivem house mlo",
  ],
  openGraph: {
    title: "FiveM MLO Free - Maps, Interiors, YMAP Downloads",
    description: "Free FiveM MLO maps download. Custom interiors, YMAP, premium MLO leak.",
  },
}

export default function MloLayout({ children }: { children: React.ReactNode }) {
  return children
}
