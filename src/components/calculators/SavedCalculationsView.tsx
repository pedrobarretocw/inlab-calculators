'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calculator, Calendar, ChevronDown, ChevronRight } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { useUser } from '@clerk/nextjs'
import { PublicClerkProvider } from '@/components/auth/PublicClerkProvider'
import { PublicLoginModal } from '@/components/auth/PublicLoginModal'
import { usePublicAuth } from '@/hooks/usePublicAuth'

interface SavedCalculation {
  id: string
  calculator_slug: string
  inputs: Record<string, any>
  outputs: Record<string, any>
  created_at: string
}

interface SavedCalculationsViewProps {
  onBack: () => void
  onSelectCalculation?: (calculation: SavedCalculation) => void
}

function SavedCalculationsContent({ onBack, onSelectCalculation }: SavedCalculationsViewProps) {
  const { user, isLoaded } = usePublicAuth()
  const [calculations, setCalculations] = useState<SavedCalculation[]>([])
  const [loading, setLoading] = useState(true)

  const [showLoginModal, setShowLoginModal] = useState(false)

  useEffect(() => {
    if (!isLoaded) return
    
    if (!user) {
      setShowLoginModal(true)
      setLoading(false)
      return
    }

    setShowLoginModal(false)
    fetchCalculations()
  }, [user, isLoaded])

  const fetchCalculations = async () => {
    try {
      const userEmail = user?.emailAddresses?.[0]?.emailAddress
      if (!userEmail) return

      const response = await fetch(`/api/user-calculations?email=${encodeURIComponent(userEmail)}`)
      console.log('[SAFE DEBUG] Response status:', response.status, response.statusText)
      if (response.ok) {
        const data = await response.json()
        
        // Mostrar TODOS os cálculos do usuário (sem filtro)
        console.log(`[DEBUG] Mostrando todos os cálculos:`, data.calculations.length, 'encontrados')
        console.log(`[DEBUG] Slugs encontrados:`, data.calculations.map((c: SavedCalculation) => c.calculator_slug))
        
        setCalculations(data.calculations)
      }
    } catch (error) {
      console.error('Error fetching calculations:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCalculatorName = (slug: string) => {
    switch (slug) {
      case '13o-salario':
      case 'decimo-terceiro':
        return '13º Salário'
      case 'ferias':
        return 'Férias'

      case 'custo-funcionario':
        return 'Custo do Funcionário'
      default:
        return 'Cálculo'
    }
  }

  const getCalculatorIcon = (slug: string) => {
    switch (slug) {
      case '13o-salario':
      case 'decimo-terceiro':
        return '💰'
      case 'ferias':
        return '🏖️'

      case 'custo-funcionario':
        return '👥'
      default:
        return '📊'
    }
  }

  const getMainResult = (calc: SavedCalculation) => {
    const outputs = calc.outputs || {}
    const values = Object.values(outputs)
    
    // Tentar encontrar o resultado principal
    if (outputs['Valor Líquido Estimado']) return outputs['Valor Líquido Estimado']
    if (outputs['Total Líquido']) return outputs['Total Líquido']
    if (outputs['Valor Líquido']) return outputs['Valor Líquido']
    if (outputs['Custo Total']) return outputs['Custo Total']
    if (outputs['Pró-labore Líquido']) return outputs['Pró-labore Líquido']
    
    // Se não achou, pegar o primeiro valor numérico
    const firstNumeric = values.find(v => typeof v === 'string' && v.includes('R$'))
    return firstNumeric || 'N/A'
  }

  const handleSelectCalculation = (calc: SavedCalculation) => {
    if (onSelectCalculation) {
      onSelectCalculation(calc)
    }
  }

  const handleLoginSuccess = () => {
    setShowLoginModal(false)
    // O usePublicAuth vai detectar automaticamente a mudança de user
  }

  const handleLoginCancel = () => {
    setShowLoginModal(false)
    onBack()
  }



  if (loading) {
    return (
      <div className="h-[500px] flex items-center justify-center pt-8" style={{ backgroundColor: '#F5F5F5' }}>
        <div className="text-center">
          <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse mx-auto mb-3"></div>
          <p className="text-xs text-gray-500">Carregando</p>
        </div>
      </div>
    )
  }

  if (showLoginModal && !user) {
    return (
      <div className="h-[500px] flex items-center justify-center pt-8 px-4 pb-4" style={{ backgroundColor: '#F5F5F5' }}>
        <PublicLoginModal
          onSuccess={handleLoginSuccess}
          onCancel={handleLoginCancel}
        />
      </div>
    )
  }

  return (
    <div className="h-[500px] flex flex-col" style={{ backgroundColor: '#F5F5F5' }}>
      {/* Header centralizado */}
      <div className="flex-shrink-0 px-4 py-2 border-b border-gray-300 relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center justify-center">
          <h2 className="text-base font-medium text-gray-900 flex items-center gap-2">
            <Calculator className="h-4 w-4 text-blue-600" />
            Meus Cálculos
            {calculations.length > 0 && (
              <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full ml-2">
                {calculations.length}
              </span>
            )}
          </h2>
        </div>
      </div>

      {/* Content com scroll */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-3">
        {calculations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-full bg-gray-50 mx-auto mb-4 flex items-center justify-center">
              <Calculator className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mb-6">Nenhum cálculo salvo</p>
            <button
              onClick={onBack}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Fazer primeiro cálculo
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {calculations.map((calc) => (
                <div
                  key={calc.id} 
                  className="bg-white/80 backdrop-blur-sm border border-gray-200/60 hover:border-gray-300/80 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-sm hover:bg-white/90"
                  onClick={() => handleSelectCalculation(calc)}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-gray-50/80 flex items-center justify-center text-sm">
                          {getCalculatorIcon(calc.calculator_slug)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium text-sm text-gray-900 tracking-tight">
                              {getCalculatorName(calc.calculator_slug)}
                            </h3>
                            <span className="text-sm font-semibold text-emerald-600 ml-3">
                              {getMainResult(calc)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 font-medium">
                            {new Date(calc.created_at).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="ml-3 opacity-40">
                        <ChevronRight className="h-4 w-4 text-gray-600" />
                      </div>
                    </div>
                  </div>
                </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function SavedCalculationsView(props: SavedCalculationsViewProps) {
  return (
    <PublicClerkProvider>
      <SavedCalculationsContent {...props} />
    </PublicClerkProvider>
  )
}