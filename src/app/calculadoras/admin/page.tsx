import { Suspense } from 'react'
import { KPICards } from '@/components/dashboard/KPICards'
import { EventsChart } from '@/components/dashboard/EventsChart'
import { TopCalculators } from '@/components/dashboard/TopCalculators'
import { ABTestReport } from '@/components/dashboard/ABTestReport'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart3, Users, Calculator, TrendingUp, Settings, TestTube } from 'lucide-react'
import Link from 'next/link'

// Admin Header Component separado como client component
import AdminHeader from '@/components/admin/AdminHeader'
import { CalculatorModal } from '@/components/admin/CalculatorModal'

// Calculators Tab Component
function CalculatorsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">View Calculators</h2>
        <p className="text-sm sm:text-base text-gray-600 mt-2">Test and preview all available calculators</p>
      </div>
      
      <div className="space-y-4">
        {/* Individual Calculators */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Individual Calculators</CardTitle>
            <CardDescription>
              Embed specific calculators on your website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium">Vacation Calculator</h3>
                  <p className="text-sm text-muted-foreground">Calculate proportional vacation value with 1/3 bonus</p>
                </div>
                <div className="flex-shrink-0">
                  <CalculatorModal calculatorSlug="ferias" calculatorName="Vacation Calculator" embedType="single" />
                </div>
              </div>
              

              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium">Employee Cost</h3>
                  <p className="text-sm text-muted-foreground">Calculate total employee cost including taxes</p>
                </div>
                <div className="flex-shrink-0">
                  <CalculatorModal calculatorSlug="custo-funcionario" calculatorName="Employee Cost" embedType="single" />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium">13th Salary</h3>
                  <p className="text-sm text-muted-foreground">Calculate 13th salary proportional to months worked</p>
                </div>
                <div className="flex-shrink-0">
                  <CalculatorModal calculatorSlug="13o-salario" calculatorName="13th Salary" embedType="single" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* A/B Test */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">A/B Test Embed</CardTitle>
            <CardDescription>
              Embed a random calculator for A/B testing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Random Calculator (A/B Test)</h3>
                <p className="text-sm text-muted-foreground">Shows a random calculator based on configured weights</p>
              </div>
              <CalculatorModal calculatorSlug="ab" calculatorName="A/B Test" embedType="ab" />
            </div>
          </CardContent>
        </Card>
        
      </div>
    </div>
  )
}

// A/B Tests Tab Component
function ABTestsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Manage A/B Tests</h2>
        <p className="text-gray-600 mt-2">Configure and monitor calculator A/B tests</p>
      </div>
      
      <Suspense fallback={<div>Loading A/B report...</div>}>
        <ABTestReport />
      </Suspense>
      
      <Card>
        <CardHeader>
          <CardTitle>A/B Test Actions</CardTitle>
          <CardDescription>Tools to manage tests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="w-full">
              New Variant
            </Button>
            <Button variant="outline" className="w-full">
              Pause Test
            </Button>
            <Button variant="outline" className="w-full">
              Detailed Report
            </Button>
            <Button variant="outline" className="w-full">
              Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Settings Tab Component
function SettingsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
        <p className="text-gray-600 mt-2">Manage general application settings</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Basic application settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Clerk Auth</span>
                <span className={`text-sm px-2 py-1 rounded ${process.env.ENABLE_CLERK === 'true' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {process.env.ENABLE_CLERK === 'true' ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Environment</span>
                <span className="text-sm px-2 py-1 rounded bg-gray-100 text-gray-800">
                  {process.env.NODE_ENV || 'development'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Supabase Schema</span>
                <span className="text-sm px-2 py-1 rounded bg-blue-100 text-blue-800">
                  inlab_payroll_tools
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Administrative Actions</CardTitle>
            <CardDescription>Maintenance tools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full">
                Export Data
              </Button>
              <Button variant="outline" className="w-full">
                System Logs
              </Button>
              <Button variant="outline" className="w-full">
                Backup Database
              </Button>
              <Button variant="destructive" className="w-full">
                Clear Cache
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default async function AdminPage() {
  // O middleware já fez toda a verificação necessária
  // Não precisamos de verificação dupla aqui para evitar loops
  
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="analytics" className="flex items-center gap-1 sm:gap-2 text-sm">
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Charts</span>
            </TabsTrigger>
            <TabsTrigger value="calculators" className="flex items-center gap-1 sm:gap-2 text-sm">
              <Calculator className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Calculators</span>
              <span className="sm:hidden">Tools</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="analytics" className="mt-8 space-y-8">
            <div className="mb-8">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-2">Calculator performance and usage metrics</p>
            </div>
            
            {/* KPIs */}
            <Suspense fallback={<div>Loading metrics...</div>}>
              <KPICards />
            </Suspense>
            
            {/* Chart and Top Calculators lado a lado */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Chart */}
              <Suspense fallback={<div>Loading chart...</div>}>
                <EventsChart />
              </Suspense>
              
              {/* Top Calculators */}
              <Suspense fallback={<div>Loading calculators...</div>}>
                <TopCalculators />
              </Suspense>
            </div>
          </TabsContent>
          
          <TabsContent value="calculators" className="mt-8">
            <CalculatorsTab />
          </TabsContent>
          
          <TabsContent value="ab-tests" className="mt-8">
            <ABTestsTab />
          </TabsContent>
          
          <TabsContent value="settings" className="mt-8">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
