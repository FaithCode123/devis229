export default function BandeauAbonnement({ dateFin }: { dateFin: string }) {
  if (!dateFin) return null;
  const aujourdHui = new Date();
  const fin = new Date(dateFin);
  const joursRestants = Math.ceil((fin.getTime() - aujourdHui.getTime()) / (1000 * 60 * 60 * 24));

  if (joursRestants > 3 || joursRestants < 0) return null;

  return (
    <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "12px", borderRadius: "10px", textAlign: "center", fontWeight: "bold", margin: "10px" }}>
      ⚠️ Attention : Il te reste {joursRestants} jour{joursRestants > 1 ? "s" : ""} d'abonnement !
      Ton abonnement se termine le {fin.toLocaleDateString("fr-FR")}.
      Renouvelle vite pour ne pas être bloqué.
    </div>
  );
}