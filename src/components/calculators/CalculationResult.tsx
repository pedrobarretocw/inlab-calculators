'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RotateCcw, Calculator, Save, Mail, ArrowLeft, Sparkles, CheckCircle, History } from 'lucide-react'
import { toast } from 'sonner'
import { PublicClerkProvider } from '@/components/auth/PublicClerkProvider'
import { usePublicAuth } from '@/hooks/usePublicAuth'

interface CalculationResultProps {
  title: string
  results: Array<{
    label: string
    value: string
    highlight?: boolean
  }>
  onReset: () => void
  isVisible: boolean
  calculatorType?: string
  calculationData?: Record<string, any>
  onShowSavedCalculations?: () => void
  isFromSavedCalculation?: boolean
  savedCalculationType?: string // Tipo real do cálculo salvo (se diferente do atual)
}

// Função para mapear tipos de cálculo para nomes amigáveis
const getCalculationTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    '13o-salario': '13º Salário',
    'ferias': 'Férias',

    'custo-funcionario': 'Custo do Funcionário'
  }
  return typeMap[type] || type
}

// Função para obter ícone do tipo de cálculo
const getCalculationTypeIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    '13o-salario': '💰',
    'ferias': '🏖️',

    'custo-funcionario': '📊'
  }
  return iconMap[type] || '📋'
}

