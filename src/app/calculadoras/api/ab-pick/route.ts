import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const calculatorSlug = searchParams.get('calculator')
    
    const supabase = await createServiceRoleClient()
    
    // Get active variants for the calculator (or all if no calculator specified)
    const query = supabase
      .from('ab_variants')
      .select('*')
      .eq('active', true)
    
    if (calculatorSlug) {
      query.eq('calculator_slug', calculatorSlug)
    }
    
    const { data: variants, error } = await query
    
    if (error) {
      console.error('Error fetching variants:', error)
      return NextResponse.json(
        { error: 'Failed to fetch variants' },
        { status: 500 }
      )
    }
    
    if (!variants || variants.length === 0) {
      return NextResponse.json(
        { error: 'No active variants found' },
        { status: 404 }
      )
    }
    
    // Weighted random selection
    const totalWeight = variants.reduce((sum, variant) => sum + variant.weight, 0)
    const random = Math.random() * totalWeight
    
    let currentWeight = 0
    let selectedVariant = variants[0] // fallback
    
    for (const variant of variants) {
      currentWeight += variant.weight
      if (random <= currentWeight) {
        selectedVariant = variant
        break
      }
    }
    
    return NextResponse.json({
      variant: selectedVariant.variant,
      calculator_slug: selectedVariant.calculator_slug,
    }, {
      headers: {
        // Cache for a short time to reduce DB load
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })
    
  } catch (error) {
    console.error('A/B Pick API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
