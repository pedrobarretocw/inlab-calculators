// Formatação de valores monetários em Real (BRL)
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

// Formatação de percentual
export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100)
}

// Formatação de números
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value)
}

// Parsing de input monetário (remove formatação)
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^\d,]/g, '').replace(',', '.')
  return parseFloat(cleaned) || 0
}

// Máscara para input de moeda
export function applyCurrencyMask(value: string): string {
  const numericValue = value.replace(/\D/g, '')
  const number = parseFloat(numericValue) / 100
  
  if (isNaN(number)) return 'R$ 0,00'
  
  return formatCurrency(number)
}

// Gera UUID simples para session_id
export function generateSessionId(): string {
  return 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}
