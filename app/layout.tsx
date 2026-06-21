import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  variable: '--font-inter', 
  subsets: ['latin'] 
})

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'FIND4SPORT - Encontre Profissionais e Espacos Desportivos',
    template: '%s | FIND4SPORT',
  },
  description: 'Descubra profissionais de desporto, espacos desportivos e eventos perto de si. A plataforma portuguesa para encontrar personal trainers, ginasios, campos e muito mais.',
  keywords: ['desporto', 'personal trainer', 'ginasio', 'fitness', 'Portugal', 'espacos desportivos', 'eventos desportivos'],
  authors: [{ name: 'FIND4SPORT' }],
  creator: 'FIND4SPORT',
  openGraph: {
    type: 'website',
    locale: 'pt_PT',
    siteName: 'FIND4SPORT',
    title: 'FIND4SPORT - Encontre Profissionais e Espacos Desportivos',
    description: 'Descubra profissionais de desporto, espacos desportivos e eventos perto de si.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FIND4SPORT',
    description: 'Encontre profissionais de desporto, espacos desportivos e eventos perto de si.',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#14b8a6' },
    { media: '(prefers-color-scheme: dark)', color: '#0d9488' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt" className={`${inter.variable} ${spaceGrotesk.variable} bg-background`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
