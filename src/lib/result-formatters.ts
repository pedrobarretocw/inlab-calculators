// Responsabilidade única: Formatação de resultados por tipo
import { formatCurrency } from './format'

export interface FormattedResult {
  label: string
  value: string
  highlight?: boolean
}

export interface CalculationData {
  [key: string]: any
}

export class ResultFormatter {
  static formatFerias(data: CalculationData): FormattedResult[] {
    return [
      {
        label: 'Valor Proporcional',
        value: formatCurrency(data.valorProporcional || 0),
        highlight: true
      },
      {
        label: 'Adicional 1/3',
        value: formatCurrency(data.adicionalUmTerco || 0)
      },
      {
        label: 'Total Líquido',
        value: formatCurrency(data.valorLiquido || 0),
        highlight: true
      }
    ]
  }

  static formatDecimoTerceiro(data: CalculationData): FormattedResult[] {
    return [
      {
        label: 'Valor Proporcional',
        value: formatCurrency(data.valorProporcional || 0),
        highlight: true
      },
      {
        label: '1ª Parcela (até 30/11)',
        value: formatCurrency(data.primeiraParcela || 0)
      },
      {
        label: '2ª Parcela (até 20/12)',
        value: formatCurrency(data.segundaParcela || 0)
      },
      {
        label: 'INSS estimado',
        value: `- ${formatCurrency(data.inss || 0)}`
      },
      {
        label: 'Valor Líquido Estimado',
        value: formatCurrency(data.valorLiquido || 0),
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

      default:
        return []
    }
  }
}
