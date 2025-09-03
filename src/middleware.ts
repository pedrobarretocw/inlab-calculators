import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Flag para ativar/desativar Clerk em desenvolvimento
const isClerkEnabled = () => process.env.ENABLE_CLERK === 'true'

// ROTA ADMIN QUE PRECISA DE PROTEÇÃO
const isAdminRoute = createRouteMatcher([
  '/calculadoras/admin/((?!login).*)',
  '/api/dashboard(.*)'
])

// MIDDLEWARE ÚNICO E SIMPLES
export default clerkMiddleware(async (auth, req: NextRequest) => {
  // Em desenvolvimento sem Clerk, libera tudo
  if (!isClerkEnabled()) {
    console.log('[DevMiddleware] Clerk disabled, allowing all requests')
    return NextResponse.next()
  }

  // Se for rota admin, verificar acesso
  if (isAdminRoute(req)) {
    const { userId, sessionClaims } = await auth()
    
    // Se não está logado
    if (!userId) {
      console.log('[Middleware] Admin route: No userId')
      
      // Se for API, retornar JSON ao invés de redirect
      if (req.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized - Please login as admin' }, { status: 401 })
      }
      
      // Se for página, redirecionar para login
      return NextResponse.redirect(new URL('/calculadoras/admin/login', req.url))
    }

    // VERIFICAÇÃO SIMPLES: usuário deve ser @cloudwalk.io E da instância admin
    try {
      // 1. Verificar se é da instância admin pelo JWT issuer
      const adminInstanceId = process.env.NEXT_PUBLIC_CLERK_ADMIN_PUBLISHABLE_KEY?.split('_')[1]
      const isFromAdminInstance = adminInstanceId && sessionClaims?.iss?.includes(adminInstanceId)
      
      if (!isFromAdminInstance) {
        console.log('[Middleware] BLOCKED: User from public instance trying to access admin')
        
        // Se for API, retornar JSON ao invés de redirect
        if (req.nextUrl.pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 })
        }
        
        return NextResponse.redirect(new URL('/calculadoras/admin/access-denied', req.url))
      }

      console.log('[Middleware] Admin access granted')
      return NextResponse.next()
      
    } catch (error) {
      console.error('[Middleware] Error checking admin status:', error)
      
      // Se for API, retornar JSON ao invés de redirect
      if (req.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Authentication error' }, { status: 500 })
      }
      
      return NextResponse.redirect(new URL('/calculadoras/admin/login', req.url))
    }
  }

  // Para todas as outras rotas, libera
  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}