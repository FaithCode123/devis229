import "./globals.css"
import type { Metadata, Viewport } from "next"

export const metadata: Metadata = {
  title: "Devis229",
  description: "Créer des devis rapidement",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Devis229",
  },
}

export const viewport: Viewport = {
  themeColor: "#16a34a",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}