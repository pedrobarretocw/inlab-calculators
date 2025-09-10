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
import { InfoIcon, RotateCcw } from 'lucide-react'
import { CalculationResult } from './CalculationResult'
import { CurrencyInput } from '@/components/ui/currency-input'
import { custoFuncionarioSchema, type CustoFuncionarioInput } from '@/lib/schemas'
import { calcularCustoFuncionario } from '@/lib/calculations'
// import { formatCurrency } from '@/lib/format'
import { track } from '@/lib/tracking'
import { type CustoFuncionarioResult } from '@/lib/types'
import { showCalculationSuccess } from '@/lib/validation-feedback'
import { InlineToastContainer } from '@/components/ui/inline-toast'
import { CalculatorErrorToastContainer } from '@/components/ui/calculator-error-toast'
import { InlineValidationError } from '@/components/ui/inline-validation-error'
import { SavedCalculationsView } from './SavedCalculationsView'
import { useCalculationResult } from '@/hooks/useCalculationResult'
import { useCalculator } from '@/contexts/CalculatorContext'
 


interface CustoFuncionarioProps {
  onCalculate?: (result: CustoFuncionarioResult) => void
  onStart?: () => void
  variant?: string
  articleSlug?: string

}

export function CustoFuncionario({ onCalculate, onStart, variant = 'custo-funcionario', articleSlug }: CustoFuncionarioProps) {
  const [hasStarted, setHasStarted] = useState(false)
  const [showSavedCalculations, setShowSavedCalculations] = useState(false)
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [leadEmail, setLeadEmail] = useState('')
  const [pendingData, setPendingData] = useState<CustoFuncionarioInput | null>(null)
  const [fadeClass, setFadeClass] = useState('opacity-100')

  const { showHome } = useCalculator()
  const calculationResult = useCalculationResult('custo-funcionario')
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [validationMessage, setValidationMessage] = useState('')
  
  const convertToNumber = (value: unknown): number => {
    if (typeof value === 'number') return value
    if (typeof value === 'string') return parseFloat(value) || 0
    return 0
  }

  const form = useForm({
    resolver: zodResolver(custoFuncionarioSchema),
    defaultValues: {
      salarioBase: 0,
      valeRefeicao: 0,
      valeTransporte: 0,
      planoSaude: 0,
      outrosBeneficios: 0,
    },
  })

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
    const stored = typeof window !== 'undefined' ? localStorage.getItem('leadEmail') : null
    if (!stored) {
      setPendingData(data)
      setLeadEmail('')
      setShowLeadModal(true)
      return
    }
    const result = calcularCustoFuncionario(data)
    calculationResult.setNewCalculation(result)
    onCalculate?.(result)
    showCalculationSuccess('Custo do Funcionário')
    track({ event: 'calculate', calculatorSlug: 'custo-funcionario', variant, articleSlug, metadata: { inputs: data, outputs: calculationResult } })
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
        const result = calcularCustoFuncionario(pendingData)
        calculationResult.setNewCalculation(result)
        onCalculate?.(result)
        showCalculationSuccess('Custo do Funcionário')
        track({ event: 'calculate', calculatorSlug: 'custo-funcionario', variant, articleSlug, metadata: { inputs: pendingData, outputs: calculationResult } })
        setPendingData(null)
      }
    }
  }

  const handleLeadSkip = () => {
    setShowLeadModal(false)
    if (pendingData) {
      const result = calcularCustoFuncionario(pendingData)
      calculationResult.setNewCalculation(result)
      onCalculate?.(result)
      showCalculationSuccess('Custo do Funcionário')
      track({ event: 'calculate', calculatorSlug: 'custo-funcionario', variant, articleSlug, metadata: { inputs: pendingData, outputs: calculationResult } })
      setPendingData(null)
    }
  }

  const onError = async () => {
    await form.trigger()
    
    const errors = form.formState.errors
    
    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0]
      const fieldNames: Record<string, string> = {
        salarioBase: 'Salário Base',
        valeRefeicao: 'Vale Refeição', 
        valeTransporte: 'Vale Transporte',
        planoSaude: 'Plano de Saúde',
        outrosBeneficios: 'Outros Benefícios'
      }
      
      const fieldName = fieldNames[firstErrorField] || firstErrorField
      const errorMessage = `Por favor, preencha o campo "${fieldName}" corretamente.`
      
      setValidationMessage(errorMessage)
      setShowValidationModal(true)
    } else {
      setValidationMessage('Por favor, preencha todos os campos obrigatórios.')
      setShowValidationModal(true)
    }
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
                form.setValue('salarioBase', convertToNumber(inputs.salarioBase || 0))
                form.setValue('valeRefeicao', convertToNumber(inputs.valeRefeicao || 0))
                form.setValue('valeTransporte', convertToNumber(inputs.valeTransporte || 0))
                form.setValue('planoSaude', convertToNumber(inputs.planoSaude || 0))
                form.setValue('outrosBeneficios', convertToNumber(inputs.outrosBeneficios || 0))
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
          
          <CardHeader className={`px-4 pb-2 pt-2`} style={{ backgroundColor: 'transparent' }}>
            <CardTitle className="text-base font-medium text-gray-900 flex items-center justify-center gap-2">
              <span>👥</span>
              Calculadora de Custo do Funcionário
            </CardTitle>
            <CardDescription className={`text-center text-xs text-gray-600 mt-0.5`}>
              Calcule o custo total de um funcionário para a empresa
            </CardDescription>
            
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
        
          <CardContent className={`px-4 pb-3 pt-1`} style={{ backgroundColor: 'transparent' }}>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs font-medium text-gray-700">
                      Salário Base
                    </label>
                    <Tooltip>
                      <TooltipTrigger>
                        <InfoIcon className="h-3 w-3 text-gray-400 hover:text-gray-600 transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-white text-black border border-gray-200 shadow-lg max-w-48" sideOffset={5}>
                        <p>O salário mensal bruto do funcionário</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <CurrencyInput
                    label=""
                    placeholder="0,00"
                    value={form.watch('salarioBase')}
                    onChange={(value) => {
                      form.setValue('salarioBase', value)
                      handleInputChange()
                    }}
                    onInputChange={handleInputChange}
                  />
                </div>

                {/* Benefícios em grid 2x2 */}
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Vale Refeição */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <label className="text-xs font-medium text-gray-700">
                          Vale Refeição
                        </label>
                        <Tooltip>
                          <TooltipTrigger>
                            <InfoIcon className="h-3 w-3 text-gray-400 hover:text-gray-600 transition-colors" />
                          </TooltipTrigger>
                          <TooltipContent className="bg-white text-black border border-gray-200 shadow-lg max-w-48" sideOffset={5}>
                            <p>Valor mensal do vale refeição</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <CurrencyInput
                        label=""
                        placeholder="0,00"
                        value={form.watch('valeRefeicao') ?? 0}
                        onChange={(value) => {
                          form.setValue('valeRefeicao', value)
                          handleInputChange()
                        }}
                        onInputChange={handleInputChange}
                      />
                    </div>

                    {/* Vale Transporte */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <label className="text-xs font-medium text-gray-700">
                          Vale Transporte
                        </label>
                        <Tooltip>
                          <TooltipTrigger>
                            <InfoIcon className="h-3 w-3 text-gray-400 hover:text-gray-600 transition-colors" />
                          </TooltipTrigger>
                          <TooltipContent className="bg-white text-black border border-gray-200 shadow-lg max-w-48" sideOffset={5}>
                            <p>Valor mensal do vale transporte</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <CurrencyInput
                        label=""
                        placeholder="0,00"
                        value={form.watch('valeTransporte') ?? 0}
                        onChange={(value) => {
                          form.setValue('valeTransporte', value)
                          handleInputChange()
                        }}
                        onInputChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Plano de Saúde */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <label className="text-xs font-medium text-gray-700">
                          Plano de Saúde
                        </label>
                        <Tooltip>
                          <TooltipTrigger>
                            <InfoIcon className="h-3 w-3 text-gray-400 hover:text-gray-600 transition-colors" />
                          </TooltipTrigger>
                          <TooltipContent className="bg-white text-black border border-gray-200 shadow-lg max-w-48" sideOffset={5}>
                            <p>Valor mensal do plano de saúde</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <CurrencyInput
                        label=""
                        placeholder="0,00"
                        value={form.watch('planoSaude') ?? 0}
                        onChange={(value) => {
                          form.setValue('planoSaude', value)
                          handleInputChange()
                        }}
                        onInputChange={handleInputChange}
                      />
                    </div>

                    {/* Outros Benefícios */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <label className="text-xs font-medium text-gray-700">
                          Outros Benefícios
                        </label>
                        <Tooltip>
                          <TooltipTrigger>
                            <InfoIcon className="h-3 w-3 text-gray-400 hover:text-gray-600 transition-colors" />
                          </TooltipTrigger>
                          <TooltipContent className="bg-white text-black border border-gray-200 shadow-lg max-w-48" sideOffset={5}>
                            <p>Outros benefícios ou auxílios mensais</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <CurrencyInput
                        label=""
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
                </div>

                {/* Botão Calcular centralizado */}
                <div className="flex justify-center mt-8">
                  <Button 
                    type="submit" 
                    className="max-w-[160px] px-6 py-2 text-sm font-medium text-black"
                    style={{ backgroundColor: '#BAFF1B' }}
                  >
                    Calcular Custo Total
                  </Button>
                </div>
                
                {/* Texto clicável para outras calculadoras */}
                <div className="flex justify-center mt-2">
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
                

              </form>
            </Form>
          </CardContent>
        </CalculatorCardWrapper>

        {/* Overlay de Resultados */}
        <CalculationResult
          title="Custo do Funcionário"
          results={calculationResult.getFormattedResults()}
          onReset={() => calculationResult.reset()}
          isVisible={calculationResult.isVisible}
          calculatorType={calculationResult.result.isFromSaved ? calculationResult.result.savedType : "custo-funcionario"}
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
