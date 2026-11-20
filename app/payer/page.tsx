"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase" // <-- Garde TON import à toi si ce n'est pas celui-là

export default function Payer() {
  const [email, setEmail] = useState("...")

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email)
    })
  }, [])

  const message = `Bonjour, j'ai payé 5000F pour Devis229. Mon email est : ${email}. Voici la capture.`
  const lienWhatsApp = `https://wa.me/2290196448338?text=${encodeURIComponent(message)}`

  const copier = (numero: string) => {
    navigator.clipboard.writeText(numero)
    alert(`Numéro copié : ${numero}`)
  }

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: 20, textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>Passer au payant - 5.000 F / mois</h1>
      <p>Devis illimités pendant 1 mois.</p>

      <div style={{ background: '#fff3cd', padding: 20, borderRadius: 10, textAlign: 'left', margin: '20px 0' }}>
        <p><b>Étape 1 :</b> Envoie 5.000 F par MTN MoMo, Moov Money ou Celtius à l'un de ces numéros :</p>

        {/* MTN - cliquable */}
        <p style={{ fontSize: 20, textAlign: 'center' }}>
          <b>MTN :</b> <a href="tel:+2290196448338" style={{ color: '#000', fontWeight: 'bold' }}>01 96 44 83 38</a>
          <button onClick={() => copier("0196448338")} style={{ marginLeft: 10 }}>📋 Copier</button>
        </p>

        {/* Moov - cliquable */}
        <p style={{ fontSize: 20, textAlign: 'center' }}>
          <b>Moov :</b> <a href="tel:+2290194898272" style={{ color: '#000', fontWeight: 'bold' }}>01 94 89 82 72</a>
          <button onClick={() => copier("0194898272")} style={{ marginLeft: 10 }}>📋 Copier</button>
        </p>

        {/* Celtius - cliquable */}
        <p style={{ fontSize: 20, textAlign: 'center' }}>
          <b>Celtius :</b> <a href="tel:+2290143174642" style={{ color: '#000', fontWeight: 'bold' }}>01 43 17 46 42</a>
          <button onClick={() => copier("0143174642")} style={{ marginLeft: 10 }}>📋 Copier</button>
        </p>

        <p style={{ fontSize: 18, textAlign: 'center' }}><b>Nom d'envoi : GNAMBODE Chédrack Nounagnon</b></p>

        <p><b>Étape 2 :</b> Envoie la capture de ton paiement sur WhatsApp avec ton email en cliquant sur le bouton ci-dessous.</p>
        <p><b>Étape 3 :</b> On t'active en moins de 2h.</p>
      </div>

      <a href={lienWhatsApp} target="_blank" style={{ display: 'block', background: '#16a34a', color: 'white', padding: 16, borderRadius: 10, fontWeight: 'bold', textDecoration: 'none' }}>
        J'ai payé, envoyer la preuve sur WhatsApp
      </a>

      <br />
      <Link href="/dashboard">← Retour au dashboard</Link>
    </div>
  )
}