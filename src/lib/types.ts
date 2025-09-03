// Types for calculation results
export interface FeriasResult {
  valorProporcional: number
  adicionalUmTerco: number
  valorBruto: number
  desconto: number
  valorLiquido: number
  diasFerias: number
  mesesTrabalhados: number
  observacao: string
}



export interface CustoFuncionarioResult {
  salarioBase: number
  decimoTerceiro: number
  ferias: number
  adicionalFerias: number
  fgts: number
  encargos: number
  beneficios: {
    valeRefeicao: number
    valeTransporte: number
    planoSaude: number
    outrosBeneficios: number
    total: number
  }
  custoMensal: number
  custoAnual: number
  observacao: string
}

export interface DecimoTerceiroResult {
  valorProporcional: number
  primeiraParcela: number
  segundaParcela: number
  inss: number
  valorLiquido: number
  mesesTrabalhados: number
  observacao: string
}

export type CalculationResult = FeriasResult | CustoFuncionarioResult | DecimoTerceiroResult
