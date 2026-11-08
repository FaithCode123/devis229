export default function Home() {
  return (
    <div className="max-w-[800px] mx-auto px-5 py-10 text-white">
      <div className="text-center mt-10">
        <p className="text-pink-500 font-bold tracking-widest">DEVIS229 🇧🇯</p>
        <h1 className="text-4xl md:text-5xl font-extrabold mt-4 leading-tight">
          Crée un devis pro<br/>en 2 minutes,<br/>sur ton téléphone.
        </h1>
        <p className="text-zinc-400 mt-4 text-lg">
          Pour les maçons, menuisiers, électriciens, plombiers au Bénin.
          Fini Word. Ton devis avec ta photo, ton total, ton suivi de paiement.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-8 text-center">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-2xl font-extrabold">2 min</p><p className="text-xs text-zinc-400">Pour créer</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-2xl font-extrabold">0 F</p><p className="text-xs text-zinc-400">Pour commencer</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-2xl font-extrabold">100%</p><p className="text-xs text-zinc-400">Sur WhatsApp</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-8">
        <a href="/nouveau-devis" className="bg-pink-600 hover:bg-pink-500 text-center font-bold rounded-xl p-4 text-lg">+ Créer un devis</a>
        <div className="grid grid-cols-2 gap-3">
          <a href="/mes-devis" className="bg-zinc-900 border border-zinc-700 text-center font-bold rounded-xl p-4">📋 Mes Devis</a>
          <a href="/mon-entreprise" className="bg-zinc-900 border border-zinc-700 text-center font-bold rounded-xl p-4">🏢 Mon Entreprise</a>
        </div>
      </div>

      <div className="mt-10 bg-white text-black rounded-2xl p-5">
        <h2 className="font-bold">Exemple : Mr Faith</h2>
        <p className="text-sm mt-1">Ciment + Sable + Gravier + Brique + Main d'oeuvre = <b>290 200 F</b></p>
        <p className="text-sm">Avance reçue : <b className="text-green-600">105 000 F</b> - Reste : <b className="text-red-600">185 200 F</b></p>
        <p className="text-xs text-zinc-500 mt-2">C'est exactement ce que Devis229 fait pour toi, automatiquement.</p>
      </div>

      <p className="text-center text-zinc-500 text-sm mt-8">Fait à Cotonou, pour les artisans du Bénin.</p>
    </div>
  );
}