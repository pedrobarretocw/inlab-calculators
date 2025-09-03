import { UserButton } from '@clerk/nextjs'
import { isClerkEnabled } from '@/lib/clerk'

// Mock UserButton para desenvolvimento
function MockUserButton() {
  return (
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
        <span className="text-sm font-semibold text-gray-600">DV</span>
      </div>
      <span className="text-sm text-gray-600">(Modo Dev)</span>
    </div>
  )
}

export function DashboardHeader() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Dashboard - Calculadoras Trabalhistas
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {isClerkEnabled() ? (
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: 'w-8 h-8'
                  }
                }}
              />
            ) : (
              <MockUserButton />
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
