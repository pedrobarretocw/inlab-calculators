import { auth, clerkClient } from '@clerk/nextjs/server'

// VERIFICAÇÃO SIMPLES: usuário admin válido
export async function isRealAdminUser(): Promise<boolean> {
  try {
    const { userId, sessionClaims } = auth()
    if (!userId || !sessionClaims) {
      console.log('[Auth Check] No userId or sessionClaims')
      return false
    }

    // 1. Verificar se é da instância admin pelo JWT issuer
    const adminInstanceId = process.env.NEXT_PUBLIC_CLERK_ADMIN_PUBLISHABLE_KEY?.split('_')[1]
    const isFromAdminInstance = adminInstanceId && sessionClaims?.iss?.includes(adminInstanceId)
    
    if (!isFromAdminInstance) {
      console.log('[Auth Check] User is not from admin instance')
      return false
    }

    // 2. Verificar se o email é @cloudwalk.io
    const user = await clerkClient.users.getUser(userId)
    const userEmail = user.emailAddresses?.[0]?.emailAddress
    if (!userEmail || !userEmail.endsWith('@cloudwalk.io')) {
      console.log('[Auth Check] User does not have cloudwalk.io email:', userEmail)
      return false
    }

    console.log('[Auth Check] Valid admin user:', userEmail)
    return true
  } catch (error) {
    console.error('[Auth Check] Error checking admin user:', error)
    return false
  }
}