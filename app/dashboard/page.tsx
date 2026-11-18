'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

const formatMoney = (n: number) => {
  const entier = Math.round(n || 0).toString()
  return entier.replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " F"
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [profil, setProfil] = useState<any>(null)
  const [devis, setDevis] = useState<any[]>([])
  const [avanceOuverte, setAvanceOuverte] = useState<string | null>(null)
  const [montantAvance, setMontantAvance] = useState("")
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (!user) return router.push('/login')
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfil(p)
      const { data: d } = await supabase.from('devis').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      setDevis(d || [])
    }
    load()
  }, [])

  const ajouterAvance = async (id: string) => {
    const montant = parseFloat(montantAvance.replace(",", ".").replace(/\s/g, "")) || 0
    if (montant <= 0) { alert("Mets le montant de l'avance d'abord"); return }
    const devisActuel = devis.find(d => d.id === id)
    const nouvelleAvance = (devisActuel.avance || 0) + montant
    await supabase.from('devis').update({ avance: nouvelleAvance }).eq('id', id)
    setDevis(devis.map(d => d.id === id ? { ...d, avance: nouvelleAvance } : d))
    setMontantAvance("")
    setAvanceOuverte(null)
    alert(`Avance de ${formatMoney(montant)} ajoutée ✅`)
  }

  const supprimer = async (id: string) => {
    if (!confirm("Supprimer ce devis ?")) return
    await supabase.from('devis').delete().eq('id', id)
    setDevis(devis.filter(d => d.id !== id))
  }

  if (!profil) return <p className="p-8 text-center">Chargement...</p>

// NOUVEAU : Si bloqué, on bloque tout
if (profil?.est_bloque) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow text-center max-w-md">
        <div className="text-5xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold mb-2">Compte bloqué</h1>
        <p className="text-gray-600 mb-4">
          Ton compte a été bloqué par l'admin.<br />
          Contacte le <b>94898272 (WhatsApp)</b> pour le débloquer.
        </p>
        <a
          href="https://wa.me/22994898272?text=Bonjour, mon compte devis229 est bloqué, aidez-moi à le débloquer"
          target="_blank"
          className="block bg-green-500 text-white px-6 py-3 rounded-lg font-bold mb-3"
        >
          💬 Contacter sur WhatsApp
        </a>
        <button
          onClick={async () => { await supabase.auth.signOut(); window.location.href = "/login" }}
          className="bg-black text-white px-6 py-3 rounded-lg"
        >
          Se déconnecter
        </button>
      </div>
    </div>
  )
}

const restants = 3 - profil.essais_utilises

  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-md mx-auto">
      {profil?.email === "chedrackgnambode5@gmail.com" && (
  <a href="/admin" className="block bg-black text-white text-center py-3 rounded-xl font-bold mb-3">
    👑 Aller à mon Admin
  </a>
)}
      <h1 className="text-2xl font-bold">Bonjour {profil.nom_entreprise} 👋</h1>

      <div className="bg-white p-6 rounded-xl shadow mt-4 text-center">
        {profil.est_payant ? (
          <p className="text-green-600 font-bold text-lg">Compte Payant ✅ - Illimité</p>
        ) : (
          <>
            <p className="text-3xl font-bold">{restants} / 3</p>
            <p className="text-gray-500">devis gratuits restants</p>
            <p className="text-sm mt-2">Tu as utilisé {profil.essais_utilises} devis</p>
          </>
        )}
      </div>

      {!profil.est_payant && restants <= 0 && (
        <button onClick={()=>router.push('/payer')} className="w-full bg-yellow-400 p-4 rounded font-bold mt-4">
          Passer au payant - 5.000 F / mois
        </button>
      )}

      <button onClick={()=>router.push('/nouveau-devis?nouveau=' + Date.now())} className="w-full bg-green-600 text-white p-4 rounded font-bold mt-4">
        + Créer un devis
      </button>
      <button onClick={()=>router.push('/mon-entreprise')} className="w-full bg-white border p-4 rounded font-bold mt-3">🏢 Mon Entreprise / Logo</button>

      <h2 className="font-bold text-lg mt-6 mb-2">Mes Devis</h2>

      {devis.length === 0 ? (
        <div className="bg-white rounded-2xl p-4">
          <p className="font-bold">Exemple : Mr Faith</p>
          <p className="text-sm text-gray-600 mt-1">Ciment + Sable + Gravier + Brique + Main d'oeuvre = <b>290 200 F</b></p>
          <p className="text-sm mt-1">Avance reçue : <span className="text-green-600 font-bold">105 000 F</span> - Reste : <span className="text-red-500 font-bold">185 200 F</span></p>
          <p className="text-xs text-gray-400 mt-2">Tes nouveaux devis apparaîtront ici après création.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {devis.map((d) => {
            const avanceD = d.avance || 0
            const reste = (d.total || 0) - avanceD
            const estOuvert = avanceOuverte === d.id
            return (
              <div key={d.id} className="bg-white border rounded-2xl p-4">
                <p className="font-bold">{d.client_nom || "Sans nom"}</p>
                <p className="text-sm text-gray-600">Total : <b>{formatMoney(d.total || 0)}</b></p>
                {avanceD > 0 && (
                  <p className="text-sm">Avance : <span className="text-green-600 font-bold">{formatMoney(avanceD)}</span> - Reste : <span className="text-red-500 font-bold">{formatMoney(reste)}</span></p>
                )}
                {!estOuvert ? (
                  <button onClick={() => { setAvanceOuverte(d.id); setMontantAvance("") }} className="w-full mt-3 bg-green-500 text-white py-3 rounded-xl font-bold">
                    + Le client a payé une avance ?
                  </button>
                ) : (
                  <div className="mt-3 bg-green-50 border border-green-300 rounded-xl p-3">
                    <p className="font-bold text-sm text-green-700">Combien il t'a donné ?</p>
                    <input type="text" inputMode="numeric" value={montantAvance} onChange={(e) => setMontantAvance(e.target.value)} placeholder="Ex : 50000" autoFocus className="w-full border-2 border-green-500 rounded-xl px-3 py-3 mt-2 text-lg font-bold outline-none" />
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <button onClick={() => ajouterAvance(d.id)} className="bg-green-600 text-white py-3 rounded-xl font-bold">Enregistrer l'avance</button>
                      <button onClick={() => setAvanceOuverte(null)} className="bg-gray-200 py-3 rounded-xl font-bold">Annuler</button>
                    </div>
                  </div>
                )}
                <div className="flex gap-2 mt-3">
                  <button onClick={() => router.push(`/nouveau-devis?edit=${d.id}`)} className="bg-yellow-400 px-4 py-2 rounded-lg text-sm font-bold">Modifier</button>
                  <button onClick={() => supprimer(d.id)} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm">Supprimer</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <button onClick={async()=>{ await supabase.auth.signOut(); router.push('/login') }} className="w-full text-gray-500 p-3 mt-4 text-sm">Se déconnecter</button>
    </div>
  )
}