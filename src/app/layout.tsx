import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Chat met Napoleon Bonaparte - HAVO 5 Geschiedenis',
  description: 'Educatieve chatbot waar HAVO 5 leerlingen kunnen praten met Napoleon Bonaparte over geschiedenis, veldslagen en zijn leven.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <body className="bg-gray-100 min-h-screen" suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  )
}