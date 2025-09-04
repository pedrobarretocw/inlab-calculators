'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { InfoIcon, Calendar, Star, ArrowLeft, Home, RotateCcw } from 'lucide-react'
import { CalculationResult } from './CalculationResult'
import { CurrencyInput } from '@/components/ui/currency-input'
import { NumberInput } from '@/components/ui/number-input'
import { decimoTerceiroSchema, type DecimoTerceiroInput } from '@/lib/schemas'
import { calcularDecimoTerceiro } from '@/lib/calculations'
import { formatCurrency } from '@/lib/format'
import { track } from '@/lib/tracking'
import { type DecimoTerceiroResult } from '@/lib/types'
import { showValidationErrors, showCalculationSuccess } from '@/lib/validation-feedback'
import { InlineToastContainer } from '@/components/ui/inline-toast'
import { CalculatorErrorToastContainer } from '@/components/ui/calculator-error-toast'
import { InlineValidationError } from '@/components/ui/inline-validation-error'
import { ViewSavedCalculationsButton } from './ViewSavedCalculationsButton'
import { SavedCalculationsView } from './SavedCalculationsView'
import { useCalculationResult } from '@/hooks/useCalculationResult'
import { CalculationParser } from '@/lib/calculation-parser'
import { useCalculator } from '@/contexts/CalculatorContext'
import { useUser } from '@clerk/nextjs'
import { PublicLoginModal } from '@/components/auth/PublicLoginModal'


interface DecimoTerceiroProps {
  onCalculate?: (result: DecimoTerceiroResult) => void
  onStart?: () => void
  variant?: string
  articleSlug?: string
  showBackButton?: boolean
  onBack?: () => void

}

