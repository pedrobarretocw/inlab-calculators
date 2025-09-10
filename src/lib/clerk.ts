import { auth } from '@clerk/nextjs/server'

export type AuthContext = 'admin' | 'public'

export const isClerkEnabled = () => {
  return process.env.ENABLE_CLERK === 'true'
}

const MOCK_ADMIN_USER = {
  userId: 'admin-dev-123',
  sessionId: 'admin-session-123'
}

const MOCK_PUBLIC_USER = {
  userId: 'user-dev-456', 
  sessionId: 'user-session-456'
}

export function getAuthContext(pathname?: string): AuthContext {
  if (!pathname && typeof window !== 'undefined') {
    pathname = window.location.pathname
  }
  
  if (pathname?.startsWith('/admin')) {
    return 'admin'
  }
  
  return 'public'
}

export async function getCurrentUser(context?: AuthContext) {
  if (!isClerkEnabled()) {
    const authContext = context || getAuthContext()
    return authContext === 'admin' ? MOCK_ADMIN_USER : MOCK_PUBLIC_USER
  }
  
  const { userId, sessionId } = await auth()
  return { userId, sessionId }
}

export async function getCurrentPublicUser() {
  return getCurrentUser('public')
}

export async function getCurrentAdminUser() {
  return getCurrentUser('admin')
}

export async function requireAuth(context?: AuthContext) {
  if (!isClerkEnabled()) {
    const authContext = context || getAuthContext()
    return authContext === 'admin' ? MOCK_ADMIN_USER.userId : MOCK_PUBLIC_USER.userId
  }
  
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error('Authentication required')
  }
  
  return userId
}

export async function requirePublicAuth() {
  return requireAuth('public')
}

export async function requireAdminAuth() {
  return requireAuth('admin')
}
