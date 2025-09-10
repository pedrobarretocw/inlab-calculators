'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RotateCcw, Calculator, Save, Mail, ArrowLeft, Sparkles, CheckCircle, History, Home } from 'lucide-react'
import { toast } from 'sonner'
import { PublicClerkProvider } from '@/components/auth/PublicClerkProvider'
import { usePublicAuth } from '@/hooks/usePublicAuth'
import { useCalculator } from '@/contexts/CalculatorContext'
// import { addEmailToActiveCampaign } from '@/lib/activecampaign' // Movido para API route


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
  calculationData?: Record<string, number | string | boolean>
  onShowSavedCalculations?: () => void
  onShowCalculatorHome?: () => void
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

    'custo-funcionario': '👥'
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
  onShowCalculatorHome,
  isFromSavedCalculation = false,
  savedCalculationType
}: CalculationResultProps) {
  
  // LOG PARA DEBUG
  // Logs removidos para limpar console
  
  const { showHome, refreshSavedCalculations, addSavedCalculation } = useCalculator()
  
  const [showEmailCapture, setShowEmailCapture] = useState(false)
  const [actionType, setActionType] = useState<'save' | 'reset'>('save')
  const [email, setEmail] = useState('')
  const [step, setStep] = useState<'email' | 'verify-code'>('email')
  const [verificationCode, setVerificationCode] = useState('')
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup')
  const [calculationName, setCalculationName] = useState('')
  const [showNameModal, setShowNameModal] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  
  const { user, isLoaded, isLoading, error, signInWithEmail, verifyCode } = usePublicAuth()

  const saveCalculation = async (currentEmail: string, currentActionType: 'save' | 'reset') => {
    // Criar objeto do cálculo salvo
    const newCalculation = {
      id: crypto.randomUUID(),
      calculator_slug: calculatorType || 'unknown',
      name: calculationName.trim() || undefined,
      inputs: calculationData || {},
      outputs: results.reduce((acc, result) => ({
        ...acc,
        [result.label]: result.value
      }), {}),
      created_at: new Date().toISOString()
    }

    // Adicionar imediatamente no contexto (usuário vê na hora)
    addSavedCalculation(newCalculation)
    
    // Pequeno delay para dar tempo do contexto atualizar
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Fechar modal e ir para Meus Cálculos
    setShowEmailCapture(false)
    setCalculationName('')
    if (onShowSavedCalculations) {
      onShowSavedCalculations()
    }

    // Extrair nome do email para ActiveCampaign
    const emailParts = currentEmail.split('@')
    const firstName = emailParts[0]?.split('.')[0] || ''
    
    // Salvar no banco em background (assíncrono)
    const payload = {
      email: currentEmail.trim(),
      calculatorSlug: calculatorType || 'unknown',
      name: calculationName.trim() || null,
      inputs: calculationData || {},
      outputs: results.reduce((acc, result) => ({
        ...acc,
        [result.label]: result.value
      }), {}),
      sessionId: crypto.randomUUID()
    }

    try {
      // Salvar no banco
      fetch('/calculadoras/api/save-calculation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then(response => {
        if (!response.ok) {
          console.error('Erro ao salvar no banco:', response.status)
        }
      }).catch(error => {
        console.error('Erro de rede ao salvar no banco:', error)
      })

      // Adicionar ao ActiveCampaign em background via API
      fetch('/api/add-to-activecampaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentEmail.trim(),
          firstName: firstName,
          lastName: undefined,
          phone: undefined
        }),
      }).then(async response => {
        const result = await response.json()
        if (result.success) {
          // Email adicionado com sucesso
        } else {
          // Falha ao adicionar email
        }
      }).catch(error => {
        // Erro inesperado ao adicionar no ActiveCampaign
      })
    } catch (error) {
      // Erro ao iniciar salvamento
    }
  }

  // Não precisamos mais detectar autenticação automática
  // O redirecionamento é feito no hook após verificação do código

  // Funções definidas antes dos retornos condicionais
  const handleSaveClick = async () => {
    setActionType('save')
    
    // Se já estiver logado, mostrar modal de nome primeiro
    if (user && isLoaded) {
      setShowNameModal(true)
      return
    }
    
    setShowEmailCapture(true)
  }

  const handleSaveWithName = async () => {
    if (user && isLoaded) {
      const userEmail = user.emailAddresses?.[0]?.emailAddress || 'user@example.com'
      await saveCalculation(userEmail, 'save')
      setShowNameModal(false)
      setCalculationName('') // Limpar o campo
    }
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

    try {
      const result = await signInWithEmail(email)
      
      if (result && result.success) {
        if (result.mode) {
          setAuthMode(result.mode)
        }
        setStep('verify-code')
        toast.success('Código de verificação enviado para seu email!')
      } else {
        toast.error((result && result.error) || 'Erro ao enviar código')
      }
    } catch (error) {
      toast.error('Erro ao enviar código. Tente novamente.')
    }
  }

  const handleCodeSubmit = async () => {
    if (!verificationCode.trim()) {
      toast.error('Por favor, digite o código de verificação')
      return
    }

    try {
      const result = await verifyCode(verificationCode.trim(), authMode)
      
      if (result && result.success) {
        // Sucesso - salvar e ir para Meus Cálculos
        await saveCalculation(email, actionType)
      } else {
        toast.error((result && result.error) || 'Código inválido')
      }
    } catch (error) {
      toast.error('Erro ao verificar código. Tente novamente.')
    }
  }

  const handleBackFromEmail = () => {
    setShowEmailCapture(false)
    setStep('email')
    setEmail('')
    setVerificationCode('')
    setCalculationName('') // Limpar o nome
  }

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      toast.error('Por favor, digite o código de verificação')
      return
    }

    setIsVerifying(true)
    try {
      const result = await verifyCode(verificationCode.trim(), authMode)
      
      if (result && result.success) {
        // Sucesso - salvar e ir para Meus Cálculos
        await saveCalculation(email, actionType)
      } else {
        toast.error((result && result.error) || 'Código inválido')
      }
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendCode = async () => {
    setIsResending(true)
    try {
      const result = await signInWithEmail(email)
      
      if (result && result.success) {
        if (result.mode) {
          setAuthMode(result.mode)
        }
        toast.success('Novo código enviado para seu email!')
      } else {
        toast.error((result && result.error) || 'Erro ao reenviar código')
      }
    } catch (error) {
      toast.error('Erro ao reenviar código. Tente novamente.')
    } finally {
      setIsResending(false)
    }
  }

  const handleSkipSave = () => {
    setShowEmailCapture(false)
    setCalculationName('') // Limpar o nome
  }

  if (!isVisible) return null

  // Modal de nome para usuários logados
  if (showNameModal) {
    return (
      <div className="absolute inset-0 z-10 rounded-lg overflow-hidden">
        <Card 
          className="h-full border border-gray-200/60 shadow-none backdrop-blur-xl"
          style={{ 
            backgroundColor: '#F5F5F5',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 8px 16px -4px rgba(0, 0, 0, 0.1)'
          }}
        >
          <CardContent className="p-6 h-full flex flex-col justify-center relative">
            {/* Back Button */}
            <button
              onClick={() => setShowNameModal(false)}
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-gray-100/80 hover:bg-gray-200/80 backdrop-blur-sm transition-all duration-200 flex items-center justify-center group"
            >
              <ArrowLeft className="h-4 w-4 text-gray-600 group-hover:text-gray-800" />
            </button>

            <div className="flex flex-col items-center space-y-6">
              {/* Title */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1 text-center">
                  Salvar Cálculo
                </h2>
                <p className="text-gray-600 text-xs leading-relaxed px-2 text-center">
                  Digite um nome para identificar este cálculo (opcional)
                </p>
              </div>

              {/* Form */}
              <div className="w-full space-y-3">
                <div className="text-left">
                  <Label htmlFor="name-input" className="text-xs font-medium text-gray-700">
                    Nome do Cálculo (opcional)
                  </Label>
                  <Input
                    id="name-input"
                    type="text"
                    value={calculationName}
                    onChange={(e) => setCalculationName(e.target.value)}
                    placeholder="Férias de Out 25"
                    className="mt-1 h-10 text-center bg-white border-gray-200 focus:border-blue-300 focus:ring-blue-200 transition-all text-sm"
                    maxLength={40}
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={handleSaveWithName}
                    className="w-full h-10 bg-[#BAFF1B] text-black font-semibold hover:bg-[#A8E616] transition-colors flex items-center gap-2 text-sm"
                  >
                    <Save className="h-3 w-3" />
                    Salvar Cálculo
                  </Button>

                  <button
                    onClick={() => {
                      setShowNameModal(false)
                      setCalculationName('') // Limpar o campo ao cancelar
                    }}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors w-full"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }



  // Tela de captura de email - Compacta para 500px
  if (showEmailCapture) {
    return (
      <div className="absolute inset-0 z-10 rounded-lg overflow-hidden">
        <Card 
          className="h-full border border-gray-200/60 shadow-none backdrop-blur-xl"
          style={{ 
            backgroundColor: '#F5F5F5',
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
                    : 'Digite o Código'
                  }
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed px-2 pt-2">
                  {step === 'email' 
                    ? (actionType === 'save' 
                      ? 'Digite seu email para salvar este cálculo e acessá-lo depois'
                      : 'Salve seus dados antes de fazer um novo cálculo para não perder o histórico'
                    )
                    : `Digite o código de 6 dígitos enviado para ${email}`
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
                      className="mt-1 h-10 text-center bg-white border-gray-200 focus:border-blue-300 focus:ring-blue-200 transition-all text-sm"
                    />
                  </div>
                  
                  <div className="text-left">
                    <Label htmlFor="calculation-name" className="text-xs font-medium text-gray-700">
                      Nome do Cálculo (opcional)
                    </Label>
                    <Input
                      id="calculation-name"
                      type="text"
                      value={calculationName}
                      onChange={(e) => setCalculationName(e.target.value)}
                      placeholder="Férias de Out 25"
                      className="mt-1 h-10 text-center bg-white border-gray-200 focus:border-blue-300 focus:ring-blue-200 transition-all text-sm"
                      maxLength={40}
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
              ) : (
                <div className="space-y-4">
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
                      className="mt-1 h-10 text-center bg-white border-gray-200 focus:border-blue-300 focus:ring-blue-200 transition-all text-lg font-mono tracking-widest"
                    />
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={handleVerifyCode}
                      disabled={isVerifying}
                      className="w-full h-10 bg-[#BAFF1B] text-black font-semibold hover:bg-[#A8E616] transition-colors flex items-center gap-2 text-sm"
                    >
                      {isVerifying ? (
                        <div className="w-3 h-3 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save className="h-3 w-3" />
                      )}
                      {isVerifying ? 'Verificando...' : 'Verificar e Salvar'}
                    </Button>

                    <Button
                      onClick={handleResendCode}
                      disabled={isResending}
                      variant="outline"
                      className="w-full h-8 border-gray-200 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2 text-xs"
                    >
                      {isResending ? (
                        <div className="w-3 h-3 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Mail className="h-3 w-3" />
                      )}
                      {isResending ? 'Reenviando...' : 'Reenviar Código'}
                    </Button>

                    <button
                      onClick={() => setStep('email')}
                      className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      Tentar outro email
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
        className="h-full border border-gray-200/60 shadow-none backdrop-blur-xl"
        style={{ 
          backgroundColor: '#F5F5F5',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 8px 16px -4px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Header com seta voltar - mais compacto para Custo do Funcionário */}
        <div className={`flex-shrink-0 px-4 border-b border-gray-200/60 relative ${
          calculatorType === 'custo-funcionario' || savedCalculationType === 'custo-funcionario'
            ? 'py-1.5'
            : 'py-2'
        }`}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onShowSavedCalculations && onShowSavedCalculations()
            }}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              showHome()
            }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Home className="h-4 w-4 text-gray-600" />
          </Button>
          
          <h2 className={`font-semibold text-gray-900 flex items-center justify-center gap-2 ${
            calculatorType === 'custo-funcionario' || savedCalculationType === 'custo-funcionario'
              ? 'text-base'
              : 'text-lg'
          }`}>
            <span className={
              calculatorType === 'custo-funcionario' || savedCalculationType === 'custo-funcionario'
                ? 'text-lg'
                : 'text-xl'
            }>
              {isFromSavedCalculation && savedCalculationType 
                ? getCalculationTypeIcon(savedCalculationType)
                : '📊'
              }
            </span>
            {isFromSavedCalculation && savedCalculationType 
              ? getCalculationTypeName(savedCalculationType)
              : title
            }
          </h2>
        </div>

        <CardContent className="p-2 flex-1 flex flex-col justify-between h-full">
          
          {/* Results - Com scroll se necessário e layout mais compacto para Custo do Funcionário */}
          <div className={`${calculatorType === 'custo-funcionario' || savedCalculationType === 'custo-funcionario' ? 'space-y-0.5' : 'space-y-1'} flex-1 overflow-y-auto`}>
            {results.map((result, index) => (
              <div 
                key={index} 
                className={`flex justify-between items-center rounded-lg backdrop-blur-sm transition-all border ${
                  result.highlight 
                    ? 'bg-gradient-to-r from-green-50/80 to-emerald-50/80 border-green-200/60 shadow-sm' 
                    : 'bg-white border-gray-200/50'
                } ${
                  calculatorType === 'custo-funcionario' || savedCalculationType === 'custo-funcionario' 
                    ? 'p-1.5' 
                    : 'p-2'
                }`}
              >
                <span className={`font-medium ${
                  result.highlight ? 'text-green-800' : 'text-gray-700'
                } ${
                  calculatorType === 'custo-funcionario' || savedCalculationType === 'custo-funcionario'
                    ? 'text-xs'
                    : 'text-sm'
                }`}>
                  {result.label}
                </span>
                <span className={`font-semibold ${
                  result.highlight 
                    ? 'text-green-600' 
                    : 'text-gray-900'
                } ${
                  result.highlight
                    ? (calculatorType === 'custo-funcionario' || savedCalculationType === 'custo-funcionario' ? 'text-sm' : 'text-base')
                    : (calculatorType === 'custo-funcionario' || savedCalculationType === 'custo-funcionario' ? 'text-xs' : 'text-sm')
                }`}>
                  {result.value}
                </span>
              </div>
            ))}
            
            {/* Disclaimer no final dos resultados - SEM LINHA */}
            <p className={`text-gray-500 text-center ${
              calculatorType === 'custo-funcionario' || savedCalculationType === 'custo-funcionario'
                ? 'text-[10px] pt-2'
                : 'text-xs pt-4'
            }`}>
              Lembre-se: estes valores são estimativas para te orientar
            </p>
          </div>
          
          {/* Actions - Fixo na parte inferior - mais compacto para Custo do Funcionário */}
          <div className={`flex-shrink-0 ${
            calculatorType === 'custo-funcionario' || savedCalculationType === 'custo-funcionario'
              ? 'pt-1 space-y-1'
              : 'pt-2 space-y-1.5'
          }`}>
            {/* Buttons layout responsivo */}
            {!isFromSavedCalculation && (
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
