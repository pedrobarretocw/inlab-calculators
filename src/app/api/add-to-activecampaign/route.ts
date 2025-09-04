import { NextRequest, NextResponse } from 'next/server'
import { addEmailToActiveCampaign } from '@/lib/activecampaign'

export async function POST(request: NextRequest) {
  try {
    console.log('[API] ActiveCampaign - Iniciando processamento')
    
    const { email, firstName, lastName, phone } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      )
    }
    
    console.log(`[API] ActiveCampaign - Processando email: ${email}`)
    
    const result = await addEmailToActiveCampaign(email, firstName, lastName, phone)
    
    if (result.success) {
      console.log(`[API] ActiveCampaign - Sucesso: ${result.contactId}`)
      return NextResponse.json(result)
    } else {
      console.warn(`[API] ActiveCampaign - Falha: ${result.message}`)
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error('[API] ActiveCampaign - Erro:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: `Erro interno: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
      },
      { status: 500 }
    )
  }
}
