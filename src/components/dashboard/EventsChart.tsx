'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, subDays, startOfDay } from 'date-fns'

interface ChartData {
  date: string
  views: number
  calculations: number
  conversions: number
}

export function EventsChart() {
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchChartData()
  }, [])
  
  const fetchChartData = async () => {
    try {
      // Generate dates for the last 30 days
      const dates: ChartData[] = []
      for (let i = 29; i >= 0; i--) {
        const date = startOfDay(subDays(new Date(), i))
        dates.push({
          date: format(date, 'MM/dd'),
          views: 0,
          calculations: 0,
          conversions: 0,
        })
      }
      
      // Fetch real data from Supabase
      const response = await fetch('/api/dashboard/events-chart')
      if (response.ok) {
        const eventData = await response.json()
        
        // Check if API returned an error object
        if (eventData.error) {
          setData(dates) // Use mock data
          return
        }
        
        // Merge real data with date structure
        const chartData = dates.map(day => {
          const dayData = eventData.find((d: any) => d.date === day.date)
          return {
            ...day,
            views: dayData?.views || 0,
            calculations: dayData?.calculations || 0,
            conversions: dayData?.conversions || 0,
          }
        })
        
        setData(chartData)
      } else {
        // If API fails, use empty data structure
        setData(dates)
      }
    } catch (error) {
      console.error('Error fetching chart data:', error)
      // Use empty data structure on error
      const dates: ChartData[] = []
      for (let i = 29; i >= 0; i--) {
        const date = startOfDay(subDays(new Date(), i))
        dates.push({
          date: format(date, 'MM/dd'),
          views: 0,
          calculations: 0,
          conversions: 0,
        })
      }
      setData(dates)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Events by Day</CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Events by Day</CardTitle>
        <CardDescription>Last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="views" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Views"
            />
            <Line 
              type="monotone" 
              dataKey="calculations" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Calculations"
            />
            <Line 
              type="monotone" 
              dataKey="conversions" 
              stroke="#f59e0b" 
              strokeWidth={2}
              name="Conversions"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