export function DecimoTerceiro({ onCalculate, onStart, variant = '13o-salario', articleSlug, showBackButton, onBack }: DecimoTerceiroProps) {
  const [hasStarted, setHasStarted] = useState(false)
  const [showSavedCalculations, setShowSavedCalculations] = useState(false)
  const [showEmailCapture, setShowEmailCapture] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [fadeClass, setFadeClass] = useState('opacity-100')

  // Hooks
  const { showHome } = useCalculator()
  const { user } = useUser()
  const calculationResult = useCalculationResult('13o-salario')
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [validationMessage, setValidationMessage] = useState('')
  
  const form = useForm<DecimoTerceiroInput>({
    resolver: zodResolver(decimoTerceiroSchema),
    defaultValues: {
      salarioMensal: 0,
      mesesTrabalhados: 12,
    },
  })

  // Track view on mount
  useEffect(() => {
    track({
      event: 'view',
      calculatorSlug: '13o-salario',
      variant,
      articleSlug,
    })
  }, [variant, articleSlug])

  const handleInputChange = () => {
    if (!hasStarted) {
      setHasStarted(true)
      onStart?.()
      track({
        event: 'start',
        calculatorSlug: '13o-salario',
        variant,
        articleSlug,
      })
    }
  }

  const onSubmit = (data: DecimoTerceiroInput) => {
    const result = calcularDecimoTerceiro(data)
    calculationResult.setNewCalculation(result)
    onCalculate?.(result)
    
    // Toast de sucesso
    showCalculationSuccess('13º Salário')
    
    track({
      event: 'calculate',
      calculatorSlug: '13o-salario',
      variant,
      articleSlug,
      metadata: { inputs: data, outputs: calculationResult },
    })
  }

  const onError = async () => {
    console.log('[DEBUG] onError called, errors:', form.formState.errors)
    
    // Forçar validação antes de verificar erros
    await form.trigger()
    
    const errors = form.formState.errors
    console.log('[DEBUG] Errors after trigger:', errors)
    
    if (Object.keys(errors).length > 0) {
      // Criar mensagem de erro
      const firstErrorField = Object.keys(errors)[0]
      const fieldNames: Record<string, string> = {
        salarioMensal: 'Salário Mensal',
        mesesTrabalhados: 'Meses Trabalhados'
      }
      
      const fieldName = fieldNames[firstErrorField] || firstErrorField
      setValidationMessage(`O campo "${fieldName}" deve ser preenchido corretamente.`)
      setShowValidationModal(true)
    } else {
      // Se não há erros detectados, mostrar erro genérico
      setValidationMessage('Por favor, preencha todos os campos obrigatórios.')
      setShowValidationModal(true)
    }
  }

  const handleReset = () => {
    calculationResult.reset()
    form.reset()
    setHasStarted(false)
  }



  // Mostrar cálculos salvos
  if (showSavedCalculations) {
    return (
      <TooltipProvider>
        <div className="relative w-full max-w-lg">
          <Card className={`w-full shadow-lg border border-gray-400 rounded-2xl overflow-hidden transition-opacity duration-300 ${fadeClass}`} style={{ backgroundColor: '#F5F5F5' }}>
                        <SavedCalculationsView

              onBack={() => {
                // Animação de fade-out
                setFadeClass('opacity-0')
                setTimeout(() => {
                  // Resetar tudo e ir para tela de novo cálculo
                  calculationResult.reset()
                  form.reset()
                  setShowSavedCalculations(false)
                  // Fade-in da tela principal
                  setFadeClass('opacity-100')
                }, 150)
              }}
              onShowCalculatorHome={() => {
                // Fecha meus calculos primeiro
                setShowSavedCalculations(false)
                // Depois mostra o home
                showHome()
              }}
              onSelectCalculation={(calc) => {
                // SOLID: Responsabilidade única - apenas parse e delegação
                const parsedData = CalculationParser.parseByType(calc)
                calculationResult.setSavedCalculation(parsedData, calc.calculator_slug)
                setShowSavedCalculations(false)
              }}
            />
          </Card>
        </div>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <div className="relative w-full max-w-lg">
        {/* Erro de Validação FORA do Card para ficar por cima */}
        <InlineValidationError
          isVisible={showValidationModal}
          onClose={() => setShowValidationModal(false)}
          title="Ops! Alguns campos estão em branco"
          message={validationMessage}
          showImage={true}
        />
        
        <Card className={`quiz-snake-border w-full shadow-lg rounded-2xl overflow-hidden transition-opacity duration-300 ${fadeClass}`}>
          {/* Toast Containers */}
          <InlineToastContainer />
          <CalculatorErrorToastContainer />
          
          {/* Back Button removido */}
          
          <CardHeader className="pb-1 px-6 pt-1">
            <CardTitle className="text-lg font-medium text-gray-900 flex items-center justify-center gap-2">
              <span>💰</span>
              Calculadora de 13º Salário
            </CardTitle>
            <CardDescription className="text-center text-sm text-gray-600 mt-1">
              Calcule seu 13º salário de forma rápida e fácil
            </CardDescription>
            
            {/* Botão Ver Cálculos Salvos abaixo da descrição - sempre visível */}
            <div className="flex justify-center mt-1">
              <button
                onClick={() => {
                  console.log('[DecimoTerceiro] Ver cálculos salvos - indo direto')
                  setShowSavedCalculations(true)
                }}
                className="px-2 py-1.5 rounded-md border border-gray-200 bg-white hover:bg-gray-50 transition-colors flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-700"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="font-medium">Ver Cálculos Salvos</span>
              </button>
            </div>
          </CardHeader>
        
          <CardContent className="px-6 pb-4 pt-1">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-5">
                {/* Campo de Salário - Minimalista */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Salário Mensal</span>
                    <Tooltip>
                      <TooltipTrigger>
                        <InfoIcon className="h-3 w-3 text-gray-400 hover:text-gray-600 transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-white text-black border border-gray-200 shadow-lg max-w-48" sideOffset={5}>
                        <p>Seu salário bruto mensal</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <CurrencyInput
                    label=""
                    placeholder="0,00"
                    value={form.watch('salarioMensal') || 0}
                    onChange={(value) => {
                      form.setValue('salarioMensal', value || undefined as any)
                      handleInputChange()
                    }}
                    onInputChange={handleInputChange}
                  />
                </div>

                {/* Campo de Meses */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">📅 Meses Trabalhados</span>
                    <Tooltip>
                      <TooltipTrigger>
                        <InfoIcon className="h-3 w-3 text-gray-400 hover:text-gray-600 transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-white text-black border border-gray-200 shadow-lg max-w-48" sideOffset={5}>
                        <p>Meses que você trabalhou neste ano</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <NumberInput
                    label=""
                    placeholder="12"
                    value={form.watch('mesesTrabalhados')}
                    onChange={(value) => {
                      form.setValue('mesesTrabalhados', value)
                      handleInputChange()
                    }}
                    onInputChange={handleInputChange}
                    min={1}
                    max={12}
                    icon={Calendar}
                    iconColor="text-purple-600"
                  />
                </div>

                <div className="space-y-2 pt-1">
                  {/* Botão Calcular centralizado */}
                  <div className="flex justify-center">
                    <Button 
                      type="submit" 
                      className="max-w-[160px] px-4 py-2 text-sm font-medium text-black transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                      style={{ backgroundColor: '#BAFF1B' }}
                    >
                      Calcular 13º Salário
                    </Button>
                  </div>
                  
                  {/* Texto clicável para outras calculadoras */}
                  <div className="flex justify-center mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        console.log('[DecimoTerceiro] Navegando para outras calculadoras')
                        showHome()
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                    >
                      Experimente <span className="font-bold underline">outras calculadoras</span> também ✨
                    </button>
                  </div>
                  

                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Modal de Login Simplificado */}
        {showEmailCapture && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/5 backdrop-blur-sm rounded-lg">
            <Card className="w-full max-w-sm mx-4 border border-gray-200/60">
              <CardHeader>
                <CardTitle className="text-lg">Faça login para continuar</CardTitle>
                <CardDescription className="text-sm">
                  Entre na sua conta para ver seus cálculos salvos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => window.location.href = '/calculadoras/login'}
                  className="w-full bg-[#BAFF1B] text-black hover:bg-[#A8E616]"
                >
                  Fazer Login
                </Button>
                <button
                  onClick={() => setShowEmailCapture(false)}
                  className="w-full text-xs text-gray-500 hover:text-gray-700"
                >
                  Voltar
                </button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Overlay de Resultados */}
        <CalculationResult
          title="13º Salário"
          results={calculationResult.getFormattedResults()}
          onReset={handleReset}
          isVisible={calculationResult.isVisible}
          calculatorType="13o-salario"
          calculationData={form.getValues()}
          onShowSavedCalculations={() => setShowSavedCalculations(true)}
          onShowCalculatorHome={() => showHome()}
          isFromSavedCalculation={calculationResult.result.isFromSaved}
          savedCalculationType={calculationResult.result.savedType}
        />
      </div>

      {/* Modal de Login - Dentro do card, estilo Apple */}
      {showLoginModal && (
        <div className="absolute inset-0 z-10 rounded-lg overflow-hidden">
          <div 
            className="h-full border border-gray-200/60 shadow-none backdrop-blur-xl rounded-lg"
            style={{ 
              backgroundColor: '#F5F5F5',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 8px 16px -4px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="p-6 h-full flex flex-col justify-center">
              <PublicLoginModal
                onSuccess={() => setShowLoginModal(false)}
                onCancel={() => setShowLoginModal(false)}
                isInline={true}
              />
            </div>
          </div>
        </div>
      )}
    </TooltipProvider>
  )
}
