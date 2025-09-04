import { Suspense } from 'react'
import { getCurrentUser } from '@/lib/clerk'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { KPICards } from '@/components/dashboard/KPICards'
import { EventsChart } from '@/components/dashboard/EventsChart'
import { TopCalculators } from '@/components/dashboard/TopCalculators'
import { ABTestReport } from '@/components/dashboard/ABTestReport'
import { UserCalculations } from '@/components/dashboard/UserCalculations'

export default async function DashboardPage() {
  const { userId } = await getCurrentUser()
  
  // Em desenvolvimento sem Clerk, sempre permitir acesso
  // Em produção com Clerk, userId será null se não autenticado
  if (!userId) {
    // Só redireciona se Clerk estiver ativo
    if (process.env.ENABLE_CLERK === 'true') {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Acesso Restrito</h1>
            <p className="text-gray-600 mt-2">Você precisa fazer login para acessar esta página.</p>
          </div>
        </div>
      )
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* KPIs */}
          <Suspense fallback={<div>Carregando métricas...</div>}>
            <KPICards />
          </Suspense>
          
          {/* Chart */}
          <Suspense fallback={<div>Carregando gráfico...</div>}>
            <EventsChart />
          </Suspense>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Calculators */}
            <Suspense fallback={<div>Carregando calculadoras...</div>}>
              <TopCalculators />
            </Suspense>
            
            {/* A/B Test Report */}
            <Suspense fallback={<div>Carregando relatório A/B...</div>}>
              <ABTestReport />
            </Suspense>
          </div>
          
          {/* User Calculations */}
          <Suspense fallback={<div>Carregando cálculos...</div>}>
            <UserCalculations userId={userId || ''} />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
