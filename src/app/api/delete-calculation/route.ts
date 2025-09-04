import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const supabase = await createServiceRoleClient()

    // First, get the calculation to verify it exists and get the email
    const { data: calculation, error: fetchError } = await supabase
      .from('calculations')
      .select('email')
      .eq('id', id)
      .single()

    if (fetchError || !calculation) {
      return NextResponse.json({ error: 'Calculation not found' }, { status: 404 })
    }

    // Delete the calculation
    const { error: deleteError } = await supabase
      .from('calculations')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting calculation:', deleteError)
      return NextResponse.json({ error: 'Failed to delete calculation' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error deleting calculation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
