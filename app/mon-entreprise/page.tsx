"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function MonEntreprise() {
  const [nom, setNom] = useState("");
  const [metier, setMetier] = useState("");
  const [quartier, setQuartier] = useState("");
  const [tel, setTel] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [banque, setBanque] = useState("");
  const [responsable, setResponsable] = useState("");
  const [photo, setPhoto] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Charger : 1. Supabase d'abord, 2. Ancien localStorage si Supabase vide
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/login');
      setUserId(user.id);
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data && (data.nom_entreprise || data.banniere_url)) {
        setNom(data.nom_entreprise || "");
        setMetier(data.activite || "");
        setQuartier(data.quartier || "");
        setTel(data.tel || "");
        setWhatsapp(data.whatsapp_entreprise || "");
        setBanque(data.banque || "");
        setResponsable(data.responsable || "");
        setPhoto(data.banniere_url || data.logo_url || "");
      } else {
        // Ancienne version en local
        const saved = localStorage.getItem("devis229_entreprise");
        if (saved) {
          const d = JSON.parse(saved);
          setNom(d.nom || ""); setMetier(d.metier || ""); setQuartier(d.quartier || "");
          setTel(d.tel || ""); setWhatsapp(d.whatsapp || ""); setBanque(d.banque || "");
          setResponsable(d.responsable || ""); setPhoto(d.photo || "");
        }
      }
    };
    load();
  }, []);

  const handlePhoto = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setPhoto(reader.result as string); };
    reader.readAsDataURL(file);
  };

  const sauvegarder = async () => {
    setLoading(true);
    let photoUrl = photo;

    // Si c'est une nouvelle photo (base64), on l'upload dans Supabase Storage
    if (photo && photo.startsWith("data:image")) {
      try {
        const res = await fetch(photo);
        const blob = await res.blob();
        const ext = blob.type.includes("png") ? "png" : "jpg";
        const nomFichier = `${userId}/banniere-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from('entreprise-logos').upload(nomFichier, blob, { upsert: true });
        if (!upErr) {
          const { data } = supabase.storage.from('entreprise-logos').getPublicUrl(nomFichier);
          photoUrl = data.publicUrl;
          setPhoto(photoUrl);
        }
      } catch {}
    }

    const data = { nom, metier, quartier, tel, whatsapp, banque, responsable, photo: photoUrl };

    // 1. Ancien localStorage (pour compatibilité)
    localStorage.setItem("devis229_entreprise", JSON.stringify(data));
    // 2. Nouveau localStorage que Nouveau Devis lit vraiment
    localStorage.setItem("entreprise229", JSON.stringify({
      nom, activite: metier, quartier, tel, whatsapp, banque, responsable, banniere: photoUrl
    }));

    // 3. Supabase - pour que ça suive même si tu changes de téléphone
    await supabase.from('profiles').update({
      nom_entreprise: nom,
      activite: metier,
      quartier: quartier,
      tel: tel,
      whatsapp_entreprise: whatsapp,
      banque: banque,
      responsable: responsable,
      banniere_url: photoUrl,
      logo_url: photoUrl,
    }).eq('id', userId);

    setLoading(false);
    alert("✅ Entreprise enregistrée ! Elle apparaîtra sur tous tes devis.");
    router.push('/dashboard');
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
        <input type="file" accept="image/*" onChange={handlePhoto} className="bg-white text-black placeholder:text-zinc-400 border border-zinc-300 rounded-lg p-3" />
        <input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Nom : Ex: Ets FENOU BATIMENTS SOLIDES" className="bg-white text-black placeholder:text-zinc-400 border border-zinc-300 rounded-lg p-3" />
        <input value={metier} onChange={(e) => setMetier(e.target.value)} placeholder="Métier : Ex: Pour tous travaux de maçonnerie" className="bg-white text-black placeholder:text-zinc-400 border border-zinc-300 rounded-lg p-3" />
        <input value={quartier} onChange={(e) => setQuartier(e.target.value)} placeholder="Quartier : Ex: Sèmè-Okoun" className="bg-white text-black placeholder:text-zinc-400 border border-zinc-300 rounded-lg p-3" />
        <input value={tel} onChange={(e) => setTel(e.target.value)} placeholder="Tél : Ex: +229 0197465286" className="bg-white text-black placeholder:text-zinc-400 border border-zinc-300 rounded-lg p-3" />
        <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="WhatsApp : Ex: 0160198243" className="bg-white text-black placeholder:text-zinc-400 border border-zinc-300 rounded-lg p-3" />
       <input value={banque} onChange={(e) => setBanque(e.target.value)} placeholder="Compte bancaire : Ex: NSIA BANK : 0100501110025960018" className="bg-white text-black placeholder:text-zinc-400 border border-zinc-300 rounded-lg p-3" />
        <input value={responsable} onChange={(e) => setResponsable(e.target.value)} placeholder="Nom du Responsable : Ex: APITY Salomon" className="bg-white text-black placeholder:text-zinc-400 border border-zinc-300 rounded-lg p-3" />
        <button onClick={sauvegarder} disabled={loading} className="bg-pink-600 hover:bg-pink-500 font-bold rounded-lg p-4 mt-2">
          {loading ? "Enregistrement..." : "Enregistrer mon entreprise"}
        </button>
      </div>
    </div>
  );
}