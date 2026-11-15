"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../lib/supabase"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        router.push("/dashboard")
      } else {
        router.push("/login")
      }
    }
    check()
  }, [router])

  return (
    <div style={{ textAlign: 'center', marginTop: 100 }}>
      <p>Chargement de Devis229...</p>
    </div>
  )
}
