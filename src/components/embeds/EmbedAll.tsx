'use client'

import { useState, useEffect } from 'react'
import { Ferias } from '@/components/calculators/Ferias'
import { CustoFuncionario } from '@/components/calculators/CustoFuncionario'
import { DecimoTerceiro } from '@/components/calculators/DecimoTerceiro'
import { CalculatorHome } from '@/components/calculators/CalculatorHome'
import { CalculatorSkeleton } from '@/components/ui/CalculatorSkeleton'
import { useCalculator } from '@/contexts/CalculatorContext'

interface EmbedAllProps {
  articleSlug?: string
  initialCalculator?: string
}

function EmbedAllContent({ articleSlug, initialCalculator }: { articleSlug?: string; initialCalculator?: string }) {
  const { selectedCalculator, showCalculatorHome, selectCalculator } = useCalculator()
  const [fadeClass, setFadeClass] = useState('opacity-100')
  const [isLoading, setIsLoading] = useState(true)
  const [hasInitialized, setHasInitialized] = useState(false)
  
  useEffect(() => {
    if (!hasInitialized) {
      if (initialCalculator) {
        selectCalculator(initialCalculator as 'ferias' | 'custo-funcionario' | '13o-salario')
        setTimeout(() => {
          setIsLoading(false)
          setHasInitialized(true)
        }, 800)
      } else {
        setTimeout(() => {
          setIsLoading(false)
          setHasInitialized(true)
        }, 500)
      }
    }
  }, [initialCalculator, hasInitialized, selectCalculator])
  
  if (isLoading) {
    return (
      <div className={`w-full max-w-lg mx-auto transition-opacity duration-300 ${fadeClass}`}>
        <div className="h-[500px] max-h-[500px] flex items-center justify-center">
          <CalculatorSkeleton />
        </div>
      </div>
    )
  }

  const handleCalculate = () => {}
  
  const handleStart = () => {}
  
  const handleCalculatorSelect = (calculatorId: string) => {
    setFadeClass('opacity-0')
    setTimeout(() => {
      selectCalculator(calculatorId as 'ferias' | 'custo-funcionario' | '13o-salario')
      setFadeClass('opacity-100')
    }, 150)
  }
  
  // handleBackToHome removido (não utilizado)


  
  if (showCalculatorHome) {
    return (
      <div className={`w-full max-w-lg mx-auto transition-opacity duration-300 ${fadeClass}`}>
        <div className="h-[500px] max-h-[500px] flex items-center justify-center">
          <CalculatorHome onSelectCalculator={handleCalculatorSelect} />
        </div>
      </div>
    )
  }
  
  if (selectedCalculator) {
    return (
      <div className={`w-full max-w-lg mx-auto transition-opacity duration-300 ${fadeClass}`}>
        <div className="h-[500px] max-h-[500px] flex items-center justify-center">
          {selectedCalculator === 'ferias' && (
            <Ferias
              key="ferias-calculator"
              onCalculate={handleCalculate}
              onStart={handleStart}
              variant="ferias-all"
              articleSlug={articleSlug}
            />
          )}

          {selectedCalculator === 'custo-funcionario' && (
            <CustoFuncionario
              key="custo-funcionario-calculator"
              onCalculate={handleCalculate}
              onStart={handleStart}
              variant="custo-funcionario-all"
              articleSlug={articleSlug}
            />
          )}
          
          {selectedCalculator === '13o-salario' && (
            <DecimoTerceiro
              key="13o-salario-calculator"
              onCalculate={handleCalculate}
              onStart={handleStart}
              variant="13o-salario-all"
              articleSlug={articleSlug}
            />
          )}
        </div>
      </div>
    )
  }
  
  return (
    <div className={`w-full max-w-lg mx-auto transition-opacity duration-300 ${fadeClass}`}>
      <div className="h-[500px] max-h-[500px] flex items-center justify-center">
        <CalculatorHome onSelectCalculator={handleCalculatorSelect} />
      </div>
    </div>
  )
}

export function EmbedAll({ articleSlug, initialCalculator }: EmbedAllProps) {
  return <EmbedAllContent articleSlug={articleSlug} initialCalculator={initialCalculator} />
}
