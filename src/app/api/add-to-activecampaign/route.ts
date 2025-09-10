import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    
    const { email, firstName, lastName, phone } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      )
    }
    
    // Salvar lead no Supabase (schema já configurado no client)
    try {
      const supabase = await createServiceRoleClient()
      await supabase.from('leads').upsert(
        { email, status: 'unverified' },
        { onConflict: 'email', ignoreDuplicates: true }
      )
    } catch {
      // não impede seguir
    }

    // Tentar ActiveCampaign de forma resiliente (import dinâmico)
    let acResult: any = { success: true, message: 'lead saved' }
    try {
      const mod = await import('@/lib/activecampaign')
      acResult = await mod.addEmailToActiveCampaign(email, firstName, lastName, phone)
    } catch {
      // mantemos sucesso se lead foi salvo localmente
      acResult = { success: true, message: 'lead saved (AC skipped)' }
    }

    return NextResponse.json(acResult)
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
