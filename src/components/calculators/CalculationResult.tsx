'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RotateCcw, Save, ArrowLeft, Home, History } from 'lucide-react'
import { EmailCaptureModal } from '@/components/ui/email-capture-modal'
import { useCalculator } from '@/contexts/CalculatorContext'
 
// import { addEmailToActiveCampaign } from '@/lib/activecampaign' // Movido para API route


interface CalculationResultProps {
  title: string
  results: Array<{
    label: string
    value: string
    highlight?: boolean
  }>
  onReset: () => void
  isVisible: boolean
  calculatorType?: string
  calculationData?: Record<string, number | string | boolean>
  onBackToCalculator?: () => void
  isFromSavedCalculation?: boolean
  savedCalculationType?: string // Tipo real do cálculo salvo (se diferente do atual)
}

// Função para mapear tipos de cálculo para nomes amigáveis
const getCalculationTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    '13o-salario': '13º Salário',
    'ferias': 'Férias',

    'custo-funcionario': 'Custo do Funcionário'
  }
  return typeMap[type] || type
}

// Função para obter ícone do tipo de cálculo
const getCalculationTypeIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    '13o-salario': '💰',
    'ferias': '🏖️',

    'custo-funcionario': '👥'
  }
  return iconMap[type] || '📋'
}

