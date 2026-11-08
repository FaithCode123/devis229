"use client";
import { useState, useEffect, Suspense } from "react";

type Item = { nom: string; quantite: number; prix: number };

function NouveauDevisContent() {
  const [entreprise, setEntreprise] = useState<any>(null);
  const [clientNom, setClientNom] = useState("");
  const [clientTel, setClientTel] = useState("");
  const [items, setItems] = useState<Item[]>([
    { nom: "", quantite: 1, prix: 0 },
  ]);
  const [mainOeuvre, setMainOeuvre] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("devis229_entreprise");
    if (saved) setEntreprise(JSON.parse(saved));
  }, []);

  const totalItems = items.reduce((sum, it) => sum + Math.max(1, it.quantite) * Math.max(0, it.prix), 0);
  const totalGeneral = totalItems + Math.max(0, mainOeuvre);

  // Minimum 1 pour quantité, jamais négatif pour prix
  const updateItem = (index: number, field: string, value: any) => {
    const copy = [...items];
    if (field === "nom") {
      // @ts-ignore
      copy[index][field] = value;
    } else {
      let n = Number(value);
      if (isNaN(n)) n = 0;
      if (field === "quantite") n = Math.max(1, Math.floor(n));
      if (field === "prix") n = Math.max(0, n);
      // @ts-ignore
      copy[index][field] = n;
    }
    setItems(copy);
  };

  const ajouterLigne = () => setItems([...items, { nom: "", quantite: 1, prix: 0 }]);
  const supprimerLigne = (index: number) => setItems(items.filter((_, i) => i !== index));

  const enregistrer = () => {
    if (!clientNom) return alert("Mets le nom du client d'abord !");
    if (items.some((it) => !it.nom.trim())) return alert("Il y a une ligne sans nom !");
    const devis = {
      id: Date.now(),
      date: new Date().toLocaleDateString("fr-FR"),
      entreprise, clientNom, clientTel, items, mainOeuvre: Math.max(0, mainOeuvre),
      total: totalGeneral, montantPaye: 0, statut: "en-attente",
    };
    const anciens = JSON.parse(localStorage.getItem("devis229_devis") || "[]");
    localStorage.setItem("devis229_devis", JSON.stringify([devis, ...anciens]));
    alert(`Devis de ${totalGeneral.toLocaleString()} F enregistré pour ${clientNom}`);
  };

  const envoyerWhatsApp = () => {
    const lignes = items.map((it) => `- ${it.nom} : ${it.quantite} x ${it.prix} = ${(it.quantite * it.prix).toLocaleString()} F`).join("\n");
    const message = `Bonjour ${clientNom}, voici votre devis ${entreprise?.nom || ""} :\n\n${lignes}\nMain d'oeuvre : ${mainOeuvre.toLocaleString()} F\nTOTAL : ${totalGeneral.toLocaleString()} F`;
    window.open(`https://wa.me/229${clientTel.replace(/\s/g, "")}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="max-w-[800px] mx-auto px-5 py-10">
      {/* PARTIE ECRAN - cachée à l'impression */}
      <div className="print:hidden">
        <h1 className="text-3xl font-extrabold">Créer un devis</h1>
        <p className="text-zinc-400 mt-1">Entreprise : {entreprise?.nom || "Va d'abord sur Mon Entreprise"}</p>

        <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h2 className="font-bold mb-3">Client</h2>
          <div className="grid grid-cols-2 gap-3">
            <input value={clientNom} onChange={(e) => setClientNom(e.target.value)} placeholder="Nom du client : Ex: Mr Faith" className="bg-black text-white placeholder:text-zinc-500 border border-zinc-700 rounded-lg p-3 col-span-2" />
            <input value={clientTel} onChange={(e) => setClientTel(e.target.value)} placeholder="WhatsApp du client : Ex: 0196000000" className="bg-black text-white placeholder:text-zinc-500 border border-zinc-700 rounded-lg p-3 col-span-2" />
          </div>
        </div>
      </div>

      {/* VERSION ECRAN - pour modifier */}
      <div className="mt-5 bg-white text-black rounded-2xl overflow-hidden print:hidden">
        <div className="p-4">
          <h3 className="text-center font-bold">DEVIS - {new Date().toLocaleDateString("fr-FR")}</h3>
          <p className="text-center text-sm">Client : {clientNom || "..."}</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-zinc-100">
            <tr><th className="text-left p-3">Désignation</th><th className="p-3">Qté</th><th className="p-3">Prix</th><th className="p-3 text-right">Montant</th><th></th></tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i} className="border-t">
                <td className="p-2"><input value={it.nom} onChange={(e) => updateItem(i, "nom", e.target.value)} placeholder="Ex: Ciment" className="w-full border rounded p-2" /></td>
                <td className="p-2"><input type="number" min={1} value={it.quantite} onChange={(e) => updateItem(i, "quantite", e.target.value)} className="w-[70px] border rounded p-2 text-center" /></td>
                <td className="p-2"><input type="number" min={0} value={it.prix} onChange={(e) => updateItem(i, "prix", e.target.value)} className="w-[100px] border rounded p-2 text-right" /></td>
                <td className="p-2 text-right font-bold">{(Math.max(1, it.quantite) * Math.max(0, it.prix)).toLocaleString()} F</td>
                <td className="p-2"><button onClick={() => supprimerLigne(i)} className="text-red-500">X</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 flex justify-between items-center border-t">
          <span className="font-bold">Main d'oeuvre</span>
          <input type="number" min={0} value={mainOeuvre} onChange={(e) => setMainOeuvre(Math.max(0, Number(e.target.value)))} className="w-[140px] border rounded p-2 text-right font-bold" />
        </div>
        <div className="p-4 bg-zinc-900 text-white flex justify-between">
          <span className="font-extrabold text-lg">TOTAL GÉNÉRAL</span>
          <span className="font-extrabold text-xl text-pink-400">{totalGeneral.toLocaleString()} F</span>
        </div>
      </div>

      {/* VERSION IMPRESSION / PDF - propre, sans boutons, sans localhost */}
      <div className="hidden print:block bg-white text-black p-6 pt-8">
        {entreprise?.photo && <img src={entreprise.photo} className="w-full h-[150px] object-cover rounded-lg" />}

        {/* ON AFFICHE TOUJOURS : même si il y a une photo, car certaines photos n'ont pas le WhatsApp, et certaines entreprises n'ont pas de photo */}
        <div className="text-center mt-4">
          <h2 className="font-extrabold text-xl">{entreprise?.nom}</h2>
          <p className="text-sm">{entreprise?.metier} - {entreprise?.quartier}</p>
          <p className="text-sm flex justify-center items-center gap-3 mt-1">
            <span>Tel : {entreprise?.tel}</span>
            <span className="flex items-center gap-1 font-bold text-green-700">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              WhatsApp : {entreprise?.whatsapp || entreprise?.tel}
            </span>
          </p>
          <p className="text-sm">Banque : {entreprise?.banque}</p>
        </div>

        <hr className="my-4 border-black" />
        <p><b>Client :</b> {clientNom}</p>
        <p><b>Date :</b> {new Date().toLocaleDateString("fr-FR")}</p>

        <table className="w-full mt-4 text-sm border-collapse">
          <thead><tr className="border-b-2 border-black"><th className="text-left py-2">Désignation</th><th>Qté</th><th>Prix</th><th className="text-right">Montant</th></tr></thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i} className="border-b border-gray-300"><td className="py-2">{it.nom}</td><td className="text-center">{it.quantite}</td><td className="text-center">{it.prix.toLocaleString()} F</td><td className="text-right">{(it.quantite * it.prix).toLocaleString()} F</td></tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between mt-3 font-bold"><span>Main d'oeuvre</span><span>{mainOeuvre.toLocaleString()} F</span></div>

        <div className="flex justify-between mt-4 border-2 border-black p-3 font-extrabold text-lg bg-white text-black">
          <span>TOTAL GÉNÉRAL</span><span>{totalGeneral.toLocaleString()} F</span>
        </div>

        <p className="text-center text-xs mt-8">Merci de votre confiance - {entreprise?.nom} - Responsable : {entreprise?.responsable}</p>
        <p className="text-right mt-10">Signature : ___________________</p>
      </div>

      {/* BOUTONS - cachés à l'impression */}
      <div className="print:hidden">
        <button onClick={ajouterLigne} className="w-full mt-3 border border-dashed border-zinc-600 rounded-lg p-3">+ Ajouter une ligne</button>
        <div className="grid grid-cols-2 gap-3 mt-5">
          <button onClick={enregistrer} className="bg-pink-600 font-bold rounded-lg p-4">Enregistrer le devis</button>
          <button onClick={envoyerWhatsApp} className="bg-green-600 font-bold rounded-lg p-4">Envoyer sur WhatsApp</button>
        </div>
        <button onClick={() => window.print()} className="w-full mt-3 bg-blue-600 text-white font-bold rounded-lg p-4">Télécharger PDF (Imprimer)</button>
      </div>
    </div>
  );
}

export default function NouveauDevis() {
  return (
    <Suspense>
      <NouveauDevisContent />
    </Suspense>
  )
}