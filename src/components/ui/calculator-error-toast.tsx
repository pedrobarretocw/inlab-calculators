'use client'

import * as React from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CalculatorErrorToastData {
  id: string
  title: string
  description?: string
  duration?: number
  imageUrl?: string
  showImage?: boolean
}

interface CalculatorErrorToastProps {
  toast: CalculatorErrorToastData
  onDismiss: (id: string) => void
}

export function CalculatorErrorToast({ toast, onDismiss }: CalculatorErrorToastProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const [isExiting, setIsExiting] = React.useState(false)

  React.useEffect(() => {
    // Anima entrada
    const timer = setTimeout(() => setIsVisible(true), 10)
    
    // Auto dismiss
    if (toast.duration !== 0) {
      const dismissTimer = setTimeout(() => {
        handleDismiss()
      }, toast.duration || 5000)
      
      return () => {
        clearTimeout(timer)
        clearTimeout(dismissTimer)
      }
    }
    
    return () => clearTimeout(timer)
  }, [toast.duration])

  const handleDismiss = () => {
    setIsExiting(true)
    setTimeout(() => {
      onDismiss(toast.id)
    }, 300)
  }

  return (
    <div
      className={cn(
        "absolute inset-x-4 bottom-16 z-50 bg-white border border-red-200 rounded-lg shadow-xl backdrop-blur-sm transition-all duration-300 overflow-hidden",
        isVisible && !isExiting ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95",
        isExiting && "opacity-0 -translate-y-2 scale-95"
      )}
    >
      {/* Header com ícone e botão fechar */}
      <div className="flex items-start justify-between p-4 pb-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-red-800">
              {toast.title}
            </div>
            {toast.description && (
              <div className="text-xs text-red-700 mt-1 leading-relaxed">
                {toast.description}
              </div>
            )}
          </div>
        </div>
        
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-100 transition-colors"
        >
          <X className="h-3.5 w-3.5 text-red-600" />
        </button>
      </div>

      {/* Imagem se habilitada */}
      {toast.showImage && (
        <div className="px-4 pb-4">
          <div className="w-full h-32 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border border-red-100 flex items-center justify-center">
            {toast.imageUrl ? (
              <img 
                src={toast.imageUrl} 
                alt="Erro na validação" 
                className="max-w-full max-h-full object-contain rounded"
              />
            ) : (
              <div className="text-center text-red-400">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                <p className="text-xs">Verifique os campos</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export interface CalculatorErrorToastContainerProps {
  className?: string
}

export function CalculatorErrorToastContainer({ className }: CalculatorErrorToastContainerProps) {
  const [toasts, setToasts] = React.useState<CalculatorErrorToastData[]>([])

  const addToast = React.useCallback((toast: Omit<CalculatorErrorToastData, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts(prev => [...prev, { ...toast, id }])
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  // Expor funções globalmente
  React.useEffect(() => {
    // @ts-expect-error - Global function for iframe communication
    window.__addCalculatorErrorToast = addToast
  }, [addToast])

  if (toasts.length === 0) return null

  return (
    <div className={cn("relative", className)}>
      {toasts.map(toast => (
        <CalculatorErrorToast
          key={toast.id}
          toast={toast}
          onDismiss={removeToast}
        />
      ))}
    </div>
  )
}

// Hook para usar o toast de erro da calculadora
export function useCalculatorErrorToast() {
  const addErrorToast = React.useCallback((toast: Omit<CalculatorErrorToastData, 'id'>) => {
    // @ts-expect-error - Global function for iframe communication
    if (window.__addCalculatorErrorToast) {
      // @ts-expect-error - Global function for iframe communication
      window.__addCalculatorErrorToast(toast)
    }
  }, [])

  return { addErrorToast }
}
