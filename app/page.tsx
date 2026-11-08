"use client"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function Home() {
  const [devis, setDevis] = useState<any[]>([])

  useEffect(() => {
    setDevis(JSON.parse(localStorage.getItem("devis229") || "[]"))
  }, [])

  const supprimer = (id: number) => {
    if (!confirm("Supprimer ce devis ?")) return
    const reste = devis.filter(d => d.id !== id)
    localStorage.setItem("devis229", JSON.stringify(reste))
    setDevis(reste)
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <h1 className="text-2xl font-bold text-center">Devis229</h1>
      <p className="text-center text-gray-500 mb-4">Ets Faith Christian</p>

      <Link href="/nouveau-devis" className="block w-full bg-black text-white text-center rounded-xl py-4 font-bold mb-6">
        + Créer un devis
      </Link>

      <div className="space-y-3">
        {devis.length === 0 && <p className="text-center text-gray-400">Aucun devis pour le moment</p>}
        {devis.map((d) => (
          <div key={d.id} className="border rounded-xl p-3 flex justify-between items-center">
            <div>
              <p className="font-bold">{d.client}</p>
              <p className="text-sm text-gray-500">{d.date} - {(d.total || 0).toLocaleString("fr-FR")} °F</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/nouveau-devis?edit=${d.id}`} className="bg-yellow-400 px-3 py-2 rounded-lg text-sm font-bold">Modifier</Link>
              <button onClick={() => supprimer(d.id)} className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm">X</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}