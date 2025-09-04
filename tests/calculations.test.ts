import { describe, it, expect } from 'vitest'
import { 
  calcularFerias, 
  calcularCustoFuncionario, 
  calcularDecimoTerceiro 
} from '../src/lib/calculations'

describe('Calculadora de Férias', () => {
  it('deve calcular férias corretamente para 12 meses', () => {
    const input = {
      salarioMensal: 3000,
      mesesTrabalhados: 12,
      diasFerias: 30,
      descontarAdiantamento: false,
      valorAdiantamento: 0,
    }
    
    const result = calcularFerias(input)
    
    expect(result.valorProporcional).toBe(3000) // 3000 * 12/12
    expect(result.adicionalUmTerco).toBe(1000) // 3000/3
    expect(result.valorBruto).toBe(4000) // 3000 + 1000
    expect(result.valorLiquido).toBe(4000) // sem desconto
  })

  it('deve calcular férias proporcionais para 6 meses', () => {
    const input = {
      salarioMensal: 2000,
      mesesTrabalhados: 6,
      diasFerias: 15,
      descontarAdiantamento: false,
      valorAdiantamento: 0,
    }
    
    const result = calcularFerias(input)
    
    expect(result.valorProporcional).toBe(1000) // 2000 * 6/12
    expect(result.adicionalUmTerco).toBeCloseTo(333.33) // 1000/3
    expect(result.valorLiquido).toBeCloseTo(1333.33)
  })
})


describe('Calculadora de 13º Salário', () => {
  it('deve calcular 13º salário para ano completo', () => {
    const input = {
      salarioMensal: 3000,
      mesesTrabalhados: 12,
    }
    
    const result = calcularDecimoTerceiro(input)
    
    expect(result.valorProporcional).toBe(3000) // 3000 * 12/12
    expect(result.primeiraParcela).toBe(1500) // metade
    expect(result.segundaParcela).toBe(1500) // metade
    expect(result.inss).toBe(330) // 3000 * 11%
    expect(result.valorLiquido).toBe(2670) // 3000 - 330
  })

  it('deve calcular 13º salário proporcional para 6 meses', () => {
    const input = {
      salarioMensal: 2400,
      mesesTrabalhados: 6,
    }
    
    const result = calcularDecimoTerceiro(input)
    
    expect(result.valorProporcional).toBe(1200) // 2400 * 6/12
    expect(result.primeiraParcela).toBe(600)
    expect(result.segundaParcela).toBe(600)
  })
})

describe('Calculadora de Custo do Funcionário', () => {
  it('deve calcular custo total do funcionário', () => {
    const input = {
      salarioBase: 3000,
      valeRefeicao: 500,
      valeTransporte: 200,
      planoSaude: 300,
      outrosBeneficios: 100,
    }
    
    const result = calcularCustoFuncionario(input)
    
    expect(result.salarioBase).toBe(3000)
    expect(result.decimoTerceiro).toBe(250) // 3000/12
    expect(result.ferias).toBe(250) // 3000/12
    expect(result.adicionalFerias).toBeCloseTo(83.33) // 250/3
    expect(result.fgts).toBe(240) // 3000 * 8%
    expect(result.encargos).toBe(810) // 3000 * 27%
    expect(result.beneficios.total).toBe(1100) // soma dos benefícios
    
    // Custo mensal total
    expect(result.custoMensal).toBeCloseTo(5733.33)
    expect(result.custoAnual).toBeCloseTo(68800)
  })
})
