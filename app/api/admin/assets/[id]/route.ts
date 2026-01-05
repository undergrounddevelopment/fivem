import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { validateAdminRole } from '@/lib/security'
import { updateAsset, deleteAsset } from '@/lib/database-direct'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!validateAdminRole(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const updates = await request.json()

    const asset = await updateAsset(id, updates)
    return NextResponse.json({ success: true, asset })
  } catch (error) {
    console.error('Asset update error:', error)
    return NextResponse.json({ error: 'Failed to update asset' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!validateAdminRole(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await deleteAsset(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Asset delete error:', error)
    return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 })
  }
}