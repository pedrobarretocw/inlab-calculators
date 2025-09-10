'use client'

import { ClerkProvider } from '@clerk/nextjs'
import { clerkPublicConfig } from '@/lib/clerk-config'
import { useEffect, useState } from 'react'

interface PublicClerkProviderProps {
  children: React.ReactNode
}

export function PublicClerkProvider({ children }: PublicClerkProviderProps) {
  const [isInIframe, setIsInIframe] = useState(false)

  useEffect(() => {
    // Detectar se está rodando dentro de um iframe
    setIsInIframe(window !== window.parent)
  }, [])

  // Se está em iframe, não usar Clerk para evitar problemas de redirecionamento
  if (isInIframe) {
    return <>{children}</>
  }

  if (!clerkPublicConfig.publishableKey) {
    return <div>Erro de configuração Clerk</div>
  }
  
  return (
    <ClerkProvider 
      publishableKey={clerkPublicConfig.publishableKey}
      appearance={{
        elements: {
          // Configurações para evitar problemas em iframes
          rootBox: {
            width: '100%'
          }
        }
      }}
    >
      {children}
    </ClerkProvider>
  )
}
