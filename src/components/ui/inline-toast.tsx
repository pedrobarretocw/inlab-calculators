'use client'

import * as React from 'react'
import { X, AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ToastData {
  id: string
  type: 'error' | 'success' | 'info'
  title: string
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface InlineToastProps {
  toast: ToastData
  onDismiss: (id: string) => void
}

export function InlineToast({ toast, onDismiss }: InlineToastProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const [isExiting, setIsExiting] = React.useState(false)

  React.useEffect(() => {
    // Anima entrada
    const timer = setTimeout(() => setIsVisible(true), 10)
    
    // Auto dismiss
    if (toast.duration !== 0) {
      const dismissTimer = setTimeout(() => {
        handleDismiss()
      }, toast.duration || 4000)
      
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
    }, 200)
  }

  const getIcon = () => {
    switch (toast.type) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getStyles = () => {
    switch (toast.type) {
      case 'error':
        return 'border-red-200 bg-red-50 text-red-800'
      case 'success':
        return 'border-green-200 bg-green-50 text-green-800'
      case 'info':
        return 'border-blue-200 bg-blue-50 text-blue-800'
    }
  }

  return (
    <div
      className={cn(
        "absolute bottom-16 left-4 right-4 z-50 flex items-start gap-3 rounded-lg border p-3 shadow-lg backdrop-blur-sm transition-all duration-200",
        getStyles(),
        isVisible && !isExiting ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
        isExiting && "opacity-0 -translate-y-1"
      )}
    >
      {/* Ícone */}
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>
      
      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">
          {toast.title}
        </div>
        {toast.description && (
          <div className="text-xs mt-1 opacity-90">
            {toast.description}
          </div>
        )}
        
        {/* Ação */}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="text-xs font-medium underline mt-2 hover:no-underline"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      
      {/* Botão fechar */}
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 ml-2 opacity-70 hover:opacity-100 transition-opacity"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}

export interface InlineToastContainerProps {
  className?: string
}

export function InlineToastContainer({ className }: InlineToastContainerProps) {
  const [toasts, setToasts] = React.useState<ToastData[]>([])

  const addToast = React.useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts(prev => [...prev, { ...toast, id }])
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  // Expor funções globalmente para o contexto
  React.useEffect(() => {
    // @ts-expect-error - Global function for iframe communication
    window.__addInlineToast = addToast
  }, [addToast])

  if (toasts.length === 0) return null

  return (
    <div className={cn("relative", className)}>
      {toasts.map(toast => (
        <InlineToast
          key={toast.id}
          toast={toast}
          onDismiss={removeToast}
        />
      ))}
    </div>
  )
}

// Hook para usar toasts inline
export function useInlineToast() {
  const addToast = React.useCallback((toast: Omit<ToastData, 'id'>) => {
    // @ts-expect-error - Global function for iframe communication
    if (window.__addInlineToast) {
      // @ts-expect-error - Global function for iframe communication
      window.__addInlineToast(toast)
    }
  }, [])

  return { addToast }
}
