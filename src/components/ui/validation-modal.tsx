'use client'

import * as React from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface ValidationModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  showImage?: boolean
}

export function ValidationModal({ isOpen, onClose, title, message, showImage = true }: ValidationModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-white rounded-lg shadow-xl border border-red-200 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-red-100 bg-red-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-red-800">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-100 transition-colors"
          >
            <X className="h-4 w-4 text-red-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-gray-700 mb-4 leading-relaxed">
            {message}
          </p>

          {/* Image placeholder */}
          {showImage && (
            <div className="w-full h-32 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border border-red-100 flex items-center justify-center mb-4">
              <div className="text-center text-red-400">
                <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
                <p className="text-xs font-medium">Verifique os campos obrigatórios</p>
              </div>
            </div>
          )}

          <Button 
            onClick={onClose}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            Entendi
          </Button>
        </div>
      </div>
    </div>
  )
}
