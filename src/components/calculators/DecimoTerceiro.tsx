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
import { InfoIcon, Calendar, RotateCcw, Mail, History } from 'lucide-react'
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
import { useCalculationResult } from '@/hooks/useCalculationResult'
import { useCalculator } from '@/contexts/CalculatorContext'
import { EmailCaptureModal } from '@/components/ui/email-capture-modal'
 


interface DecimoTerceiroProps {
  onCalculate?: (result: DecimoTerceiroResult) => void
  onStart?: () => void
  variant?: string
  articleSlug?: string

}

export function DecimoTerceiro({ onCalculate, onStart, variant = '13o-salario', articleSlug }: DecimoTerceiroProps) {
  const [hasStarted, setHasStarted] = useState(false)
  // Removido: exibição de "Meus Cálculos"
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [leadEmail, setLeadEmail] = useState('')
  const [pendingData, setPendingData] = useState<DecimoTerceiroInput | null>(null)
  const [fadeClass, setFadeClass] = useState('opacity-100')
  const [showSavedLeadModal, setShowSavedLeadModal] = useState(false)

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

  const handleLeadSubmit = async (emailArg?: string) => {
    const emailToUse = (emailArg ?? leadEmail).trim()
    if (!emailToUse) return
    try {
      await fetch('/api/add-to-activecampaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToUse })
      })
      if (typeof window !== 'undefined') {
        localStorage.setItem('leadEmail', emailToUse)
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



  // Bloque removido: nunca navegar para "Meus Cálculos"

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
                  setShowSavedLeadModal(true)
                }}
                className="px-2 py-1.5 rounded-md border border-gray-200 bg-white hover:bg-gray-50 transition-colors flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-700"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="font-medium">Ver Cálculos Salvos</span>
              </button>
            </div>
          </CardHeader>
        
          <CardContent className={`px-6 pb-4 pt-1 flex-1 flex flex-col`}>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit, onError)} className="flex-1 flex flex-col">
                <div className="flex-1 flex flex-col justify-evenly gap-4">
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
                </div>

                <div className="space-y-2 pt-6">
                  <div className="flex justify-center">
                    <Button 
                      type="submit" 
                      className="max-w-[160px] px-4 py-2 text-sm font-medium text-black transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                      style={{ backgroundColor: '#BAFF1B' }}
                    >
                      Calcular 13º Salário
                    </Button>
                  </div>
                  
                  <div className="flex justify-center mt-6">
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
        
        {/* Modais dentro do wrapper para não ultrapassar o card */}
        {showLeadModal && (
          <EmailCaptureModal
            open={true}
            onClose={handleLeadSkip}
          onConfirm={async (email) => {
            await handleLeadSubmit(email)
          }}
            title="Receba materiais exclusivos"
            descriptionRich={(
              <>
                <p>Receba também <strong>materiais práticos e exclusivos</strong> sobre empreendedorismo.</p>
              </>
            )}
            successTitle="Inscrição confirmada!"
            successMessage="Você vai receber materiais práticos e exclusivos no seu email."
            confirmLabel="Quero receber"
            cancelLabel="Não quero"
            Icon={Mail}
          />
        )}

        {showSavedLeadModal && (
          <EmailCaptureModal
            open={true}
            onClose={() => setShowSavedLeadModal(false)}
            onConfirm={async (email) => {
              await fetch('/api/add-to-activecampaign', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
            }}
            title="Seja avisado quando lançar"
            descriptionRich={(
              <>
                <p>Estamos finalizando a área de “Meus Cálculos”.</p>
                <p>
                  Deixe seu email e enviaremos também <strong>materiais práticos e exclusivos</strong> sobre empreendedorismo.
                </p>
              </>
            )}
            onSuccessAnother={() => {
              setShowSavedLeadModal(false)
              showHome()
            }}
            confirmLabel="Quero ser avisado"
            cancelLabel="Não quero"
            Icon={History}
          />
        )}

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
          
          onBackToCalculator={() => {
            calculationResult.reset()
          }}
          isFromSavedCalculation={calculationResult.result.isFromSaved}
          savedCalculationType={calculationResult.result.savedType}
        />
      </div>

      

      {/* Modal de Login removido (código não utilizado) */}
    </TooltipProvider>
  )
}
