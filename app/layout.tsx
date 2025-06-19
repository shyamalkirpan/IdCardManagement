import type { Metadata } from 'next'
import { Toaster } from "@/components/ui/sonner"
import Navbar from "@/components/navbar"
import './globals.css'

export const metadata: Metadata = {
  title: 'Student ID Card System',
  description: 'Create and manage student identification cards',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  )
}
