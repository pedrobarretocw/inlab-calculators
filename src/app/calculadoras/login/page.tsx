import CustomAuthForm from '@/components/auth/CustomAuthForm'

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
