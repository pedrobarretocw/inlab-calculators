/**
 * Utility para verificação de acesso administrativo
 * 
 * REGRA DEFINITIVA: Apenas usuários @cloudwalk.io da instância admin podem acessar
 */

import { auth } from '@clerk/nextjs/server'

export interface AdminAuthResult {
  isAuthorized: boolean
  email?: string
  userId?: string
  reason?: string
}

/**
 * Verifica se o usuário atual tem acesso administrativo
 * 
 * @returns Promise<AdminAuthResult>
 */
export async function checkAdminAccess(): Promise<AdminAuthResult> {
  try {
    const { userId, sessionClaims } = await auth()
    
    // 1. Verificar se está logado
    if (!userId) {
      return {
        isAuthorized: false,
        reason: 'Usuário não está logado'
      }
    }
    
    // 2. Verificar se é da instância admin
    const adminInstanceId = process.env.NEXT_PUBLIC_CLERK_ADMIN_PUBLISHABLE_KEY?.split('_')[1]
    const isFromAdminInstance = adminInstanceId && sessionClaims?.iss?.includes(adminInstanceId)
    
    if (!isFromAdminInstance) {
      return {
        isAuthorized: false,
        userId,
        email: sessionClaims?.email as string,
        reason: 'Usuário não é da instância administrativa'
      }
    }
    
    // 3. Verificar se o email é @cloudwalk.io
    const userEmail = sessionClaims?.email as string
    const isCloudwalkEmail = userEmail && userEmail.endsWith('@cloudwalk.io')
    
    if (!isCloudwalkEmail) {
      return {
        isAuthorized: false,
        userId,
        email: userEmail,
        reason: 'Email não é do domínio @cloudwalk.io'
      }
    }
    
    // 4. Tudo OK - acesso autorizado
    return {
      isAuthorized: true,
      userId,
      email: userEmail
    }
    
  } catch (error) {
    console.error('[AdminAuth] Erro ao verificar acesso:', error)
    return {
      isAuthorized: false,
      reason: `Erro interno: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    }
  }
}

/**
 * Hook para verificação de acesso admin em componentes
 * Retorna informações de autorização e dados do usuário
 */
export async function requireAdminAccess(): Promise<AdminAuthResult> {
  const result = await checkAdminAccess()
  
  // Verificação de acesso admin concluída
  
  return result
}

/**
 * Middleware helper para verificar acesso admin
 * Usado em API routes para verificação server-side
 */
export function isCloudwalkEmail(email: string): boolean {
  return !!(email && email.endsWith('@cloudwalk.io'))
}

/**
 * Extrai email do sessionClaims do Clerk
 */
export function extractEmailFromClaims(sessionClaims: Record<string, unknown>): string | null {
  const email = sessionClaims?.email
  return typeof email === 'string' ? email : null
}

/**
 * Verifica se usuário é da instância admin baseado no JWT issuer
 */
export function isFromAdminInstance(sessionClaims: Record<string, unknown>): boolean {
  const adminInstanceId = process.env.NEXT_PUBLIC_CLERK_ADMIN_PUBLISHABLE_KEY?.split('_')[1]
  const iss = sessionClaims?.iss
  return !!(adminInstanceId && typeof iss === 'string' && iss.includes(adminInstanceId))
}