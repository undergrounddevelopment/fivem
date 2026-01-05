"use client"

// Event Lucky Spin sudah berakhir - komponen dinonaktifkan

export function DailySpinTicket({ 
  open, 
  onOpenChange,
  onClaimSuccess
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void
  onClaimSuccess?: (newTicketCount: number) => void
}) {
  // Event sudah berakhir - tidak menampilkan dialog
  return null
}