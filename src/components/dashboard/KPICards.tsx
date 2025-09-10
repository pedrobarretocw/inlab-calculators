import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { formatNumber } from '@/lib/format'

export async function KPICards() {
  try {
    const supabase = await createServiceRoleClient()
    
    // Get KPIs from the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    // Total views
    const { count: totalViews } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('event', 'view')
      .gte('created_at', thirtyDaysAgo.toISOString())
    
    // Total calculations
    const { count: totalCalculations } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('event', 'calculate')
      .gte('created_at', thirtyDaysAgo.toISOString())
    
    // Total leads (entries in leads table, all-time)
    const { count: totalLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
    
    // Calculate conversion rate
    const conversionRate = totalCalculations && totalCalculations > 0 
      ? (totalLeads || 0) / totalCalculations * 100 
      : 0
    
    const kpis = [
      {
        title: 'Total Views',
        value: formatNumber(totalViews || 0),
        description: 'Last 30 days',
      },
      {
        title: 'Calculations',
        value: formatNumber(totalCalculations || 0),
        description: 'Last 30 days',
      },
      {
        title: 'Leads',
        value: formatNumber(totalLeads || 0),
        description: 'Total leads (all time)',
      },
      {
        title: 'Conversion Rate',
        value: `${conversionRate.toFixed(1)}%`,
        description: 'Calculations → Leads',
      },
    ]
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {kpi.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  } catch (error) {
    console.error('Error fetching KPIs:', error)
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Loading...
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground mt-1">
                Error loading data
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
}
