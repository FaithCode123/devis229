import "./globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Devis229 - Ets Faith Christian",
  description: "Créer des devis rapidement",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}