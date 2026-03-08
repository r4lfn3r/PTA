import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/Sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AlphaQuant | High-Frequency Trading Core',
  description: 'Evidence-based algorithmic trading ecosystem',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0A0A0A] text-zinc-300 min-h-screen selection:bg-indigo-500/30 flex`}>
        {/* Sidebar Fixed en la izquierda */}
        <Sidebar />

        {/* Contenido Principal (con margen izquierdo para el sidebar) */}
        <main className="flex-1 ml-64 p-8 min-h-screen overflow-x-hidden">
          {children}
        </main>
      </body>
    </html>
  )
}
