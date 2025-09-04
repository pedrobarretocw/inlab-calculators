import { Shield, AlertTriangle, Mail, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-xl text-gray-900">
            Acesso Negado
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center space-x-2 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm font-medium">Área Restrita</span>
            </div>
            
            <p className="text-gray-600 text-sm leading-relaxed">
              O painel administrativo é exclusivo para colaboradores da CloudWalk.
            </p>
            
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 text-blue-700 mb-2">
                <Mail className="w-4 h-4" />
                <span className="text-xs font-medium">Requisitos de Acesso</span>
              </div>
              <ul className="text-xs text-blue-600 space-y-1 text-left">
                <li>• Email corporativo @cloudwalk.io</li>
                <li>• Login pela conta administrativa</li>
                <li>• Permissões de administrador</li>
              </ul>
            </div>
          </div>
          
          <div className="space-y-2 pt-2">
            <Link href="/calculadoras/admin/login" className="w-full">
              <Button className="w-full" variant="default">
                Fazer Login como Admin
              </Button>
            </Link>
            
            <Link href="/" className="w-full">
              <Button className="w-full" variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Início
              </Button>
            </Link>
          </div>
          
          <div className="pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Se você é colaborador da CloudWalk e está enfrentando problemas de acesso, 
              entre em contato com o suporte técnico.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}