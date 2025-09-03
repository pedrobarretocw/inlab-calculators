import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { formatNumber } from '@/lib/format'

interface ABVariant {
  calculator_slug: string
  variant: string
  weight: number
  active: boolean
  views: number
  conversions: number
  conversion_rate: number
}

export async function ABTestReport() {
  try {
    const supabase = await createServiceRoleClient()
    
    // Get A/B variants from database
    const { data: variants } = await supabase
      .from('ab_variants')
      .select('*')
      .order('calculator_slug', { ascending: true })
    
    // Get stats for the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { data: viewEvents } = await supabase
      .from('events')
      .select('variant')
      .eq('event', 'view')
      .gte('created_at', thirtyDaysAgo.toISOString())
    
    const { data: conversionEvents } = await supabase
      .from('events')
      .select('variant')
      .eq('event', 'conversion')
      .gte('created_at', thirtyDaysAgo.toISOString())
    
    const calculatorNames: Record<string, string> = {
      'ferias': 'Vacation',

      'custo-funcionario': 'Employee Cost',
      '13o-salario': '13th Salary'
    }
    
    // Create variants with real stats
    const displayVariants: ABVariant[] = variants ? variants.map(variant => {
      const views = viewEvents?.filter(e => e.variant === variant.variant).length || 0
      const conversions = conversionEvents?.filter(e => e.variant === variant.variant).length || 0
      const conversion_rate = views > 0 ? (conversions / views) * 100 : 0
      
      return {
        calculator_slug: variant.calculator_slug,
        variant: variant.variant,
        weight: variant.weight,
        active: variant.active,
        views,
        conversions,
        conversion_rate
      }
    }) : []
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>A/B Testing Report</CardTitle>
          <CardDescription>Variant distribution and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Variant</TableHead>
                <TableHead className="text-center">Weight</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Views</TableHead>
                <TableHead className="text-center">CR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayVariants.map((variant, index) => (
                <TableRow key={`${variant.calculator_slug}-${index}`}>
                  <TableCell className="font-medium">
                    {calculatorNames[variant.calculator_slug] || variant.variant}
                  </TableCell>
                  <TableCell className="text-center">
                    {variant.weight}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      variant.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {variant.active ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {formatNumber(variant.views || 0)}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`font-medium ${
                      (variant.conversion_rate || 0) > 6 ? 'text-green-600' : 
                      (variant.conversion_rate || 0) > 4 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {(variant.conversion_rate || 0).toFixed(1)}%
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
    console.error('Error fetching A/B variants:', error)
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>A/B Testing Report</CardTitle>
          <CardDescription>Error loading data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Unable to load A/B testing report.
          </div>
        </CardContent>
      </Card>
    )
  }
}
