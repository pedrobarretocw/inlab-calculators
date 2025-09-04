'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
// import { usePublicAuth } from '@/hooks/usePublicAuth' // Removido para evitar dependência global

type CalculatorType = 'ferias' | 'custo-funcionario' | '13o-salario'

interface SavedCalculation {
  id: string
  calculator_slug: string
  name?: string
  inputs: Record<string, any>
  outputs: Record<string, any>
  created_at: string
}

interface CalculatorContextData {
  // Estados de navegação
  selectedCalculator: CalculatorType | null
  showCalculatorHome: boolean
  
  // Estados de cálculos salvos
  savedCalculations: SavedCalculation[]
  loadingSavedCalculations: boolean
  
  // Ações de navegação
  selectCalculator: (calculatorId: CalculatorType) => void
  showHome: () => void
  hideHome: () => void
  navigateToCarousel: () => void
  
  // Ações de cálculos salvos
  refreshSavedCalculations: (userEmail?: string) => Promise<void>
  addSavedCalculation: (calculation: SavedCalculation) => void
  deleteCalculation: (calculationId: string) => Promise<void>
}

const CalculatorContext = createContext<CalculatorContextData | undefined>(undefined)

interface CalculatorProviderProps {
  children: ReactNode
  initialCalculator?: string
}

export function CalculatorProvider({ children, initialCalculator }: CalculatorProviderProps) {
  // Estados de navegação
  const [selectedCalculator, setSelectedCalculator] = useState<CalculatorType | null>(
    initialCalculator as CalculatorType || null
  )
  const [showCalculatorHome, setShowCalculatorHome] = useState(false)
  
  // Estados de cálculos salvos
  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>([])
  const [loadingSavedCalculations, setLoadingSavedCalculations] = useState(false)
  
  // User será passado via parâmetros quando necessário
  // const { user, isLoaded } = usePublicAuth() // Removido
  
  // Função para buscar cálculos salvos do banco
  const fetchSavedCalculations = async (userEmail?: string) => {
    if (!userEmail) {
      console.log('[Context] Email não fornecido, limpando cálculos salvos')
      setSavedCalculations([])
      return
    }
    
    setLoadingSavedCalculations(true)
    try {
      console.log('[Context] Buscando cálculos salvos para email:', userEmail)
      const response = await fetch(`/api/user-calculations?email=${encodeURIComponent(userEmail)}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('[Context] Cálculos salvos carregados:', data.calculations.length, 'itens')
        setSavedCalculations(data.calculations)
      } else {
        console.error('[Context] Erro ao buscar cálculos salvos:', response.status)
        setSavedCalculations([])
      }
    } catch (error) {
      console.error('[Context] Erro na requisição:', error)
      setSavedCalculations([])
    } finally {
      setLoadingSavedCalculations(false)
    }
  }
  
  // useEffect removido - cálculos serão carregados via chamada explícita nos componentes
  
  // Ações de navegação
  const selectCalculator = (calculatorId: CalculatorType) => {
    console.log('[Context] Selecionando calculadora:', calculatorId)
    setSelectedCalculator(calculatorId)
    setShowCalculatorHome(false)
  }
  
  const showHome = () => {
    console.log('[Context] Mostrando Calculator Home')
    setSelectedCalculator(null) // Limpa calculadora selecionada
    setShowCalculatorHome(true)
  }
  
  const hideHome = () => {
    console.log('[Context] Escondendo Calculator Home')
    setShowCalculatorHome(false)
  }
  
  const navigateToCarousel = () => {
    console.log('[Context] Navegando para carousel')
    setSelectedCalculator(null)
    setShowCalculatorHome(false)
  }
  
  // Ações de cálculos salvos
  const refreshSavedCalculations = async (userEmail?: string) => {
    console.log('[Context] refreshSavedCalculations chamada - atualizando cálculos salvos para:', userEmail)
    await fetchSavedCalculations(userEmail)
  }
  
  const addSavedCalculation = (calculation: SavedCalculation) => {
    console.log('[Context] Adicionando novo cálculo salvo:', calculation.id)
    setSavedCalculations(prev => [calculation, ...prev])
  }
  
  const deleteCalculation = async (calculationId: string) => {
    console.log('[Context] Deletando cálculo:', calculationId)
    console.log('[Context] Tipo do ID:', typeof calculationId)
    console.log('[Context] ID codificado:', encodeURIComponent(calculationId))
    
    try {
      const url = `/api/delete-calculation?id=${encodeURIComponent(calculationId)}`
      console.log('[Context] URL da requisição:', url)
      
      const response = await fetch(url, {
        method: 'DELETE'
      })
      
      console.log('[Context] Status da resposta:', response.status)
      
      if (response.ok) {
        console.log('[Context] Cálculo deletado com sucesso')
        setSavedCalculations(prev => prev.filter(calc => calc.id !== calculationId))
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('[Context] Erro ao deletar cálculo:', response.status, errorData)
        throw new Error(`Erro ao deletar cálculo: ${response.status}`)
      }
    } catch (error) {
      console.error('[Context] Erro na requisição de deleção:', error)
      throw error
    }
  }
  
  return (
    <CalculatorContext.Provider
      value={{
        // Estados de navegação
        selectedCalculator,
        showCalculatorHome,
        
        // Estados de cálculos salvos
        savedCalculations,
        loadingSavedCalculations,
        
        // Ações de navegação
        selectCalculator,
        showHome,
        hideHome,
        navigateToCarousel,
        
        // Ações de cálculos salvos
        refreshSavedCalculations,
        addSavedCalculation,
        deleteCalculation
      }}
    >
      {children}
    </CalculatorContext.Provider>
  )
}

export function useCalculator() {
  const context = useContext(CalculatorContext)
  
  if (!context) {
    throw new Error('useCalculator deve ser usado dentro de CalculatorProvider')
  }
  
  return context
}
