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
      setSavedCalculations([])
      return
    }
    
    setLoadingSavedCalculations(true)
    try {
      const response = await fetch(`/api/user-calculations?email=${encodeURIComponent(userEmail)}`)
      
      if (response.ok) {
        const data = await response.json()
        setSavedCalculations(data.calculations)
      } else {
        setSavedCalculations([])
      }
    } catch (error) {
      setSavedCalculations([])
    } finally {
      setLoadingSavedCalculations(false)
    }
  }
  
  // useEffect removido - cálculos serão carregados via chamada explícita nos componentes
  
  // Ações de navegação
  const selectCalculator = (calculatorId: CalculatorType) => {
    setSelectedCalculator(calculatorId)
    setShowCalculatorHome(false)
  }
  
  const showHome = () => {
    setSelectedCalculator(null) // Limpa calculadora selecionada
    setShowCalculatorHome(true)
  }
  
  const hideHome = () => {
    setShowCalculatorHome(false)
  }
  
  const navigateToCarousel = () => {
    setSelectedCalculator(null)
    setShowCalculatorHome(false)
  }
  
  // Ações de cálculos salvos
  const refreshSavedCalculations = async (userEmail?: string) => {
    await fetchSavedCalculations(userEmail)
  }
  
  const addSavedCalculation = (calculation: SavedCalculation) => {
    setSavedCalculations(prev => [calculation, ...prev])
  }
  
  const deleteCalculation = async (calculationId: string) => {
    try {
      const url = `/api/delete-calculation?id=${encodeURIComponent(calculationId)}`
      
      const response = await fetch(url, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setSavedCalculations(prev => prev.filter(calc => calc.id !== calculationId))
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Erro ao deletar cálculo: ${response.status}`)
      }
    } catch (error) {
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
