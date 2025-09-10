'use client'
import { Calculator } from 'lucide-react'

interface CalculatorOption {
  id: string
  name: string
  description: string
  emoji: string
  gradient: string
}

interface CalculatorHomeProps {
  onSelectCalculator: (calculatorId: string) => void
}

const calculatorOptions: CalculatorOption[] = [
  {
    id: 'ferias',
    name: 'Férias',
    description: 'Calcule o valor das suas férias',
    emoji: '🏖️',
    gradient: 'from-purple-400 to-purple-600'
  },
  {
    id: '13o-salario',
    name: '13º Salário',
    description: 'Calcule seu décimo terceiro',
    emoji: '💰',
    gradient: 'from-purple-400 to-purple-600'
  },
  {
    id: 'custo-funcionario',
    name: 'Custo do Funcionário',
    description: 'Calcule o custo total',
    emoji: '👥',
    gradient: 'from-purple-400 to-purple-600'
  }
]

export function CalculatorHome({ onSelectCalculator }: CalculatorHomeProps) {
  return (
    <div 
      className="quiz-snake-border h-[480px] max-h-[480px] flex flex-col animate-in fade-in-0 slide-in-from-bottom-4 duration-500 rounded-2xl"
    >
      {/* Header */}
      <div className="flex-shrink-0 px-4 pt-4 pb-2 border-b border-gray-200/60">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center justify-center gap-2">
          <Calculator className="h-5 w-5 text-purple-600" />
          Calculadoras InfinitePay
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-3">
          {calculatorOptions.map((calc, index) => (
            <button
              key={calc.id}
              onClick={() => {
                onSelectCalculator(calc.id)
              }}
              className="w-full group animate-in fade-in-0 slide-in-from-bottom-2"
              style={{ 
                animationDelay: `${index * 100}ms`,
                animationDuration: '400ms',
                animationFillMode: 'both'
              }}
            >
              <div className="flex items-center gap-4 p-3 rounded-xl bg-white/70 hover:bg-white/90 border border-gray-200/50 hover:border-gray-300/70 transition-all duration-200 hover:shadow-sm">
                {/* Emoji Icon */}
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center text-xl shadow-sm group-hover:scale-105 transition-transform duration-200">
                  {calc.emoji}
                </div>
                
                {/* Content */}
                <div className="flex-1 text-left">
                  <h3 className="font-medium text-gray-900 text-sm mb-0.5">
                    {calc.name}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {calc.description}
                  </p>
                </div>
                
                {/* Arrow */}
                <div className="text-gray-400 group-hover:text-gray-600 transition-colors duration-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
