import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { saveCalculationSchema } from '@/lib/schemas'
import { getCurrentUser } from '@/lib/clerk'

export async function POST(request: NextRequest) {
  try {
    console.log('[Save Calculation] Request received')
    const body = await request.json()
    console.log('[Save Calculation] Request body:', body)
    
    // Validate the request body
    const validatedData = saveCalculationSchema.parse(body)
    console.log('[Save Calculation] Data validated successfully')
    
    // Get user info (supports mock in development)
    const { userId } = await getCurrentUser()
    
    // Create server client with service role for writing
    const supabase = await createServiceRoleClient()
    
    // Start a transaction-like operation
    const operations = []
    
    // 1. Save the calculation
    operations.push(
      supabase.from('calculations').insert({
        session_id: validatedData.sessionId,
        user_id: userId,
        email: validatedData.email,
        calculator_slug: validatedData.calculatorSlug,
        name: validatedData.name,
        inputs: validatedData.inputs,
        outputs: validatedData.outputs,
        created_at: new Date().toISOString(),
      })
    )
    
    // 2. Upsert lead (if email provided and not authenticated)
    if (validatedData.email && !userId) {
      operations.push(
        supabase.from('leads').upsert({
          email: validatedData.email,
          status: 'unverified',
        }, {
          onConflict: 'email',
          ignoreDuplicates: true,
        })
      )
    }
    
    // Execute operations
    const results = await Promise.all(operations)
    
    // Check for errors
    const errors = results.filter(result => result.error)
    if (errors.length > 0) {
      console.error('Error saving calculation:', errors)
      return NextResponse.json(
        { error: 'Failed to save calculation' },
        { status: 500 }
      )
    }
    
    // Determine response based on authentication status
    if (userId) {
      // User is authenticated, calculation saved
      return NextResponse.json({ 
        success: true,
        status: 'saved',
        redirectUrl: '/calculadoras/usuarios'
      })
    } else {
      // User not authenticated, send email link
      return NextResponse.json({ 
        success: true,
        status: 'email_required',
        message: 'Cálculo salvo! Verifique seu email para acessar o dashboard.',
        // In production, you'd trigger Clerk's email link here
        // For now, we'll return a placeholder
        emailLinkSent: true
      })
    }
    
  } catch (error) {
    console.error('Save Calculation API error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
