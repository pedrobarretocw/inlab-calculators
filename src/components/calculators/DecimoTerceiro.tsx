'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { InfoIcon, Calendar, Star, ArrowLeft, Home } from 'lucide-react'
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
import { ViewSavedCalculationsButton } from './ViewSavedCalculationsButton'
import { SavedCalculationsView } from './SavedCalculationsView'
import { useCalculationResult } from '@/hooks/useCalculationResult'
import { CalculationParser } from '@/lib/calculation-parser'
import { CalculatorHome } from './CalculatorHome'

interface DecimoTerceiroProps {
  onCalculate?: (result: DecimoTerceiroResult) => void
  onStart?: () => void
  variant?: string
  articleSlug?: string
  showBackButton?: boolean
  onBack?: () => void
  onNavigateToCalculator?: (calculatorId: string) => void
}

export function DecimoTerceiro({ onCalculate, onStart, variant = '13o-salario', articleSlug, showBackButton, onBack, onNavigateToCalculator }: DecimoTerceiroProps) {
  const [hasStarted, setHasStarted] = useState(false)
  const [showSavedCalculations, setShowSavedCalculations] = useState(false)
  const [showEmailCapture, setShowEmailCapture] = useState(false)
  const [showCalculatorHome, setShowCalculatorHome] = useState(false)
  
  // Hook limpo para gerenciar resultados
  const calculationResult = useCalculationResult('13o-salario')
  
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

  const onError = () => {
    showValidationErrors(form.formState.errors, {
      title: "Ops! Alguns campos estão em branco"
    })
  }

  const handleReset = () => {
    calculationResult.reset()
    form.reset()
    setHasStarted(false)
  }

  // Mostrar home de calculadoras
  if (showCalculatorHome) {
    return (
      <TooltipProvider>
        <div className="relative w-full max-w-lg">
          <Card className="w-full h-[500px] shadow-lg border border-gray-400 rounded-2xl overflow-hidden" style={{ backgroundColor: '#F5F5F5' }}>
            <CalculatorHome
              onSelectCalculator={(calculatorId) => {
                console.log('[DEBUG] Navegando para calculadora:', calculatorId)
                if (calculatorId === '13o-salario') {
                  // Se selecionar 13º salário, fecha home e meus calculos, volta pra tela principal
                  setShowCalculatorHome(false)
                  setShowSavedCalculations(false)
                  calculationResult.reset()
                } else if (onNavigateToCalculator) {
                  // Se for outra calculadora, navega diretamente
                  onNavigateToCalculator(calculatorId)
                } else {
                  // Fallback: apenas fecha o home se não houver callback
                  setShowCalculatorHome(false)
                }
              }}
            />
          </Card>
        </div>
      </TooltipProvider>
    )
  }

  // Mostrar cálculos salvos
  if (showSavedCalculations) {
    return (
      <TooltipProvider>
        <div className="relative w-full max-w-lg">
          <Card className="w-full h-[500px] shadow-lg border border-gray-400 rounded-2xl overflow-hidden" style={{ backgroundColor: '#F5F5F5' }}>
                        <SavedCalculationsView

              onBack={() => {
                // Resetar tudo e ir para tela de novo cálculo
                calculationResult.reset()
                form.reset()
                setShowSavedCalculations(false)
              }}
              onShowCalculatorHome={() => {
                // Fecha meus calculos primeiro
                setShowSavedCalculations(false)
                // Depois mostra o home
                setShowCalculatorHome(true)
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
        <Card className="w-full shadow-lg border border-gray-400 rounded-2xl overflow-hidden" style={{ backgroundColor: '#F5F5F5' }}>
          {/* Toast Containers */}
          <InlineToastContainer />
          <CalculatorErrorToastContainer />
          
          {/* Back Button Integrado */}
          {showBackButton && onBack && (
            <button
              onClick={onBack}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100/80 hover:bg-gray-200/80 backdrop-blur-sm transition-all duration-200 flex items-center justify-center group"
            >
              <ArrowLeft className="h-4 w-4 text-gray-600 group-hover:text-gray-800" />
            </button>
          )}
          
          <CardHeader className="pb-3 px-6 pt-3">
            <CardTitle className="text-lg font-medium text-gray-900 flex items-center justify-center gap-2">
              <span>💰</span>
              Calculadora de 13º Salário
            </CardTitle>
            <CardDescription className="text-center text-sm text-gray-600 mt-2">
              Calcule seu 13º salário de forma rápida e fácil
            </CardDescription>
          </CardHeader>
        
          <CardContent className="px-6 pb-6 pt-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-8">
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
                    placeholder="R$ 0,00"
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
                    iconColor="text-blue-500"
                  />
                </div>

                <div className="space-y-3 pt-2">
                  {/* Botões lado a lado */}
                  <div className="flex gap-3 justify-center">
                    <Button 
                      type="submit" 
                      className="flex-1 max-w-[160px] px-4 py-2 text-sm font-medium text-black transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                      style={{ backgroundColor: '#BAFF1B' }}
                    >
                      Calcular 13º Salário
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={() => setShowSavedCalculations(true)}
                      className="flex-1 max-w-[160px] px-4 py-2 text-sm font-medium transition-all duration-200"
                      style={{ 
                        backgroundColor: '#6B7280', 
                        borderColor: '#4B5563',
                        color: 'white'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#4B5563'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#6B7280'
                      }}
                    >
                      Ver Cálculos Salvos
                    </Button>
                  </div>
                  
                  {/* Disclaimer sem linha */}
                  <p className="text-xs text-gray-400 text-center pt-2">
                    Estes valores são estimativas para orientação
                  </p>
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
          onShowCalculatorHome={() => setShowCalculatorHome(true)}
          isFromSavedCalculation={calculationResult.result.isFromSaved}
          savedCalculationType={calculationResult.result.savedType}
        />
      </div>
    </TooltipProvider>
  )
}
