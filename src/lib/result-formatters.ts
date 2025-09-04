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

  static formatCustoFuncionario(data: CalculationData): FormattedResult[] {
    return [
      {
        label: 'Salário Base',
        value: formatCurrency(data.salarioBase || 0)
      },
      {
        label: '13º Salário (prop.)',
        value: formatCurrency(data.decimoTerceiro || 0)
      },
      {
        label: 'Férias + 1/3 (prop.)',
        value: formatCurrency((data.ferias || 0))
      },
      {
        label: 'FGTS (8%)',
        value: formatCurrency(data.fgts || 0)
      },
      {
        label: 'Encargos Sociais',
        value: formatCurrency(data.encargos || 0)
      },
      {
        label: 'Benefícios',
        value: formatCurrency(data.beneficios?.total || 0)
      },
      {
        label: 'Custo Mensal Total',
        value: formatCurrency(data.custoMensal || 0),
        highlight: true
      },
      {
        label: 'Custo Anual',
        value: formatCurrency(data.custoAnual || 0),
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
