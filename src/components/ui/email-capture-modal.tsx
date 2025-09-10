'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

interface EmailCaptureModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (email: string) => Promise<void> | void
  title?: string
  description?: string
  descriptionRich?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  Icon?: React.ComponentType<{ className?: string }>
  onSuccessAnother?: () => void
  successTitle?: string
  successMessage?: string
  successPrimaryLabel?: string
}

export function EmailCaptureModal({
  open,
  onClose,
  onConfirm,
  title = 'Seja avisado quando lançar',
  description = 'Estamos finalizando esta funcionalidade. Quer ser avisado quando estiver pronta? Deixe seu email e enviaremos também materiais práticos e exclusivos sobre empreendedorismo.',
  descriptionRich,
  confirmLabel = 'Quero ser avisado',
  cancelLabel = 'Não quero',
  Icon,
  onSuccessAnother,
  successTitle,
  successMessage,
  successPrimaryLabel,
}: EmailCaptureModalProps) {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const isValidEmail = (val: string) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(val)

  if (!open) return null

  if (success) {
    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center px-4">
        {/* Background inset to avoid covering animated border on the sides */}
        <div className="absolute inset-1 rounded-xl bg-[#F5F5F5] animate-in fade-in-0 duration-200" />
        <div className="relative z-10 w-full max-w-[440px] text-center px-6 animate-in fade-in-0 zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{successTitle || 'Tudo certo!'}</h3>
          <p className="text-sm text-gray-600 mt-1">{successMessage || 'Vamos te avisar quando estiver no ar.'}</p>
          <div className="mt-4">
            <Button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  // limpar email enquanto permanece na tela
                }
                if (typeof onSuccessAnother === 'function') {
                  onSuccessAnother()
                } else {
                  onClose()
                }
                setEmail('')
                setSuccess(false)
              }}
              className="h-10 bg-[#BAFF1B] text-black font-semibold hover:bg-[#A8E616] text-sm"
            >
              {successPrimaryLabel || 'Fazer outro cálculo'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 z-20 rounded-lg overflow-hidden flex items-center justify-center px-4">
      {/* Background overlay com margem para não cobrir a borda animada */}
      <div className="absolute inset-1 rounded-xl bg-[#F5F5F5] animate-in fade-in-0 duration-200" />
      <div className="relative z-10 w-full max-w-[440px] text-center px-6 animate-in fade-in-0 zoom-in-95 duration-300">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
          {Icon ? <Icon className="h-8 w-8 text-white" /> : null}
        </div>

        <div className="mt-5">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">{title}</h2>
          {descriptionRich ? (
            <div className="text-gray-600 text-sm leading-relaxed pt-2 space-y-2">
              {descriptionRich}
            </div>
          ) : (
            <p className="text-gray-600 text-sm leading-relaxed pt-2">{description}</p>
          )}
        </div>

        <div className="space-y-3 mt-5">
          <div className="text-left">
            <Label htmlFor="lead-email" className="text-xs font-medium text-gray-700">Email</Label>
            <Input
              id="lead-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (error) setError(null)
              }}
              placeholder="seu@email.com"
              className="mt-1 h-10 text-center bg-white border-gray-200 focus:border-blue-300 focus:ring-blue-200 transition-all text-sm"
            />
            {error && (
              <p className="mt-1 text-xs text-red-600">{error}</p>
            )}
          </div>

          <div className="space-y-2">
            <Button
              onClick={async () => {
                const trimmed = email.trim()
                if (!trimmed || !isValidEmail(trimmed)) {
                  setError('Digite um email válido')
                  return
                }
                setSubmitting(true)
                try {
                  // Mostra o sucesso imediatamente para evitar lag na transição
                  setSuccess(true)
                  setSubmitting(false)
                  await onConfirm(trimmed)
                } catch (e) {
                  setSubmitting(false)
                }
              }}
              disabled={submitting}
              className="w-full h-10 bg-[#BAFF1B] text-black font-semibold hover:bg-[#A8E616] transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {confirmLabel}
            </Button>

            <button onClick={onClose} className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors opacity-70 w-full">
              {cancelLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
