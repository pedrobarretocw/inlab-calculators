'use client'

import { useState, useEffect } from 'react'
import { Ferias } from '@/components/calculators/Ferias'
import { CustoFuncionario } from '@/components/calculators/CustoFuncionario'
import { DecimoTerceiro } from '@/components/calculators/DecimoTerceiro'
import { getVariant, setVariant } from '@/lib/tracking'
import { PublicClerkProvider } from '@/components/auth/PublicClerkProvider'

interface EmbedABProps {
  articleSlug?: string
}

function EmbedABContent({ articleSlug }: EmbedABProps) {
  const [selectedCalculator, setSelectedCalculator] = useState<string>('')
  const [variant, setCurrentVariant] = useState<string>('')
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Check if we already have a variant in cookie
    const existingVariant = getVariant()
    
    if (existingVariant) {
      setCurrentVariant(existingVariant)
      setSelectedCalculator(existingVariant)
      setLoading(false)
    } else {
      // Fetch variant from A/B API
      fetchVariant()
    }
  }, [])
  
  const fetchVariant = async () => {
    try {
      const response = await fetch('/calculadoras/api/ab-pick')
      
      if (response.ok) {
        const data = await response.json()
        const selectedVariant = data.variant
        
        // Save to cookie (TTL 7 days)
        setVariant(selectedVariant)
        setCurrentVariant(selectedVariant)
        setSelectedCalculator(selectedVariant)
      } else {
        // Fallback to default calculator
        const fallback = 'ferias'
        setCurrentVariant(fallback)
        setSelectedCalculator(fallback)
      }
    } catch (error) {
      console.warn('Error fetching A/B variant:', error)
      // Fallback to default calculator
      const fallback = 'ferias'
      setCurrentVariant(fallback)
      setSelectedCalculator(fallback)
    } finally {
      setLoading(false)
    }
  }
  
  const handleCalculate = () => {
    // Could trigger save flow here
  }
  
  const handleStart = () => {
    // User started calculation
  }
  
  if (loading) {
    return (
      <div className="w-full max-w-lg h-[500px] max-h-[500px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  const renderCalculator = () => {
    switch (selectedCalculator) {
      case 'ferias':
        return (
          <Ferias
            onCalculate={handleCalculate}
            onStart={handleStart}
            variant={variant}
            articleSlug={articleSlug}
          />
        )
      case 'custo-funcionario':
        return (
          <CustoFuncionario
            onCalculate={handleCalculate}
            onStart={handleStart}
            variant={variant}
            articleSlug={articleSlug}
          />
        )
      case '13o-salario':
        return (
          <DecimoTerceiro
            onCalculate={handleCalculate}
            onStart={handleStart}
            variant={variant}
            articleSlug={articleSlug}
          />
        )
      default:
        return (
          <Ferias
            onCalculate={handleCalculate}
            onStart={handleStart}
            variant={variant}
            articleSlug={articleSlug}
          />
        )
    }
  }
  
  return (
    <div className="w-full max-w-lg h-[500px] max-h-[500px] flex items-center justify-center">
      {renderCalculator()}
    </div>
  )
}

export function EmbedAB({ articleSlug }: EmbedABProps) {
  return (
    <PublicClerkProvider>
      <EmbedABContent articleSlug={articleSlug} />
    </PublicClerkProvider>
  )
}
