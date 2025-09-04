'use client'

import { ClerkProvider } from '@clerk/nextjs'
import { clerkPublicConfig } from '@/lib/clerk-config'

interface PublicClerkProviderProps {
  children: React.ReactNode
}

export function PublicClerkProvider({ children }: PublicClerkProviderProps) {
  console.log('[PublicClerkProvider] 🔧 Configurando instância PÚBLICA do Clerk')
  console.log('[PublicClerkProvider] Chave pública:', clerkPublicConfig.publishableKey?.substring(0, 20) + '...')
  console.log('[PublicClerkProvider] É chave admin?', clerkPublicConfig.publishableKey?.includes('admin'))
  
  if (!clerkPublicConfig.publishableKey) {
    console.error('[PublicClerkProvider] ❌ ERRO: Chave pública não encontrada!')
    return <div>Erro de configuração Clerk</div>
  }
  
  return (
    <ClerkProvider publishableKey={clerkPublicConfig.publishableKey}>
      {children}
    </ClerkProvider>
  )
}
