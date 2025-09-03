'use client'

import * as React from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface InlineValidationErrorProps {
  isVisible: boolean
  onClose: () => void
  title: string
  message: string
  showImage?: boolean
}

export function InlineValidationError({ isVisible, onClose, title, message, showImage = true }: InlineValidationErrorProps) {
  // Auto-dismiss após 4 segundos
  React.useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, 4000)
      
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    <div className="absolute top-4 right-4 left-4 z-40">
      {/* Toast-style notification DENTRO do embed */}
      <div className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-10 shadow-lg transition-all",
        "bg-background text-foreground",
        "animate-in slide-in-from-top-full duration-300"
      )}>
        {/* Icon e Content */}
        <div className="flex items-center gap-3 flex-1">
          <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          
          {/* Content */}
          <div className="grid gap-1 flex-1">
            <div className="text-sm font-semibold">
              {title}
            </div>
            <div className="text-xs opacity-90">
              {message}
            </div>
          </div>
        </div>

        {/* Close button - Maior */}
        <button
          onClick={onClose}
          className="absolute right-2 top-2 rounded-md p-1.5 text-foreground/50 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
