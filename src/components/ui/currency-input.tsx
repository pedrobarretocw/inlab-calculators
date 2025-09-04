'use client'

import * as React from 'react'
import { Input } from '@/components/ui/input'
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { cn } from '@/lib/utils'

interface CurrencyInputProps {
  label: string
  placeholder?: string
  value: number
  onChange: (value: number) => void
  onInputChange?: () => void
  className?: string
}

// Função para aplicar máscara de moeda brasileira em tempo real
const formatCurrencyMask = (value: string): string => {
  // Remove tudo que não é dígito
  const digits = value.replace(/\D/g, '')
  
  // Se não há dígitos ou é zero, retorna vazio para permitir deletar tudo
  if (!digits || digits === '0' || digits === '00') return ''
  
  // Remove zeros à esquerda mas mantém pelo menos um dígito
  const cleanDigits = digits.replace(/^0+/, '') || '0'
  
  // Se só restou zero, retorna vazio
  if (cleanDigits === '0') return ''
  
  // Converte para número e divide por 100 para ter centavos
  let number = parseInt(cleanDigits, 10) / 100
  
  // Evita números muito pequenos que podem causar problemas
  if (number < 0.01) return ''
  
  // Limita a um valor máximo razoável (10 milhões)
  if (number > 10000000) return ''
  
  // Formata no padrão brasileiro
  return number.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// Função para converter valor formatado para número
const parseCurrencyValue = (value: string): number => {
  if (!value || value.trim() === '') return 0
  
  // Remove pontos de milhar e converte vírgula para ponto
  const cleanValue = value.replace(/\./g, '').replace(',', '.')
  const parsed = parseFloat(cleanValue)
  
  // Verifica se é um número válido
  return isNaN(parsed) ? 0 : parsed
}

export function CurrencyInput({ 
  label, 
  placeholder = "0,00", 
  value, 
  onChange, 
  onInputChange,
  className 
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = React.useState('')
  const [isUserTyping, setIsUserTyping] = React.useState(false)

  // Inicializa o valor formatado apenas se não estiver digitando
  React.useEffect(() => {
    if (!isUserTyping) {
      if (value > 0) {
        setDisplayValue(formatCurrencyMask((value * 100).toString()))
      } else {
        setDisplayValue('')
      }
    }
  }, [value, isUserTyping])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsUserTyping(true)
    const inputValue = e.target.value
    
    // Se o usuário deletou tudo, permite campo vazio
    if (inputValue === '') {
      setDisplayValue('')
      onChange(0)
      onInputChange?.()
      setTimeout(() => setIsUserTyping(false), 100) // Reset após um delay
      return
    }
    
    const formatted = formatCurrencyMask(inputValue)
    const numericValue = parseCurrencyValue(formatted)
    
    setDisplayValue(formatted)
    onChange(numericValue)
    onInputChange?.()
    
    // Reset o flag após um delay para permitir que o useEffect funcione novamente
    setTimeout(() => setIsUserTyping(false), 100)
  }

  const handleBlur = () => {
    setIsUserTyping(false)
    // Reformata o valor ao sair do campo
    if (value > 0) {
      setDisplayValue(formatCurrencyMask((value * 100).toString()))
    } else {
      setDisplayValue('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permite navegação, backspace, delete, tab, escape, enter
    if ([8, 9, 27, 13, 46, 35, 36, 37, 38, 39, 40].includes(e.keyCode) ||
        // Permite Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
        (e.ctrlKey && [65, 67, 86, 88, 90].includes(e.keyCode))) {
      return
    }
    // Impede caracteres não numéricos
    if ((e.shiftKey || e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault()
    }
  }

  return (
    <FormItem className={className}>
      <FormLabel className="text-sm font-medium text-gray-700">{label}</FormLabel>
      <FormControl>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-purple-600 font-bold text-sm">R$</span>
          </div>
          <Input
            placeholder={placeholder}
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={cn(
              "pl-10 pr-4 py-3 text-base font-medium transition-all duration-200",
              "border-gray-200 focus:border-green-400 focus:ring-green-400/20 focus:ring-2",
              "bg-white hover:bg-gray-50/50 focus:bg-white"
            )}
          />
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  )
}

export default CurrencyInput
