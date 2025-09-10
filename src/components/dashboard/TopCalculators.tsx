import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { formatNumber } from '@/lib/format'

interface CalculatorStats {
  calculator_slug: string
  views: number
  calculations: number
  leads: number
  lead_rate: number
}

export async function TopCalculators() {
  try {
    const supabase = await createServiceRoleClient()
    
    // Get stats for each calculator from the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    // Get real data from events table
    const { data: viewData } = await supabase
      .from('events')
      .select('calculator_slug')
      .eq('event', 'view')
      .gte('created_at', thirtyDaysAgo.toISOString())
    
    const { data: calcData } = await supabase
      .from('events')
      .select('calculator_slug')
      .eq('event', 'calculate')
      .gte('created_at', thirtyDaysAgo.toISOString())
    
    const { data: convData } = await supabase
      .from('events')
      .select('calculator_slug')
      .eq('event', 'conversion')
      .gte('created_at', thirtyDaysAgo.toISOString())
    
    // Process the data to get stats per calculator
    const calculatorSlugs = ['ferias', 'custo-funcionario', '13o-salario']
    const stats: CalculatorStats[] = calculatorSlugs.map(slug => {
      const views = viewData?.filter(e => e.calculator_slug === slug).length || 0
      const calculations = calcData?.filter(e => e.calculator_slug === slug).length || 0
      const leads = convData?.filter(e => e.calculator_slug === slug).length || 0
      const lead_rate = calculations > 0 ? (leads / calculations) * 100 : 0
      
      return {
        calculator_slug: slug,
        views,
        calculations,
        leads,
        lead_rate
      }
    })
    
    const calculatorNames: Record<string, string> = {
      'ferias': 'Vacation',

      'custo-funcionario': 'Employee Cost',
      '13o-salario': '13th Salary'
    }
    
    // Sort by views descending
    const displayStats = stats.sort((a, b) => b.views - a.views)
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Calculators</CardTitle>
          <CardDescription>Performance in the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Calculator</TableHead>
                <TableHead className="text-center">Views</TableHead>
                <TableHead className="text-center">Calculations</TableHead>
                <TableHead className="text-center">Leads</TableHead>
                <TableHead className="text-center">Lead Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayStats.map((stat) => (
                <TableRow key={stat.calculator_slug}>
                  <TableCell className="font-medium">
                    {calculatorNames[stat.calculator_slug] || stat.calculator_slug}
                  </TableCell>
                  <TableCell className="text-center">
                    {formatNumber(stat.views)}
                  </TableCell>
                  <TableCell className="text-center">
                    {formatNumber(stat.calculations)}
                  </TableCell>
                  <TableCell className="text-center">
                    {formatNumber(stat.leads)}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`font-medium ${
                      stat.lead_rate > 6 ? 'text-green-600' : 
                      stat.lead_rate > 4 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {stat.lead_rate.toFixed(1)}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    )
  } catch (error) {
    console.error('Error fetching calculator stats:', error)
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Calculators</CardTitle>
          <CardDescription>Error loading data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Unable to load calculator statistics.
          </div>
        </CardContent>
      </Card>
    )
  }
}
