'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CalculatorCardWrapper } from '@/components/ui/calculator-card-wrapper'
import { CalculationParser } from '@/lib/calculation-parser'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { InfoIcon, Calendar, RotateCcw } from 'lucide-react'
import { CalculationResult } from './CalculationResult'
import { CurrencyInput } from '@/components/ui/currency-input'
import { NumberInput } from '@/components/ui/number-input'
import { decimoTerceiroSchema, type DecimoTerceiroInput } from '@/lib/schemas'
import { calcularDecimoTerceiro } from '@/lib/calculations'
// import { formatCurrency } from '@/lib/format'
import { track } from '@/lib/tracking'
import { type DecimoTerceiroResult } from '@/lib/types'
import { showCalculationSuccess } from '@/lib/validation-feedback'
import { InlineToastContainer } from '@/components/ui/inline-toast'
import { CalculatorErrorToastContainer } from '@/components/ui/calculator-error-toast'
import { InlineValidationError } from '@/components/ui/inline-validation-error'
import { SavedCalculationsView } from './SavedCalculationsView'
import { useCalculationResult } from '@/hooks/useCalculationResult'
import { useCalculator } from '@/contexts/CalculatorContext'
 


interface DecimoTerceiroProps {
  onCalculate?: (result: DecimoTerceiroResult) => void
  onStart?: () => void
  variant?: string
  articleSlug?: string

}

