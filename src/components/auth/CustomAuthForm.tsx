'use client'

import { useState, useEffect } from 'react'
import { useSignIn, useSignUp, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface CustomAuthFormProps {
  title: string
  description: string
  redirectTo: string
  requireDomainValidation?: boolean
  validateDomainUrl?: string
}

function AuthForm({ title, description, redirectTo, requireDomainValidation, validateDomainUrl }: CustomAuthFormProps) {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [domainError, setDomainError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'email' | 'verification'>('email')
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [resendLoading, setResendLoading] = useState(false)

  const { signIn, isLoaded: signInLoaded } = useSignIn()
  const { signUp, isLoaded: signUpLoaded } = useSignUp()

  const validateDomainServerSide = async (email: string) => {
    if (!requireDomainValidation || !validateDomainUrl) return true

    try {
      const response = await fetch(validateDomainUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (!response.ok) {
        const data = await response.json()
        setDomainError(data.error)
        return false
      }

      setDomainError(null)
      return true
    } catch (error) {
      setDomainError('Unable to validate domain. Please try again.')
      return false
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!signInLoaded || !signUpLoaded) return

    setIsLoading(true)
    setDomainError(null)

    // Server-side domain validation first (if required)
    const isDomainValid = await validateDomainServerSide(email)
    if (!isDomainValid) {
      setIsLoading(false)
      return
    }

    // Try sign-up first (which covers both new and existing users in modern Clerk)
    try {
      const signUpAttempt = await signUp.create({
        emailAddress: email,
      })

      await signUpAttempt.prepareEmailAddressVerification({
        strategy: 'email_code',
      })
      
      setMode('signup')
      setStep('verification')
      return
    } catch (signUpErr: unknown) {
      // If user exists, try sign-in
      const err = signUpErr as { errors?: Array<{ code: string }> } // Type guard for Clerk error structure
      if (err.errors?.[0]?.code === 'form_identifier_exists') {
        try {
          const signInAttempt = await signIn.create({
            identifier: email,
          })

          const emailCodeFactor = signInAttempt.supportedFirstFactors?.find(
            (f) => f.strategy === 'email_code'
          )

          if (emailCodeFactor && emailCodeFactor.emailAddressId) {
            await signInAttempt.prepareFirstFactor({
              strategy: 'email_code',
              emailAddressId: emailCodeFactor.emailAddressId,
            })

            setMode('signin')
            setStep('verification')
            return
          } else {
            setDomainError('Email verification not available for this account. Please contact support.')
          }
        } catch (signInErr: unknown) {
          setDomainError('Unable to send verification code. Please try again.')
        }
      } else {
        setDomainError('Unable to send verification code. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setDomainError(null)

    try {
      if (mode === 'signin') {
        const result = await signIn?.attemptFirstFactor({
          strategy: 'email_code',
          code: code,
        })

        if (result?.status === 'complete') {
          window.location.href = redirectTo
        } else {
          setDomainError('Sign-in process incomplete. Please try again.')
        }
      } else {
        const result = await signUp?.attemptEmailAddressVerification({
          code: code,
        })

        if (result?.status === 'complete') {
          window.location.href = redirectTo
        } else {
          setDomainError('Account verification incomplete. Please try again.')
        }
      }
    } catch (error: unknown) {
      const err = error as { errors?: Array<{ code: string }> } // Type guard for Clerk error structure
      if (err.errors?.[0]?.code === 'form_code_incorrect') {
        setDomainError('Invalid verification code. Please check and try again.')
      } else if (err.errors?.[0]?.code === 'verification_expired') {
        setDomainError('Verification code expired. Please request a new one.')
      } else {
        setDomainError('Verification failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setResendLoading(true)
    setDomainError(null)

    try {
      if (mode === 'signup') {
        if (!signUp) throw new Error('SignUp not loaded')
        
        const signUpAttempt = await signUp.create({
          emailAddress: email,
        })

        await signUpAttempt.prepareEmailAddressVerification({
          strategy: 'email_code',
        })
      } else {
        if (!signIn) throw new Error('SignIn not loaded')
        
        const signInAttempt = await signIn.create({
          identifier: email,
        })

        const emailCodeFactor = signInAttempt.supportedFirstFactors?.find(
          (f) => f.strategy === 'email_code'
        )

        if (emailCodeFactor && emailCodeFactor.emailAddressId) {
          await signInAttempt.prepareFirstFactor({
            strategy: 'email_code',
            emailAddressId: emailCodeFactor.emailAddressId,
          })
        } else {
          throw new Error('Email verification not available')
        }
      }

      setDomainError(null)
    } catch (error: unknown) {
      setDomainError('Failed to resend code. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }

  if (step === 'verification') {
    return (
      <div className="grid w-full grow items-center px-4 sm:justify-center">
        <Card className="w-full sm:w-96">
          <CardHeader className="pb-4">
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              Enter the verification code sent to {email}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleCodeSubmit}>
            <CardContent className="space-y-4">
              {domainError && (
                <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-md text-sm">
                  <strong>Error:</strong> {domainError}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value)
                    setDomainError(null)
                  }}
                  maxLength={6}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-4">
              <Button 
                type="submit" 
                disabled={isLoading || code.length !== 6} 
                className="w-full bg-black hover:bg-gray-800 text-white"
              >
                {isLoading ? 'Verifying...' : 'Continue'}
              </Button>
              <div className="flex justify-between w-full">
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() => setStep('email')}
                >
                  Go back
                </Button>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={handleResendCode}
                  disabled={resendLoading}
                >
                  {resendLoading ? 'Resending...' : 'Resend code'}
                </Button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid w-full grow items-center px-4 sm:justify-center">
      <Card className="w-full sm:w-96">
        <CardHeader className="pb-4">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <form onSubmit={handleEmailSubmit}>
          <CardContent className="space-y-4">
            {domainError && (
              <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-md text-sm">
                <strong>Access Denied:</strong> {domainError}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder={requireDomainValidation ? "your.email@cloudwalk.io" : "your.email@example.com"}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setDomainError(null)
                }}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="pt-4">
            <Button 
              type="submit" 
              disabled={isLoading || !email} 
              className="w-full bg-black hover:bg-gray-800 text-white"
            >
              {isLoading ? 'Sending...' : 'Continue'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default function CustomAuthForm({ title, description, redirectTo, requireDomainValidation, validateDomainUrl }: CustomAuthFormProps) {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && user) {
      // User is already authenticated, redirect to dashboard
      router.replace(redirectTo)
    }
  }, [isLoaded, user, router, redirectTo])

  // Show loading while checking authentication
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // If user is authenticated, don't render the form (redirect is in progress)
  if (user) {
    return null
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Design Panel */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 relative overflow-hidden">
        {/* C gigante posicionado à esquerda */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-20">
          <div className="text-white/5 font-black text-[48rem] leading-none select-none">C</div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-between p-12 text-white h-full">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              <span className="font-light">Labor</span><span className="font-black">Calculators</span>
            </h1>
            <p className="text-slate-300 text-lg">Professional tools for your business</p>
          </div>
          
          <div className="max-w-md">
            <h2 className="text-2xl font-bold mb-4">Built by InLab Mafia</h2>
            <blockquote className="text-slate-200 text-base italic leading-relaxed">
              &ldquo;With great power, comes great responsibility&rdquo;
              <br />
              <span className="text-slate-400 text-sm not-italic">— Spider-Man, 2002</span>
            </blockquote>
          </div>
          
          <div className="text-slate-400 text-sm">© 2025 CloudWalk - InLab</div>
        </div>
      </div>

      {/* Right side - Sign In Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Header mobile */}
          <div className="mb-8 lg:hidden text-center">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              <span className="font-light">Labor</span><span className="font-black">Calculators</span>
            </h1>
            <p className="text-slate-600">Access the platform</p>
          </div>

          <AuthForm 
            title={title}
            description={description}
            redirectTo={redirectTo}
            requireDomainValidation={requireDomainValidation}
            validateDomainUrl={validateDomainUrl}
          />
        </div>
      </div>
    </div>
  )
}
