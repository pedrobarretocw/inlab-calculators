'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CalculatorCardWrapper } from '@/components/ui/calculator-card-wrapper'
import { CalculationParser } from '@/lib/calculation-parser'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { InfoIcon, User, Coffee, Car, Shield, Gift, ArrowLeft, RotateCcw } from 'lucide-react'
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
import { InlineValidationError } from '@/components/ui/inline-validation-error'
import { ViewSavedCalculationsButton } from './ViewSavedCalculationsButton'
import { SavedCalculationsView } from './SavedCalculationsView'
import { useCalculationResult } from '@/hooks/useCalculationResult'
import { useCalculator } from '@/contexts/CalculatorContext'
import { useUser } from '@clerk/nextjs'
import { PublicLoginModal } from '@/components/auth/PublicLoginModal'


interface CustoFuncionarioProps {
  onCalculate?: (result: CustoFuncionarioResult) => void
  onStart?: () => void
  variant?: string
  articleSlug?: string
  showBackButton?: boolean
  onBack?: () => void

}

export function CustoFuncionario({ onCalculate, onStart, variant = 'custo-funcionario', articleSlug, showBackButton, onBack }: CustoFuncionarioProps) {
  const [hasStarted, setHasStarted] = useState(false)
  const [showSavedCalculations, setShowSavedCalculations] = useState(false)
  const [showEmailCapture, setShowEmailCapture] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [fadeClass, setFadeClass] = useState('opacity-100')

  // Hooks
  const { showHome } = useCalculator()
  const { user } = useUser()
  const calculationResult = useCalculationResult('custo-funcionario')
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [validationMessage, setValidationMessage] = useState('')
  
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
    const result = calcularCustoFuncionario(data)
    calculationResult.setNewCalculation(result)
    onCalculate?.(result)
    
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

  const onError = async () => {
    // Forçar validação antes de verificar erros
    await form.trigger()
    
    const errors = form.formState.errors
    
    if (Object.keys(errors).length > 0) {
      // Criar mensagem de erro
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
          <CalculatorCardWrapper fadeClass={fadeClass}>
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
                // Preencher formulário com inputs salvos
                const inputs = calc.inputs || {}
                form.setValue('salarioBase', inputs.salarioBase || 0)
                form.setValue('valeRefeicao', inputs.valeRefeicao || 0)
                form.setValue('valeTransporte', inputs.valeTransporte || 0)
                form.setValue('planoSaude', inputs.planoSaude || 0)
                form.setValue('outrosBeneficios', inputs.outrosBeneficios || 0)
                
                // Usar os outputs DIRETO do banco via CalculationParser
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
        {/* Erro de Validação FORA do Card para ficar por cima */}
        <InlineValidationError
          isVisible={showValidationModal}
          onClose={() => setShowValidationModal(false)}
          title="Ops! Alguns campos estão em branco"
          message={validationMessage}
          showImage={true}
        />
        
        <CalculatorCardWrapper fadeClass={fadeClass}>
          {/* Toast Containers */}
          <InlineToastContainer />
          <CalculatorErrorToastContainer />
          
          {/* Back Button removido */}
          
          <CardHeader className="pb-2 px-4 pt-2" style={{ backgroundColor: 'transparent' }}>
            <CardTitle className="text-base font-medium text-gray-900 flex items-center justify-center gap-2">
              <span>👥</span>
              Calculadora de Custo do Funcionário
            </CardTitle>
            <CardDescription className="text-center text-xs text-gray-600 mt-0.5">
              Calcule o custo total de um funcionário para a empresa
            </CardDescription>
            
            {/* Botão Ver Cálculos Salvos abaixo da descrição - sempre visível */}
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
        
          <CardContent className="px-4 pb-3 pt-1" style={{ backgroundColor: 'transparent' }}>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-3">
                {/* Campo de Salário Base */}
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
