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
          <div className="flex-shrink-0 min-w-0">
            <h1 className="text-base sm:text-lg lg:text-2xl font-bold text-gray-900 truncate">
              <span className="hidden lg:inline">Dashboard - Calculadoras Trabalhistas</span>
              <span className="hidden sm:inline lg:hidden">Dashboard - Calculadoras</span>
              <span className="sm:hidden">Dashboard</span>
            </h1>
          </div>
          
          <div className="flex items-center space-x-4 flex-shrink-0">
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
