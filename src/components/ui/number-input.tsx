'use client'

import * as React from 'react'
import { LucideIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { cn } from '@/lib/utils'

interface NumberInputProps {
  label: string
  placeholder?: string
  value: number
  onChange: (value: number) => void
  onInputChange?: () => void
  className?: string
  min?: number
  max?: number
  icon?: LucideIcon
  iconColor?: string
}

export function NumberInput({ 
  label, 
  placeholder = "0", 
  value, 
  onChange, 
  onInputChange,
  className,
  min,
  max,
  icon: Icon,
  iconColor = "text-blue-500"
}: NumberInputProps) {
  return (
    <FormItem className={className}>
      <FormLabel className="text-sm font-medium text-gray-700">{label}</FormLabel>
      <FormControl>
        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon className={cn("h-4 w-4", iconColor)} />
            </div>
          )}
          <Input
            type="number"
            min={min}
            max={max}
            placeholder={placeholder}
            value={value || ''}
            onChange={(e) => {
              const parsedValue = parseInt(e.target.value) || 0
              onChange(parsedValue)
              onInputChange?.()
            }}
            className={cn(
              Icon ? "pl-10" : "pl-4",
              "pr-4 py-3 text-base font-medium transition-all duration-200",
              "border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 focus:ring-2",
              "bg-white hover:bg-gray-50/50 focus:bg-white"
            )}
          />
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  )
}

export default NumberInput
