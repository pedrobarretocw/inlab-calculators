import { Suspense } from 'react'
import { getCurrentPublicUser } from '@/lib/clerk'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { UserCalculations } from '@/components/dashboard/UserCalculations'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function UsuariosPage() {
  const { userId } = await getCurrentPublicUser()
  
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Meu Dashboard</h1>
          <p className="text-gray-600 mt-2">Acesse suas calculadoras salvas e histórico</p>
        </div>
        
        <div className="space-y-8">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>Acesse rapidamente as calculadoras</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/calculadoras/embed/all?calculator=ferias" target="_blank">
                  <Button variant="outline" className="w-full">
                    Férias
                  </Button>
                </Link>


                <Link href="/calculadoras/embed/all?calculator=custo-funcionario" target="_blank">
                  <Button variant="outline" className="w-full">
                    Custo Funcionário
                  </Button>
                </Link>
                <Link href="/calculadoras/embed/all?calculator=13o-salario" target="_blank">
                  <Button variant="outline" className="w-full">
                    13º Salário
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          {/* User Calculations */}
          <Suspense fallback={<div>Carregando cálculos...</div>}>
            <UserCalculations userId={userId} />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
