import { FieldErrors } from 'react-hook-form'

interface ValidationToastOptions {
  title?: string
  duration?: number
}

export function showValidationErrors(
  errors: FieldErrors, 
  options: ValidationToastOptions = {}
) {
  const { duration = 4000 } = options

  if (Object.keys(errors).length === 0) return

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

  const firstErrorField = Object.keys(errors)[0]
  const firstError = errors[firstErrorField]
  const fieldLabel = fieldLabels[firstErrorField] || firstErrorField
  
  let message = ''
  
  if (firstError?.message) {
    message = String(firstError.message)
  } else {
    message = `Por favor, preencha "${fieldLabel}"`
  }

  const errorCount = Object.keys(errors).length
  if (errorCount > 1) {
    message += ` e mais ${errorCount - 1} campo${errorCount > 2 ? 's' : ''}`
  }

  if (window.__addCalculatorErrorToast) {
    window.__addCalculatorErrorToast({
      title: options.title || "Ops! Alguns campos estão em branco",
      description: message,
      duration,
      showImage: true,
    })
  } else {
    if (window.__addInlineToast) {
      window.__addInlineToast({
        type: 'error',
        title: message,
        description: "Todos os campos obrigatórios devem ser preenchidos",
        duration,
        action: {
          label: "Ok",
          onClick: () => {
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
export function showCalculationSuccess(calculatorName: string) {
  if (window.__addInlineToast) {
    window.__addInlineToast({
      type: 'success',
      title: `✨ ${calculatorName} calculado com sucesso!`,
      description: "Você pode salvar este resultado ou fazer um novo cálculo",
      duration: 3000
    })
  }
}
export function showCalculationError(message?: string) {
  if (window.__addInlineToast) {
    window.__addInlineToast({
      type: 'error',
      title: message || "Erro ao realizar cálculo",
      description: "Tente novamente ou verifique os dados inseridos",
      duration: 4000
    })
  }
}
