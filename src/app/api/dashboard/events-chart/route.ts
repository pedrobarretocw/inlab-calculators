import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { format, subDays, startOfDay } from 'date-fns'
import { isRealAdminUser } from '@/lib/clerk-jwt-utils'

export async function GET(req: NextRequest) {
  try {
    // VERIFICAÇÃO DUPLA: BLOQUEIA USUÁRIOS PÚBLICOS
    const isAdmin = await isRealAdminUser()
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized - Please login as admin' }, { status: 401 })
    }
    const supabase = await createServiceRoleClient()
    
    // Get data for the last 30 days (to ensure we have some data)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    // Get all events from the last 30 days
    const { data: events } = await supabase
      .from('events')
      .select('event, created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true })
    
    if (!events) {
      return NextResponse.json([])
    }
    
    // Group events by day
    const eventsByDay: Record<string, { views: number; calculations: number; conversions: number }> = {}
    
    // Initialize all days with 0 counts
    for (let i = 6; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i))
      const dateKey = format(date, 'dd/MM')
      eventsByDay[dateKey] = { views: 0, calculations: 0, conversions: 0 }
    }
    
    // Count events by day and type
    events.forEach(event => {
      const eventDate = new Date(event.created_at)
      const dateKey = format(eventDate, 'dd/MM')
      
      if (eventsByDay[dateKey]) {
        switch (event.event) {
          case 'view':
            eventsByDay[dateKey].views++
            break
          case 'calculate':
            eventsByDay[dateKey].calculations++
            break
          case 'conversion':
            eventsByDay[dateKey].conversions++
            break
        }
      }
    })
    
    // Convert to array format
    const chartData = Object.entries(eventsByDay).map(([date, counts]) => ({
      date,
      ...counts
    }))
    
    return NextResponse.json(chartData)
  } catch (error) {
    console.error('Error fetching events chart data:', error)
    return NextResponse.json({ error: 'Failed to fetch chart data' }, { status: 500 })
  }
}