export function DecimoTerceiro({ onCalculate, onStart, variant = '13o-salario', articleSlug }: DecimoTerceiroProps) {
  const [hasStarted, setHasStarted] = useState(false)
  const [showSavedCalculations, setShowSavedCalculations] = useState(false)
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [leadEmail, setLeadEmail] = useState('')
  const [pendingData, setPendingData] = useState<DecimoTerceiroInput | null>(null)
  const [fadeClass, setFadeClass] = useState('opacity-100')

  const { showHome } = useCalculator()
  const calculationResult = useCalculationResult('13o-salario')
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [validationMessage, setValidationMessage] = useState('')
  
  const convertToNumber = (value: unknown): number => {
    if (typeof value === 'number') return value
    if (typeof value === 'string') return parseFloat(value) || 0
    return 0
  }

  const form = useForm({
    resolver: zodResolver(decimoTerceiroSchema),
    defaultValues: {
      salarioMensal: 0,
      mesesTrabalhados: 12,
    },
  })

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
    const stored = typeof window !== 'undefined' ? localStorage.getItem('leadEmail') : null
    if (!stored) {
      setPendingData(data)
      setLeadEmail('')
      setShowLeadModal(true)
      return
    }
    const result = calcularDecimoTerceiro(data)
    calculationResult.setNewCalculation(result)
    onCalculate?.(result)
    showCalculationSuccess('13º Salário')
    track({ event: 'calculate', calculatorSlug: '13o-salario', variant, articleSlug, metadata: { inputs: data, outputs: calculationResult } })
  }

  const handleLeadSubmit = async () => {
    if (!leadEmail.trim()) return
    try {
      await fetch('/api/add-to-activecampaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: leadEmail.trim() })
      })
      if (typeof window !== 'undefined') {
        localStorage.setItem('leadEmail', leadEmail.trim())
      }
    } finally {
      setShowLeadModal(false)
      if (pendingData) {
        const result = calcularDecimoTerceiro(pendingData)
        calculationResult.setNewCalculation(result)
        onCalculate?.(result)
        showCalculationSuccess('13º Salário')
        track({ event: 'calculate', calculatorSlug: '13o-salario', variant, articleSlug, metadata: { inputs: pendingData, outputs: calculationResult } })
        setPendingData(null)
      }
    }
  }

  const handleLeadSkip = () => {
    setShowLeadModal(false)
    if (pendingData) {
      const result = calcularDecimoTerceiro(pendingData)
      calculationResult.setNewCalculation(result)
      onCalculate?.(result)
      showCalculationSuccess('13º Salário')
      track({ event: 'calculate', calculatorSlug: '13o-salario', variant, articleSlug, metadata: { inputs: pendingData, outputs: calculationResult } })
      setPendingData(null)
    }
  }

  const onError = async () => {
    await form.trigger()
    
    const errors = form.formState.errors
    
    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0]
      const fieldNames: Record<string, string> = {
        salarioMensal: 'Salário Mensal',
        mesesTrabalhados: 'Meses Trabalhados'
      }
      
      const fieldName = fieldNames[firstErrorField] || firstErrorField
      setValidationMessage(`O campo "${fieldName}" deve ser preenchido corretamente.`)
      setShowValidationModal(true)
    } else {
      setValidationMessage('Por favor, preencha todos os campos obrigatórios.')
      setShowValidationModal(true)
    }
  }

  const handleReset = () => {
    calculationResult.reset()
    form.reset()
    setHasStarted(false)
  }



  if (showSavedCalculations) {
    return (
      <TooltipProvider>
        <div className="relative w-full max-w-lg">
          <CalculatorCardWrapper fadeClass={fadeClass}>
            <SavedCalculationsView

              onBack={() => {
                setFadeClass('opacity-0')
                setTimeout(() => {
                  calculationResult.reset()
                  form.reset()
                  setShowSavedCalculations(false)
                  setFadeClass('opacity-100')
                }, 150)
              }}
              onShowCalculatorHome={() => {
                setShowSavedCalculations(false)
                showHome()
              }}
              onSelectCalculation={(calc) => {
                const inputs = calc.inputs || {}
                form.setValue('salarioMensal', convertToNumber(inputs.salarioMensal || 0))
                form.setValue('mesesTrabalhados', convertToNumber(inputs.mesesTrabalhados || 12))
                const parsedData = CalculationParser.parseByType(calc)
                calculationResult.setSavedCalculation(parsedData, calc.calculator_slug)
                setShowSavedCalculations(false)
              }}
            />
          </CalculatorCardWrapper>
        </div>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <div className="relative w-full max-w-lg">
        <InlineValidationError
          isVisible={showValidationModal}
          onClose={() => setShowValidationModal(false)}
          title="Ops! Alguns campos estão em branco"
          message={validationMessage}
          showImage={true}
        />
        
        <CalculatorCardWrapper fadeClass={fadeClass}>
          <InlineToastContainer />
          <CalculatorErrorToastContainer />
          
          {/* Back Button removido */}
          
          <CardHeader className={`px-6 pb-1 pt-1`}>
            <CardTitle className="text-lg font-medium text-gray-900 flex items-center justify-center gap-2">
              <span>💰</span>
              Calculadora de 13º Salário
            </CardTitle>
            <CardDescription className={`text-center text-sm text-gray-600 mt-1`}>
              Calcule seu 13º salário de forma rápida e fácil
            </CardDescription>
            
            {/* Botão Ver Cálculos Salvos abaixo da descrição */}
            <div className="flex justify-center mt-1">
              <button
                onClick={() => {
                  setShowSavedCalculations(true)
                }}
                className="px-2 py-1.5 rounded-md border border-gray-200 bg-white hover:bg-gray-50 transition-colors flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-700"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="font-medium">Ver Cálculos Salvos</span>
              </button>
            </div>
          </CardHeader>
        
          <CardContent className={`px-6 pb-4 pt-1`}>
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
                      form.setValue('salarioMensal', value || 0)
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

                <div className="space-y-2 pt-9">
                  <div className="flex justify-center">
                    <Button 
                      type="submit" 
                      className="max-w-[160px] px-4 py-2 text-sm font-medium text-black transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                      style={{ backgroundColor: '#BAFF1B' }}
                    >
                      Calcular 13º Salário
                    </Button>
                  </div>
                  
                  <div className="flex justify-center mt-4">
                    <button
                      type="button"
                      onClick={() => {
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
        </CalculatorCardWrapper>

        {/* Modal de Login removido (código não utilizado) */}

        {/* Overlay de Resultados */}
        <CalculationResult
          title="13º Salário"
          results={calculationResult.getFormattedResults()}
          onReset={handleReset}
          isVisible={calculationResult.isVisible}
          calculatorType={calculationResult.result.isFromSaved ? calculationResult.result.savedType : "13o-salario"}
          calculationData={form.getValues()}
          onShowSavedCalculations={() => setShowSavedCalculations(true)}
          isFromSavedCalculation={calculationResult.result.isFromSaved}
          savedCalculationType={calculationResult.result.savedType}
        />
      </div>

      {showLeadModal && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/5 backdrop-blur-sm rounded-lg">
          <div className="w-full max-w-sm mx-4 border border-gray-200/60 rounded-lg bg-white p-5">
            <h3 className="text-lg font-medium text-gray-900 text-center">Receba materiais exclusivos</h3>
            <p className="text-sm text-gray-600 text-center mt-2">Digite seu email para receber conteúdos de empreendedorismo.</p>
            <div className="mt-4">
              <input
                type="email"
                value={leadEmail}
                onChange={(e) => setLeadEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full h-10 border border-gray-200 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <button
              onClick={handleLeadSubmit}
              className="mt-3 w-full h-10 bg-[#BAFF1B] text-black font-semibold rounded-md hover:bg-[#A8E616]"
            >
              Quero receber
            </button>
            <button onClick={handleLeadSkip} className="mt-2 w-full text-[11px] text-gray-400 opacity-70 hover:opacity-100">Não quero</button>
          </div>
        </div>
      )}

      {/* Modal de Login removido (código não utilizado) */}
    </TooltipProvider>
  )
}
