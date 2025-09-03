'use client'

import { ClerkProvider } from '@clerk/nextjs'
import { clerkPublicConfig } from '@/lib/clerk-config'

interface PublicClerkProviderProps {
  children: React.ReactNode
}

export function PublicClerkProvider({ children }: PublicClerkProviderProps) {
  return (
    <ClerkProvider publishableKey={clerkPublicConfig.publishableKey}>
      {children}
    </ClerkProvider>
  )
}
