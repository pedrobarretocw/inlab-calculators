import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { trackEventSchema } from '@/lib/schemas'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request body
    const validatedData = trackEventSchema.parse(body)
    
    // Get referrer from headers if not in body
    const referrer = validatedData.metadata?.referrer || request.headers.get('referer') || ''
    
    // Create server client with service role for writing
    const supabase = await createServiceRoleClient()
    
    // Insert event
    const { error } = await supabase
      .from('events')
      .insert({
        session_id: validatedData.sessionId,
        user_id: validatedData.userId,
        email: validatedData.email,
        calculator_slug: validatedData.calculatorSlug,
        variant: validatedData.variant,
        event: validatedData.event,
        article_slug: validatedData.articleSlug,
        referrer,
        metadata: validatedData.metadata,
        created_at: new Date().toISOString(),
      })
    
    if (error) {
      console.error('Error inserting event:', error)
      return NextResponse.json(
        { error: 'Failed to track event' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Track API error:', error)
    return NextResponse.json(
      { error: 'Invalid request data' },
      { status: 400 }
    )
  }
}
