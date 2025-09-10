import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
const isClerkEnabled = () => process.env.ENABLE_CLERK === 'true'
 
const isAdminRoute = createRouteMatcher([
  '/calculadoras/admin/((?!login|access-denied).*)',
  '/api/dashboard(.*)'
])
 
const isPublicAdminRoute = createRouteMatcher([
  '/calculadoras/admin/login',
  '/calculadoras/admin/access-denied'
])
 
export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { pathname } = req.nextUrl
 
  if (!isClerkEnabled()) {
    return NextResponse.next()
  }
 
  if (isPublicAdminRoute(req)) {
    return NextResponse.next()
  }
 
  if (isAdminRoute(req)) {
    const { userId, sessionClaims } = await auth()
    
    if (!userId) {
      if (req.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized - Please login as admin' }, { status: 401 })
      }
      const loginUrl = new URL('/calculadoras/admin/login', req.url)
      return NextResponse.redirect(loginUrl)
    }
 
    try {
      const adminInstanceId = process.env.NEXT_PUBLIC_CLERK_ADMIN_PUBLISHABLE_KEY?.split('_')[1]
      const isFromAdminInstance = adminInstanceId && sessionClaims?.iss?.includes(adminInstanceId)
      
      const userEmail = sessionClaims?.email as string
      const isCloudwalkEmail = userEmail && userEmail.endsWith('@cloudwalk.io')
      
      if (!isFromAdminInstance || !isCloudwalkEmail) {
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
      
    } catch {
      
      if (req.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Authentication error' }, { status: 500 })
      }
      return NextResponse.redirect(new URL('/calculadoras/admin/login', req.url))
    }
  }
 
  const response = NextResponse.next()
  
  if (pathname.startsWith("/embed") || pathname.startsWith("/calculadoras/embed")) {
    response.headers.delete('X-Frame-Options')
    response.headers.set(
      'Content-Security-Policy',
      "frame-ancestors *;"
    )
    response.headers.set(
      'Set-Cookie',
      'SameSite=None; Secure'
    )
  }

  return response
})

// Restrict Clerk middleware only to admin routes to avoid
// Clerk handshake/redirect parameters on public embeds and pages.
export const config = {
  matcher: [
    '/calculadoras/admin/:path*',
    '/api/dashboard/:path*',
  ],
}
