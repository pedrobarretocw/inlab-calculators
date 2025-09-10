import { 
  FeriasInput, 
  CustoFuncionarioInput, 
  DecimoTerceiroInput 
} from './schemas'

export function calcularFerias(input: FeriasInput) {
  const { salarioMensal, mesesTrabalhados, diasFerias, descontarAdiantamento, valorAdiantamento } = input
  
  const valorProporcional = (salarioMensal / 12) * mesesTrabalhados
  
  const adicionalUmTerco = valorProporcional / 3
  
  const valorBruto = valorProporcional + adicionalUmTerco
  
  const desconto = descontarAdiantamento && valorAdiantamento ? valorAdiantamento : 0
  
  const valorLiquido = valorBruto - desconto
  
  return {
    valorProporcional,
    adicionalUmTerco,
    valorBruto,
    desconto,
    valorLiquido,
    diasFerias,
    mesesTrabalhados,
    observacao: "Estes cálculos são estimativas. Consulte sempre um contador ou especialista em RH."
  }
}

export function calcularCustoFuncionario(input: CustoFuncionarioInput) {
  const { 
    salarioBase, 
    valeRefeicao = 0, 
    valeTransporte = 0, 
    planoSaude = 0, 
    outrosBeneficios = 0 
  } = input
  
  const decimoTerceiro = salarioBase / 12
  
  const ferias = salarioBase / 12
  const adicionalFerias = ferias / 3
  
  const fgts = salarioBase * 0.08
  
  const encargos = salarioBase * 0.27 // 27% aproximado
  
  const totalBeneficios = valeRefeicao + valeTransporte + planoSaude + outrosBeneficios
  
  const custoMensal = salarioBase + decimoTerceiro + ferias + adicionalFerias + fgts + encargos + totalBeneficios
  
  return {
    salarioBase,
    decimoTerceiro,
    ferias,
    adicionalFerias,
    fgts,
    encargos,
    beneficios: {
      valeRefeicao,
      valeTransporte,
      planoSaude,
      outrosBeneficios,
      total: totalBeneficios
    },
    custoMensal,
    custoAnual: custoMensal * 12,
    observacao: "Estes cálculos são estimativas. Consulte sempre um contador."
  }
}

export function calcularDecimoTerceiro(input: DecimoTerceiroInput) {
  const { salarioMensal, mesesTrabalhados } = input
  
  const valorProporcional = (salarioMensal / 12) * mesesTrabalhados
  
  const primeiraParcela = valorProporcional / 2
  
  const segundaParcela = valorProporcional - primeiraParcela
  
  const inss = Math.min(valorProporcional * 0.11, 760.78 * (mesesTrabalhados / 12))
  
  const valorLiquido = valorProporcional - inss
  
  return {
    valorProporcional,
    primeiraParcela,
    segundaParcela,
    inss,
    valorLiquido,
    mesesTrabalhados,
    observacao: "Estes cálculos são estimativas. Consulte sempre um contador para cálculos precisos de IR e INSS."
  }
}
