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
  title: "Calculadoras Trabalhistas | InLab",
  description: "Micro-SaaS de calculadoras trabalhistas brasileiras para embedar em posts de blog",
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
      <html lang="pt-BR">
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
