import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from '@/components/ui/sonner'
import { clerkAdminConfig } from '@/lib/clerk-config'
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
  title: "Calculadoras Trabalhistas | InLab",
  description: "Micro-SaaS de calculadoras trabalhistas brasileiras para embedar em posts de blog",
};

// Flag para ativar/desativar Clerk em desenvolvimento
const isClerkEnabled = () => process.env.ENABLE_CLERK === 'true'

// Wrapper condicional para ClerkProvider (usando configuração admin)
function AuthProvider({ children }: { children: React.ReactNode }) {
  if (isClerkEnabled()) {
    return (
      <ClerkProvider publishableKey={clerkAdminConfig.publishableKey}>
        {children}
      </ClerkProvider>
    )
  }
  
  return <>{children}</>
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <html lang="pt-BR">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
          <Toaster />
        </body>
      </html>
    </AuthProvider>
  );
}
