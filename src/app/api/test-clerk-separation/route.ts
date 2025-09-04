import { NextResponse } from 'next/server'
import { clerkAdminConfig, clerkPublicConfig } from '@/lib/clerk-config'

export async function GET() {
  try {
    console.log('[TEST] Verificando separação de instâncias Clerk...')
    
    const adminKey = clerkAdminConfig.publishableKey
    const publicKey = clerkPublicConfig.publishableKey
    
    console.log('[TEST] Admin Key:', adminKey?.substring(0, 30) + '...')
    console.log('[TEST] Public Key:', publicKey?.substring(0, 30) + '...')
    
    // Verificar se as chaves são diferentes
    const keysAreDifferent = adminKey !== publicKey
    
    // Verificar se ambas existem
    const adminExists = !!adminKey
    const publicExists = !!publicKey
    
    // Verificar se uma é admin e outra não
    const adminIsAdmin = adminKey?.includes('_admin') || false
    const publicIsNotAdmin = !publicKey?.includes('_admin') || false
    
    const result = {
      success: true,
      separation: {
        keysAreDifferent,
        adminExists,
        publicExists,
        adminIsAdmin,
        publicIsNotAdmin
      },
      adminKeyPreview: adminKey?.substring(0, 30) + '...',
      publicKeyPreview: publicKey?.substring(0, 30) + '...',
      verdict: keysAreDifferent && adminExists && publicExists ? 
        '✅ INSTÂNCIAS SEPARADAS CORRETAMENTE' : 
        '❌ PROBLEMA NA SEPARAÇÃO DE INSTÂNCIAS',
      details: {
        message: keysAreDifferent ? 
          'As instâncias Clerk estão corretamente separadas' :
          'PERIGO: As instâncias podem estar misturadas!'
      }
    }
    
    console.log('[TEST] Resultado:', result.verdict)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('[TEST] Erro:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
