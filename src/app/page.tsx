import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            InLab - Calculadoras Trabalhistas
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Micro-SaaS de calculadoras trabalhistas brasileiras para embedar em posts de blog
          </p>
        </div>
        
        <div className="text-center space-x-4">
          <Link href="/calculadoras/admin/login">
            <Button size="lg" className="text-lg px-8 py-4">
              Painel Administrativo
            </Button>
          </Link>
          
          <Link href="/calculadoras/login">
            <Button variant="secondary" size="lg" className="text-lg px-8 py-4">
              Dashboard Usuário
            </Button>
          </Link>
        </div>
        
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">
            Exemplo de Uso - Embed
          </h2>
          
          <div className="bg-white rounded-lg p-6 max-w-4xl mx-auto shadow-lg">
            <p className="text-sm text-gray-700 mb-2">
              <strong>Embed A/B (uma calculadora aleatória):</strong>
            </p>
            <code className="block bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
              {`<iframe src="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/calculadoras/embed/ab" 
  width="500" 
  height="500" 
  frameborder="0" 
  style="border: none; border-radius: 8px;">
</iframe>`}
            </code>
            
            <p className="text-sm text-gray-700 mb-2 mt-4">
              <strong>Embed Carousel (todas as calculadoras):</strong>
            </p>
            <code className="block bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
              {`<iframe src="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/calculadoras/embed/all" 
  width="500" 
  height="500" 
  frameborder="0" 
  style="border: none; border-radius: 8px;">
</iframe>`}
            </code>
          </div>
        </div>
      </div>
    </main>
  )
}