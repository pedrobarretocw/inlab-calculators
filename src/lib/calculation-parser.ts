// Responsabilidade única: Parse de dados salvos do banco
export interface SavedCalculation {
  id: string
  calculator_slug: string
  inputs: Record<string, any>
  outputs: Record<string, any>
  created_at: string
}

export class CalculationParser {
  // Parse universal de valores monetários brasileiros
  static parseValue(value: any, fieldName?: string): number {
    if (value === null || value === undefined) return 0
    if (typeof value === 'number') return isNaN(value) ? 0 : value
    
    if (typeof value === 'string') {
      if (value.includes('R$')) {
        let cleaned = value.replace(/R\$\s?/g, '').trim()
        
        const isNegative = cleaned.startsWith('-') || value.startsWith('-')
        if (isNegative) {
          cleaned = cleaned.replace(/^-\s*/, '')
        }
        
        if (cleaned.includes('.') && cleaned.includes(',')) {
          cleaned = cleaned.replace(/\./g, '').replace(',', '.')
        } else if (cleaned.includes(',') && !cleaned.includes('.')) {
          cleaned = cleaned.replace(',', '.')
        }
        
        let parsed = parseFloat(cleaned)
        if (isNegative) parsed = -parsed
        
        return isNaN(parsed) ? 0 : parsed
      }
      
      const parsed = parseFloat(value)
      return isNaN(parsed) ? 0 : parsed
    }
    
    return 0
  }

  // Parse específico para cada tipo de cálculo
  static parseFerias(calc: SavedCalculation) {
    const { inputs, outputs } = calc
    
    return {
      valorProporcional: this.parseValue(outputs['Valor Proporcional']),
      adicionalUmTerco: this.parseValue(outputs['Adicional 1/3']),
      valorLiquido: this.parseValue(outputs['Total Líquido']),
      valorBruto: this.parseValue(outputs['Valor Proporcional']),
      desconto: 0,
      diasFerias: inputs?.diasFerias || 30,
      mesesTrabalhados: inputs?.mesesTrabalhados || 12,
      observacao: ''
    }
  }

  static parseDecimoTerceiro(calc: SavedCalculation) {
    const { inputs, outputs } = calc
    
    return {
      valorProporcional: this.parseValue(outputs['Valor Proporcional']),
      primeiraParcela: this.parseValue(outputs['1ª Parcela (até 30/11)']),
      segundaParcela: this.parseValue(outputs['2ª Parcela (até 20/12)']),
      inss: Math.abs(this.parseValue(outputs['INSS estimado'] || outputs['INSS'])),
      valorLiquido: this.parseValue(
        outputs['Valor Líquido Estimado'] || 
        outputs['Total Líquido'] || 
        outputs['Valor Líquido']
      ),
      mesesTrabalhados: inputs?.mesesTrabalhados || 12,
      observacao: ''
    }
  }

  // Factory method - retorna dados baseado no tipo
  static parseByType(calc: SavedCalculation) {
    switch (calc.calculator_slug) {
      case 'ferias':
        return this.parseFerias(calc)
      case '13o-salario':
        return this.parseDecimoTerceiro(calc)
      default:
        return {}
    }
  }
}
