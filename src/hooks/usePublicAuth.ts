'use client'

import { useSignIn, useSignUp, useUser } from '@clerk/nextjs'
import { useState } from 'react'

export function usePublicAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { signIn, isLoaded: signInLoaded } = useSignIn()
  const { signUp, isLoaded: signUpLoaded } = useSignUp()
  const { user, isLoaded: userLoaded } = useUser()

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

  const verifyCode = async (code: string, mode: 'signin' | 'signup', onSuccess?: () => Promise<void>) => {
    setIsLoading(true)
    setError(null)

    try {
      // Verificar se já existe uma sessão ativa
      if (user) {
        // Usuário já está logado, apenas executar callback
        if (onSuccess) {
          await onSuccess()
        }
        return { success: true, alreadyAuthenticated: true }
      }

      if (mode === 'signup') {
        // Usar a instância atual do signUp
        const result = await signUp.attemptEmailAddressVerification({ code })
        if (result.status === 'complete') {
          await signUp.setActive({ session: result.createdSessionId })
          
          // Executar callback (ex: salvar cálculo)
          if (onSuccess) {
            await onSuccess()
          }
          
          // Não redirecionar - deixar o componente lidar com isso
          return { success: true }
        }
      } else {
        // Usar a instância atual do signIn
        const result = await signIn.attemptFirstFactor({ strategy: 'email_code', code })
        if (result.status === 'complete') {
          await signIn.setActive({ session: result.createdSessionId })
          
          // Executar callback (ex: salvar cálculo)
          if (onSuccess) {
            await onSuccess()
          }
          
          // Não redirecionar - deixar o componente lidar com isso
          return { success: true }
        }
      }
      
      setError('Código inválido. Tente novamente.')
      setIsLoading(false)
      return { success: false, error: 'Código inválido' }
    } catch (err: unknown) {
      console.error('Erro ao verificar código:', err)
      
      // Tratar erro de sessão existente
      if ((err as any)?.errors?.[0]?.code === 'session_exists') {
        // Usuário já está logado, apenas executar callback
        if (onSuccess) {
          await onSuccess()
        }
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
