import Link from 'next/link'
import { ShieldX } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-red-100 rounded-full mx-auto flex items-center justify-center">
            <ShieldX className="h-10 w-10 text-red-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Acesso Negado
        </h1>
        
        <p className="text-gray-600 mb-8">
          Esta área é restrita a administradores do InfinitePay.
          <br />
          Apenas emails @cloudwalk.io têm acesso.
        </p>
        
        <div className="space-y-4">
          <Link href="/calculadoras/admin/login">
            <Button className="w-full">
              Fazer Login como Admin
            </Button>
          </Link>
          
          <Link href="/calculadoras">
            <Button variant="outline" className="w-full">
              Voltar para Calculadoras
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
