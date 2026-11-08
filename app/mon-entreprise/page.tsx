"use client";
import { useState, useEffect } from "react";

export default function MonEntreprise() {
  const [nom, setNom] = useState("");
  const [metier, setMetier] = useState("");
  const [quartier, setQuartier] = useState("");
  const [tel, setTel] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [banque, setBanque] = useState("");
  const [responsable, setResponsable] = useState("");
  const [photo, setPhoto] = useState("");

  // Charger les infos si déjà enregistrées
  useEffect(() => {
    const saved = localStorage.getItem("devis229_entreprise");
    if (saved) {
      const data = JSON.parse(saved);
      setNom(data.nom || "");
      setMetier(data.metier || "");
      setQuartier(data.quartier || "");
      setTel(data.tel || "");
      setWhatsapp(data.whatsapp || "");
      setBanque(data.banque || "");
      setResponsable(data.responsable || "");
      setPhoto(data.photo || "");
    }
  }, []);

  // Quand l'artisan choisit sa photo / bannière
  const handlePhoto = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const sauvegarder = () => {
    const data = { nom, metier, quartier, tel, whatsapp, banque, responsable, photo };
    localStorage.setItem("devis229_entreprise", JSON.stringify(data));
    alert("✅ Entreprise enregistrée ! Elle apparaîtra sur tous tes devis.");
  };

  return (
    <div className="max-w-[700px] mx-auto px-5 py-10">
      <h1 className="text-3xl font-extrabold">Mon Entreprise</h1>
      <p className="text-zinc-400 mt-2">À remplir une seule fois. Ça apparaîtra sur tous tes devis.</p>

      {/* APERÇU BANNIÈRE COMME FENOU */}
      <div className="mt-8 border rounded-2xl overflow-hidden bg-white text-black">
        {photo ? (
          <img src={photo} alt="Bannière" className="w-full h-[160px] object-cover" />
        ) : (
          <div className="w-full h-[160px] bg-zinc-200 flex items-center justify-center text-zinc-500">
            Aucune photo - ta bannière s'affichera ici
          </div>
        )}
        <div className="p-4 text-center">
          <h2 className="text-xl font-extrabold text-blue-900">{nom || "Nom de ton entreprise"}</h2>
          <p className="font-semibold">{metier || "Ton métier : Ex: Maçonnerie"}</p>
          <p className="text-sm mt-1">📍 {quartier || "Quartier"} &nbsp; 📞 {tel || "Tél"} &nbsp; 💬 WhatsApp : {whatsapp || "..."}</p>
          <p className="text-sm">🏦 {banque || "Compte bancaire"}</p>
        </div>
      </div>

      {/* FORMULAIRE */}
      <div className="flex flex-col gap-4 mt-8">
        <label className="text-sm font-bold">📸 Photo de ton entreprise / Bannière</label>
        <input type="file" accept="image/*" onChange={handlePhoto} className="bg-zinc-900 text-white placeholder:text-zinc-500 border border-zinc-800 rounded-lg p-3" />

        <input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Nom : Ex: Ets FENOU BATIMENTS SOLIDES" className="bg-zinc-900 text-white placeholder:text-zinc-500 border border-zinc-800 rounded-lg p-3" />
        <input value={metier} onChange={(e) => setMetier(e.target.value)} placeholder="Métier : Ex: Pour tous travaux de maçonnerie" className="bg-zinc-900 text-white placeholder:text-zinc-500 border border-zinc-800 rounded-lg p-3" />
        <input value={quartier} onChange={(e) => setQuartier(e.target.value)} placeholder="Quartier : Ex: Sèmè-Okoun" className="bg-zinc-900 text-white placeholder:text-zinc-500 border border-zinc-800 rounded-lg p-3" />
        <input value={tel} onChange={(e) => setTel(e.target.value)} placeholder="Tél : Ex: +229 0197465286" className="bg-zinc-900 text-white placeholder:text-zinc-500 border border-zinc-800 rounded-lg p-3" />
        <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="WhatsApp : Ex: 0160198243" className="bg-zinc-900 text-white placeholder:text-zinc-500 border border-zinc-800 rounded-lg p-3" />
        <input value={banque} onChange={(e) => setBanque(e.target.value)} placeholder="Compte bancaire : Ex: NSIA BANK : 0100501110025960018" className="bg-zinc-900 text-white placeholder:text-zinc-500 border border-zinc-800 rounded-lg p-3" />
        <input value={responsable} onChange={(e) => setResponsable(e.target.value)} placeholder="Nom du Responsable : Ex: APITY Salomon" className="bg-zinc-900 text-white placeholder:text-zinc-500 border border-zinc-800 rounded-lg p-3" />

        <button onClick={sauvegarder} className="bg-pink-600 hover:bg-pink-500 font-bold rounded-lg p-4 mt-2">
          Enregistrer mon entreprise
        </button>
      </div>
    </div>
  );
}