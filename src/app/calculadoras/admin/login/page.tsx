import CustomAuthForm from '@/components/auth/CustomAuthForm'

export default function AdminLoginPage() {
  return (
    <CustomAuthForm
      title="Admin Access - Labor Calculators"
      description="Enter your corporate email to receive the verification code"
      redirectTo="/calculadoras/admin"
      requireDomainValidation={true}
      validateDomainUrl="/calculadoras/api/auth/validate-domain"
    />
  )
}
