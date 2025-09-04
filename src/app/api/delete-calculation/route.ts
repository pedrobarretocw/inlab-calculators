import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function DELETE(request: NextRequest) {
  try {
    console.log('[DELETE] Iniciando deleção de cálculo')
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    console.log('[DELETE] ID recebido:', id)

    if (!id) {
      console.log('[DELETE] ID não fornecido')
      return NextResponse.json(
        { error: 'ID do cálculo é obrigatório' },
        { status: 400 }
      )
    }

    console.log('[DELETE] Conectando ao Supabase...')
    
    const supabase = await createServiceRoleClient()
    
    // Verificar se o cálculo existe antes de deletar
    const { data: existingCalc, error: fetchError } = await supabase
      .from('calculations')
      .select('id')
      .eq('id', id)
      .single()
    
    if (fetchError) {
      console.error('[DELETE] Erro ao buscar cálculo:', fetchError)
      return NextResponse.json(
        { error: 'Cálculo não encontrado' },
        { status: 404 }
      )
    }
    
    console.log('[DELETE] Cálculo encontrado:', existingCalc)

    // Deletar o cálculo
    const { error } = await supabase
      .from('calculations')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[DELETE] Erro ao deletar cálculo:', error)
      return NextResponse.json(
        { error: 'Erro ao deletar cálculo', details: error.message },
        { status: 500 }
      )
    }

    console.log('[DELETE] Cálculo deletado com sucesso')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE] Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
