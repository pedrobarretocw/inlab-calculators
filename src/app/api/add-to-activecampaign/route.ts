import { NextRequest, NextResponse } from 'next/server'
import { addEmailToActiveCampaign } from '@/lib/activecampaign'
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
    
    // ActiveCampaign + salvar lead no Supabase em paralelo
    const [acResult] = await Promise.all([
      addEmailToActiveCampaign(email, firstName, lastName, phone),
      (async () => {
        try {
          const supabase = await createServiceRoleClient()
          await supabase.from('leads').upsert(
            { email, status: 'unverified' },
            { onConflict: 'email', ignoreDuplicates: true }
          )
        } catch {
          // silencioso: não falha a rota se insert do lead falhar
        }
      })()
    ])

    if (acResult.success) {
      return NextResponse.json(acResult)
    } else {
      return NextResponse.json(acResult, { status: 400 })
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
