"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { jsPDF } from "jspdf"

type Ligne = {
  conception: string
  qte: string
  prix: string
}

function NouveauDevisContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get("edit")

  const [client, setClient] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [lignes, setLignes] = useState<Ligne[]>([
    { conception: "", qte: "1", prix: "" },
  ])
  const [mainOeuvre, setMainOeuvre] = useState("")

  // Charger si on modifie un devis existant
  useEffect(() => {
    if (editId) {
      const saved = JSON.parse(localStorage.getItem("devis229") || "[]")
      const found = saved.find((d: any) => String(d.id) === editId)
      if (found) {
        setClient(found.client || "")
        setWhatsapp(found.whatsapp || "")
        setLignes(found.lignes?.map((l: any) => ({
          conception: String(l.conception || ""),
          qte: String(l.qte ?? "1"),
          prix: String(l.prix ?? ""),
        })) || [{ conception: "", qte: "1", prix: "" }])
        setMainOeuvre(String(found.mainOeuvre ?? ""))
      }
    }
  }, [editId])

  const toNumber = (v: any) => {
    if (v === "" || v === null || v === undefined) return 0
    return parseFloat(String(v).replace(",", ".").replace(/\s/g, "")) || 0
  }

  const calcMontant = (qte: string, prix: string) => {
    return toNumber(qte) * toNumber(prix)
  }

  const totalLignes = lignes.reduce((acc, l) => acc + calcMontant(l.qte, l.prix), 0)
  const totalGeneral = totalLignes + toNumber(mainOeuvre)

  const formatMoney = (n: number) => {
    return n.toLocaleString("fr-FR") + " °F"
  }

  const updateLigne = (index: number, champ: keyof Ligne, valeur: string) => {
    const copy = [...lignes]
    copy[index] = { ...copy[index], [champ]: valeur }
    setLignes(copy)
  }

  const ajouterLigne = () => {
    setLignes([...lignes, { conception: "", qte: "1", prix: "" }])
  }

  const supprimerLigne = (index: number) => {
    if (lignes.length === 1) return
    setLignes(lignes.filter((_, i) => i !== index))
  }

  const sauvegarder = () => {
    const devis = {
      id: editId ? Number(editId) : Date.now(),
      client: client || "Sans nom",
      whatsapp,
      lignes: lignes.map(l => ({
        conception: l.conception,
        qte: toNumber(l.qte),
        prix: toNumber(l.prix),
        montant: calcMontant(l.qte, l.prix),
      })),
      mainOeuvre: toNumber(mainOeuvre),
      total: totalGeneral,
      date: new Date().toLocaleDateString("fr-FR"),
    }
    const saved = JSON.parse(localStorage.getItem("devis229") || "[]")
    const filtered = saved.filter((d: any) => String(d.id) !== String(devis.id))
    localStorage.setItem("devis229", JSON.stringify([devis, ...filtered]))
    router.push("/")
  }

  const envoyerWhatsApp = () => {
    if (!whatsapp) { alert("Mets le WhatsApp du client d'abord"); return }
    let msg = `*DEVIS - Ets Faith Christian*\n`
    msg += `Client : ${client}\nDate : ${new Date().toLocaleDateString("fr-FR")}\n\n`
    lignes.forEach(l => {
      msg += `- ${l.conception || "Article"} : ${l.qte} x ${formatMoney(toNumber(l.prix))} = ${formatMoney(calcMontant(l.qte, l.prix))}\n`
    })
    msg += `\nMain d'oeuvre : ${formatMoney(toNumber(mainOeuvre))}\n`
    msg += `*TOTAL : ${formatMoney(totalGeneral)}*`
    const num = whatsapp.replace(/\D/g, "")
    const finalNum = num.startsWith("229") ? num : "229" + num
    window.open(`https://wa.me/${finalNum}?text=${encodeURIComponent(msg)}`, "_blank")
  }

  // ===== VRAI TELECHARGEMENT PDF COMME CV229 =====
  const telechargerPDF = () => {
    const doc = new jsPDF()
    const dateStr = new Date().toLocaleDateString("fr-FR")

    // En-tête
    doc.setFont("helvetica", "bold")
    doc.setFontSize(16)
    doc.text("Ets Faith Christian", 105, 18, { align: "center" })
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.text("Developpeur web - Seme Okoun", 105, 24, { align: "center" })
    doc.text("Tel. : 0196448338  -  WhatsApp : 0194898272", 105, 29, { align: "center" })
    doc.text("Banque : ", 105, 34, { align: "center" })
    doc.line(15, 38, 195, 38)

    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.text(`Client : ${client || "..."}`, 15, 48)
    doc.text(`Date : ${dateStr}`, 15, 54)

    // Tableau
    let y = 66
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text("Conception", 15, y)
    doc.text("Qte", 95, y)
    doc.text("Prix", 125, y)
    doc.text("Montant", 165, y)
    doc.line(15, y + 2, 195, y + 2)
    y += 10

    doc.setFont("helvetica", "normal")
    lignes.forEach((l) => {
      doc.text(String(l.conception || "-").substring(0, 30), 15, y)
      doc.text(String(l.qte || "0"), 95, y)
      doc.text(formatMoney(toNumber(l.prix)), 125, y)
      doc.text(formatMoney(calcMontant(l.qte, l.prix)), 165, y)
      y += 8
      if (y > 260) { doc.addPage(); y = 20 }
    })

    y += 4
    doc.setFont("helvetica", "bold")
    doc.text("Main d'oeuvre", 15, y)
    doc.text(formatMoney(toNumber(mainOeuvre)), 165, y)
    y += 6
    doc.line(15, y, 195, y)
    y += 10
    doc.setFontSize(12)
    doc.text("TOTAL GENERAL", 15, y)
    doc.text(formatMoney(totalGeneral), 165, y)

    y += 18
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.text("Merci de votre confiance - Ets Faith Christian - Responsable : GNAMBODE Chedrack N.", 105, y, { align: "center" })
    y += 12
    doc.text("Signature : ____________________", 130, y)

    const nomFichier = `Devis-${client ? client.replace(/\s+/g, "-") : "Client"}-${dateStr.replace(/\//g, "-")}.pdf`
    doc.save(nomFichier)
  }

  return (
    <div className="min-h-screen bg-white pb-10">
      {/* Formulaire client */}
      <div className="mx-3 mt-3 rounded-2xl bg-black p-4 space-y-3">
        <input
          value={client}
          onChange={(e) => setClient(e.target.value)}
          placeholder="Nom du client : Ex : M. Faith"
          className="w-full rounded-xl bg-black border border-gray-700 px-4 py-3 text-white placeholder:text-gray-500 outline-none"
        />
        <input
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="WhatsApp du client : Ex: 0196000000"
          inputMode="tel"
          className="w-full rounded-xl bg-black border border-gray-700 px-4 py-3 text-white placeholder:text-gray-500 outline-none"
        />
      </div>

      <div className="px-4 mt-6 text-center">
        <h2 className="font-bold text-lg">DEVIS - {new Date().toLocaleDateString("fr-FR")}</h2>
        <p className="text-gray-600">Client : {client || "..."}</p>
      </div>

      {/* Tableau saisie */}
      <div className="mx-3 mt-4">
        <div className="grid grid-cols-[1fr_55px_85px_70px_20px] gap-1 bg-gray-100 px-2 py-2 font-bold text-sm">
          <span>Conception</span><span className="text-center">Qté</span><span className="text-center">Prix</span><span className="text-center">Montant</span><span></span>
        </div>

        {lignes.map((ligne, i) => (
          <div key={i} className="grid grid-cols-[1fr_55px_85px_70px_20px] gap-1 px-2 py-2 items-center border-b">
            <input
              value={ligne.conception}
              onChange={(e) => updateLigne(i, "conception", e.target.value)}
              placeholder="Ciment"
              className="w-full rounded-md border border-black px-2 py-2 outline-none"
            />
            <input
              type="text"
              inputMode="numeric"
              value={ligne.qte}
              onChange={(e) => updateLigne(i, "qte", e.target.value)}
              className="w-full rounded-md border border-black px-1 py-2 text-center outline-none"
            />
            <input
              type="text"
              inputMode="numeric"
              value={ligne.prix}
              onChange={(e) => updateLigne(i, "prix", e.target.value)}
              placeholder="0"
              className="w-full rounded-md border border-black px-1 py-2 text-right outline-none"
            />
            <span className="text-center font-bold text-sm">{formatMoney(calcMontant(ligne.qte, ligne.prix))}</span>
            <button onClick={() => supprimerLigne(i)} className="text-red-500 font-bold">X</button>
          </div>
        ))}

        <div className="flex justify-between items-center px-2 py-3">
          <span className="font-bold">Main d'oeuvre</span>
          <input
            type="text"
            inputMode="numeric"
            value={mainOeuvre}
            onChange={(e) => setMainOeuvre(e.target.value)}
            placeholder="0"
            className="w-[160px] rounded-md border border-black px-2 py-2 text-right outline-none"
          />
        </div>

        <div className="flex justify-between items-center bg-black text-white rounded-b-2xl px-3 py-4">
          <span className="font-bold text-lg">TOTAL GÉNÉRAL</span>
          <span className="font-bold text-lg text-pink-500">{formatMoney(totalGeneral)}</span>
        </div>

        <button onClick={ajouterLigne} className="w-full mt-4 rounded-xl border border-dashed border-gray-400 py-3">+ Ajouter une ligne</button>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <button onClick={sauvegarder} className="rounded-xl bg-pink-600 py-4 font-bold">Enregistrer le devis</button>
          <button onClick={envoyerWhatsApp} className="rounded-xl bg-green-500 py-4 font-bold">Envoyer sur WhatsApp</button>
        </div>

        <button onClick={telechargerPDF} className="w-full mt-3 rounded-xl bg-blue-600 text-white py-4 font-bold">
          Télécharger PDF
        </button>
      </div>
    </div>
  )
}

export default function NouveauDevis() {
  return (
    <Suspense>
      <NouveauDevisContent />
    </Suspense>
  )
}