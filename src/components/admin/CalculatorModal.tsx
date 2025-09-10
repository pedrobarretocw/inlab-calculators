'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Eye, Copy } from 'lucide-react'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'

// Importar calculadoras dinamicamente
const Ferias = dynamic(() => import('@/components/calculators/Ferias').then(mod => ({ default: mod.Ferias })), { ssr: false })

const CustoFuncionario = dynamic(() => import('@/components/calculators/CustoFuncionario').then(mod => ({ default: mod.CustoFuncionario })), { ssr: false })
const DecimoTerceiro = dynamic(() => import('@/components/calculators/DecimoTerceiro').then(mod => ({ default: mod.DecimoTerceiro })), { ssr: false })
const EmbedAll = dynamic(() => import('@/components/embeds/EmbedAll').then(mod => ({ default: mod.EmbedAll })), { ssr: false })

interface CalculatorModalProps {
  calculatorSlug: string
  calculatorName: string
  embedType: 'single' | 'ab' | 'carousel'
}

export function CalculatorModal({ calculatorSlug, calculatorName, embedType }: CalculatorModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const copyEmbedCode = async () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
    let embedCode = ''
    let successMessage = ''
    
    switch (embedType) {
      case 'single':
        embedCode = `<section id="inlab-calculadora-${calculatorSlug}">
  <iframe src="${baseUrl}/calculadoras/embed/all?calculator=${calculatorSlug}" width="500" height="500" frameborder="0" style="border: none; border-radius: 8px;"></iframe>
</section>`
        successMessage = `${calculatorName} embed code copied!`
        break
      case 'ab':
        embedCode = `<section id="inlab-calculadora-ab-test">
  <iframe src="${baseUrl}/calculadoras/embed/ab" width="500" height="500" frameborder="0" style="border: none; border-radius: 8px;"></iframe>
</section>`
        successMessage = 'A/B Test embed code copied!'
        break
      case 'carousel':
        embedCode = `<section id="inlab-calculadora-carousel">
  <iframe src="${baseUrl}/calculadoras/embed/all" width="500" height="500" frameborder="0" style="border: none; border-radius: 8px;"></iframe>
</section>`
        successMessage = 'Carousel embed code copied!'
        break
    }
    
    try {
      await navigator.clipboard.writeText(embedCode)
      toast.success(successMessage)
    } catch (error) {
      toast.error('Failed to copy embed code')
    }
  }
  
  const renderCalculatorComponent = () => {
    switch (embedType) {
      case 'single':
        switch (calculatorSlug) {
          case 'ferias':
            return <EmbedAll initialCalculator="ferias" />
          case 'custo-funcionario':
            return <EmbedAll initialCalculator="custo-funcionario" />
          case '13o-salario':
            return <EmbedAll initialCalculator="13o-salario" />
          default:
            return <div className="p-8 text-center text-muted-foreground">Calculator not found</div>
        }
      case 'ab':
        // Para A/B, vamos mostrar uma calculadora aleatória
        const randomCalculators = ['ferias', 'custo-funcionario', '13o-salario']
        const randomIndex = Math.floor(Math.random() * randomCalculators.length)
        return <EmbedAll initialCalculator={randomCalculators[randomIndex]} />
      case 'carousel':
        return <EmbedAll />
      default:
        return <div className="p-8 text-center text-muted-foreground">Unknown embed type</div>
    }
  }
  
  const getButtonText = () => {
    return 'Embed'
  }
  
  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <Eye className="h-4 w-4" />
        Preview
      </Button>
      
      <Button 
        variant="default" 
        size="sm"
        onClick={copyEmbedCode}
        className="flex items-center gap-2"
      >
        <Copy className="h-4 w-4" />
        {getButtonText()}
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[600px] max-h-[700px]">
          <DialogHeader>
            <DialogTitle>
              {calculatorName} - Preview
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-4 max-h-[500px] overflow-y-auto">
            {renderCalculatorComponent()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}