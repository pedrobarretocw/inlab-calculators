'use client'

import { ClerkProvider } from '@clerk/nextjs'
import { clerkPublicConfig } from '@/lib/clerk-config'

interface PublicClerkProviderProps {
  children: React.ReactNode
}

export function PublicClerkProvider({ children }: PublicClerkProviderProps) {
  if (!clerkPublicConfig.publishableKey) {
    return <div>Erro de configuração Clerk</div>
  }
  
  return (
    <ClerkProvider publishableKey={clerkPublicConfig.publishableKey}>
      {children}
    </ClerkProvider>
  )
}
