import type { Metadata, Viewport } from 'next'
import { Google_Sans, Google_Sans_Code } from 'next/font/google'

import './globals.css'

// Une seule famille, trois rôles : Google Sans porte les titres et le texte,
// Google Sans Code tout ce qui relève de l'instrument (relevés, étiquettes, chiffres).
const sans = Google_Sans({
  variable: '--font-body',
  subsets: ['latin'],
})

const mono = Google_Sans_Code({
  variable: '--font-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'République du Bénin — relevé',
  description:
    'Une descente en 3D de l’orbite basse jusqu’aux douze départements du Bénin. Frontières réelles, chiffres datés et sourcés.',
}

export const viewport: Viewport = {
  themeColor: '#05080F',
  colorScheme: 'dark',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="fr" className={`${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
