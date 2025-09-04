'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts'

interface ChartData {
  date: string
  sessions: number
  completions: number
}

interface EventsChartClientProps {
  data: ChartData[]
}

export function EventsChartClient({ data }: EventsChartClientProps) {
  const totalSessions = data.reduce((sum, day) => sum + day.sessions, 0)
  const totalCompletions = data.reduce((sum, day) => sum + day.completions, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Sessions</CardTitle>
        <CardDescription>Session evolution over the last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex items-center gap-6 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-600">Sessions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600">Completions</span>
          </div>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#666' }}
            />
            <YAxis hide />
            <Bar dataKey="sessions" radius={[2, 2, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill="#3b82f6" />
              ))}
            </Bar>
            <Bar dataKey="completions" radius={[2, 2, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill="#10b981" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Totals */}
        <div className="flex justify-center gap-16 mt-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-500">{totalSessions}</div>
            <div className="text-sm text-gray-600">Total Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-500">{totalCompletions}</div>
            <div className="text-sm text-gray-600">Total Completions</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
