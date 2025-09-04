'use client'

import { useState, useEffect } from 'react'
import { Ferias } from '@/components/calculators/Ferias'
import { CustoFuncionario } from '@/components/calculators/CustoFuncionario'
import { DecimoTerceiro } from '@/components/calculators/DecimoTerceiro'
import { CalculatorHome } from '@/components/calculators/CalculatorHome'
import { CalculatorSkeleton } from '@/components/ui/CalculatorSkeleton'
import { CalculatorProvider, useCalculator } from '@/contexts/CalculatorContext'
import { PublicClerkProvider } from '@/components/auth/PublicClerkProvider'

interface EmbedAllProps {
  articleSlug?: string
  initialCalculator?: string
}

function EmbedAllContent({ articleSlug, initialCalculator }: { articleSlug?: string; initialCalculator?: string }) {
  const { selectedCalculator, showCalculatorHome, selectCalculator, navigateToCarousel } = useCalculator()
  const [fadeClass, setFadeClass] = useState('opacity-100')
  const [isLoading, setIsLoading] = useState(true)
  const [hasInitialized, setHasInitialized] = useState(false)
  
  // Estado atual do componente
  
  // Inicialização apenas uma vez
  useEffect(() => {
    if (!hasInitialized) {
      if (initialCalculator) {
        selectCalculator(initialCalculator as any)
        setTimeout(() => {
          setIsLoading(false)
          setHasInitialized(true)
        }, 800)
      } else {
        // Se não tem initial, vai direto para home
        setTimeout(() => {
          setIsLoading(false)
          setHasInitialized(true)
        }, 500)
      }
    }
  }, [initialCalculator, hasInitialized, selectCalculator])
  
  // Loading state - mostrar skeleton
  if (isLoading) {
    return (
      <div className={`w-full max-w-lg mx-auto transition-opacity duration-300 ${fadeClass}`}>
        <div className="h-[500px] max-h-[500px] overflow-hidden flex items-start justify-center pt-4">
          <CalculatorSkeleton />
        </div>
      </div>
    )
  }

  const handleCalculate = (result: unknown) => {
    // Calculation completed
  }
  
  const handleStart = () => {
    // User started calculation
  }
  
  const handleCalculatorSelect = (calculatorId: string) => {
    setFadeClass('opacity-0')
    setTimeout(() => {
      selectCalculator(calculatorId as any)
      setFadeClass('opacity-100')
    }, 150)
  }
  
  const handleBackToHome = () => {
    setFadeClass('opacity-0')
    setTimeout(() => {
      navigateToCarousel()
      setFadeClass('opacity-100')
    }, 150)
  }


  
  // Renderizar CalculatorHome
  if (showCalculatorHome) {
    return (
      <div className={`w-full max-w-lg mx-auto transition-opacity duration-300 ${fadeClass}`}>
        <div className="max-h-[500px] overflow-hidden pt-4">
          <CalculatorHome onSelectCalculator={handleCalculatorSelect} />
        </div>
      </div>
    )
  }
  
  // Renderizar calculadora selecionada
  if (selectedCalculator) {
    return (
      <div className={`w-full max-w-lg mx-auto transition-opacity duration-300 ${fadeClass}`}>
        <div className="h-[500px] max-h-[500px] overflow-hidden flex items-start justify-center pt-4">
          {selectedCalculator === 'ferias' && (
            <Ferias
              key="ferias-calculator"
              onCalculate={handleCalculate}
              onStart={handleStart}
              variant="ferias-all"
              articleSlug={articleSlug}
              showBackButton={false}
              onBack={handleBackToHome}
            />
          )}

          {selectedCalculator === 'custo-funcionario' && (
            <CustoFuncionario
              key="custo-funcionario-calculator"
              onCalculate={handleCalculate}
              onStart={handleStart}
              variant="custo-funcionario-all"
              articleSlug={articleSlug}
              showBackButton={false}
              onBack={handleBackToHome}
            />
          )}
          
          {selectedCalculator === '13o-salario' && (
            <DecimoTerceiro
              key="13o-salario-calculator"
              onCalculate={handleCalculate}
              onStart={handleStart}
              variant="13o-salario-all"
              articleSlug={articleSlug}
              showBackButton={false}
              onBack={handleBackToHome}
            />
          )}
        </div>
      </div>
    )
  }
  
  // Renderizar CalculatorHome por padrão (sem carousel)
  return (
    <div className={`w-full max-w-lg mx-auto transition-opacity duration-300 ${fadeClass}`}>
      <div className="max-h-[500px] overflow-hidden pt-4">
        <CalculatorHome onSelectCalculator={handleCalculatorSelect} />
      </div>
    </div>
  )
}

export function EmbedAll({ articleSlug, initialCalculator }: EmbedAllProps) {
  return (
    <PublicClerkProvider>
      <EmbedAllContent articleSlug={articleSlug} initialCalculator={initialCalculator} />
    </PublicClerkProvider>
  )
}