// Componente interno que usa os hooks do Clerk
function CalculationResultContent({ 
  title, 
  results, 
  onReset, 
  isVisible, 
  calculatorType, 
  calculationData,
  onShowSavedCalculations,
  isFromSavedCalculation = false,
  savedCalculationType
}: CalculationResultProps) {
  const [showEmailCapture, setShowEmailCapture] = useState(false)
  const [actionType, setActionType] = useState<'save' | 'reset'>('save')
  const [email, setEmail] = useState('')
  const [step, setStep] = useState<'email' | 'verify-code' | 'success'>('email')
  const [verificationCode, setVerificationCode] = useState('')
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup')
  
  const { user, isLoaded, isLoading, error, signInWithEmail, verifyCode } = usePublicAuth()

  const saveCalculation = async (currentEmail: string, currentActionType: 'save' | 'reset') => {
    try {
      console.log('[Frontend] Saving calculation...')
      const payload = {
        email: currentEmail.trim(),
        calculatorSlug: calculatorType || 'unknown',
        inputs: calculationData || {},
        outputs: results.reduce((acc, result) => ({
          ...acc,
          [result.label]: result.value
        }), {}),
        sessionId: crypto.randomUUID()
      }
      console.log('[Frontend] Payload:', payload)

      const response = await fetch('/calculadoras/api/save-calculation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      console.log('[Frontend] Response status:', response.status)
      
      if (response.ok) {
        const responseData = await response.json()
        console.log('[Frontend] Success response:', responseData)
        toast.success('Cálculo salvo com sucesso!')
        
        // Se o usuário não estava logado (está no fluxo de email), ir para tela de sucesso
        if (showEmailCapture && step !== 'success') {
          setStep('success')
        } else {
          // Se já estava logado, fechar modal e redirecionar direto
          setShowEmailCapture(false)
          if (onShowSavedCalculations) {
            setTimeout(() => {
              onShowSavedCalculations()
            }, 100)
          }
        }
      } else {
        const errorData = await response.text()
        console.error('[Frontend] Error response:', response.status, errorData)
        toast.error(`Erro ao salvar cálculo: ${response.status}`)
      }
    } catch (error) {
      console.error('[Frontend] Fetch error:', error)
      toast.error('Erro de rede ao salvar cálculo. Tente novamente.')
    }
  }

  // Não precisamos mais detectar autenticação automática
  // O redirecionamento é feito no hook após verificação do código

  if (!isVisible) return null

  const handleSaveClick = async () => {
    setActionType('save')
    
    // Se já estiver logado, salvar direto
    if (user && isLoaded) {
      const userEmail = user.emailAddresses?.[0]?.emailAddress || 'user@example.com'
      await saveCalculation(userEmail, 'save')
      return
    }
    
    setShowEmailCapture(true)
  }

  const handleResetClick = async () => {
    setActionType('reset')
    
    // Se já estiver logado, resetar direto sem salvar
    if (user && isLoaded) {
      onReset()
      return
    }
    
    setShowEmailCapture(true)
  }

  const handleEmailSubmit = async () => {
    if (!email.trim()) {
      toast.error('Por favor, digite seu email')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Por favor, digite um email válido')
      return
    }

    const result = await signInWithEmail(email.trim())
    
    if (result && result.success) {
      setAuthMode(result.mode)
      setStep('verify-code')
      toast.success('Código de verificação enviado para seu email!')
    } else {
      toast.error((result && result.error) || 'Erro ao enviar código')
    }
  }

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      toast.error('Por favor, digite o código de verificação')
      return
    }

    const result = await verifyCode(
      verificationCode.trim(), 
      authMode,
      // Callback para salvar cálculo após autenticação
      () => saveCalculation(email, actionType)
    )
    
    if (result && result.success) {
      // Sucesso - mostrar tela de sucesso
      setStep('success')
    } else {
      toast.error((result && result.error) || 'Código inválido')
    }
  }

  const handleSkipSave = () => {
    setShowEmailCapture(false)
    if (actionType === 'reset') {
      onReset()
    }
  }

  const handleBackFromEmail = () => {
    setShowEmailCapture(false)
    setEmail('')
    setStep('email')
  }

  // Tela de captura de email - Compacta para 500px
  if (showEmailCapture) {
    return (
      <div className="absolute inset-0 z-10 rounded-lg overflow-hidden">
        <Card 
          className="h-full border border-gray-200/60 shadow-none bg-white/95 backdrop-blur-xl"
          style={{ 
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 8px 16px -4px rgba(0, 0, 0, 0.1)'
          }}
        >
          <CardContent className="p-6 h-full flex flex-col justify-center relative">
            {/* Back Button */}
            <button
              onClick={handleBackFromEmail}
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-gray-100/80 hover:bg-gray-200/80 backdrop-blur-sm transition-all duration-200 flex items-center justify-center group"
            >
              <ArrowLeft className="h-4 w-4 text-gray-600 group-hover:text-gray-800" />
            </button>

            <div className="text-center space-y-5 max-w-sm mx-auto">
              {/* Icon - Menor */}
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                {step === 'email' ? <Mail className="h-8 w-8 text-white" /> : <Sparkles className="h-8 w-8 text-white" />}
              </div>

              {/* Title - Compacto */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  {step === 'email' 
                    ? (actionType === 'save' ? 'Salvar Cálculo' : 'Salvar Histórico')
                    : 'Verifique seu Email'
                  }
                </h2>
                <p className="text-gray-600 text-xs leading-relaxed px-2">
                  {step === 'email' 
                    ? (actionType === 'save' 
                      ? 'Digite seu email para salvar este cálculo e acessá-lo depois'
                      : 'Salve seus dados antes de fazer um novo cálculo para não perder o histórico'
                    )
                    : `Enviamos um link de acesso para ${email}. Clique no link do email para salvar automaticamente seu cálculo.`
                  }
                </p>
              </div>

              {/* Forms */}
              {step === 'email' ? (
                <div className="space-y-3">
                  <div className="text-left">
                    <Label htmlFor="email" className="text-xs font-medium text-gray-700">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="mt-1 h-10 text-center bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-300 focus:ring-blue-200 transition-all text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={handleEmailSubmit}
                      disabled={isLoading}
                      className="w-full h-10 bg-[#BAFF1B] text-black font-semibold hover:bg-[#A8E616] transition-colors flex items-center gap-2 text-sm"
                    >
                      {isLoading ? (
                        <div className="w-3 h-3 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Mail className="h-3 w-3" />
                      )}
                      {isLoading ? 'Enviando...' : 'Enviar Código'}
                    </Button>

                    <button
                      onClick={handleSkipSave}
                      className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {actionType === 'save' ? 'Não quero salvar' : 'Pular e continuar'}
                    </button>
                  </div>
                </div>
              ) : step === 'verify-code' ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Digite o código recebido</span>
                    </div>
                    <p className="text-xs text-blue-700">
                      Enviamos um código de 6 dígitos para {email}
                    </p>
                  </div>

                  <div className="text-left">
                    <Label htmlFor="code" className="text-xs font-medium text-gray-700">
                      Código de verificação
                    </Label>
                    <Input
                      id="code"
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="123456"
                      maxLength={6}
                      className="mt-1 h-10 text-center bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-300 focus:ring-blue-200 transition-all text-lg font-mono tracking-widest"
                    />
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={handleVerifyCode}
                      disabled={isLoading}
                      className="w-full h-10 bg-[#BAFF1B] text-black font-semibold hover:bg-[#A8E616] transition-colors flex items-center gap-2 text-sm"
                    >
                      {isLoading ? (
                        <div className="w-3 h-3 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save className="h-3 w-3" />
                      )}
                      {isLoading ? 'Verificando...' : 'Verificar e Salvar'}
                    </Button>

                    <Button
                      onClick={handleEmailSubmit}
                      disabled={isLoading}
                      variant="outline"
                      className="w-full h-8 border-gray-200 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2 text-xs"
                    >
                      {isLoading ? (
                        <div className="w-3 h-3 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Mail className="h-3 w-3" />
                      )}
                      {isLoading ? 'Reenviando...' : 'Reenviar Código'}
                    </Button>

                    <button
                      onClick={() => setStep('email')}
                      className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      Tentar outro email
                    </button>
                  </div>
                </div>
              ) : (
                // Tela de sucesso
                <div className="space-y-4 text-center">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <Sparkles className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Cálculo salvo com sucesso!
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                      Você está logado como:
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {email}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <Button
                      onClick={() => {
                        setShowEmailCapture(false)
                        if (actionType === 'reset') {
                          onReset()
                        }
                        // Redirecionar para cálculos salvos
                        if (onShowSavedCalculations) {
                          setTimeout(() => {
                            onShowSavedCalculations()
                          }, 100)
                        }
                      }}
                      className="w-full h-10 bg-[#BAFF1B] text-black font-semibold hover:bg-[#A8E616] transition-colors text-sm"
                    >
                      Ver Meus Cálculos Salvos
                    </Button>
                    
                    <button
                      onClick={() => {
                        setShowEmailCapture(false)
                        if (actionType === 'reset') {
                          onReset()
                        }
                      }}
                      className="text-xs text-gray-600 hover:text-gray-800 transition-colors block w-full"
                    >
                      {actionType === 'reset' ? 'Fazer Novo Cálculo' : 'Continuar aqui'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Tela de resultados principal - Otimizada para 500px
  return (
    <div className="absolute inset-0 z-10 rounded-lg overflow-hidden">
      <Card 
        className="h-full border border-gray-200/60 shadow-none bg-white/95 backdrop-blur-xl"
        style={{ 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 8px 16px -4px rgba(0, 0, 0, 0.1)'
        }}
      >
        <CardContent className="p-3 flex-1 flex flex-col justify-between h-full">
          {/* Header sutil com tipo de cálculo */}
          {isFromSavedCalculation && savedCalculationType && (
            <div className="mb-2 pb-2 border-b border-gray-200/40">
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-lg">
                  {getCalculationTypeIcon(savedCalculationType)}
                </span>
                <span className="text-xs font-medium text-gray-600 tracking-wide">
                  {getCalculationTypeName(savedCalculationType)}
                </span>
              </div>
            </div>
          )}
          
          {/* Results - Com scroll se necessário */}
          <div className="space-y-1.5 flex-1 overflow-y-auto">
            {results.map((result, index) => (
              <div 
                key={index} 
                className={`flex justify-between items-center p-2 rounded-lg backdrop-blur-sm transition-all border ${
                  result.highlight 
                    ? 'bg-gradient-to-r from-green-50/80 to-emerald-50/80 border-green-200/60 shadow-sm' 
                    : 'bg-gray-50/60 border-gray-200/50'
                }`}
              >
                <span className={`font-medium text-sm ${
                  result.highlight ? 'text-green-800' : 'text-gray-700'
                }`}>
                  {result.label}
                </span>
                <span className={`font-semibold ${
                  result.highlight 
                    ? 'text-green-600 text-base' 
                    : 'text-gray-900 text-sm'
                }`}>
                  {result.value}
                </span>
              </div>
            ))}
            
            {/* Disclaimer no final dos resultados */}
            <p className="text-xs text-gray-500 text-center pt-4 border-t border-gray-200/30">
              Lembre-se: estes valores são estimativas para te orientar
            </p>
          </div>
          
          {/* Actions - Fixo na parte inferior */}
          <div className="pt-2 border-t border-gray-200/50 space-y-1.5 flex-shrink-0">
            {/* Buttons layout responsivo */}
            {!isFromSavedCalculation ? (
              // Botões normais (cálculo novo)
              user && isLoaded ? (
                // 3 botões quando logado - grid responsivo
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      onClick={handleSaveClick}
                      className="h-10 bg-[#BAFF1B] text-black font-semibold hover:bg-[#A8E616] transition-all flex items-center gap-2 shadow-sm text-sm"
                    >
                      <Save className="h-3 w-3" />
                      Salvar
                    </Button>
                    
                    <Button 
                      onClick={handleResetClick}
                      variant="outline"
                      className="h-10 border-gray-200 bg-white/50 backdrop-blur-sm hover:bg-gray-50/80 hover:border-gray-300 transition-all flex items-center gap-2 text-sm"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Refazer
                    </Button>
                  </div>
                  
                  <Button 
                    onClick={() => onShowSavedCalculations && onShowSavedCalculations()}
                    variant="outline"
                    className="w-full h-9 border-blue-200 bg-blue-50/50 backdrop-blur-sm hover:bg-blue-100/80 hover:border-blue-300 transition-all flex items-center gap-2 text-sm text-blue-700"
                  >
                    <History className="h-3 w-3" />
                    Meus Cálculos
                  </Button>
                </div>
              ) : (
                // 2 botões quando não logado - layout original
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={handleSaveClick}
                    className="h-10 bg-[#BAFF1B] text-black font-semibold hover:bg-[#A8E616] transition-all flex items-center gap-2 shadow-sm text-sm"
                  >
                    <Save className="h-3 w-3" />
                    Salvar
                  </Button>
                  
                  <Button 
                    onClick={handleResetClick}
                    variant="outline"
                    className="h-10 border-gray-200 bg-white/50 backdrop-blur-sm hover:bg-gray-50/80 hover:border-gray-300 transition-all flex items-center gap-2 text-sm"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Refazer
                  </Button>
                </div>
              )
            ) : (
              // Apenas botão de voltar para cálculos salvos
              <div className="flex justify-center">
                <Button 
                  onClick={() => onShowSavedCalculations && onShowSavedCalculations()}
                  variant="outline"
                  className="w-full max-w-64 h-10 border-blue-200 bg-blue-50/50 backdrop-blur-sm hover:bg-blue-100/80 hover:border-blue-300 transition-all flex items-center gap-2 text-sm text-blue-700"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Voltar aos Cálculos
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente principal que provê o contexto do Clerk
export function CalculationResult(props: CalculationResultProps) {
  return (
    <PublicClerkProvider>
      <CalculationResultContent {...props} />
    </PublicClerkProvider>
  )
}
