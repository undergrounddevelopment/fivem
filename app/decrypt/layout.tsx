import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "FiveM Decrypt CFX V7 - Free FiveM Script Decryptor Tool",
  description:
    "Free FiveM Decrypt CFX V7 Tool. Decrypt encrypted FiveM scripts, resources, and Lua files. Best FiveM decryptor with 98.5% success rate. Decrypt CFX.re protected scripts instantly.",
  keywords: [
    "fivem decrypt",
    "cfx decrypt",
    "fivem decryptor",
    "decrypt cfx v7",
    "fivem script decrypt",
    "fivem unlock",
    "fivem decrypt tool",
    "cfx.re decrypt",
    "fivem lua decrypt",
    "fivem resource decrypt",
    "fivem decrypt free",
    "fivem script unlocker",
    "fivem decrypt bot",
    "decrypt fivem scripts",
    "fivem decryption",
    "cfx decryptor",
  ],
  openGraph: {
    title: "FiveM Decrypt CFX V7 - Free Script Decryptor",
    description: "Decrypt FiveM scripts free. CFX V7 decryptor tool with 98.5% success rate.",
    images: ["https://r2.fivemanage.com/IKG5gF4pHPjLHEhuHxEh0/Untitleddesign-26.png"],
  },
}

export default function DecryptLayout({ children }: { children: React.ReactNode }) {
  return children
}
