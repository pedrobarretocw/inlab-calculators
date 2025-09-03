import { 
  FeriasInput, 
 
  CustoFuncionarioInput, 
  DecimoTerceiroInput 
} from './schemas'

// Calculadora de Férias
export function calcularFerias(input: FeriasInput) {
  const { salarioMensal, mesesTrabalhados, diasFerias, descontarAdiantamento, valorAdiantamento } = input
  
  // Valor proporcional das férias (1/12 por mês)
  const valorProporcional = (salarioMensal / 12) * mesesTrabalhados
  
  // Adicional de 1/3 constitucional
  const adicionalUmTerco = valorProporcional / 3
  
  // Valor bruto das férias
  const valorBruto = valorProporcional + adicionalUmTerco
  
  // Desconto de adiantamento (se aplicável)
  const desconto = descontarAdiantamento && valorAdiantamento ? valorAdiantamento : 0
  
  // Valor líquido
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




// Calculadora de Custo do Funcionário
export function calcularCustoFuncionario(input: CustoFuncionarioInput) {
  const { 
    salarioBase, 
    valeRefeicao = 0, 
    valeTransporte = 0, 
    planoSaude = 0, 
    outrosBeneficios = 0 
  } = input
  
  // 13º salário proporcional (1/12 por mês)
  const decimoTerceiro = salarioBase / 12
  
  // Férias + 1/3 proporcional (1/12 por mês)
  const ferias = salarioBase / 12
  const adicionalFerias = ferias / 3
  
  // FGTS (8%)
  const fgts = salarioBase * 0.08
  
  // Encargos sociais aproximados (INSS patronal + outros)
  const encargos = salarioBase * 0.27 // 27% aproximado
  
  // Benefícios
  const totalBeneficios = valeRefeicao + valeTransporte + planoSaude + outrosBeneficios
  
  // Custo total mensal
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

// Calculadora de 13º Salário
export function calcularDecimoTerceiro(input: DecimoTerceiroInput) {
  const { salarioMensal, mesesTrabalhados } = input
  
  // Valor proporcional (1/12 por mês)
  const valorProporcional = (salarioMensal / 12) * mesesTrabalhados
  
  // 1ª parcela (normalmente paga até 30/11) - metade
  const primeiraParcela = valorProporcional / 2
  
  // 2ª parcela (até 20/12) - restante com desconto de IR e INSS se aplicável
  const segundaParcela = valorProporcional - primeiraParcela
  
  // INSS sobre o valor total (aproximação)
  const inss = Math.min(valorProporcional * 0.11, 760.78 * (mesesTrabalhados / 12))
  
  // Valor líquido estimado
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
