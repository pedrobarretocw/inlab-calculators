import { auth } from '@clerk/nextjs/server'

// Tipos de contexto de autenticação
export type AuthContext = 'admin' | 'public'

// Flag para ativar/desativar Clerk em desenvolvimento
export const isClerkEnabled = () => {
  return process.env.ENABLE_CLERK === 'true'
}

// Mock users para desenvolvimento sem Clerk
const MOCK_ADMIN_USER = {
  userId: 'admin-dev-123',
  sessionId: 'admin-session-123'
}

const MOCK_PUBLIC_USER = {
  userId: 'user-dev-456', 
  sessionId: 'user-session-456'
}

// Detectar contexto baseado na URL
export function getAuthContext(pathname?: string): AuthContext {
  if (!pathname && typeof window !== 'undefined') {
    pathname = window.location.pathname
  }
  
  if (pathname?.startsWith('/admin')) {
    return 'admin'
  }
  
  return 'public'
}

// Função para obter usuário atual baseado no contexto
export async function getCurrentUser(context?: AuthContext) {
  if (!isClerkEnabled()) {
    const authContext = context || getAuthContext()
    return authContext === 'admin' ? MOCK_ADMIN_USER : MOCK_PUBLIC_USER
  }
  
  const { userId, sessionId } = await auth()
  return { userId, sessionId }
}

// Função para obter usuário público
export async function getCurrentPublicUser() {
  return getCurrentUser('public')
}

// Função para obter usuário admin
export async function getCurrentAdminUser() {
  return getCurrentUser('admin')
}

// Função para exigir autenticação baseada no contexto
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

// Função para exigir auth de usuário público
export async function requirePublicAuth() {
  return requireAuth('public')
}

// Função para exigir auth de admin
export async function requireAdminAuth() {
  return requireAuth('admin')
}
