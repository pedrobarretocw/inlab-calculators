'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Users, DollarSign, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { Ferias } from '@/components/calculators/Ferias'

import { CustoFuncionario } from '@/components/calculators/CustoFuncionario'
import { DecimoTerceiro } from '@/components/calculators/DecimoTerceiro'

interface EmbedAllProps {
  articleSlug?: string
  initialCalculator?: string
}

type CalculatorType = 'ferias' | 'custo-funcionario' | '13o-salario'

const calculators = [
  {
    id: 'ferias' as CalculatorType,
    title: 'Férias',
    description: 'Calcule férias proporcionais e adicional de 1/3',
    emoji: '🏖️',
    icon: Calendar,
    accentColor: '#10B981'
  },


  {
    id: 'custo-funcionario' as CalculatorType,
    title: 'Custo Funcionário',
    description: 'Calcule o custo total incluindo encargos',
    emoji: '👥',
    icon: Users,
    accentColor: '#8B5CF6'
  },
  {
    id: '13o-salario' as CalculatorType,
    title: '13º Salário',
    description: 'Calcule o valor proporcional do décimo terceiro',
    emoji: '⭐',
    icon: Star,
    accentColor: '#F59E0B'
  }
]

export function EmbedAll({ articleSlug, initialCalculator }: EmbedAllProps) {
  const [showCarousel, setShowCarousel] = useState(!initialCalculator)
  const [selectedCalculator, setSelectedCalculator] = useState<CalculatorType | null>(
    initialCalculator as CalculatorType || null
  )
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [fadeClass, setFadeClass] = useState('opacity-100')
  const [cameFromCarousel, setCameFromCarousel] = useState(false) // Track if user came from carousel
  
  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying || !showCarousel) return
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % calculators.length)
    }, 5000) // 5 segundos - timing elegante
    
    return () => clearInterval(interval)
  }, [isAutoPlaying, showCarousel])
  
  const handleCalculate = (result: unknown) => {
    console.log('Calculation result:', result)
  }
  
  const handleStart = () => {
    console.log('User started calculation')
  }
  
  const handleCalculatorSelect = (calculatorId: CalculatorType) => {
    setFadeClass('opacity-0')
    setTimeout(() => {
      setSelectedCalculator(calculatorId)
      setShowCarousel(false)
      setCameFromCarousel(true) // Mark that user came from carousel
      setFadeClass('opacity-100')
    }, 300)
  }
  
  const handleBackToCarousel = () => {
    setFadeClass('opacity-0')
    setTimeout(() => {
      setShowCarousel(true)
      setSelectedCalculator(null)
      setCameFromCarousel(false) // Reset carousel state
      setFadeClass('opacity-100')
    }, 300)
  }
  
  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + calculators.length) % calculators.length)
  }

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % calculators.length)
  }
  
  if (!showCarousel && selectedCalculator) {
    return (
      <div className={`w-full max-w-lg mx-auto p-6 transition-opacity duration-300 ${fadeClass}`}>
        <div className="min-h-[500px] flex items-start justify-center">
          {selectedCalculator === 'ferias' && (
            <Ferias
              onCalculate={handleCalculate}
              onStart={handleStart}
              variant="ferias-all"
              articleSlug={articleSlug}
              showBackButton={cameFromCarousel}
              onBack={handleBackToCarousel}
            />
          )}

          {selectedCalculator === 'custo-funcionario' && (
            <CustoFuncionario
              onCalculate={handleCalculate}
              onStart={handleStart}
              variant="custo-funcionario-all"
              articleSlug={articleSlug}
              showBackButton={cameFromCarousel}
              onBack={handleBackToCarousel}
            />
          )}
          {selectedCalculator === '13o-salario' && (
            <DecimoTerceiro
              onCalculate={handleCalculate}
              onStart={handleStart}
              variant="13o-salario-all"
              articleSlug={articleSlug}
              showBackButton={cameFromCarousel}
              onBack={handleBackToCarousel}
            />
          )}
        </div>
      </div>
    )
  }
  
  return (
    <div 
      className={`w-full max-w-lg mx-auto p-6 transition-opacity duration-300 ${fadeClass}`}
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Card Minimalista */}
      <div className="relative w-full">
        <Card className="w-full border-0 shadow-lg bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            {/* Título Minimalista */}
            <div className="py-6 px-8 text-center border-b border-gray-100">
              <h1 className="text-xl font-medium text-gray-900 tracking-tight">
                Calculadoras InfinitePay
              </h1>
              <p className="text-sm text-gray-500 mt-2">
                Escolha uma calculadora para começar
              </p>
            </div>
          
          {/* Carousel Section */}
          <div className="relative py-12 px-8">
            {/* Navegação Minimalista */}
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center opacity-60 hover:opacity-100 border border-gray-100"
            >
              <ChevronLeft className="h-5 w-5 text-gray-400" />
            </button>

            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center opacity-60 hover:opacity-100 border border-gray-100"
            >
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>

            <div 
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {calculators.map((calculator, index) => (
                <div key={calculator.id} className="w-full flex-shrink-0 py-8">
                  <div 
                    className="cursor-pointer group flex flex-col items-center justify-center transition-all duration-300 rounded-2xl mx-4 py-8 hover:bg-gray-50/60"
                    onClick={() => handleCalculatorSelect(calculator.id)}
                  >
                    {/* Icon Container - Minimalista */}
                    <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mb-6 group-hover:bg-gray-200 transition-colors duration-300 shadow-sm">
                      <calculator.icon className="h-8 w-8 text-gray-600" />
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-lg font-medium text-gray-900 mb-3 text-center">
                      {calculator.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-sm text-gray-500 text-center leading-relaxed max-w-xs px-2">
                      {calculator.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Indicadores Minimalistas */}
          <div className="py-6 flex justify-center border-t border-gray-100">
            <div className="flex space-x-2">
              {calculators.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  onMouseEnter={() => {
                    goToSlide(index)
                    setIsAutoPlaying(false)
                  }}
                  onMouseLeave={() => setIsAutoPlaying(true)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentSlide 
                      ? 'w-6 h-2 bg-gray-400' 
                      : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
