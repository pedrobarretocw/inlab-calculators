import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { clerkAdminConfig } from '@/lib/clerk-config'

interface AdminAuthResult {
  userId: string
  email: string
  isValid: boolean
}

/**
 * Verifica se o usuário atual é um admin válido
 * IMPORTANTE: Esta função DEVE ser chamada em Server Components
 */
export async function requireAdminAuth(): Promise<AdminAuthResult> {
  try {
    // 1. Obter o usuário do contexto atual usando currentUser
    const user = await currentUser()
    
    if (!user) {
      console.log('[AdminAuth] No user found - redirecting to login')
      redirect('/calculadoras/admin/login')
    }

    const email = user.emailAddresses?.[0]?.emailAddress || ''
    
    // 2. Verificar domínio @cloudwalk.io
    if (!email.endsWith('@cloudwalk.io')) {
      console.log('[AdminAuth] Invalid domain:', email)
      redirect('/calculadoras/admin/access-denied')
    }
    
    console.log('[AdminAuth] Valid admin user:', email)
    return {
      userId: user.id,
      email,
      isValid: true
    }
  } catch (error) {
    console.error('[AdminAuth] Unexpected error:', error)
    redirect('/calculadoras/admin/login')
  }
}

/**
 * Verificação para o middleware - não faz redirect, apenas retorna boolean
 */
export async function isAdminUser(): Promise<boolean> {
  try {
    const user = await currentUser()
    
    if (!user) {
      return false
    }

    const email = user.emailAddresses?.[0]?.emailAddress || ''
    return email.endsWith('@cloudwalk.io')
  } catch {
    return false
  }
}
