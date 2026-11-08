"use client"
import Link from "next/link"
import { useEffect, useState } from "react"

const formatMoney = (n: number) => {
  const entier = Math.round(n || 0).toString()
  return entier.replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " F"
}

// ===== PHOTO DANS IndexedDB, PAS DANS localStorage =====
const ouvrirDB = () => new Promise<any>((resolve, reject) => {
  const req = indexedDB.open("devis229-images", 1)
  req.onupgradeneeded = () => { req.result.createObjectStore("images") }
  req.onsuccess = () => resolve(req.result)
  req.onerror = () => reject(req.error)
})
const sauverImageDB = async (cle: string, valeur: string) => {
  const db = await ouvrirDB()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction("images", "readwrite")
    tx.objectStore("images").put(valeur, cle)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}
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

const compresserImage = (file: File, callback: (base64: string) => void) => {
  const reader = new FileReader()
  reader.onload = () => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      const maxLargeur = 700
      const ratio = Math.min(1, maxLargeur / img.width)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio
      const ctx = canvas.getContext("2d")
      if (!ctx) { callback(String(reader.result)); return }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      callback(canvas.toDataURL("image/jpeg", 0.5))
    }
    img.src = String(reader.result)
  }
  reader.readAsDataURL(file)
}

type Entreprise = {
  nom: string; activite: string; quartier: string; tel: string; whatsapp: string; banque: string; responsable: string; banniere: string; logo: string
}

