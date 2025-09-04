import { NextRequest, NextResponse } from 'next/server'
import { addEmailToActiveCampaign } from '@/lib/activecampaign'

export async function POST(request: NextRequest) {
  try {
    
    const { email, firstName, lastName, phone } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      )
    }
    
    // Processando email no ActiveCampaign
    
    const result = await addEmailToActiveCampaign(email, firstName, lastName, phone)
    
    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: `Erro interno: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
      },
      { status: 500 }
    )
  }
}

