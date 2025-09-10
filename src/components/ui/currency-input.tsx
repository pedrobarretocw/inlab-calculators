'use client'

import * as React from 'react'
import { NumericFormat } from 'react-number-format'
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

export function CurrencyInput({ 
  label, 
  placeholder = "0,00", 
  value, 
  onChange, 
  onInputChange,
  className 
}: CurrencyInputProps) {
  return (
    <FormItem className={className}>
      <FormLabel className="text-sm font-medium text-gray-700">{label}</FormLabel>
      <FormControl>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <span className="text-purple-600 font-bold text-sm">R$</span>
          </div>
          <NumericFormat
            value={value || ''}
            onValueChange={(values) => {
              onChange(values.floatValue || 0)
              onInputChange?.()
            }}
            thousandSeparator="."
            decimalSeparator=","
            decimalScale={2}
            fixedDecimalScale={value > 0}
            allowNegative={false}
            placeholder={placeholder}
            onFocus={(e) => {
              // Se o campo está vazio ou zero, limpa para facilitar digitação
              if (value === 0 || !value) {
                e.target.setSelectionRange(0, e.target.value.length)
              }
            }}
            className={cn(
              "flex h-auto w-full rounded-md border border-input bg-background text-sm ring-offset-background",
              "file:border-0 file:bg-transparent file:text-sm file:font-medium",
              "placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              // Compact height and font for tighter vertical spacing
              "pl-10 pr-3 py-2 text-sm font-medium transition-all duration-200",
              "border-gray-200 focus:border-green-400 focus:ring-green-400/20 focus:ring-2",
              "bg-white hover:bg-gray-50/50 focus:bg-white",
              "tabular-nums"
            )}
            autoComplete="off"
            inputMode="numeric"
          />
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  )
}

export default CurrencyInput
