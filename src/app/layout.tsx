import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from '@/components/ui/sonner'
import { CalculatorProvider } from '@/contexts/CalculatorContext'
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
    url: "https://inlab-calculators.onrender.com",
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
};

// Flag para ativar/desativar Clerk em desenvolvimento
const isClerkEnabled = () => process.env.ENABLE_CLERK === 'true'

// Sem ClerkProvider global - cada área usa sua própria instância
function AuthProvider({ children }: { children: React.ReactNode }) {
  // NÃO mais colocamos ClerkProvider global para evitar conflitos
  // Cada área (admin/public) usa sua própria instância
  return <>{children}</>
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <CalculatorProvider>
            {children}
          </CalculatorProvider>
          <Toaster />
        </body>
      </html>
    </AuthProvider>
  );
}
