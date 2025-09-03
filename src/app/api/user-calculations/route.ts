import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const email = searchParams.get('email')

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  const supabase = await createServiceRoleClient()

  const { data: calculations, error } = await supabase
    .from('calculations')
    .select('*')
    .eq('email', email)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Error fetching calculations:', error)
    return NextResponse.json({ error: 'Failed to fetch calculations' }, { status: 500 })
  }

  return NextResponse.json({ calculations })
}
