'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail } from 'lucide-react'
import { toast } from 'sonner'
import { usePublicAuth } from '@/hooks/usePublicAuth'

interface PublicLoginModalProps {
  onSuccess: () => void
  onCancel: () => void
  isInline?: boolean
}

export function PublicLoginModal({ onSuccess, onCancel }: PublicLoginModalProps) {
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [calculationName, setCalculationName] = useState('')
  
  const { signInWithEmail, verifyCode, isLoading } = usePublicAuth()

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error('Por favor, digite seu email')
      return
    }

    try {
      const result = await signInWithEmail(email.trim())
      if (result && result.success) {
        setStep('code')
        toast.success('Código enviado para seu email!')
      } else {
        toast.error((result && 'error' in result && result.error) || 'Erro ao enviar código')
      }
    } catch {
      toast.error('Erro ao enviar código. Tente novamente.')
    }
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) {
      toast.error('Por favor, digite o código de verificação')
      return
    }

    try {
      const result = await verifyCode(code.trim(), 'signup')
      if (result && result.success) {
        onSuccess()
      } else {
        toast.error((result && 'error' in result && result.error) || 'Código inválido')
      }
    } catch {
      toast.error('Erro ao verificar código. Tente novamente.')
    }
  }

  return (
    <div className="w-full space-y-6">
      {step === 'email' ? (
        <>
          {/* Título e descrição */}
          <div className="text-center space-y-2">
            <h2 className="text-lg font-medium text-gray-900">
              Salvar Cálculo
            </h2>
            <p className="text-sm text-gray-600">
              Digite seu email para salvar este cálculo e acessá-lo depois
            </p>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
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

            {/* Campo de nome do cálculo */}
            <div className="space-y-2">
              <Label htmlFor="calculation-name" className="text-sm font-medium text-gray-700">
                Nome do cálculo
              </Label>
              <Input
                id="calculation-name"
                type="text"
                value={calculationName}
                onChange={(e) => setCalculationName(e.target.value)}
                placeholder="Férias de Out 25"
                className="h-10 bg-white border-gray-200 focus:border-blue-300 focus:ring-blue-200 transition-all"
                disabled={isLoading}
              />
            </div>

            {/* Botões */}
            <div className="space-y-2">
              <Button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full h-10 bg-[#BAFF1B] text-black font-semibold hover:bg-[#A8E616] transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                {isLoading ? 'Enviando...' : 'Enviar Código'}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="w-full h-8 border-gray-200 bg-white hover:bg-gray-50 transition-colors text-sm"
                disabled={isLoading}
              >
                Não quero salvar
              </Button>
            </div>
          </form>
        </>
      ) : (
        <>
          {/* Tela de código */}
          <div className="text-center space-y-2">
            <h2 className="text-lg font-medium text-gray-900">
              Digite o Código
            </h2>
            <p className="text-sm text-gray-600 pt-2">
              Digite o código de 6 dígitos enviado para {email}
            </p>
          </div>

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
                maxLength={6}
                className="h-10 text-center bg-white border-gray-200 focus:border-blue-300 focus:ring-blue-200 transition-all text-lg font-mono tracking-widest"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Button
                type="submit"
                disabled={isLoading || !code.trim()}
                className="w-full h-10 bg-[#BAFF1B] text-black font-semibold hover:bg-[#A8E616] transition-colors"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Verificar e Salvar'
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('email')}
                className="w-full h-8 border-gray-200 bg-white hover:bg-gray-50 transition-colors text-sm"
                disabled={isLoading}
              >
                Tentar outro email
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  )
}
