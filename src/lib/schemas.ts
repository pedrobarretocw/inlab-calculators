import { z } from 'zod'

// Schema para calculadora de férias
export const feriasSchema = z.object({
  salarioMensal: z.coerce.number().min(0.01, 'Salário deve ser maior que zero'),
  mesesTrabalhados: z.coerce.number().min(1).max(12, 'Meses deve estar entre 1 e 12'),
  diasFerias: z.coerce.number().min(10).max(30, 'Dias de férias entre 10 e 30'),
  descontarAdiantamento: z.boolean().optional(),
  valorAdiantamento: z.coerce.number().min(0).optional(),
})



// Schema para custo do funcionário
export const custoFuncionarioSchema = z.object({
  salarioBase: z.number().min(0.01, 'Salário deve ser maior que zero'),
  valeRefeicao: z.number().min(0).optional(),
  valeTransporte: z.number().min(0).optional(),
  planoSaude: z.number().min(0).optional(),
  outrosBeneficios: z.number().min(0).optional(),
})

// Schema para 13º salário
export const decimoTerceiroSchema = z.object({
  salarioMensal: z.number().min(0.01, 'Salário deve ser maior que zero'),
  mesesTrabalhados: z.number().min(1).max(12, 'Meses deve estar entre 1 e 12'),
})

// Schema para eventos de tracking
export const trackEventSchema = z.object({
  event: z.enum(['view', 'start', 'calculate', 'save_email', 'conversion']),
  calculatorSlug: z.string(),
  variant: z.string(),
  sessionId: z.string(),
  articleSlug: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  email: z.string().email().optional(),
  userId: z.string().optional(),
})

// Schema para salvar cálculo
export const saveCalculationSchema = z.object({
  calculatorSlug: z.string(),
  inputs: z.record(z.string(), z.unknown()),
  outputs: z.record(z.string(), z.unknown()),
  email: z.string().email(),
  sessionId: z.string(),
})

// Tipos TypeScript derivados dos schemas
export type FeriasInput = z.infer<typeof feriasSchema>

export type CustoFuncionarioInput = z.infer<typeof custoFuncionarioSchema>
export type DecimoTerceiroInput = z.infer<typeof decimoTerceiroSchema>
export type TrackEventInput = z.infer<typeof trackEventSchema>
export type SaveCalculationInput = z.infer<typeof saveCalculationSchema>
