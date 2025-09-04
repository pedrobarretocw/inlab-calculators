import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Flag para ativar/desativar Clerk em desenvolvimento
const isClerkEnabled = () => process.env.ENABLE_CLERK === 'true'

// ROTAS ADMIN QUE PRECISAM DE PROTEÇÃO
const isAdminRoute = createRouteMatcher([
  '/calculadoras/admin/((?!login|access-denied).*)',
  '/api/dashboard(.*)'
])

// Rotas que devem ser excluídas da proteção
const isPublicAdminRoute = createRouteMatcher([
  '/calculadoras/admin/login',
  '/calculadoras/admin/access-denied'
])

// MIDDLEWARE ÚNICO E SIMPLES
export default clerkMiddleware(async (auth, req: NextRequest) => {
  // Em desenvolvimento sem Clerk, libera tudo
  if (!isClerkEnabled()) {
    console.log('[DevMiddleware] Clerk disabled, allowing all requests')
    return NextResponse.next()
  }

  // Se for rota pública do admin, liberar
  if (isPublicAdminRoute(req)) {
    console.log(`[Middleware] 🟢 Rota pública admin liberada: ${req.nextUrl.pathname}`)
    return NextResponse.next()
  }

  // Se for rota admin protegida, verificar acesso
  if (isAdminRoute(req)) {
    console.log(`[Middleware] 🛡️  Verificando acesso admin para: ${req.nextUrl.pathname}`)
    
    const { userId, sessionClaims } = await auth()
    
    // Se não está logado
    if (!userId) {
      console.log('[Middleware] ❌ Admin route: No userId - redirecionando para login')
      
      // Se for API, retornar JSON ao invés de redirect
      if (req.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized - Please login as admin' }, { status: 401 })
      }
      
      // Se for página, redirecionar para login
      const loginUrl = new URL('/calculadoras/admin/login', req.url)
      console.log(`[Middleware] Redirecionando para: ${loginUrl.toString()}`)
      return NextResponse.redirect(loginUrl)
    }

    // VERIFICAÇÃO RIGOROSA: usuário deve ser @cloudwalk.io E da instância admin
    try {
      // 1. Verificar se é da instância admin pelo JWT issuer
      const adminInstanceId = process.env.NEXT_PUBLIC_CLERK_ADMIN_PUBLISHABLE_KEY?.split('_')[1]
      const isFromAdminInstance = adminInstanceId && sessionClaims?.iss?.includes(adminInstanceId)
      
      // 2. Verificar se o email é @cloudwalk.io
      const userEmail = sessionClaims?.email as string
      const isCloudwalkEmail = userEmail && userEmail.endsWith('@cloudwalk.io')
      
      console.log('[Middleware] Admin verification:')
      console.log('  - User ID:', userId)
      console.log('  - Email:', userEmail)
      console.log('  - Is Cloudwalk email:', isCloudwalkEmail)
      console.log('  - Is from admin instance:', isFromAdminInstance)
      console.log('  - Admin instance ID:', adminInstanceId)
      
      // REGRA DEFINITIVA: AMBAS as condições devem ser verdadeiras
      if (!isFromAdminInstance || !isCloudwalkEmail) {
        console.log('[Middleware] 🚫 ACESSO NEGADO - Usuário não autorizado')
        console.log(`[Middleware] Motivo: ${!isFromAdminInstance ? 'Instância incorreta' : 'Email não é @cloudwalk.io'}`)
        
        // Se for API, retornar JSON ao invés de redirect
        if (req.nextUrl.pathname.startsWith('/api/')) {
          return NextResponse.json({ 
            error: 'Unauthorized - Only @cloudwalk.io emails can access admin panel',
            details: {
              isFromAdminInstance,
              isCloudwalkEmail,
              email: userEmail
            }
          }, { status: 403 })
        }
        
        return NextResponse.redirect(new URL('/calculadoras/admin/access-denied', req.url))
      }

      console.log('[Middleware] ✅ ACESSO AUTORIZADO - Admin @cloudwalk.io verificado')
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