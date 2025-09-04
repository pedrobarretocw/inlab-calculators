// Responsabilidade única: Gerenciar estado de resultados
import { useState } from 'react'
import { ResultFormatter, FormattedResult, CalculationData } from '@/lib/result-formatters'

export interface CalculationResultState {
  data: CalculationData | null
  isFromSaved: boolean
  savedType?: string
}

export function useCalculationResult(currentCalculatorType: string) {
  const [result, setResult] = useState<CalculationResultState>({
    data: null,
    isFromSaved: false,
    savedType: undefined
  })

  const setNewCalculation = (data: CalculationData) => {
    setResult({
      data,
      isFromSaved: false,
      savedType: undefined
    })
  }

  const setSavedCalculation = (data: CalculationData, savedType: string) => {
    setResult({
      data,
      isFromSaved: true,
      savedType
    })
  }

  const reset = () => {
    setResult({
      data: null,
      isFromSaved: false,
      savedType: undefined
    })
  }

  const getFormattedResults = (): FormattedResult[] => {
    if (!result.data) return []
    
    // REGRA: Se é salvo, usar o tipo do salvo. Se é novo, usar tipo da calculadora atual.
    const typeToFormat = result.isFromSaved ? result.savedType : currentCalculatorType
    const finalType = typeToFormat || currentCalculatorType
    
    // Formatando resultado do cálculo
    
    return ResultFormatter.formatByType(finalType, result.data)
  }

  return {
    result,
    setNewCalculation,
    setSavedCalculation,
    reset,
    getFormattedResults,
    isVisible: !!result.data
  }
}
