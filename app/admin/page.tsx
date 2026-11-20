"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
const ADMIN_EMAIL = "chedrackgnambode5@gmail.com"
export default function AdminPage() {
  const [clients, setClients] = useState<any[]>([])
  const [recherche, setRecherche] = useState("")
  const [loading, setLoading] = useState(true)
  const [pasAdmin, setPasAdmin] = useState(false)
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.email !== ADMIN_EMAIL) {
        setPasAdmin(true)
        setLoading(false)
        return
      }
     const { data, error } = await supabase.from("profiles").select("*")
      console.log("MES CLIENTS :", data, error)
      setClients(data || [])
      setLoading(false)
    }
    init()
  }, [])

  // NOUVEAU : Calculer les jours restants pour un client
  const joursRestants = (c: any) => {
    const fin = c.abonnement_fin || c.date_fin_abonnement
    if (!fin) return null
    return Math.ceil((new Date(fin).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  }

  // NOUVEAU : Nombre de clients qui expirent dans 3 jours
  const nbExpirent = clients.filter(c => {
    const j = joursRestants(c)
    return j !== null && j <= 3 && j >= 0
  }).length

  // Passer Payant avec la durée que TU choisis
  const passerPayant = async (id: string, jours: number = 30, _label?: string) => {
  const fin = new Date()
  fin.setDate(fin.getDate() + jours)
  const dateFin = fin.toISOString().split('T')[0]
  const { error } = await supabase.rpc('admin_changer_abonnement', {
    p_user_id: id,
    p_est_payant: true,
    p_fin_abonnement: dateFin
  })
  if (error) { alert("Erreur : " + error.message); return }
  setClients(prev => prev.map(c => c.id === id ? { ...c, est_payant: true, abonnement_fin: dateFin, date_fin_abonnement: dateFin } : c))
}
  const passerGratuit = async (id: string) => {
  const { error } = await supabase.rpc('admin_changer_abonnement', { 
    p_user_id: id, 
    p_est_payant: false, 
    p_fin_abonnement: null 
  })
  if (error) { alert("Erreur : " + error.message); return }
    setClients(prev => prev.map(c => c.id === id ? { ...c, est_payant: false, abonnement_fin: null, date_fin_abonnement: null } : c))
  }
  // NOUVEAU : Réinitialiser les essais à 0
  const resetEssais = async (id: string) => {
    if (!confirm("Remettre les essais de ce client à 0 ?")) return
    const { error } = await supabase.rpc('reinitialiser_essais_client', { p_user_id: id })
    if (error) { alert("Erreur : " + error.message); return }
    setClients(prev => prev.map(c => c.id === id ? { ...c, essais_utilises: 0 } : c))
  }
  const toggleBloquer = async (id: string, actuel: boolean) => {
  const { error } = await supabase.rpc('admin_bloquer_client', {
    p_user_id: id,
    p_bloque: !actuel
  })
  if (error) { alert("Erreur : " + error.message); return }
  setClients(prev => prev.map(c => c.id === id ? { ...c, est_bloque: !actuel } : c))
}
  const filtres = clients.filter(c => ((c.email || "") + " " + (c.nom_entreprise || "")).toLowerCase().includes(recherche.toLowerCase()) )
  if (loading) return <div style={{ padding: 30 }}>Chargement...</div>
  if (pasAdmin) return <div style={{ padding: 30, color: "red" }}>Tu n'es pas Admin</div>
  return (
    <div style={{ padding: 30, maxWidth: 900, margin: "0 auto", fontFamily: "sans-serif" }}>
      <a href="/admin/rappels" style={{ background: nbExpirent > 0 ? "#FECACA" : "#FEF3C7", border: "1px solid #F59E0B", padding: "12px", borderRadius: "10px", display: "block", textAlign: "center", fontWeight: "bold", color: "#92400E", textDecoration: "none", marginBottom: "15px" }}>
        {nbExpirent > 0 ? `🚨 ${nbExpirent} abonnement(s) expire(nt) dans 3 jours - Voir les rappels →` : `⚠️ Voir les abonnements qui expirent dans 3 jours →`}
      </a>
      <h1>👑 Mon Admin - Mes Clients</h1>
      <p style={{ color: "#666" }}>Connecté : {ADMIN_EMAIL} | Total : {clients.length} clients | Affichés : {filtres.length}</p>
      <input value={recherche} onChange={(e) => setRecherche(e.target.value)} placeholder="Rechercher un client par email..." style={{ width: "100%", padding: 14, borderRadius: 10, border: "1px solid #ccc", fontSize: 16, marginBottom: 20 }} />
      {filtres.map((c) => {
        const j = joursRestants(c)
        const expireBientot = j !== null && j <= 3 && j >= 0
        const expire = j !== null && j < 0
        const dateFin = c.abonnement_fin || c.date_fin_abonnement
        return (
        <div key={c.id} style={{ border: expireBientot ? "2px solid #F59E0B" : "1px solid #eee", borderRadius: 12, padding: 16, marginBottom: 12, background: expireBientot ? "#FFFBEB" : "#fff" }}>
          <div style={{ fontWeight: "bold", fontSize: 17 }}>{c.email}</div>
          <div style={{ color: "#666" }}>{c.nom_entreprise || "Sans nom"}</div>
          <div style={{ margin: "8px 0", fontSize: 14 }}>
            {c.est_payant ? "✅ Payant" : "🆓 Gratuit"} | Essais : {c.essais_utilises ?? 0} | Fin : {dateFin ? new Date(dateFin).toLocaleDateString() : "—"} | {c.est_bloque ? "🚫 Bloqué" : "🟢 Actif"}
            {expireBientot && <span style={{ color: "#D97706", fontWeight: "bold" }}> | ⚠️ Expire dans {j} jours</span>}
            {expire && <span style={{ color: "#DC2626", fontWeight: "bold" }}> | ❌ Expiré depuis {-j} jours</span>}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {c.est_payant ? (
              <button onClick={() => passerGratuit(c.id)} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "#f1f1f1", cursor: "pointer" }}>Passer Gratuit</button>
            ) : (
              <>
                <button onClick={() => passerPayant(c.id, 30, "1 mois")} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "#16a34a", color: "#fff", cursor: "pointer" }}>Payant 1 mois</button>
                <button onClick={() => passerPayant(c.id, 90, "3 mois")} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "#15803d", color: "#fff", cursor: "pointer" }}>Payant 3 mois</button>
                <button onClick={() => passerPayant(c.id, 180, "6 mois")} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "#166534", color: "#fff", cursor: "pointer" }}>Payant 6 mois</button>
                <button onClick={() => passerPayant(c.id, 365, "1 an")} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "#14532d", color: "#fff", cursor: "pointer" }}>Payant 1 an</button>
              </>
            )}
            <button onClick={() => resetEssais(c.id)} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "#f59e0b", color: "#fff", cursor: "pointer" }}>🔄 Réinitialiser Essais</button>
            <button onClick={() => toggleBloquer(c.id, c.est_bloque)} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: c.est_bloque ? "#16a34a" : "#dc2626", color: "#fff", cursor: "pointer" }}>
              {c.est_bloque ? "Débloquer" : "Bloquer"}
            </button>
          </div>
        </div>
        )
      })}
    </div>
  )
}