export default function Home() {
  const [devis, setDevis] = useState<any[]>([])
  const [onglet, setOnglet] = useState<"devis" | "entreprise">("devis")
  const [avanceOuverte, setAvanceOuverte] = useState<number | null>(null)
  const [montantAvance, setMontantAvance] = useState("")
  const [entreprise, setEntreprise] = useState<Entreprise>({
    nom: "Ets Faith Christian", activite: "Developpeur web - Seme Okoun", quartier: "Sèmè-Okoun", tel: "0196448338", whatsapp: "0194898272", banque: "", responsable: "GNAMBODE Chedrack N.", banniere: "", logo: "",
  })

  useEffect(() => {
    setDevis(JSON.parse(localStorage.getItem("devis229") || "[]"))
    const s = localStorage.getItem("entreprise229")
    const base = s ? { ...entreprise, ...JSON.parse(s) } : entreprise
    setEntreprise(base)
    // On récupère la photo dans IndexedDB, pas dans localStorage
    lireImageDB("banniere").then((b) => { if (b) setEntreprise((p) => ({ ...p, banniere: b })) })
    lireImageDB("logo").then((l) => { if (l) setEntreprise((p) => ({ ...p, logo: l })) })
    // On nettoie l'ancienne grosse photo qui faisait planter
    try {
      const vieux = s ? JSON.parse(s) : null
      if (vieux?.banniere) {
        const { banniere, logo, ...reste } = vieux
        localStorage.setItem("entreprise229", JSON.stringify(reste))
      }
    } catch {}
  }, [])

  const sauvegarderEntreprise = async () => {
    // On ne met JAMAIS la photo dans localStorage
    const { banniere, logo, ...sansPhoto } = entreprise
    localStorage.setItem("entreprise229", JSON.stringify(sansPhoto))
    if (banniere) await sauverImageDB("banniere", banniere)
    if (logo) await sauverImageDB("logo", logo)
    alert("Entreprise enregistrée ✅ - Plus d'erreur rouge")
  }

  const choisirImage = (champ: "banniere" | "logo") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    compresserImage(file, (base64) => {
      setEntreprise({ ...entreprise, [champ]: base64 })
      alert("Photo choisie ✅ - Clique sur Enregistrer mon entreprise en bas")
    })
  }

  const supprimer = (id: number) => {
    if (!confirm("Supprimer ce devis ?")) return
    const reste = devis.filter(d => d.id !== id)
    localStorage.setItem("devis229", JSON.stringify(reste))
    setDevis(reste)
  }

  const ajouterAvance = (id: number) => {
    const montant = parseFloat(montantAvance.replace(",", ".").replace(/\s/g, "")) || 0
    if (montant <= 0) { alert("Mets le montant de l'avance d'abord"); return }
    const nouveaux = devis.map((d) => d.id === id ? { ...d, avance: (d.avance || 0) + montant } : d)
    localStorage.setItem("devis229", JSON.stringify(nouveaux))
    setDevis(nouveaux)
    setMontantAvance("")
    setAvanceOuverte(null)
    alert(`Avance de ${formatMoney(montant)} ajoutée ✅`)
  }

  return (
    <div className="min-h-screen bg-white pb-10">
      {entreprise.banniere ? (
        <img src={entreprise.banniere} alt="Bannière" className="w-full h-[160px] object-cover" />
      ) : (
        <div className="px-4 pt-6 text-center"><h1 className="text-4xl font-extrabold">Devis229</h1></div>
      )}
      <div className="px-4 pt-4">
        <p className="text-center text-gray-600 leading-snug">Pour les maçons, menuisiers, électriciens, plombiers au Bénin. Fini Word. Ton devis avec ta photo, ton total, ton suivi de paiement.</p>
        <div className="grid grid-cols-3 gap-2 mt-5">
          <div className="bg-black text-white rounded-xl p-3 text-center"><p className="text-2xl font-bold">2 min</p><p className="text-[11px] opacity-70">Pour créer</p></div>
          <div className="bg-black text-white rounded-xl p-3 text-center"><p className="text-2xl font-bold">0 F</p><p className="text-[11px] opacity-70">Pour commencer</p></div>
          <div className="bg-black text-white rounded-xl p-3 text-center"><p className="text-2xl font-bold">100%</p><p className="text-[11px] opacity-70">Sur mesure</p></div>
        </div>
        <Link href="/nouveau-devis" className="block w-full bg-[#e11d48] text-white text-center rounded-xl py-4 font-bold mt-4 text-lg shadow-md">+ Créer un devis</Link>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <button onClick={() => setOnglet("devis")} className={`py-4 rounded-xl font-bold ${onglet === "devis" ? "bg-black text-white" : "bg-gray-200"}`}>Mes Devis</button>
          <button onClick={() => setOnglet("entreprise")} className={`py-4 rounded-xl font-bold ${onglet === "entreprise" ? "bg-black text-white" : "bg-gray-200"}`}>Mon Entreprise</button>
        </div>
        {onglet === "devis" && (
          <div className="mt-6">
            {devis.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl p-4"><p className="font-bold">Exemple : Mr Faith</p><p className="text-sm text-gray-600 mt-1">Ciment + Sable + Gravier + Brique + Main d'oeuvre = <b>290 200 F</b></p><p className="text-sm mt-1">Avance reçue : <span className="text-green-600 font-bold">105 000 F</span> - Reste : <span className="text-red-500 font-bold">185 200 F</span></p></div>
            ) : (
              <div className="space-y-3">
                {devis.map((d) => {
                  const avanceD = d.avance || 0
                  const reste = (d.total || 0) - avanceD
                  const aPaye = avanceD > 0
                  const estOuvert = avanceOuverte === d.id
                  return (
                    <div key={d.id} className="border rounded-2xl p-4">
                      <p className="font-bold">{d.client}</p>
                      <p className="text-sm text-gray-600">{d.date} - Total : <b>{formatMoney(d.total || 0)}</b></p>
                      {aPaye && (<p className="text-sm">Avance : <span className="text-green-600 font-bold">{formatMoney(avanceD)}</span> - Reste : <span className="text-red-500 font-bold">{formatMoney(reste)}</span></p>)}
                      {!estOuvert ? (
                        <button onClick={() => { setAvanceOuverte(d.id); setMontantAvance("") }} className="w-full mt-3 bg-green-500 text-white py-3 rounded-xl font-bold">+ Le client a payé une avance ?</button>
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
                        <Link href={`/nouveau-devis?edit=${d.id}`} className="bg-yellow-400 px-4 py-2 rounded-lg text-sm font-bold">Modifier</Link>
                        <button onClick={() => supprimer(d.id)} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm">Supprimer</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
        {onglet === "entreprise" && (
          <div className="mt-6 space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
              <p className="font-bold">🖼️ Photo / Bannière d'en-tête du PDF</p>
              {entreprise.banniere ? (
                <img src={entreprise.banniere} alt="Bannière" className="w-full h-[140px] object-cover rounded-xl mt-2 border" />
              ) : (
                <p className="text-sm text-red-500 font-bold mt-2">⚠️ Aucune photo pour le moment</p>
              )}
              <label className="block w-full bg-black text-white py-3 rounded-xl font-bold cursor-pointer mt-2">
                Choisir ma bannière
                <input type="file" accept="image/*" onChange={choisirImage("banniere")} className="hidden" />
              </label>
              {entreprise.banniere && <button onClick={async () => { setEntreprise({ ...entreprise, banniere: "" }); const db = await ouvrirDB(); db.transaction("images", "readwrite").objectStore("images").delete("banniere") }} className="text-red-500 text-sm font-bold mt-2">Supprimer la bannière</button>}
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 text-center">
              <p className="font-bold text-sm">Logo rond</p>
              {entreprise.logo && <img src={entreprise.logo} alt="Logo" className="w-16 h-16 object-cover rounded-full mx-auto mt-2" />}
              <label className="block w-full bg-white border py-3 rounded-xl font-bold cursor-pointer mt-2">
                Choisir un logo
                <input type="file" accept="image/*" onChange={choisirImage("logo")} className="hidden" />
              </label>
            </div>
            <input value={entreprise.nom} onChange={(e) => setEntreprise({ ...entreprise, nom: e.target.value })} placeholder="Nom" className="w-full border rounded-xl px-3 py-3" />
            <input value={entreprise.activite} onChange={(e) => setEntreprise({ ...entreprise, activite: e.target.value })} placeholder="Activité" className="w-full border rounded-xl px-3 py-3" />
            <input value={entreprise.quartier} onChange={(e) => setEntreprise({ ...entreprise, quartier: e.target.value })} placeholder="Quartier" className="w-full border rounded-xl px-3 py-3" />
            <input value={entreprise.tel} onChange={(e) => setEntreprise({ ...entreprise, tel: e.target.value })} placeholder="Tél" className="w-full border rounded-xl px-3 py-3" />
            <input value={entreprise.whatsapp} onChange={(e) => setEntreprise({ ...entreprise, whatsapp: e.target.value })} placeholder="WhatsApp" className="w-full border rounded-xl px-3 py-3" />
            <input value={entreprise.banque} onChange={(e) => setEntreprise({ ...entreprise, banque: e.target.value })} placeholder="Compte bancaire" className="w-full border rounded-xl px-3 py-3" />
            <input value={entreprise.responsable} onChange={(e) => setEntreprise({ ...entreprise, responsable: e.target.value })} placeholder="Responsable" className="w-full border rounded-xl px-3 py-3" />
            <button onClick={sauvegarderEntreprise} className="w-full bg-green-500 text-white py-4 rounded-xl font-bold">Enregistrer mon entreprise</button>
          </div>
        )}
      </div>
    </div>
  )
}