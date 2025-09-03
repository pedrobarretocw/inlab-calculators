'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useClerk } from '@clerk/nextjs'
import { toast } from "sonner"
import { LogOut } from "lucide-react"

export default function AdminSignOut() {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const { signOut } = useClerk()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut(() => {
        toast.success("Logout realizado com sucesso!")
        router.push("/calculadoras/admin/login")
      })
    } catch (error) {
      toast.error("Erro ao fazer logout. Tente novamente.")
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <button 
      onClick={handleLogout} 
      disabled={isLoggingOut}
      className="flex items-center space-x-2 hover:text-gray-800 transition-colors text-sm text-gray-600"
    >
      <LogOut className="w-4 h-4" />
      <span>{isLoggingOut ? "Saindo..." : "Sair"}</span>
    </button>
  )
}
