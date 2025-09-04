'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calculator, Calendar, ChevronDown, ChevronRight, Home, Trash2, LogOut, User } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { useUser, useClerk } from '@clerk/nextjs'
import { PublicClerkProvider } from '@/components/auth/PublicClerkProvider'
import { SimpleLoginForm } from '@/components/auth/SimpleLoginForm'
import { usePublicAuth } from '@/hooks/usePublicAuth'
import { useCalculator } from '@/contexts/CalculatorContext'

interface SavedCalculation {
  id: string
  calculator_slug: string
  name?: string
  inputs: Record<string, any>
  outputs: Record<string, any>
  created_at: string
}

interface SavedCalculationsViewProps {
  onBack: () => void
  onSelectCalculation?: (calculation: SavedCalculation) => void
  onShowCalculatorHome?: () => void
}

function SavedCalculationsContent({ onBack, onSelectCalculation, onShowCalculatorHome }: SavedCalculationsViewProps) {
  const { user, isLoaded } = usePublicAuth()
  const { signOut, setActive } = useClerk()
  const { showHome, savedCalculations, loadingSavedCalculations, refreshSavedCalculations, deleteCalculation } = useCalculator()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showLogoutMenu, setShowLogoutMenu] = useState(false)

  const handleLogout = async () => {
    try {
      // Fazer logout limpando a sessão sem redirect
      await setActive({ session: null })
      setShowLogoutMenu(false)
      // Recarregar os cálculos para mostrar o formulário de login
      refreshSavedCalculations()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }
 
  useEffect(() => {
    if (!isLoaded) return
    
    if (user) {
      // Carregar cálculos salvos quando usuário logar
      const userEmail = user.emailAddresses?.[0]?.emailAddress
      if (userEmail) {
        refreshSavedCalculations(userEmail)
      }
    }
    // SEMPRE vai para Meus Cálculos, logado ou não
  }, [user, isLoaded])

  // Fechar menu de logout quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showLogoutMenu) {
        setShowLogoutMenu(false)
      }
    }

    if (showLogoutMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showLogoutMenu])

  const getCalculatorName = (slug: string) => {
    switch (slug) {
      case '13o-salario':
      case 'decimo-terceiro':
        return '13º Salário'
      case 'ferias':
        return 'Férias'

      case 'custo-funcionario':
        return 'Custo do Funcionário'
      default:
        return 'Cálculo'
    }
  }

  const getCalculatorIcon = (slug: string) => {
    switch (slug) {
      case '13o-salario':
      case 'decimo-terceiro':
        return '💰'
      case 'ferias':
        return '🏖️'

      case 'custo-funcionario':
        return '👥'
      default:
        return '📊'
    }
  }

  const getMainResult = (calc: SavedCalculation) => {
    const outputs = calc.outputs || {}
    const values = Object.values(outputs)
    
    // Tentar encontrar o resultado principal
    if (outputs['Valor Líquido Estimado']) return outputs['Valor Líquido Estimado']
    if (outputs['Total Líquido']) return outputs['Total Líquido']
    if (outputs['Valor Líquido']) return outputs['Valor Líquido']
    if (outputs['Custo Mensal Total']) return outputs['Custo Mensal Total'] // ADICIONADO
    if (outputs['Custo Total']) return outputs['Custo Total']
    if (outputs['Pró-labore Líquido']) return outputs['Pró-labore Líquido']
    
    // Se não achou, pegar o primeiro valor numérico
    const firstNumeric = values.find(v => typeof v === 'string' && v.includes('R$'))
    return firstNumeric || 'N/A'
  }

  const handleSelectCalculation = (calc: SavedCalculation) => {
    if (onSelectCalculation) {
      onSelectCalculation(calc)
    }
  }

  const handleDeleteCalculation = async (e: React.MouseEvent, calculationId: string) => {
    e.stopPropagation() // Previne o clique no card
    
    // Adicionar efeito "puf" com CSS
    const cardElement = e.currentTarget.closest('.calculation-card') as HTMLElement
    if (cardElement) {
      cardElement.classList.add('calculation-delete')
    }
    
    try {
      // Remover do estado rapidamente para os cards subirem
      setTimeout(() => {
        deleteCalculation(calculationId)
      }, 150) // Remove bem cedo, enquanto ainda está animando
      
    } catch (error) {
      console.error('Erro ao deletar cálculo:', error)
      // Reverter o efeito visual se houver erro
      if (cardElement) {
        cardElement.classList.remove('calculation-delete')
      }
    }
  }

  const handleLoginSuccess = () => {
    setShowLoginModal(false)
    // O usePublicAuth vai detectar automaticamente a mudança de user
  }

  const handleLoginCancel = () => {
    setShowLoginModal(false)
    onBack()
  }





  if (loadingSavedCalculations) {
    return (
      <div 
        className="flex items-center justify-center pt-8 animate-in fade-in-0 duration-300 overflow-hidden"
        style={{ backgroundColor: '#F5F5F5' }}
      >
        <div className="text-center animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-100">
          {/* Spinner Apple style */}
          <div className="relative w-8 h-8 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-gray-200"></div>
            <div className="absolute inset-0 rounded-full border-2 border-gray-400 border-t-transparent animate-spin"></div>
          </div>
          
          {/* Texto com fade */}
          <p className="text-base font-medium text-gray-600 animate-pulse">
            Carregando seus cálculos
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Aguarde um momento...
          </p>
        </div>
      </div>
    )
  }

  // Não renderizar modal aqui - vai ser renderizado como overlay depois

  return (
    <div 
      className="flex flex-col animate-in fade-in-0 slide-in-from-right-4 duration-500 relative overflow-hidden"
      style={{ backgroundColor: '#F5F5F5' }}
    >
      {/* Header centralizado */}
      <div className="flex-shrink-0 px-4 py-2 border-b border-gray-300 relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
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
        
        <div className="flex items-center justify-center">
          <h2 className="text-base font-medium text-gray-900 flex items-center gap-2">
            <Calculator className="h-4 w-4 text-purple-600" />
            Meus Cálculos
          </h2>
        </div>

        {/* Botão de logout minimalista */}
        {user && (
          <div className="absolute right-12 top-1/2 transform -translate-y-1/2 z-50">
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowLogoutMenu(!showLogoutMenu)
                }}
                className="h-6 w-6 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center group"
              >
                <User className="h-3.5 w-3.5 text-gray-500 group-hover:text-gray-700" />
              </button>

              {/* Menu dropdown - simples e direto */}
                            {showLogoutMenu && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-7 bg-white border border-gray-300 rounded-lg py-2 px-1 min-w-48 z-[999999]"
                  style={{
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
                    zIndex: 999999
                  }}
                >
                  <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100">
                    {user?.emailAddresses?.[0]?.emailAddress || 'Email não encontrado'}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="h-3 w-3" />
                    Sair da conta
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content com scroll */}
      <div className="flex-1 overflow-y-auto px-4 pb-12 pt-3">
        {savedCalculations.length === 0 ? (
          <div className="text-center py-8">
            {!user ? (
              // Estado de login - com animação própria
              <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
                <p className="text-sm text-gray-600 mb-6">
                  Faça login/cadastro para ver e salvar os seus cálculos
                </p>

                <div className="w-full max-w-sm mx-auto mb-6 animate-in fade-in-0 duration-300 delay-200">
                  <SimpleLoginForm
                    onSuccess={handleLoginSuccess}
                  />
                </div>

                <button
                  onClick={onBack}
                  className="text-sm text-gray-600 hover:text-gray-700 font-medium transition-colors"
                >
                  Voltar para calculadora
                </button>
              </div>
            ) : (
              // Estado sem cálculos - com animação própria
              <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-600">
                <p className="text-sm text-gray-600 mb-6 animate-in fade-in-0 duration-500 delay-300">
                  Nenhum cálculo salvo
                </p>

                <button
                  onClick={onBack}
                  className="text-sm text-gray-600 hover:text-gray-700 font-medium transition-colors animate-in fade-in-0 duration-500 delay-400"
                >
                  Fazer primeiro cálculo
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {savedCalculations.map((calc, index) => (
                <div
                  key={calc.id} 
                  className="calculation-card group relative bg-white hover:bg-gray-100 hover:border hover:border-gray-400 cursor-pointer transition-all duration-200 animate-in fade-in-0 slide-in-from-bottom-2 border border-transparent rounded-lg"
                  style={{ 
                    animationDelay: `${index * 50}ms`,
                    animationDuration: '400ms',
                    animationFillMode: 'both'
                  }}
                  onClick={() => handleSelectCalculation(calc)}
                >
                  <div className="px-4 py-3 flex items-center gap-3">
                    {/* Avatar/Icon */}
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg flex-shrink-0">
                      {getCalculatorIcon(calc.calculator_slug)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between mb-0.5">
                        <h3 className="font-medium text-gray-900 text-sm truncate">
                          {calc.name ? calc.name : getCalculatorName(calc.calculator_slug)}
                        </h3>
                        <span className="text-xs text-gray-500 font-normal ml-2 flex-shrink-0">
                          {new Date(calc.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-emerald-600 font-semibold truncate">
                          {getMainResult(calc)}
                        </p>
                        <div className="flex items-center">
                          {/* Botão de deletar que aparece no hover */}
                          <button
                            onClick={(e) => handleDeleteCalculation(e, calc.id)}
                            className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 rounded-full hover:bg-red-100 hover:scale-110"
                            title="Excluir cálculo"
                          >
                            <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            ))}
          </div>
        )}
      </div>


    </div>
  )
}

export function SavedCalculationsView(props: SavedCalculationsViewProps) {
  return (
    <PublicClerkProvider>
      <SavedCalculationsContent {...props} />
    </PublicClerkProvider>
  )
}