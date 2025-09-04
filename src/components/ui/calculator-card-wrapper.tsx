'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface CalculatorCardWrapperProps {
  children: React.ReactNode
  className?: string
  fadeClass?: string
}

export function CalculatorCardWrapper({ 
  children, 
  className,
  fadeClass = ''
}: CalculatorCardWrapperProps) {
  return (
    <div className="pt-4">
      <Card 
        className={cn(
          "quiz-snake-border w-full shadow-lg rounded-2xl overflow-hidden transition-opacity duration-300",
          "h-[480px] max-h-[480px]", // Altura fixa para evitar layout shifting
          fadeClass,
          className
        )}
      >
        <div className="h-full overflow-hidden">
          {children}
        </div>
      </Card>
    </div>
  )
}
