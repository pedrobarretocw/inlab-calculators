// Responsabilidade única: Formatação de resultados por tipo
import { formatCurrency } from './format'

export interface FormattedResult {
  label: string
  value: string
  highlight?: boolean
}

export interface CalculationData {
  [key: string]: number | string | boolean | { [key: string]: number } | undefined
}

// Type guard helpers
function asNumber(value: number | string | boolean | { [key: string]: number } | undefined): number {
  return typeof value === 'number' ? value : 0
}

function asObject(value: number | string | boolean | { [key: string]: number } | undefined): { [key: string]: number } | undefined {
  return typeof value === 'object' && value !== null ? value : undefined
}

export class ResultFormatter {
  static formatFerias(data: CalculationData): FormattedResult[] {
    return [
      {
        label: 'Valor Proporcional',
        value: formatCurrency(asNumber(data.valorProporcional)),
        highlight: true
      },
      {
        label: 'Adicional 1/3',
        value: formatCurrency(asNumber(data.adicionalUmTerco))
      },
      {
        label: 'Total Líquido',
        value: formatCurrency(asNumber(data.valorLiquido)),
        highlight: true
      }
    ]
  }

  static formatDecimoTerceiro(data: CalculationData): FormattedResult[] {
    return [
      {
        label: 'Valor Proporcional',
        value: formatCurrency(asNumber(data.valorProporcional)),
        highlight: true
      },
      {
        label: '1ª Parcela (até 30/11)',
        value: formatCurrency(asNumber(data.primeiraParcela))
      },
      {
        label: '2ª Parcela (até 20/12)',
        value: formatCurrency(asNumber(data.segundaParcela))
      },
      {
        label: 'INSS estimado',
        value: `- ${formatCurrency(asNumber(data.inss))}`
      },
      {
        label: 'Valor Líquido Estimado',
        value: formatCurrency(asNumber(data.valorLiquido)),
        highlight: true
      }
    ]
  }

  static formatCustoFuncionario(data: CalculationData): FormattedResult[] {
    return [
      {
        label: 'Salário Base',
        value: formatCurrency(asNumber(data.salarioBase))
      },
      {
        label: '13º Salário (prop.)',
        value: formatCurrency(asNumber(data.decimoTerceiro))
      },
      {
        label: 'Férias + 1/3 (prop.)',
        value: formatCurrency(asNumber(data.ferias))
      },
      {
        label: 'FGTS (8%)',
        value: formatCurrency(asNumber(data.fgts))
      },
      {
        label: 'Encargos Sociais',
        value: formatCurrency(asNumber(data.encargos))
      },
      {
        label: 'Benefícios',
        value: formatCurrency(asObject(data.beneficios)?.total || 0)
      },
      {
        label: 'Custo Mensal Total',
        value: formatCurrency(asNumber(data.custoMensal)),
        highlight: true
      },
      {
        label: 'Custo Anual',
        value: formatCurrency(asNumber(data.custoAnual)),
        highlight: true
      }
    ]
  }




  static formatByType(type: string, data: CalculationData): FormattedResult[] {
    
    switch (type) {
      case 'ferias':
        return this.formatFerias(data)
      case '13o-salario':
        return this.formatDecimoTerceiro(data)
      case 'custo-funcionario':
        const result = this.formatCustoFuncionario(data)
        return result
      default:
        return []
    }
  }
}
