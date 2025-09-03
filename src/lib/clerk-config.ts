// Configurações para duas instâncias do Clerk

// Configuração do Clerk Admin
export const clerkAdminConfig = {
  publishableKey: process.env.NEXT_PUBLIC_CLERK_ADMIN_PUBLISHABLE_KEY!,
  secretKey: process.env.CLERK_ADMIN_SECRET_KEY!
}

// Configuração do Clerk Público (usuários)
export const clerkPublicConfig = {
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
  secretKey: process.env.CLERK_SECRET_KEY!
}

// Helper para verificar se as chaves estão configuradas
export const isClerkAdminConfigured = () => {
  return !!(clerkAdminConfig.publishableKey && clerkAdminConfig.secretKey)
}

export const isClerkPublicConfigured = () => {
  return !!(clerkPublicConfig.publishableKey && clerkPublicConfig.secretKey)
}
