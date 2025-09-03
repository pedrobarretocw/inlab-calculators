import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/format'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface UserCalculationsProps {
  userId: string
}

interface UserCalculation {
  id: string
  calculator_slug: string
  inputs: Record<string, unknown>
  outputs: Record<string, unknown>
  created_at: string
}

export async function UserCalculations({ userId }: UserCalculationsProps) {
  try {
    const supabase = await createServiceRoleClient()
    
    const { data: calculations, error } = await supabase
      .from('calculations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (error) {
      console.error('Error fetching user calculations:', error)
      throw error
    }
    
    const calculatorNames: Record<string, string> = {
      'ferias': 'Férias',

      'custo-funcionario': 'Custo do Funcionário',
      '13o-salario': '13º Salário'
    }
    
    const getResultValue = (calculation: UserCalculation): string => {
      const { outputs, calculator_slug } = calculation
      
      if (!outputs) return 'N/A'
      
      switch (calculator_slug) {
        case 'ferias':
          return formatCurrency((outputs.valorLiquido as number) || 0)
        case 'custo-funcionario':
          return formatCurrency((outputs.custoMensal as number) || 0)
        case '13o-salario':
          return formatCurrency((outputs.valorLiquido as number) || 0)
        default:
          return 'N/A'
      }
    }
    
    if (!calculations || calculations.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Meus Cálculos</CardTitle>
            <CardDescription>Seus cálculos mais recentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              Você ainda não fez nenhum cálculo.
            </div>
          </CardContent>
        </Card>
      )
    }
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Meus Cálculos</CardTitle>
          <CardDescription>Seus cálculos mais recentes (últimos 10)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Calculadora</TableHead>
                <TableHead>Resultado</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calculations.map((calculation) => (
                <TableRow key={calculation.id}>
                  <TableCell className="font-medium">
                    {calculatorNames[calculation.calculator_slug] || calculation.calculator_slug}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono">
                      {getResultValue(calculation)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {format(new Date(calculation.created_at), 'dd/MM/yyyy HH:mm', {
                      locale: ptBR
                    })}
                  </TableCell>
                  <TableCell className="text-center">
                    <button className="text-sm text-blue-600 hover:text-blue-800 underline">
                      Ver Detalhes
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    )
  } catch (error) {
    console.error('Error fetching user calculations:', error)
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Meus Cálculos</CardTitle>
          <CardDescription>Erro ao carregar dados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Não foi possível carregar seus cálculos.
          </div>
        </CardContent>
      </Card>
    )
  }
}
