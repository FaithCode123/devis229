"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase"; // <-- VÉRIFIE CETTE LIGNE

export default function PageRappels() {
  const [artisans, setArtisans] = useState<any[]>([]);

  useEffect(() => {
    async function charger() {
      const { data } = await supabase.from("profiles").select("*");
      if (!data) return;
      const liste = data.filter((p: any) => {
        if (!p.date_fin_abonnement) return false;
        const jours = Math.ceil((new Date(p.date_fin_abonnement).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return jours <= 3 && jours >= 0;
      });
      setArtisans(liste);
    }
    charger();
  }, []);

  if (artisans.length === 0) {
    return <div style={{ padding: "20px" }}>Aucun abonnement qui expire dans 3 jours. ✅</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontWeight: "bold", fontSize: "20px" }}>⚠️ Expire dans 3 jours ({artisans.length})</h1>
      {artisans.map((a: any) => {
        const jours = Math.ceil((new Date(a.date_fin_abonnement).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        const message = `Bonjour ${a.nom_entreprise || a.nom}, c'est Devis229 👋\nTon abonnement Pro se termine dans ${jours} jours, le ${new Date(a.date_fin_abonnement).toLocaleDateString("fr-FR")}.\nPour continuer sans interruption, renouvelle à 5.000 F / mois par MTN MoMo.\nTu veux que je te garde ta place ?`;
        const telBrut = (a.telephone || "").replace("+", "").replace(" ", "");
const tel = telBrut.startsWith("229") ? telBrut : "229" + telBrut;
const lien = `https://wa.me/${tel}?text=${encodeURIComponent(message)}`;

        return (
          <div key={a.id} style={{ border: "1px solid #ddd", padding: "12px", borderRadius: "10px", marginTop: "12px" }}>
            <b>{a.nom_entreprise || a.nom}</b> - {a.telephone} <br />
            Fin : {a.date_fin_abonnement} - Reste : {jours} jours
            <br />
            <a href={lien} target="_blank" style={{ background: "#25D366", color: "white", padding: "10px", borderRadius: "8px", display: "inline-block", marginTop: "8px", textDecoration: "none", fontWeight: "bold" }}>
              Envoyer rappel WhatsApp
            </a>
          </div>
        );
      })}
    </div>
  );
}