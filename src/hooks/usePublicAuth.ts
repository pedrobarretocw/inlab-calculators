'use client'

import { useSignIn, useSignUp, useUser, useClerk } from '@clerk/nextjs'
import { useState } from 'react'

export function usePublicAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { signIn, isLoaded: signInLoaded } = useSignIn()
  const { signUp, isLoaded: signUpLoaded } = useSignUp()
  const { user, isLoaded: userLoaded } = useUser()
  const { setActive } = useClerk()

  // Debug: verificar se estamos na instância pública
  console.log('[usePublicAuth] Hook inicializado - instância pública')

  const signInWithEmail = async (email: string) => {
    if (!signInLoaded || !signUpLoaded) return false

    setIsLoading(true)
    setError(null)

    try {
      // Tentar sign-up primeiro (cobre usuários novos e existentes)
      const signUpAttempt = await signUp.create({
        emailAddress: email,
      })

      await signUpAttempt.prepareEmailAddressVerification({
        strategy: 'email_code'
      })
      
      setIsLoading(false)
      return { success: true, mode: 'signup' as const }
    } catch (signUpErr: unknown) {
      // Se usuário já existe, tentar sign-in
      if ((signUpErr as any)?.errors?.[0]?.code === 'form_identifier_exists') {
        try {
          const signInAttempt = await signIn.create({
            identifier: email,
          })

          const emailCodeFactor = signInAttempt.supportedFirstFactors?.find(
            (f) => f.strategy === 'email_code'
          )

          if (emailCodeFactor && emailCodeFactor.emailAddressId) {
            await signInAttempt.prepareFirstFactor({
              strategy: 'email_code',
              emailAddressId: emailCodeFactor.emailAddressId
            })

            setIsLoading(false)
            return { success: true, mode: 'signin' as const }
          }
        } catch (signInErr: unknown) {
          setError('Erro ao fazer login. Tente novamente.')
          setIsLoading(false)
          return { success: false, error: 'Erro ao fazer login' }
        }
      } else {
        setError('Erro ao criar conta. Tente novamente.')
        setIsLoading(false)
        return { success: false, error: 'Erro ao criar conta' }
      }
    }

    setError('Erro inesperado. Tente novamente.')
    setIsLoading(false)
    return { success: false, error: 'Erro inesperado' }
  }

  const verifyCode = async (code: string, mode: 'signin' | 'signup') => {
    console.log(`[usePublicAuth] Verificando código: ${code} (modo: ${mode})`)
    setIsLoading(true)
    setError(null)

    try {
      // Verificar se já existe uma sessão ativa
      if (user) {
        console.log('[usePublicAuth] Usuário já autenticado')
        return { success: true, alreadyAuthenticated: true }
      }

      if (mode === 'signup') {
        console.log('[usePublicAuth] Tentando verificar código via signUp (instância pública)')
        if (!signUp) {
          console.error('[usePublicAuth] SignUp não disponível')
          setError('Erro de inicialização. Tente novamente.')
          setIsLoading(false)
          return { success: false, error: 'SignUp não disponível' }
        }
        // Usar a instância atual do signUp
        const result = await signUp.attemptEmailAddressVerification({ code })
        console.log('[usePublicAuth] Resultado signUp:', result.status)
        if (result.status === 'complete') {
          await setActive({ session: result.createdSessionId })
          console.log('[usePublicAuth] ✅ SignUp bem-sucedido na instância pública')
          return { success: true }
        }
      } else {
        console.log('[usePublicAuth] Tentando verificar código via signIn (instância pública)')
        if (!signIn) {
          console.error('[usePublicAuth] SignIn não disponível')
          setError('Erro de inicialização. Tente novamente.')
          setIsLoading(false)
          return { success: false, error: 'SignIn não disponível' }
        }
        // Usar a instância atual do signIn
        const result = await signIn.attemptFirstFactor({ strategy: 'email_code', code })
        console.log('[usePublicAuth] Resultado signIn:', result.status)
        if (result.status === 'complete') {
          await setActive({ session: result.createdSessionId })
          console.log('[usePublicAuth] ✅ SignIn bem-sucedido na instância pública')
          return { success: true }
        }
      }
      
      setError('Código inválido. Tente novamente.')
      setIsLoading(false)
      return { success: false, error: 'Código inválido' }
    } catch (err: unknown) {
      console.error('[usePublicAuth] ❌ Erro ao verificar código:', err)
      console.error('[usePublicAuth] Detalhes do erro:', (err as any)?.errors)
      
      // Tratar erro de sessão existente
      if ((err as any)?.errors?.[0]?.code === 'session_exists') {
        console.log('[usePublicAuth] Usuário já possui sessão ativa')
        return { success: true, alreadyAuthenticated: true }
      }
      
      // Log específico sobre código inválido
      if ((err as any)?.errors?.[0]?.code === 'form_code_incorrect') {
        console.log('[usePublicAuth] Código incorreto fornecido')
      }
      
      setError('Código inválido. Tente novamente.')
      setIsLoading(false)
      return { success: false, error: 'Código inválido' }
    }
  }

  return {
    user,
    isLoaded: userLoaded,
    isLoading,
    error,
    signInWithEmail,
    verifyCode
  }
}
