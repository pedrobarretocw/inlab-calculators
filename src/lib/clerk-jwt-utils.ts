import { checkAdminAccess } from '@/lib/admin-auth'

// VERIFICAÇÃO ADMIN REUTILIZANDO NOVA ESTRUTURA
export async function isRealAdminUser(): Promise<boolean> {
  try {
    const result = await checkAdminAccess()
    
    if (result.isAuthorized) {
      console.log(`[Auth Check] ✅ Admin válido: ${result.email}`)
      return true
    } else {
      console.log(`[Auth Check] 🚫 Acesso negado: ${result.reason}`)
      console.log(`[Auth Check] Email tentando acessar: ${result.email}`)
      return false
    }
  } catch (error) {
    console.error('[Auth Check] Erro na verificação:', error)
    return false
  }
}