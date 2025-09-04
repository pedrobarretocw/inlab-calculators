'use client'

import { useUser } from '@clerk/nextjs'
import AdminSignOut from '@/components/auth/AdminSignOut'

export default function AdminHeader() {
  const { user } = useUser()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <h1 className="text-lg sm:text-xl text-gray-900">
              <span className="font-normal">Labor</span><span className="font-bold">Calculators</span>
            </h1>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-6 text-xs sm:text-sm text-gray-600">
            <span className="hidden sm:inline truncate max-w-48">
              {user?.emailAddresses?.[0]?.emailAddress || 'pedro.barreto@cloudwalk.io'}
            </span>
            <span className="sm:hidden truncate max-w-32 text-xs">
              {user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'pedro.barreto'}
            </span>
            <AdminSignOut />
          </div>
        </div>
      </div>
    </header>
  )
}
