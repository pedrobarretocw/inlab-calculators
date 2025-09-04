import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })
    }
    
    console.log('[TEST] Testando envio de email Clerk público para:', email)
    
    // Log das chaves de configuração (sem expor valores sensíveis)
    const publicKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    const adminKey = process.env.NEXT_PUBLIC_CLERK_ADMIN_PUBLISHABLE_KEY
    
    console.log('[TEST] Chave pública configurada:', !!publicKey, publicKey?.substring(0, 20) + '...')
    console.log('[TEST] Chave admin configurada:', !!adminKey, adminKey?.substring(0, 20) + '...')
    
    return NextResponse.json({
      success: true,
      message: 'Teste de configuração Clerk',
      config: {
        hasPublicKey: !!publicKey,
        hasAdminKey: !!adminKey,
        publicKeyPreview: publicKey?.substring(0, 20) + '...',
        adminKeyPreview: adminKey?.substring(0, 20) + '...',
        keysAreDifferent: publicKey !== adminKey
      },
      instructions: [
        'Verifique os logs do console no browser',
        'Confirme se a instância pública está sendo usada',
        'Teste com um código real do email'
      ]
    })
  } catch (error) {
    console.error('[TEST] Erro:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
