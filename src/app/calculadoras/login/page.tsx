'use client'

import dynamic from 'next/dynamic'

const CustomAuthForm = dynamic(() => import('@/components/auth/CustomAuthForm'), {
  ssr: false,
  loading: () => <div className="min-h-screen flex items-center justify-center">Loading...</div>
})

export default function PublicLoginPage() {
  return (
    <CustomAuthForm
      title="Access - InfinitePay Calculators"
      description="Enter your email to receive the verification code"
      redirectTo="/calculadoras/usuarios"
      requireDomainValidation={false}
    />
  )
}
