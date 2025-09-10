 

import { auth } from '@clerk/nextjs/server'

export interface AdminAuthResult {
  isAuthorized: boolean
  email?: string
  userId?: string
  reason?: string
}

export async function checkAdminAccess(): Promise<AdminAuthResult> {
  try {
    const { userId, sessionClaims } = await auth()
    
    if (!userId) {
      return {
        isAuthorized: false,
        reason: 'Usuário não está logado'
      }
    }
    
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
    
    return {
      isAuthorized: true,
      userId,
      email: userEmail
    }
    
  } catch (error) {
    return {
      isAuthorized: false,
      reason: `Erro interno: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    }
  }
}
 
export async function requireAdminAccess(): Promise<AdminAuthResult> {
  const result = await checkAdminAccess()
  
  return result
}

export function isCloudwalkEmail(email: string): boolean {
  return !!(email && email.endsWith('@cloudwalk.io'))
}

export function extractEmailFromClaims(sessionClaims: Record<string, unknown>): string | null {
  const email = sessionClaims?.email
  return typeof email === 'string' ? email : null
}

export function isFromAdminInstance(sessionClaims: Record<string, unknown>): boolean {
  const adminInstanceId = process.env.NEXT_PUBLIC_CLERK_ADMIN_PUBLISHABLE_KEY?.split('_')[1]
  const iss = sessionClaims?.iss
  return !!(adminInstanceId && typeof iss === 'string' && iss.includes(adminInstanceId))
}
