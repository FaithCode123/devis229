"use client";
import { useState, useEffect } from "react";

export default function MesDevis() {
  const [devis, setDevis] = useState<any[]>([]);
  const [montantAjout, setMontantAjout] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("devis229_devis") || "[]");
    // On ajoute montantPaye = 0 pour les anciens devis comme celui de Mr Faith
    const fixed = saved.map((d: any) => ({ ...d, montantPaye: d.montantPaye || 0 }));
    setDevis(fixed);
  }, []);

  const save = (updated: any[]) => {
    setDevis(updated);
    localStorage.setItem("devis229_devis", JSON.stringify(updated));
  };

  const ajouterPaiement = (id: number) => {
    const montant = Number(montantAjout[id] || 0);
    if (!montant) return alert("Mets un montant d'abord ! Ex: 100000");
    const updated = devis.map((d) => {
      if (d.id !== id) return d;
      const nouveauPaye = (d.montantPaye || 0) + montant;
      let statut = "en-attente";
      if (nouveauPaye >= d.total) statut = "paye";
      else if (nouveauPaye > 0) statut = "partiel";
      return { ...d, montantPaye: nouveauPaye, statut };
    });
    save(updated);
    setMontantAjout({ ...montantAjout, [id]: "" });
  };

  const supprimer = (id: number) => {
    if (!confirm("Tu es sûr de vouloir supprimer ce devis ?")) return;
    save(devis.filter((d) => d.id !== id));
  };

  const totalPaye = devis.reduce((s, d) => s + (d.montantPaye || 0), 0);
  const totalReste = devis.reduce((s, d) => s + (d.total - (d.montantPaye || 0)), 0);

  return (
    <div className="max-w-[800px] mx-auto px-5 py-10 text-white">
      <h1 className="text-3xl font-extrabold">Mes Devis</h1>

      <div className="grid grid-cols-2 gap-3 mt-6">
        <div className="bg-green-900/40 border border-green-700 rounded-xl p-4">
          <p className="text-sm text-green-300">Déjà reçu</p>
          <p className="text-2xl font-extrabold">{totalPaye.toLocaleString()} F</p>
        </div>
        <div className="bg-red-900/40 border border-red-700 rounded-xl p-4">
          <p className="text-sm text-red-300">Reste à recevoir</p>
          <p className="text-2xl font-extrabold">{totalReste.toLocaleString()} F</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-6">
        {devis.map((d) => {
          const reste = d.total - (d.montantPaye || 0);
          const pourcent = Math.min(100, Math.round(((d.montantPaye || 0) / d.total) * 100));
          return (
            <div key={d.id} className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-white">{d.clientNom}</h3>
                  <p className="text-zinc-400 text-sm">{d.date} - {d.items.length} articles</p>
                </div>
                <p className="font-extrabold text-xl text-white">{d.total.toLocaleString()} F</p>
              </div>

              <div className="text-sm text-zinc-300 mt-3">
                {d.items.map((it: any, i: number) => (
                  <p key={i}>- {it.nom} : {it.quantite} x {it.prix.toLocaleString()} F</p>
                ))}
                <p>Main d'oeuvre : {d.mainOeuvre.toLocaleString()} F</p>
              </div>

              {/* BARRE DE PAIEMENT */}
              <div className="mt-4">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-green-400">Payé : {(d.montantPaye || 0).toLocaleString()} F</span>
                  <span className="text-red-400">Reste : {reste.toLocaleString()} F</span>
                </div>
                <div className="w-full h-3 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                  <div className={`h-full ${pourcent === 100 ? "bg-green-500" : "bg-yellow-500"}`} style={{ width: `${pourcent}%` }} />
                </div>
                <p className="text-center text-xs mt-1 text-zinc-400">
                  {pourcent === 100 ? "✅ Payé en totalité" : pourcent === 0 ? "⏳ Rien payé" : `🟡 Payé à ${pourcent}% - Avance reçue`}
                </p>
              </div>

              {/* AJOUTER UN PAIEMENT */}
              <div className="flex gap-2 mt-4">
                <input
                  type="number"
                  value={montantAjout[d.id] || ""}
                  onChange={(e) => setMontantAjout({ ...montantAjout, [d.id]: e.target.value })}
                  placeholder="Ex: 100000 (avance)"
                  className="flex-1 bg-black text-white placeholder:text-zinc-500 border border-zinc-600 rounded-lg p-3"
                />
                <button onClick={() => ajouterPaiement(d.id)} className="bg-green-600 hover:bg-green-500 font-bold px-4 rounded-lg">
                  + Paiement
                </button>
              </div>

              {/* BOUTON SUPPRIMER VISIBLE */}
              <button onClick={() => supprimer(d.id)} className="w-full mt-4 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg border border-red-400">
                🗑️ Supprimer ce devis
              </button>
            </div>
          );
        })}
      </div>

      <a href="/nouveau-devis" className="block text-center bg-pink-600 font-bold rounded-lg p-4 mt-6 text-white">+ Nouveau devis</a>
    </div>
  );
}