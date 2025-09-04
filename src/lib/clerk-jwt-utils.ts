import { checkAdminAccess } from '@/lib/admin-auth'

// VERIFICAÇÃO ADMIN REUTILIZANDO NOVA ESTRUTURA
export async function isRealAdminUser(): Promise<boolean> {
  try {
    const result = await checkAdminAccess()
    
    if (result.isAuthorized) {
      return true
    } else {
      return false
    }
  } catch (error) {
    return false
  }
}