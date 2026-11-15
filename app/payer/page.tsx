"use client"
import Link from "next/link"

export default function Payer() {
  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: 20, textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>Passer au payant - 5.000 F / mois</h1>
      <p>Devis illimités pendant 1 mois.</p>

      <div style={{ background: '#fff3cd', padding: 20, borderRadius: 10, textAlign: 'left', margin: '20px 0' }}>
        <p><b>Étape 1 :</b> Envoie 5.000 F par MTN MoMo / Moov Money au :</p>
        <p style={{ fontSize: 22, textAlign: 'center' }}><b>(MTN)+229 01 96 44 83 38 ou (Moov)+229 01 94 89 82 72</b></p>
        <p><b>Étape 2 :</b> Envoie la capture de ton paiement sur WhatsApp au même numéro avec ton email.</p>
        <p><b>Étape 3 :</b> On t'active en moins de 2h.</p>
      </div>

      <a href="https://wa.me/2290196448338?text=Bonjour, j'ai payé 5000F pour Devis229" style={{ display: 'block', background: '#25D366', color: 'white', padding: 15, borderRadius: 10, textDecoration: 'none', fontWeight: 'bold' }}>
        J'ai payé, envoyer la preuve sur WhatsApp
      </a>

      <br />
      <Link href="/dashboard">← Retour au dashboard</Link>
    </div>
  )
}