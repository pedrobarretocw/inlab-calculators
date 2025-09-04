'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function CalculatorSkeleton() {
  return (
    <div className="w-full max-w-lg animate-pulse">
      <div className="quiz-snake-border h-[480px] rounded-lg">
        <Card 
          className="w-full h-full border-0 shadow-none rounded-lg flex flex-col bg-transparent"
        >
      <CardHeader className="pb-3 px-4 pt-4">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Icon skeleton */}
            <div className="w-5 h-5 bg-gray-300 rounded"></div>
            
            {/* Title skeleton */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-32"></div>
              <div className="h-3 bg-gray-200 rounded w-48"></div>
            </div>
          </div>
          
          {/* Button skeleton */}
          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 flex-1 overflow-hidden px-4 pb-4">
        {/* Form fields skeleton */}
        <div className="space-y-3">
          {/* Campo 1 */}
          <div className="space-y-1">
            <div className="h-3 bg-gray-300 rounded w-24"></div>
            <div className="h-9 bg-white border border-gray-300 rounded-md"></div>
          </div>
          
          {/* Campo 2 */}
          <div className="space-y-1">
            <div className="h-3 bg-gray-300 rounded w-28"></div>
            <div className="h-9 bg-white border border-gray-300 rounded-md"></div>
          </div>
          
          {/* Campo 3 */}
          <div className="space-y-1">
            <div className="h-3 bg-gray-300 rounded w-32"></div>
            <div className="h-9 bg-white border border-gray-300 rounded-md"></div>
          </div>
          
          {/* Campo 4 */}
          <div className="space-y-1">
            <div className="h-3 bg-gray-300 rounded w-20"></div>
            <div className="h-9 bg-white border border-gray-300 rounded-md"></div>
          </div>
        </div>

        {/* Buttons skeleton */}
        <div className="space-y-2 pt-1">
          {/* Calculate button */}
          <div className="h-9 bg-gray-300 rounded-md w-full"></div>
          
          {/* Secondary button */}
          <div className="h-7 bg-gray-200 rounded-md w-full"></div>
          
          {/* Link text */}
          <div className="text-center pt-1">
            <div className="h-3 bg-gray-200 rounded w-32 mx-auto"></div>
          </div>
        </div>
      </CardContent>
        </Card>
      </div>
    </div>
  )
}
