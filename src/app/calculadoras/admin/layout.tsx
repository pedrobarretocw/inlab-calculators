import { ClerkProvider } from '@clerk/nextjs'
import { ptBR } from '@clerk/localizations'
import { clerkAdminConfig } from '@/lib/clerk-config'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      publishableKey={clerkAdminConfig.publishableKey}
      localization={ptBR}
      signInUrl="/calculadoras/admin/login"
      signUpUrl="/calculadoras/admin/login"
      afterSignInUrl="/calculadoras/admin"
      afterSignUpUrl="/calculadoras/admin"
    >
      {children}
    </ClerkProvider>
  )
}
