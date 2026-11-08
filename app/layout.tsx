import "./globals.css"
import type { Metadata } from "next"
export const metadata: Metadata = { title: "Devis229", description: "Créer des devis rapidement" }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="fr"><body>{children}</body></html>)
}