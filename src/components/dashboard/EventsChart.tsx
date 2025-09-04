import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EventsChartClient } from './EventsChartClient'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { format, subDays, startOfDay } from 'date-fns'

interface ChartData {
  date: string
  sessions: number
  completions: number
}

export async function EventsChart() {
  try {
    const supabase = await createServiceRoleClient()
    
    // Get data for the last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    // Get all events from the last 7 days
    const { data: events } = await supabase
      .from('events')
      .select('event, created_at')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: true })
    
    // Generate dates for the last 7 days
    const eventsByDay: Record<string, { views: number; calculations: number }> = {}
    
    // Initialize all days with 0 counts
    for (let i = 6; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i))
      const dateKey = format(date, 'dd/MM')
      eventsByDay[dateKey] = { views: 0, calculations: 0 }
    }
    
    // Count events by day and type
    if (events) {
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
          }
        }
      })
    }
    
    // Convert to array format
    const chartData: ChartData[] = Object.entries(eventsByDay).map(([date, counts]) => ({
      date,
      sessions: counts.views,
      completions: counts.calculations,
    }))
    
    return <EventsChartClient data={chartData} />
  } catch (error) {
    console.error('Error fetching events chart data:', error)
    
    // Return empty data on error
    const dates: ChartData[] = []
    for (let i = 6; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i))
      dates.push({
        date: format(date, 'dd/MM'),
        sessions: 0,
        completions: 0,
      })
    }
    
    return <EventsChartClient data={dates} />
  }
}
