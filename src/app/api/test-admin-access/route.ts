import { NextResponse } from 'next/server'
import { requireAdminAccess } from '@/lib/admin-auth'

export async function GET() {
  try {
    console.log('[TEST] Verificando acesso administrativo...')
    
    const adminAuth = await requireAdminAccess()
    
    if (!adminAuth.isAuthorized) {
      console.log('[TEST] 🚫 Acesso negado')
      return NextResponse.json({
        success: false,
        authorized: false,
        reason: adminAuth.reason,
        email: adminAuth.email,
        message: 'Acesso negado - apenas @cloudwalk.io'
      }, { status: 403 })
    }
    
    console.log('[TEST] ✅ Acesso autorizado')
    return NextResponse.json({
      success: true,
      authorized: true,
      email: adminAuth.email,
      userId: adminAuth.userId,
      message: 'Acesso autorizado como administrador'
    })
  } catch (error) {
    console.error('[TEST] Erro:', error)
    return NextResponse.json({
      success: false,
      authorized: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
