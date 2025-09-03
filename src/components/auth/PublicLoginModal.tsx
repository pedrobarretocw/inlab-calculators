'use client'

import { useState } from 'react'
import { useSignIn, useSignUp } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Mail, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

interface PublicLoginModalProps {
  onSuccess: () => void
  onCancel: () => void
}

export function PublicLoginModal({ onSuccess, onCancel }: PublicLoginModalProps) {
  const [step, setStep] = useState<'email' | 'code' | 'success'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<'signup' | 'signin'>('signup')
  const { signIn, isLoaded: signInLoaded } = useSignIn()
  const { signUp, isLoaded: signUpLoaded } = useSignUp()

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signInLoaded || !signUpLoaded || !email.trim()) return

    setIsLoading(true)

    // Try sign-up first (which covers both new and existing users)
    try {
      const signUpAttempt = await signUp.create({
        emailAddress: email.trim(),
      })

      await signUpAttempt.prepareEmailAddressVerification({
        strategy: 'email_code',
      })
      
      setMode('signup')
      setStep('code')
      toast.success('Código enviado para seu email!')
      return
    } catch (signUpErr: unknown) {
      // If user exists, try sign-in
      const err = signUpErr as any
      if (err.errors?.[0]?.code === 'form_identifier_exists') {
        try {
          const signInAttempt = await signIn.create({
            identifier: email.trim(),
          })

          const emailCodeFactor = signInAttempt.supportedFirstFactors?.find(
            (f) => f.strategy === 'email_code'
          )

          if (emailCodeFactor && emailCodeFactor.emailAddressId) {
            await signInAttempt.prepareFirstFactor({
              strategy: 'email_code',
              emailAddressId: emailCodeFactor.emailAddressId,
            })

            setMode('signin')
            setStep('code')
            toast.success('Código enviado para seu email!')
            return
          } else {
            toast.error('Verificação por email não disponível para esta conta.')
          }
        } catch (signInErr: unknown) {
          console.error('Error in sign-in:', signInErr)
          toast.error('Erro ao enviar código. Tente novamente.')
        }
      } else {
        console.error('Error in sign-up:', signUpErr)
        toast.error('Erro ao enviar código. Tente novamente.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signInLoaded || !signUpLoaded || !code.trim()) return

    setIsLoading(true)
    try {
      let result
      
      if (mode === 'signup') {
        result = await signUp.attemptEmailAddressVerification({
          code: code.trim(),
        })
      } else {
        result = await signIn.attemptFirstFactor({
          strategy: 'email_code',
          code: code.trim(),
        })
      }

      if (result.status === 'complete') {
        setStep('success')
        toast.success('Login realizado com sucesso!')
        // Aguardar um pouco antes de chamar onSuccess
        setTimeout(() => {
          onSuccess()
        }, 1000)
      }
    } catch (error: any) {
      console.error('Error verifying code:', error)
      toast.error('Código inválido. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToEmail = () => {
    setStep('email')
    setCode('')
  }

  if (step === 'success') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Login realizado!
          </CardTitle>
          <CardDescription className="text-gray-600">
            Você está logado como {email}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-semibold text-gray-900">
          {step === 'email' ? 'Entrar ou criar conta' : 'Verificar email'}
        </CardTitle>
        <CardDescription className="text-gray-600">
          {step === 'email' 
            ? 'Digite seu email para receber um código de verificação'
            : `Código enviado para ${email}`
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 'email' ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading || !email.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar código'
                )}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-sm font-medium text-gray-700">
                Código de verificação
              </Label>
              <Input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="000000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
                maxLength={6}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleBackToEmail}
                className="flex-1"
                disabled={isLoading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading || !code.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Verificar'
                )}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
