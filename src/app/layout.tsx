import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Stage Assessment App',
  description: 'Simple stage assessment application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <body className="bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  )
}