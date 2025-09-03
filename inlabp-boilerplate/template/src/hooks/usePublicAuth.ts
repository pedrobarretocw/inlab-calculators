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
      return { success: true, mode: 'signup' as const, signUpAttempt }
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
            return { success: true, mode: 'signin' as const, signInAttempt }
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

  const verifyCode = async (code: string, attempt: any, mode: 'signin' | 'signup') => {
    setIsLoading(true)
    setError(null)

    try {
      if (mode === 'signup') {
        const result = await attempt.attemptEmailAddressVerification({ code })
        if (result.status === 'complete') {
          await signUp.setActive({ session: result.createdSessionId })
          // Redirecionar para dashboard após login bem-sucedido
          window.location.href = '/__ROOT_ROUTE__/usuarios'
          return { success: true }
        }
      } else {
        const result = await attempt.attemptFirstFactor({ strategy: 'email_code', code })
        if (result.status === 'complete') {
          await signIn.setActive({ session: result.createdSessionId })
          // Redirecionar para dashboard após login bem-sucedido
          window.location.href = '/__ROOT_ROUTE__/usuarios'
          return { success: true }
        }
      }
      
      setError('Código inválido. Tente novamente.')
      setIsLoading(false)
      return { success: false, error: 'Código inválido' }
    } catch (err: unknown) {
      setError('Erro ao verificar código. Tente novamente.')
      setIsLoading(false)
      return { success: false, error: 'Erro ao verificar código' }
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
