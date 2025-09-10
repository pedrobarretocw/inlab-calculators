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
  const { pathname } = req.nextUrl

  // Em desenvolvimento sem Clerk, libera tudo
  if (!isClerkEnabled()) {
    return NextResponse.next()
  }

  // Se for rota pública do admin, liberar
  if (isPublicAdminRoute(req)) {
    return NextResponse.next()
  }

  // Se for rota admin protegida, verificar acesso
  if (isAdminRoute(req)) {
    const { userId, sessionClaims } = await auth()
    
    // Se não está logado
    if (!userId) {
      
      // Se for API, retornar JSON ao invés de redirect
      if (req.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized - Please login as admin' }, { status: 401 })
      }
      
      // Se for página, redirecionar para login
      const loginUrl = new URL('/calculadoras/admin/login', req.url)
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
      
      // Verificar acesso admin
      
      // REGRA DEFINITIVA: AMBAS as condições devem ser verdadeiras
      if (!isFromAdminInstance || !isCloudwalkEmail) {
        // Acesso negado
        
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

      return NextResponse.next()
      
    } catch (error) {
      
      // Se for API, retornar JSON ao invés de redirect
      if (req.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Authentication error' }, { status: 500 })
      }
      
      return NextResponse.redirect(new URL('/calculadoras/admin/login', req.url))
    }
  }

  // Add iframe headers for embed routes (fix third-party cookie issues)
  const response = NextResponse.next()
  
  if (pathname.startsWith("/embed") || pathname.startsWith("/calculadoras/embed")) {
    // Remove X-Frame-Options completely to allow embedding anywhere
    response.headers.delete('X-Frame-Options')
    response.headers.set(
      'Content-Security-Policy',
      "frame-ancestors *;"
    )
    // Configure cookies for iframe compatibility
    response.headers.set(
      'Set-Cookie',
      'SameSite=None; Secure'
    )
  }

  return response
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}