"use client"
import { useState, useEffect, Suspense, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { jsPDF } from "jspdf"
import { supabase } from '../../lib/supabase'

type Ligne = { designation: string; qte: string; prix: string }

const formatMoney = (n: number) => {
  const entier = Math.round(n || 0).toString()
  return entier.replace(/\B(?=(\d{3})+(?!\d))/g, " ")
}

const ouvrirDB = () => new Promise<any>((resolve, reject) => {
  const req = indexedDB.open("devis229-images", 1)
  req.onupgradeneeded = () => { req.result.createObjectStore("images") }
  req.onupgradeneeded = () => { req.result.createObjectStore("images") }
  req.onsuccess = () => resolve(req.result)
  req.onerror = () => reject(req.error)
})

const lireImageDB = async (cle: string) => {
  try {
    const db = await ouvrirDB()
    return new Promise<string | null>((resolve) => {
      const req = db.transaction("images", "readonly").objectStore("images").get(cle)
      req.onsuccess = () => resolve(req.result || null)
      req.onerror = () => resolve(null)
    })
  } catch { return null }
}

function NouveauDevisContent({ editId }: { editId: string | null }) {
  const router = useRouter()
  const [client, setClient] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [lignes, setLignes] = useState<Ligne[]>([{ designation: "", qte: "1", prix: "" }])
  const [mainOeuvre, setMainOeuvre] = useState("")
  const [avance, setAvance] = useState("")
  const [entreprise, setEntreprise] = useState<any>({
    nom: "Ets Faith Christian",
    activite: "Developpeur web - Seme Okoun",
    quartier: "Sèmè-Okoun",
    tel: "0196448338",
    whatsapp: "0194898272",
    banque: "",
    responsable: "GNAMBODE Chedrack N.",
    banniere: "",
    logo: "",
  })
  const devisIdEnCours = useRef<string | null>(null)
  const essaiDejaCompte = useRef(false)

  const viderFormulaire = () => {
    devisIdEnCours.current = null
    essaiDejaCompte.current = false
    setClient("")
    setWhatsapp("")
    setLignes([{ designation: "", qte: "1", prix: "" }])
    setMainOeuvre("")
    setAvance("")
  }

  const appliquerDevis = (d: any) => {
    setClient(d.client || d.client_nom || "")
    setWhatsapp(d.whatsapp || "")
    const liste = d.lignes || d.data?.lignes || []
    setLignes(liste.length ? liste.map((l: any) => ({ designation: String(l.designation || ""), qte: String(l.qte ?? "1"), prix: String(l.prix ?? "") })) : [{ designation: "", qte: "1", prix: "" }])
    setMainOeuvre(String(d.mainOeuvre ?? d.data?.mainOeuvre ?? ""))
    setAvance(String(d.avance ?? d.data?.avance ?? ""))
  }

  useEffect(() => {
    const s = localStorage.getItem("entreprise229")
    if (s) setEntreprise((prev: any) => ({ ...prev, ...JSON.parse(s) }))
    lireImageDB("banniere").then((b) => { if (b) setEntreprise((p: any) => ({ ...p, banniere: b })) })
    if (editId) {
      devisIdEnCours.current = editId
      essaiDejaCompte.current = true
      const charger = async () => {
        const { data } = await supabase.from('devis').select('*').eq('id', editId).single()
        if (data) { appliquerDevis({ ...data, ...(data.data || {}) }); return }
        const saved = JSON.parse(localStorage.getItem("devis229") || "[]")
        const found = saved.find((x: any) => String(x.id) === editId)
        if (found) appliquerDevis(found)
      }
      charger()
    } else {
      viderFormulaire()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId])

  const toNumber = (v: any) => {
    if (v === "" || v == null) return 0
    return parseFloat(String(v).replace(",", ".").replace(/\s/g, "")) || 0
  }
  const calc = (q: string, p: string) => toNumber(q) * toNumber(p)
  const totalLignes = lignes.reduce((a, l) => a + calc(l.qte, l.prix), 0)
  const totalGeneral = totalLignes + toNumber(mainOeuvre)
  const montantAvance = toNumber(avance)
  const reste = totalGeneral - montantAvance
  const aPayeAvance = montantAvance > 0

  const updateLigne = (i: number, champ: keyof Ligne, v: string) => {
    const c = [...lignes]
    c[i] = { ...c[i], [champ]: v }
    setLignes(c)
  }

  const [profil, setProfil] = useState<any>(null)
  useEffect(() => {
    const loadProfil = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfil(data)
    }
    loadProfil()
  }, [router])

  const sauvegarderSilencieux = async (): Promise<boolean> => {
    // NOUVEAU 1 : Si bloqué, on ne sauvegarde rien
    if (profil?.est_bloque) { alert("🚫 Compte bloqué, contactez l'admin."); return false }

    // Vérifie si l'abonnement est expiré
    if (profil?.est_payant && profil?.abonnement_fin && new Date(profil.abonnement_fin) < new Date()) {
      await supabase.from('profiles').update({ est_payant: false, abonnement_fin: null }).eq('id', profil.id)
      setProfil({ ...profil, est_payant: false })
      alert("Ton abonnement est terminé. Repasse en payant pour continuer en illimité.")
      router.push('/payer')
      return false
    }
    if (!editId && !devisIdEnCours.current && profil && !profil.est_payant && profil.essais_utilises >= 3) {
      alert('Tu as utilisé tes 3 devis gratuits. Passe au payant pour continuer.')
      router.push('/payer')
      return false
    }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return false }
    const devisData = {
      client: client || "Sans nom",
      whatsapp,
      lignes: lignes.map(l => ({ designation: l.designation, qte: toNumber(l.qte), prix: toNumber(l.prix), montant: calc(l.qte, l.prix) })),
      mainOeuvre: toNumber(mainOeuvre),
      avance: montantAvance,
      total: totalGeneral,
      date: new Date().toLocaleDateString("fr-FR"),
    }
    const localId = editId ? editId : (devisIdEnCours.current || Date.now().toString())
    const devisLocal = { id: localId, ...devisData }
    const saved = JSON.parse(localStorage.getItem("devis229") || "[]")
    localStorage.setItem("devis229", JSON.stringify([devisLocal, ...saved.filter((d: any) => String(d.id) !== String(devisLocal.id))]))
    if (devisIdEnCours.current) {
      await supabase.from('devis').update({ client_nom: client || "Sans nom", total: totalGeneral, avance: montantAvance, data: devisData }).eq('id', devisIdEnCours.current)
    } else {
      const { data: inserted } = await supabase.from('devis').insert({ user_id: user.id, client_nom: client || "Sans nom", total: totalGeneral, avance: montantAvance, data: devisData }).select('id').single()
      if (inserted?.id) devisIdEnCours.current = inserted.id
    }
    if (!editId && !essaiDejaCompte.current && profil && !profil.est_payant) {
      essaiDejaCompte.current = true
      await supabase.from('profiles').update({ essais_utilises: profil.essais_utilises + 1 }).eq('id', profil.id)
      setProfil((p: any) => p ? { ...p, essais_utilises: p.essais_utilises + 1 } : p)
    }
    return true
  }

  const sauvegarder = async () => {
    const ok = await sauvegarderSilencieux()
    if (ok) { devisIdEnCours.current = null; router.push("/dashboard") }
  }

  const envoyerWhatsApp = async () => {
    const ok = await sauvegarderSilencieux()
    if (!ok) return
    if (!whatsapp) { alert("Mets le WhatsApp du client"); return }
    let msg = `*DEVIS - ${entreprise.nom}*\nClient : ${client}\nTél client : ${whatsapp}\n\n`
    lignes.forEach(l => { msg += `- ${l.designation || "Article"} : ${l.qte} x ${formatMoney(toNumber(l.prix))} = ${formatMoney(calc(l.qte, l.prix))}\n` })
    msg += `\nMain d'oeuvre : ${formatMoney(toNumber(mainOeuvre))}\n*TOTAL : ${formatMoney(totalGeneral)}*`
    if (aPayeAvance) msg += `\nAvance reçue : ${formatMoney(montantAvance)}\nReste à payer : ${formatMoney(reste)}`
    const num = whatsapp.replace(/\D/g, "")
    window.open(`https://wa.me/${num.startsWith("229") ? num : "229" + num}?text=${encodeURIComponent(msg)}`, "_blank")
  }

  const telechargerPDF = async () => {
    const ok = await sauvegarderSilencieux()
    if (!ok) return
    let ent: any = entreprise
    try {
      const frais = JSON.parse(localStorage.getItem("entreprise229") || "{}")
      const banniereDB = await lireImageDB("banniere")
      ent = { ...entreprise, ...frais, banniere: banniereDB || entreprise.banniere || frais.banniere || "" }
      setEntreprise(ent)
    } catch {}
    const banniere = ent.banniere || ""
    const doc = new jsPDF()
    const dateStr = new Date().toLocaleDateString("fr-FR")
    let y = 10
    let photoMise = false
    if (banniere) {
      try {
        const format = banniere.includes("data:image/png") ? "PNG" : "JPEG"
        doc.addImage(banniere, format, 10, y, 190, 45)
        photoMise = true
        y = 60
      } catch { photoMise = false }
    }
    if (!photoMise) {
      doc.setTextColor(30, 80, 160)
      doc.setFont("helvetica", "bold"); doc.setFontSize(18)
      doc.text(ent.nom, 105, 18, { align: "center" })
      doc.setFontSize(12); doc.setFont("helvetica", "normal"); doc.setTextColor(80, 80, 80)
      doc.text(ent.activite, 105, 26, { align: "center" })
      doc.setTextColor(30, 80, 160)
      doc.text(`Qtier : ${ent.quartier} Tel : ${ent.tel}`, 105, 33, { align: "center" })
      doc.text(`WhatsApp : ${ent.whatsapp}`, 105, 39, { align: "center" })
      if (ent.banque) doc.text(`Compte bancaire ${ent.banque}`, 105, 45, { align: "center" })
      doc.setDrawColor(30, 80, 160); doc.setLineWidth(0.8); doc.line(10, 49, 200, 49)
      y = 58
    }
    doc.setTextColor(0, 0, 0)
    doc.setFont("helvetica", "bold"); doc.setFontSize(11)
    doc.text(`Client : ${client || "..."}`, 15, y)
    doc.text(`Date : ${dateStr}`, 140, y)
    y += 7
    if (whatsapp) {
      doc.setFont("helvetica", "normal"); doc.setFontSize(11)
      doc.text(`Tél client : ${whatsapp}`, 15, y)
      y += 7
    }
    y += 3
    doc.setTextColor(0, 0, 0)
    doc.setFont("times", "bold"); doc.setFontSize(14)
    doc.text("Liste des matériels", 105, y, { align: "center" })
    doc.line(75, y + 1, 135, y + 1)
    y += 10
    const colX = [10, 75, 115, 155]
    const colW = [65, 40, 40, 45]
    const rowH = 9
    const drawRow = (cells: string[], bold: boolean, yy: number) => {
      doc.setFont("times", bold ? "bold" : "normal"); doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      cells.forEach((c, i) => {
        doc.rect(colX[i], yy, colW[i], rowH)
        const alignRight = i > 0
        doc.text(c, alignRight ? colX[i] + colW[i] - 3 : colX[i] + 3, yy + 6.5, { align: alignRight ? "right" : "left" })
      })
    }
    drawRow(["Désignation", "Quantités", "Prix unitaire", "Montant"], true, y)
    y += rowH
    lignes.forEach((l) => {
      drawRow([String(l.designation || "-").substring(0, 28), String(l.qte || "0"), formatMoney(toNumber(l.prix)), formatMoney(calc(l.qte, l.prix))], false, y)
      y += rowH
      if (y > 260) { doc.addPage(); y = 20 }
    })
    drawRow(["Main d'oeuvre", "", "", formatMoney(toNumber(mainOeuvre))], true, y)
    y += rowH + 4
    doc.setFont("times", "bold"); doc.setFontSize(13)
    doc.text("TOTAL GENERAL", 15, y)
    doc.text(formatMoney(totalGeneral), 190, y, { align: "right" })
    if (aPayeAvance) {
      y += 10
      doc.setFontSize(11)
      doc.text(`Avance recue : ${formatMoney(montantAvance)}`, 15, y)
      doc.text(`Reste a payer : ${formatMoney(reste)}`, 190, y, { align: "right" })
    }
    y += 20
    doc.setFontSize(9); doc.setFont("times", "normal")
    doc.text(`Merci de votre confiance - ${ent.nom} - Responsable : ${ent.responsable}`, 105, y, { align: "center" })
    y += 12
    doc.text("Signature : ____________________", 140, y)
    doc.save(`Devis-${client ? client.replace(/\s+/g, "-") : "Client"}-${dateStr.replace(/\//g, "-")}.pdf`)
  }

  // NOUVEAU 2 : Écran bloqué, juste avant le return principal
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

  return (
    <div className="min-h-screen bg-white pb-10">
      {entreprise.banniere ? (
        <img src={entreprise.banniere} alt="Bannière" className="w-full h-[120px] object-cover" />
      ) : (
        <div className="mx-3 mt-3 bg-yellow-50 border border-yellow-400 rounded-xl p-3 text-center">
          <p className="text-sm font-bold text-yellow-700">⚠️ Pas encore de photo d'en-tête</p>
          <p className="text-xs">Va sur l'accueil → Mon Entreprise → Choisir ma bannière → Enregistrer</p>
        </div>
      )}
      <div className="mx-3 mt-3 rounded-2xl bg-black p-4 space-y-3">
        <input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Nom du client" className="w-full rounded-xl bg-black border border-gray-700 px-4 py-3 text-white outline-none" />
        <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="Téléphone / WhatsApp du client - s'affichera sur la facture" inputMode="tel" className="w-full rounded-xl bg-black border border-gray-700 px-4 py-3 text-white outline-none" />
        {whatsapp && <p className="text-green-400 text-xs">✅ Ce numéro s'affichera sur le PDF : Tél client : {whatsapp}</p>}
      </div>
      <div className="px-4 mt-6 text-center">
        <h2 className="font-bold text-lg underline">Liste des matériels</h2>
        <p className="text-gray-600">Client : {client || "..."} {whatsapp ? `- Tél : ${whatsapp}` : ""} - {new Date().toLocaleDateString("fr-FR")}</p>
      </div>
      <div className="mx-3 mt-4">
        <div className="grid grid-cols-[1fr_55px_85px_70px_20px] gap-1 bg-gray-100 px-2 py-2 font-bold text-sm">
          <span>Désignation</span><span className="text-center">Qté</span><span className="text-center">Prix</span><span className="text-center">Montant</span><span></span>
        </div>
        {lignes.map((ligne, i) => (
          <div key={i} className="grid grid-cols-[1fr_55px_85px_70px_20px] gap-1 px-2 py-2 items-center border-b">
            <input value={ligne.designation} onChange={(e) => updateLigne(i, "designation", e.target.value)} placeholder="Briques de 10" className="w-full rounded-md border border-black px-2 py-2 outline-none" />
            <input type="text" inputMode="numeric" value={ligne.qte} onChange={(e) => updateLigne(i, "qte", e.target.value)} className="w-full rounded-md border border-black px-1 py-2 text-center outline-none" />
            <input type="text" inputMode="numeric" value={ligne.prix} onChange={(e) => updateLigne(i, "prix", e.target.value)} placeholder="0" className="w-full rounded-md border border-black px-1 py-2 text-right outline-none" />
            <span className="text-center font-bold text-sm">{formatMoney(calc(ligne.qte, ligne.prix))}</span>
            <button onClick={() => setLignes(lignes.filter((_, j) => j !== i))} className="text-red-500 font-bold">X</button>
          </div>
        ))}
        <div className="flex justify-between items-center px-2 py-3 border-b">
          <span className="font-bold">Main d'oeuvre</span>
          <input type="text" inputMode="numeric" value={mainOeuvre} onChange={(e) => setMainOeuvre(e.target.value)} placeholder="0" className="w-[160px] rounded-md border border-black px-2 py-2 text-right outline-none" />
        </div>
        <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-3 mt-3">
          <p className="font-bold text-green-700">💰 Le client a payé une avance ?</p>
          <p className="text-xs text-gray-500">Si il n'a rien payé, laisse vide, rien ne s'affichera sur le devis.</p>
          <input type="text" inputMode="numeric" value={avance} onChange={(e) => setAvance(e.target.value)} placeholder="Laisse vide si pas encore payé" className="w-full border-2 border-green-500 rounded-xl px-3 py-4 mt-2 text-xl font-bold text-green-700 outline-none" />
        </div>
        <div className="bg-black text-white rounded-b-2xl px-3 py-4 mt-3 space-y-1">
          <div className="flex justify-between"><span className="font-bold">TOTAL GÉNÉRAL</span><span className="font-bold text-pink-400">{formatMoney(totalGeneral)} F</span></div>
          {aPayeAvance && (
            <>
              <div className="flex justify-between text-sm"><span>Avance reçue</span><span className="text-green-400">{formatMoney(montantAvance)} F</span></div>
              <div className="flex justify-between text-sm"><span>Reste à payer</span><span className="text-red-400 font-bold">{formatMoney(reste)} F</span></div>
            </>
          )}
        </div>
        <button onClick={() => setLignes([...lignes, { designation: "", qte: "1", prix: "" }])} className="w-full mt-4 rounded-xl border border-dashed border-gray-400 py-3">+ Ajouter une ligne</button>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button onClick={sauvegarder} className="rounded-xl bg-pink-600 py-4 font-bold text-white">Enregistrer</button>
          <button onClick={envoyerWhatsApp} className="rounded-xl bg-green-500 py-4 font-bold text-white">WhatsApp</button>
        </div>
        <button onClick={telechargerPDF} className="w-full mt-3 rounded-xl bg-blue-600 text-white py-4 font-bold">Télécharger PDF</button>
        <button onClick={viderFormulaire} className="w-full mt-3 rounded-xl border border-gray-400 py-3 font-bold">🔄 Nouveau devis vierge</button>
      </div>
    </div>
  )
}

function NouveauDevisWrapper() {
  const searchParams = useSearchParams()
  const editId = searchParams.get("edit")
  const nouveau = searchParams.get("nouveau")
  return <NouveauDevisContent key={editId ? `edit-${editId}` : `new-${nouveau || "0"}`} editId={editId} />
}

export default function NouveauDevis() {
  return (<Suspense><NouveauDevisWrapper /></Suspense>)
}