import CustomAuthForm from '@/components/auth/CustomAuthForm'
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Brazilian Payroll Calculators | InLab Tools",
  description: "Professional Brazilian payroll calculators for vacation, 13th salary, employee costs and more. Embed-ready tools for blogs and websites.",
  keywords: ["payroll calculator", "brazilian labor laws", "vacation calculator", "13th salary", "employee cost calculator", "HR tools"],
  authors: [{ name: "InLab Team" }],
  creator: "InLab",
  publisher: "InLab",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://inlab-calculators.onrender.com/calculadoras/admin/login",
    title: "Brazilian Payroll Calculators | InLab Tools",
    description: "Professional Brazilian payroll calculators for vacation, 13th salary, employee costs and more. Embed-ready tools for blogs and websites.",
    siteName: "InLab Calculators",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Brazilian Payroll Calculators - InLab Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Brazilian Payroll Calculators | InLab Tools",
    description: "Professional Brazilian payroll calculators for vacation, 13th salary, employee costs and more.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

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
