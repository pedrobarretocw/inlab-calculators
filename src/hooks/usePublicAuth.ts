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

  // Hook inicializado para instância pública

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
    setIsLoading(true)
    setError(null)

    try {
      // Verificar se já existe uma sessão ativa
      if (user) {
        return { success: true, alreadyAuthenticated: true }
      }

      if (mode === 'signup') {
        if (!signUp) {
          setError('Erro de inicialização. Tente novamente.')
          setIsLoading(false)
          return { success: false, error: 'SignUp não disponível' }
        }
        // Usar a instância atual do signUp
        const result = await signUp.attemptEmailAddressVerification({ code })
        if (result.status === 'complete') {
          await setActive({ session: result.createdSessionId })
          return { success: true }
        }
      } else {
        if (!signIn) {
          setError('Erro de inicialização. Tente novamente.')
          setIsLoading(false)
          return { success: false, error: 'SignIn não disponível' }
        }
        // Usar a instância atual do signIn
        const result = await signIn.attemptFirstFactor({ strategy: 'email_code', code })
        if (result.status === 'complete') {
          await setActive({ session: result.createdSessionId })
          return { success: true }
        }
      }
      
      setError('Código inválido. Tente novamente.')
      setIsLoading(false)
      return { success: false, error: 'Código inválido' }
    } catch (err: unknown) {
      // Tratar erro de sessão existente
      if ((err as any)?.errors?.[0]?.code === 'session_exists') {
        return { success: true, alreadyAuthenticated: true }
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
