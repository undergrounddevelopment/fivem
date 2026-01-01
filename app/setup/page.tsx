import { Metadata } from "next"
import SetupClient from "@/components/setup-client"

export const metadata: Metadata = {
  title: "Setup - FiveM Tools",
  description: "Setup your FiveM Tools marketplace",
}

export default function SetupPage() {
  return <SetupClient />
}
