'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail } from 'lucide-react'
import { toast } from 'sonner'
import { usePublicAuth } from '@/hooks/usePublicAuth'

interface SimpleLoginFormProps {
  onSuccess: () => void
}

export function SimpleLoginForm({ onSuccess }: SimpleLoginFormProps) {
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  
  const { signInWithEmail, verifyCode, isLoading } = usePublicAuth()

  // COPIADO EXATO DO CALCULATIONRESULT
  const handleEmailSubmit = async () => {
    if (!email.trim()) {
      toast.error('Por favor, digite seu email')
      return
    }

    try {
      console.log('[EmailSubmit] Iniciando processo de verificação')
      const result = await signInWithEmail(email)
      
      if (result && result.success) {
        console.log('[EmailSubmit] Email enviado com sucesso')
        if (result.mode) {
          setAuthMode(result.mode)
        }
        setStep('code')
        toast.success('Código de verificação enviado para seu email!')
      } else {
        console.error('[EmailSubmit] Erro ao enviar email:', result && result.error)
        toast.error((result && result.error) || 'Erro ao enviar código')
      }
    } catch (error) {
      console.error('[EmailSubmit] Erro na requisição:', error)
      toast.error('Erro ao enviar código. Tente novamente.')
    }
  }

  // COPIADO EXATO DO CALCULATIONRESULT
  const handleVerifyCode = async () => {
    if (!code.trim()) {
      toast.error('Por favor, digite o código de verificação')
      return
    }

    setIsVerifying(true)
    try {
      const result = await verifyCode(code.trim(), authMode)
      
      if (result && result.success) {
        // Sucesso - chamar onSuccess
        onSuccess()
      } else {
        toast.error((result && result.error) || 'Código inválido')
      }
    } catch (error) {
      toast.error('Erro ao verificar código. Tente novamente.')
    } finally {
      setIsVerifying(false)
    }
  }

  // COPIADO EXATO DO CALCULATIONRESULT
  const handleResendCode = async () => {
    setIsResending(true)
    try {
      const result = await signInWithEmail(email)
      
      if (result && result.success) {
        console.log('[ResendCode] Código reenviado com sucesso')
        if (result.mode) {
          setAuthMode(result.mode)
        }
        toast.success('Novo código enviado para seu email!')
      } else {
        console.error('[ResendCode] Erro ao reenviar:', result && result.error)
        toast.error((result && result.error) || 'Erro ao reenviar código')
      }
    } catch (error) {
      console.error('[ResendCode] Erro na requisição:', error)
      toast.error('Erro ao reenviar código. Tente novamente.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="w-full space-y-4">
      {step === 'email' ? (
        <div className="space-y-4">
          {/* Campo de email */}
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
              className="h-10 bg-white border-gray-200 focus:border-blue-300 focus:ring-blue-200 transition-all"
              required
              disabled={isLoading}
            />
          </div>

          {/* Botão */}
          <Button
            onClick={handleEmailSubmit}
            disabled={isLoading || !email.trim()}
            className="w-full h-10 bg-[#BAFF1B] text-black font-semibold hover:bg-[#A8E616] transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            {isLoading ? 'Enviando...' : 'Login / Cadastro'}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
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
              maxLength={6}
              className="h-10 text-center bg-white border-gray-200 focus:border-blue-300 focus:ring-blue-200 transition-all text-lg font-mono tracking-widest"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Button
              onClick={handleVerifyCode}
              disabled={isVerifying || !code.trim()}
              className="w-full h-10 bg-[#BAFF1B] text-black font-semibold hover:bg-[#A8E616] transition-colors"
            >
              {isVerifying ? (
                <div className="w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />
              ) : (
                'Verificar'
              )}
            </Button>

            <Button
              onClick={handleResendCode}
              variant="outline"
              disabled={isResending}
              className="w-full h-8 border-gray-200 bg-white hover:bg-gray-50 transition-colors text-sm"
            >
              {isResending ? (
                <div className="w-3 h-3 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />
              ) : (
                'Reenviar código'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
