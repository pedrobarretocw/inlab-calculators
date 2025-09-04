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
      // Detectar se é negativo (- no início ou "- R$")
      const isNegative = value.startsWith('-') || value.startsWith('- ')
      
      if (value.includes('R$')) {
        // Limpar tudo: "- ", "R$", etc.
        let cleaned = value.replace(/^-\s*/, '').replace(/R\$\s?/g, '').trim()
        
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
    
    // Debug para ver o que está chegando
    console.log('[CalculationParser] parseDecimoTerceiro - outputs:', outputs)
    console.log('[CalculationParser] INSS bruto:', outputs['INSS estimado'])
    console.log('[CalculationParser] INSS parseado:', this.parseValue(outputs['INSS estimado']))
    
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

  static parseCustoFuncionario(calc: SavedCalculation) {
    const { inputs, outputs } = calc
    
    // Debug para ver o que está chegando
    console.log('[CalculationParser] parseCustoFuncionario - outputs:', outputs)
    
    return {
      salarioBase: this.parseValue(outputs['Salário Base']),
      decimoTerceiro: this.parseValue(outputs['13º Salário (prop.)']),
      ferias: this.parseValue(outputs['Férias + 1/3 (prop.)']),
      fgts: this.parseValue(outputs['FGTS (8%)']),
      encargos: this.parseValue(outputs['Encargos Sociais']),
      beneficios: {
        total: this.parseValue(outputs['Benefícios']),
        valeRefeicao: inputs?.valeRefeicao || 0,
        valeTransporte: inputs?.valeTransporte || 0,
        planoSaude: inputs?.planoSaude || 0,
        outrosBeneficios: inputs?.outrosBeneficios || 0
      },
      custoMensal: this.parseValue(outputs['Custo Mensal Total']),
      custoAnual: this.parseValue(outputs['Custo Anual']),
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
      case 'custo-funcionario':
        return this.parseCustoFuncionario(calc)
      default:
        return {}
    }
  }
}
