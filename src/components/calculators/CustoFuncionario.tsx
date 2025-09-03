'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { InfoIcon, User, Coffee, Car, Shield, Gift, ArrowLeft } from 'lucide-react'
import { CalculationResult } from './CalculationResult'
import { CurrencyInput } from '@/components/ui/currency-input'
import { custoFuncionarioSchema, type CustoFuncionarioInput } from '@/lib/schemas'
import { calcularCustoFuncionario } from '@/lib/calculations'
import { formatCurrency } from '@/lib/format'
import { track } from '@/lib/tracking'
import { type CustoFuncionarioResult } from '@/lib/types'
import { showValidationErrors, showCalculationSuccess } from '@/lib/validation-feedback'
import { InlineToastContainer } from '@/components/ui/inline-toast'
import { CalculatorErrorToastContainer } from '@/components/ui/calculator-error-toast'
import { ViewSavedCalculationsButton } from './ViewSavedCalculationsButton'
import { SavedCalculationsView } from './SavedCalculationsView'
import { CalculatorHome } from './CalculatorHome'

interface CustoFuncionarioProps {
  onCalculate?: (result: CustoFuncionarioResult) => void
  onStart?: () => void
  variant?: string
  articleSlug?: string
  showBackButton?: boolean
  onBack?: () => void
  onNavigateToCalculator?: (calculatorId: string) => void
}

export function CustoFuncionario({ onCalculate, onStart, variant = 'custo-funcionario', articleSlug, showBackButton, onBack, onNavigateToCalculator }: CustoFuncionarioProps) {
  const [result, setResult] = useState<CustoFuncionarioResult | null>(null)
  const [hasStarted, setHasStarted] = useState(false)
  const [showSavedCalculations, setShowSavedCalculations] = useState(false)
  const [showEmailCapture, setShowEmailCapture] = useState(false)
  const [showCalculatorHome, setShowCalculatorHome] = useState(false)
  
  const form = useForm<CustoFuncionarioInput>({
    resolver: zodResolver(custoFuncionarioSchema),
    defaultValues: {
      salarioBase: 0,
      valeRefeicao: 0,
      valeTransporte: 0,
      planoSaude: 0,
      outrosBeneficios: 0,
    },
  })

  // Track view on mount
  useEffect(() => {
    track({
      event: 'view',
      calculatorSlug: 'custo-funcionario',
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
        calculatorSlug: 'custo-funcionario',
        variant,
        articleSlug,
      })
    }
  }

  const onSubmit = (data: CustoFuncionarioInput) => {
    const calculationResult = calcularCustoFuncionario(data)
    setResult(calculationResult)
    onCalculate?.(calculationResult)
    
    // Toast de sucesso
    showCalculationSuccess('Custo do Funcionário')
    
    track({
      event: 'calculate',
      calculatorSlug: 'custo-funcionario',
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
    setResult(null)
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
                if (calculatorId === 'custo-funcionario') {
                  // Se selecionar custo funcionario, fecha home e meus calculos, volta pra tela principal
                  setShowCalculatorHome(false)
                  setShowSavedCalculations(false)
                  setResult(null)
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
                setResult(null)
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
                console.log('[DEBUG] Cálculo selecionado:', calc)
                // Por enquanto apenas fecha
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
        <Card className="w-full relative min-h-[500px] border border-gray-200/60">
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
          
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Custo do Funcionário
              <Tooltip>
                <TooltipTrigger>
                  <InfoIcon className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Estas contas são estimativas</p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
            <CardDescription>
              Calcule o custo total de um funcionário para a empresa
            </CardDescription>
          </CardHeader>
        
          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-8">
                {/* Campo de Salário - Destaque principal */}
                <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-100">
                  <CurrencyInput
                    label="👤 Salário Base"
                    placeholder="0,00"
                    value={form.watch('salarioBase')}
                    onChange={(value) => {
                      form.setValue('salarioBase', value)
                      handleInputChange()
                    }}
                    onInputChange={handleInputChange}
                  />
                </div>

                {/* Benefícios em grid */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Gift className="h-4 w-4 text-purple-500" />
                    Benefícios Mensais
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <CurrencyInput
                      label="Vale Refeição"
                      placeholder="0,00"
                      value={form.watch('valeRefeicao') ?? 0}
                      onChange={(value) => {
                        form.setValue('valeRefeicao', value)
                        handleInputChange()
                      }}
                      onInputChange={handleInputChange}
                    />

                    <CurrencyInput
                      label="🚌 Vale Transporte"
                      placeholder="0,00"
                      value={form.watch('valeTransporte') ?? 0}
                      onChange={(value) => {
                        form.setValue('valeTransporte', value)
                        handleInputChange()
                      }}
                      onInputChange={handleInputChange}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <CurrencyInput
                      label="Plano de Saúde"
                      placeholder="0,00"
                      value={form.watch('planoSaude') ?? 0}
                      onChange={(value) => {
                        form.setValue('planoSaude', value)
                        handleInputChange()
                      }}
                      onInputChange={handleInputChange}
                    />

                    <CurrencyInput
                      label="Outros Benefícios"
                      placeholder="0,00"
                      value={form.watch('outrosBeneficios') ?? 0}
                      onChange={(value) => {
                        form.setValue('outrosBeneficios', value)
                        handleInputChange()
                      }}
                      onInputChange={handleInputChange}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full py-3 text-base font-bold text-black transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                  style={{ backgroundColor: '#BAFF1B' }}
                >
                  Calcular Custo Total
                </Button>
                
                {/* Botão minimalista para ver cálculos salvos */}
                <div className="flex justify-center pt-3">
                  <ViewSavedCalculationsButton 
                    onShowSavedCalculations={() => setShowSavedCalculations(true)}
                  />
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Overlay de Resultados */}
        <CalculationResult
          title="Custo do Funcionário"
          results={result ? [
            {
              label: 'Salário Base',
              value: formatCurrency(result.salarioBase)
            },
            {
              label: '13º Salário (prop.)',
              value: formatCurrency(result.decimoTerceiro)
            },
            {
              label: 'Férias + 1/3 (prop.)',
              value: formatCurrency(result.ferias + result.adicionalFerias)
            },
            {
              label: 'FGTS (8%)',
              value: formatCurrency(result.fgts)
            },
            {
              label: 'Encargos Sociais',
              value: formatCurrency(result.encargos)
            },
            {
              label: 'Benefícios',
              value: formatCurrency(result.beneficios.total)
            },
            {
              label: 'Custo Mensal Total',
              value: formatCurrency(result.custoMensal),
              highlight: true
            },
            {
              label: 'Custo Anual',
              value: formatCurrency(result.custoAnual),
              highlight: true
            }
          ] : []}
          onReset={handleReset}
          isVisible={!!result}
          calculatorType="custo-funcionario"
          calculationData={form.getValues()}
          onShowSavedCalculations={() => setShowSavedCalculations(true)}
        />
      </div>
    </TooltipProvider>
  )
}