// Componente interno que usa os hooks do Clerk
function CalculationResultContent({ 
  title, 
  results, 
  onReset, 
  isVisible, 
  calculatorType, 
  calculationData,
  onBackToCalculator,
  isFromSavedCalculation = false,
  savedCalculationType
}: CalculationResultProps) {
  
  const { showHome, addSavedCalculation } = useCalculator()
  
  const [showSaveLeadModal, setShowSaveLeadModal] = useState(false)
  
  const [calculationName, setCalculationName] = useState('')
  const [showNameModal, setShowNameModal] = useState(false)
  

  const saveCalculation = async (currentEmail: string) => {
    // Criar objeto do cálculo salvo
    const newCalculation = {
      id: crypto.randomUUID(),
      calculator_slug: calculatorType || 'unknown',
      name: calculationName.trim() || undefined,
      inputs: calculationData || {},
      outputs: results.reduce((acc, result) => ({
        ...acc,
        [result.label]: result.value
      }), {}),
      created_at: new Date().toISOString()
    }

    // Adicionar imediatamente no contexto (usuário vê na hora)
    addSavedCalculation(newCalculation)
    
    // Pequeno delay para dar tempo do contexto atualizar
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Fechar modal e permanecer na calculadora
    setCalculationName('')

    // Extrair nome do email para ActiveCampaign
    const emailParts = currentEmail.split('@')
    const firstName = emailParts[0]?.split('.')[0] || ''
    
    // Salvar no banco em background (assíncrono)
    const payload = {
      email: currentEmail.trim(),
      calculatorSlug: calculatorType || 'unknown',
      name: calculationName.trim() || null,
      inputs: calculationData || {},
      outputs: results.reduce((acc, result) => ({
        ...acc,
        [result.label]: result.value
      }), {}),
      sessionId: crypto.randomUUID()
    }

    try {
      // Salvar no banco
      fetch('/calculadoras/api/save-calculation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then(response => {
        if (!response.ok) {
          console.error('Erro ao salvar no banco:', response.status)
        }
      }).catch(error => {
        console.error('Erro de rede ao salvar no banco:', error)
      })

      // Adicionar ao ActiveCampaign em background via API
      fetch('/api/add-to-activecampaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentEmail.trim(),
          firstName: firstName,
          lastName: undefined,
          phone: undefined
        }),
      }).then(async response => {
        const result = await response.json()
        if (result.success) {
          // Email adicionado com sucesso
        } else {
          // Falha ao adicionar email
        }
      }).catch(() => {
        // erro silencioso
      })
    } catch {
      // erro silencioso
    }
  }

  // Não precisamos mais detectar autenticação automática
  // O redirecionamento é feito no hook após verificação do código

  // Funções definidas antes dos retornos condicionais
  const handleSaveClick = async () => {
    setShowSaveLeadModal(true)
  }

  const handleSaveWithName = async () => {
    const userEmail = (typeof window !== 'undefined' ? localStorage.getItem('leadEmail') : null) || 'lead@local'
    await saveCalculation(userEmail)
    setShowNameModal(false)
    setCalculationName('')
  }

  const handleResetClick = async () => {
    onReset()
  }

  // Email capture handled by EmailCaptureModal

  if (!isVisible) return null

  // Modal de nome para usuários logados
  if (showNameModal) {
    return (
      <div className="absolute inset-0 z-10 rounded-lg overflow-hidden">
        <Card 
          className="h-full border border-gray-200/60 shadow-none backdrop-blur-xl"
          style={{ 
            backgroundColor: '#F5F5F5',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 8px 16px -4px rgba(0, 0, 0, 0.1)'
          }}
        >
          <CardContent className="p-6 h-full flex flex-col justify-center relative">
            <button
              onClick={() => setShowNameModal(false)}
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-gray-100/80 hover:bg-gray-200/80 backdrop-blur-sm transition-all duration-200 flex items-center justify-center group"
            >
              <ArrowLeft className="h-4 w-4 text-gray-600 group-hover:text-gray-800" />
            </button>

            <div className="flex flex-col items-center space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1 text-center">
                  Salvar Cálculo
                </h2>
                <p className="text-gray-600 text-xs leading-relaxed px-2 text-center">
                  Digite um nome para identificar este cálculo (opcional)
                </p>
              </div>

              <div className="w-full space-y-3">
                <div className="text-left">
                  <Label htmlFor="name-input" className="text-xs font-medium text-gray-700">
                    Nome do Cálculo (opcional)
                  </Label>
                  <Input
                    id="name-input"
                    type="text"
                    value={calculationName}
                    onChange={(e) => setCalculationName(e.target.value)}
                    placeholder="Férias de Out 25"
                    className="mt-1 h-10 text-center bg-white border-gray-200 focus:border-blue-300 focus:ring-blue-200 transition-all text-sm"
                    maxLength={40}
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={handleSaveWithName}
                    className="w-full h-10 bg-[#BAFF1B] text-black font-semibold hover:bg-[#A8E616] transition-colors flex items-center gap-2 text-sm"
                  >
                    <Save className="h-3 w-3" />
                    Salvar Cálculo
                  </Button>

                  <button
                    onClick={() => {
                      setShowNameModal(false)
                      setCalculationName('') // Limpar o campo ao cancelar
                    }}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors w-full"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }



  // Email capture for Save (use the "Seja avisado quando lançar" modal)
  if (showSaveLeadModal) {
    return (
      <EmailCaptureModal
        open={true}
        onClose={() => setShowSaveLeadModal(false)}
        onConfirm={async (leadEmail) => {
          await fetch('/api/add-to-activecampaign', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: leadEmail })
          })
          await saveCalculation(leadEmail)
        }}
        title="Seja avisado quando lançar"
        descriptionRich={(
          <>
            <p>Estamos finalizando a área de “Meus Cálculos”.</p>
            <p>
              Deixe seu email e enviaremos também <strong>materiais práticos e exclusivos</strong> sobre empreendedorismo.
            </p>
          </>
        )}
        confirmLabel="Quero ser avisado"
        cancelLabel="Não quero"
        Icon={History}
        onSuccessAnother={() => {
          setShowSaveLeadModal(false)
        }}
      />
    )
  }

  // Removido: modal promocional de "Meus Cálculos"

  // Tela de resultados principal - Otimizada para 500px
  return (
    <div className="absolute inset-0 z-10 rounded-lg overflow-hidden">
      <Card 
        className="h-full border border-gray-200/60 shadow-none backdrop-blur-xl"
        style={{ 
          backgroundColor: '#F5F5F5',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 8px 16px -4px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className={`flex-shrink-0 px-4 border-b border-gray-200/60 relative ${
          calculatorType === 'custo-funcionario' || savedCalculationType === 'custo-funcionario'
            ? 'py-1.5'
            : 'py-2'
        }`}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (onBackToCalculator) {
                onBackToCalculator()
              } else if (onReset) {
                // Fallback: se não houver callback dedicado, apenas resetar
                onReset()
              }
            }}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              showHome()
            }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Home className="h-4 w-4 text-gray-600" />
          </Button>
          
          <h2 className={`font-semibold text-gray-900 flex items-center justify-center gap-2 ${
            calculatorType === 'custo-funcionario' || savedCalculationType === 'custo-funcionario'
              ? 'text-base'
              : 'text-lg'
          }`}>
            <span className={
              calculatorType === 'custo-funcionario' || savedCalculationType === 'custo-funcionario'
                ? 'text-lg'
                : 'text-xl'
            }>
              {isFromSavedCalculation && savedCalculationType 
                ? getCalculationTypeIcon(savedCalculationType)
                : '📊'
              }
            </span>
            {isFromSavedCalculation && savedCalculationType 
              ? getCalculationTypeName(savedCalculationType)
              : title
            }
          </h2>
        </div>

        <CardContent className="p-2 flex-1 flex flex-col justify-between h-full">
          
          <div className={`${calculatorType === 'custo-funcionario' || savedCalculationType === 'custo-funcionario' ? 'space-y-0.5' : 'space-y-1'} flex-1 overflow-y-auto`}>
            {results.map((result, index) => (
              <div 
                key={index} 
                className={`flex justify-between items-center rounded-lg backdrop-blur-sm transition-all border ${
                  result.highlight 
                    ? 'bg-gradient-to-r from-green-50/80 to-emerald-50/80 border-green-200/60 shadow-sm' 
                    : 'bg-white border-gray-200/50'
                } ${
                  calculatorType === 'custo-funcionario' || savedCalculationType === 'custo-funcionario' 
                    ? 'p-1.5' 
                    : 'p-2'
                }`}
              >
                <span className={`font-medium ${
                  result.highlight ? 'text-green-800' : 'text-gray-700'
                } ${
                  calculatorType === 'custo-funcionario' || savedCalculationType === 'custo-funcionario'
                    ? 'text-xs'
                    : 'text-sm'
                }`}>
                  {result.label}
                </span>
                <span className={`font-semibold ${
                  result.highlight 
                    ? 'text-green-600' 
                    : 'text-gray-900'
                } ${
                  result.highlight
                    ? (calculatorType === 'custo-funcionario' || savedCalculationType === 'custo-funcionario' ? 'text-sm' : 'text-base')
                    : (calculatorType === 'custo-funcionario' || savedCalculationType === 'custo-funcionario' ? 'text-xs' : 'text-sm')
                }`}>
                  {result.value}
                </span>
              </div>
            ))}
            
            <p className={`text-gray-500 text-center ${
              calculatorType === 'custo-funcionario' || savedCalculationType === 'custo-funcionario'
                ? 'text-[10px] pt-2'
                : 'text-xs pt-4'
            }`}>
              Lembre-se: estes valores são estimativas para te orientar
            </p>
          </div>
          
          <div className={`flex-shrink-0 ${
            calculatorType === 'custo-funcionario' || savedCalculationType === 'custo-funcionario'
              ? 'pt-1 space-y-1'
              : 'pt-2 space-y-1.5'
          }`}>
            {!isFromSavedCalculation && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={handleSaveClick}
                    className="h-10 bg-[#BAFF1B] text-black font-semibold hover:bg-[#A8E616] transition-all flex items-center gap-2 shadow-sm text-sm"
                  >
                    <Save className="h-3 w-3" />
                    Salvar
                  </Button>
                  
                  <Button 
                    onClick={handleResetClick}
                    variant="outline"
                    className="h-10 border-gray-200 bg-white/50 backdrop-blur-sm hover:bg-gray-50/80 hover:border-gray-300 transition-all flex items-center gap-2 text-sm"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Refazer
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente principal que provê o contexto do Clerk
export function CalculationResult(props: CalculationResultProps) {
  return <CalculationResultContent {...props} />
}
