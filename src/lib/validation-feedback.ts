import { FieldErrors } from 'react-hook-form'

interface ValidationToastOptions {
  title?: string
  duration?: number
}

/**
 * Exibe toasts elegantes inline para erros de validação de formulários
 * Converte erros do react-hook-form em mensagens amigáveis
 */
export function showValidationErrors(
  errors: FieldErrors, 
  options: ValidationToastOptions = {}
) {
  const { duration = 4000 } = options

  if (Object.keys(errors).length === 0) return

  // Mapeamento de campos para nomes amigáveis
  const fieldLabels: Record<string, string> = {
    salarioBase: 'Salário Base',
    salarioMensal: 'Salário Mensal',
    salario: 'Salário',
    mesesTrabalhados: 'Meses Trabalhados',
    diasFerias: 'Dias de Férias',
    faturamentoMensal: 'Faturamento Mensal',
    percentualDesejado: 'Percentual Desejado',
    valeRefeicao: 'Vale Refeição',
    valeTransporte: 'Vale Transporte',
    planoSaude: 'Plano de Saúde',
    outrosBeneficios: 'Outros Benefícios'
  }

  // Pega o primeiro erro para exibir
  const firstErrorField = Object.keys(errors)[0]
  const firstError = errors[firstErrorField]
  const fieldLabel = fieldLabels[firstErrorField] || firstErrorField
  
  let message = ''
  
  if (firstError?.message) {
    message = String(firstError.message)
  } else {
    // Mensagem padrão baseada no tipo de campo
    message = `Por favor, preencha "${fieldLabel}"`
  }

  // Se há múltiplos erros, menciona isso
  const errorCount = Object.keys(errors).length
  if (errorCount > 1) {
    message += ` e mais ${errorCount - 1} campo${errorCount > 2 ? 's' : ''}`
  }

  // Toast de erro da calculadora com imagem
  // @ts-expect-error - Global function for iframe communication
  if (window.__addCalculatorErrorToast) {
    // @ts-expect-error - Global function for iframe communication
    window.__addCalculatorErrorToast({
      title: options.title || "Ops! Alguns campos estão em branco",
      description: message,
      duration,
      showImage: true,
    })
  } else {
    // Fallback para toast inline normal
    // @ts-expect-error - Global function for iframe communication
    if (window.__addInlineToast) {
      // @ts-expect-error - Global function for iframe communication
      window.__addInlineToast({
        type: 'error',
        title: message,
        description: "Todos os campos obrigatórios devem ser preenchidos",
        duration,
        action: {
          label: "Ok",
          onClick: () => {
            // Foca no primeiro campo com erro
            const firstInput = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement
            if (firstInput) {
              firstInput.focus()
              firstInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
          }
        }
      })
    }
  }
}

/**
 * Mostra toast de sucesso para cálculo realizado
 */
export function showCalculationSuccess(calculatorName: string) {
  // @ts-expect-error - Global function for iframe communication
  if (window.__addInlineToast) {
    // @ts-expect-error - Global function for iframe communication
    window.__addInlineToast({
      type: 'success',
      title: `✨ ${calculatorName} calculado com sucesso!`,
      description: "Você pode salvar este resultado ou fazer um novo cálculo",
      duration: 3000
    })
  }
}

/**
 * Mostra toast de erro genérico
 */
export function showCalculationError(message?: string) {
  // @ts-expect-error - Global function for iframe communication
  if (window.__addInlineToast) {
    // @ts-expect-error - Global function for iframe communication
    window.__addInlineToast({
      type: 'error',
      title: message || "Erro ao realizar cálculo",
      description: "Tente novamente ou verifique os dados inseridos",
      duration: 4000
    })
  }
}
