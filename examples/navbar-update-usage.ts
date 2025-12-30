// Example: Update navbar after coin transaction

import { triggerCoinsUpdate, triggerUserUpdate } from '@/components/use-user-updates'

// Example 1: After download (coins deducted)
async function handleDownload(assetId: string) {
  const response = await fetch('/api/download/' + assetId, { method: 'POST' })
  if (response.ok) {
    triggerCoinsUpdate() // Navbar updates instantly
  }
}

// Example 2: After profile update
async function handleProfileUpdate(data: any) {
  const response = await fetch('/api/profile/update', {
    method: 'POST',
    body: JSON.stringify(data)
  })
  if (response.ok) {
    triggerUserUpdate() // Navbar updates instantly
  }
}

// Example 3: After spin wheel
async function handleSpin() {
  const response = await fetch('/api/spin-wheel/spin', { method: 'POST' })
  if (response.ok) {
    triggerCoinsUpdate() // Navbar updates instantly
  }
}
