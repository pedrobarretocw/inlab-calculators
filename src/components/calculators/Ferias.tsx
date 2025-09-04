'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { InfoIcon, Calendar, Clock, ArrowLeft, Home, Grid3X3, BookmarkCheck, RotateCcw } from 'lucide-react'
import { CalculationResult } from './CalculationResult'
import { CurrencyInput } from '@/components/ui/currency-input'
import { NumberInput } from '@/components/ui/number-input'
import { feriasSchema, type FeriasInput } from '@/lib/schemas'
import { calcularFerias } from '@/lib/calculations'
import { formatCurrency } from '@/lib/format'
import { track } from '@/lib/tracking'
import { type FeriasResult } from '@/lib/types'
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



interface FeriasProps {
  onCalculate?: (result: FeriasResult) => void
  onStart?: () => void
  variant?: string
  articleSlug?: string
  showBackButton?: boolean
  onBack?: () => void

}

export function Ferias({ onCalculate, onStart, variant = 'ferias', articleSlug, showBackButton, onBack }: FeriasProps) {
  const [hasStarted, setHasStarted] = useState(false)
  const [showSavedCalculations, setShowSavedCalculations] = useState(false)
  const [showEmailCapture, setShowEmailCapture] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [fadeClass, setFadeClass] = useState('opacity-100')

  // Hooks
  const { showHome, showCalculatorHome } = useCalculator()
  const { user } = useUser()
  const calculationResult = useCalculationResult('ferias')
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [validationMessage, setValidationMessage] = useState('')
  
  const form = useForm<FeriasInput>({
    resolver: zodResolver(feriasSchema),
    defaultValues: {
      salarioMensal: undefined as any, // Para forçar validação
      mesesTrabalhados: 12,
      diasFerias: 30,
      descontarAdiantamento: false,
      valorAdiantamento: 0,
    },
  })

  // Track view on mount
  useEffect(() => {
    track({
      event: 'view',
      calculatorSlug: 'ferias',
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
        calculatorSlug: 'ferias',
        variant,
        articleSlug,
      })
    }
  }

  const onSubmit = (data: FeriasInput) => {
    const result = calcularFerias(data)
    calculationResult.setNewCalculation(result)
    onCalculate?.(result)
    
    // Toast de sucesso
    showCalculationSuccess('Férias')
    
    track({
      event: 'calculate',
      calculatorSlug: 'ferias',
      variant,
      articleSlug,
      metadata: { inputs: data, outputs: result },
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
        mesesTrabalhados: 'Meses Trabalhados', 
        diasFerias: 'Dias de Férias'
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
              }}
              onSelectCalculation={(calc) => {
                console.log('[DEBUG] Cálculo selecionado:', calc)
                console.log('[DEBUG] Inputs:', calc.inputs)
                console.log('[DEBUG] Outputs:', calc.outputs)
                
                // Preencher os dados do formulário com os dados salvos
                const inputs = calc.inputs || {}
                form.setValue('salarioMensal', inputs.salarioMensal || 0)
                form.setValue('mesesTrabalhados', inputs.mesesTrabalhados || 12)
                form.setValue('diasVendidos', inputs.diasVendidos || 0)
                
                // Ir direto para a tela de resultado com os dados salvos
                const outputs = calc.outputs || {}
                
                // Converter strings para números e tratar NaN
                const parseValue = (value: any, fieldName?: string) => {
                  console.log(`[DEBUG] Parsing ${fieldName}:`, value, typeof value)
                  
                  if (value === null || value === undefined) return 0
                  if (typeof value === 'number') return isNaN(value) ? 0 : value
                  if (typeof value === 'string') {
                    // Se já está formatado como moeda brasileira, tratar isso
                    if (value.includes('R$')) {
                      // Exemplo: "R$ 2.472,22" ou "- R$ 110,00" -> "2472.22" ou "-110.00"
                      // Remove R$ e espaços, depois converte formato brasileiro para americano
                      let cleaned = value.replace(/R\$\s?/g, '').trim()
                      
                      // Verificar se tem sinal negativo
                      const isNegative = cleaned.startsWith('-') || value.startsWith('-')
                      if (isNegative) {
                        cleaned = cleaned.replace(/^-\s*/, '') // Remove o sinal de menos
                      }
                      
                      // Se tem ponto E vírgula (formato brasileiro: 1.234,56)
                      if (cleaned.includes('.') && cleaned.includes(',')) {
                        // Remove pontos (separadores de milhar) e troca vírgula por ponto
                        cleaned = cleaned.replace(/\./g, '').replace(',', '.')
                      } 
                      // Se tem apenas vírgula (formato brasileiro: 123,45)
                      else if (cleaned.includes(',') && !cleaned.includes('.')) {
                        cleaned = cleaned.replace(',', '.')
                      }
                      // Se tem apenas ponto (formato americano: 123.45) - mantém
                      
                      let parsed = parseFloat(cleaned)
                      if (isNegative) {
                        parsed = -parsed // Aplica o sinal negativo
                      }
                      
                      console.log(`[DEBUG] Moeda parseada ${fieldName}: "${value}" -> "${cleaned}" -> ${parsed}`)
                      return isNaN(parsed) ? 0 : parsed
                    }
                    // Caso contrário, apenas converter
                    const parsed = parseFloat(value)
                    return isNaN(parsed) ? 0 : parsed
                  }
                  return 0
                }
                
                // Processar qualquer tipo de cálculo - mapeamento dinâmico baseado no tipo
                console.log(`[DEBUG] Processando cálculo tipo ${calc.calculator_slug}...`)
                
                // Mapeamento dinâmico baseado no tipo de cálculo
                let resultData: any
                
                if (calc.calculator_slug === 'ferias') {
                  // Mapear para FeriasResult
                  resultData = {
                    valorProporcional: parseValue(outputs['Valor Proporcional'], 'valorProporcional'),
                    adicionalUmTerco: parseValue(outputs['Adicional 1/3'], 'adicionalUmTerco'),
                    valorLiquido: parseValue(outputs['Total Líquido'], 'valorLiquido'),
                    valorBruto: parseValue(outputs['Valor Proporcional'], 'valorBruto'),
                    desconto: 0,
                    diasFerias: inputs.diasFerias || 30,
                    mesesTrabalhados: inputs.mesesTrabalhados || 12,
                    observacao: ''
                  }
                } else if (calc.calculator_slug === '13o-salario') {
                  // Mapear cálculo de 13º para interface de férias (adaptação)
                  resultData = {
                    valorProporcional: parseValue(
                      outputs['Valor Proporcional'] ||
                      outputs['valorProporcional'], 
                      'valorProporcional'
                    ),
                    adicionalUmTerco: parseValue(
                      outputs['1ª Parcela (até 30/11)'] ||
                      outputs['primeiraParcela'], 
                      'adicionalUmTerco'
                    ), // Usar primeira parcela como adicional
                    valorLiquido: parseValue(
                      outputs['Valor Líquido Estimado'] ||
                      outputs['Total Líquido'] ||
                      outputs['valorLiquido'], 
                      'valorLiquido'
                    ),
                    valorBruto: parseValue(
                      outputs['Valor Proporcional'] ||
                      outputs['valorProporcional'], 
                      'valorBruto'
                    ),
                    desconto: 0,
                    diasFerias: 30,
                    mesesTrabalhados: inputs.mesesTrabalhados || 12,
                    observacao: 'Cálculo de 13º Salário adaptado'
                  }
                } else {
                  // Fallback para outros tipos
                  resultData = {
                    valorProporcional: 0,
                    adicionalUmTerco: 0,
                    valorLiquido: 0,
                    valorBruto: 0,
                    desconto: 0,
                    diasFerias: 30,
                    mesesTrabalhados: 12,
                    observacao: `Tipo ${calc.calculator_slug} não suportado`
                  }
                }
                
                console.log('[DEBUG] Resultado parseado:', resultData)
                calculationResult.setSavedCalculation(resultData, calc.calculator_slug)
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
              <span>🏖️</span>
              Calculadora de Férias
            </CardTitle>
            <CardDescription className="text-center text-sm text-gray-600 mt-1">
              Calcule suas férias de forma rápida e fácil
            </CardDescription>
            
            {/* Botão Ver Cálculos Salvos abaixo da descrição - sempre visível */}
            <div className="flex justify-center mt-1">
              <button
                onClick={() => {
                  console.log('[Ferias] Ver cálculos salvos - indo direto')
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

                {/* Campos em Grid - Espaçamento compacto */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">📅 Meses Trabalhados</span>
                      <Tooltip>
                        <TooltipTrigger>
                          <InfoIcon className="h-3 w-3 text-gray-400 hover:text-gray-600 transition-colors" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-white text-black border border-gray-200 shadow-lg max-w-48" sideOffset={5}>
                          <p>Meses que você trabalhou neste período</p>
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

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Dias de Férias</span>
                      <Tooltip>
                        <TooltipTrigger>
                          <InfoIcon className="h-3 w-3 text-gray-400 hover:text-gray-600 transition-colors" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-white text-black border border-gray-200 shadow-lg max-w-48" sideOffset={5}>
                          <p>Dias que você vai tirar de férias</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <NumberInput
                      label=""
                      placeholder="30"
                      value={form.watch('diasFerias')}
                      onChange={(value) => {
                        form.setValue('diasFerias', value)
                        handleInputChange()
                      }}
                      onInputChange={handleInputChange}
                      min={10}
                      max={30}
                      icon={Clock}
                      iconColor="text-purple-500"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  {/* Botão Calcular centralizado */}
                  <div className="flex justify-center">
                    <Button 
                      type="submit" 
                      className="max-w-[160px] px-4 py-2 text-sm font-medium text-black transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                      style={{ backgroundColor: '#BAFF1B' }}
                    >
                      Calcular Férias
                    </Button>
                  </div>
                  
                  {/* Texto clicável para outras calculadoras */}
                  <div className="flex justify-center mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        console.log('[Ferias] Navegando para outras calculadoras')
                        console.log('[Ferias] Estado atual - showCalculatorHome:', showCalculatorHome)
                        showHome()
                        console.log('[Ferias] Chamou showHome()')
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
          title="Férias"
          results={calculationResult.getFormattedResults()}
          onReset={() => calculationResult.reset()}
          isVisible={calculationResult.isVisible}
          calculatorType="ferias"
          calculationData={form.getValues()}
          onShowSavedCalculations={() => setShowSavedCalculations(true)}
              
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
