'use client'

import { History } from 'lucide-react'

interface ViewSavedCalculationsButtonProps {
  onShowSavedCalculations: () => void
}

export function ViewSavedCalculationsButton({ onShowSavedCalculations }: ViewSavedCalculationsButtonProps) {
  return (
    <button
      onClick={onShowSavedCalculations}
      className="inline-flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600 bg-gray-50/80 hover:bg-gray-100/80 hover:text-gray-700 rounded-full border border-gray-200/60 transition-all duration-200 hover:shadow-sm"
    >
      <History className="h-3 w-3" />
      <span>Ver cálculos salvos</span>
    </button>
  )
}
