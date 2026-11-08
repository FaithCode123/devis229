# Devis229 🇧🇯
Application web pour les artisans au Bénin (maçons, menuisiers, électriciens).

### Le problème
Ils faisaient leurs devis sur Word. C'était long, pas pro, et aucun suivi de paiement.

### La solution
En 2 minutes, ils créent un devis PDF avec leur bannière, leur total, leur avance et leur reste à payer.

### Fonctionnalités
- Création de devis avec tableau matériels + main d'oeuvre
- Calcul automatique Total / Avance / Reste
- Avance cachée si 0, affichée si payée
- Génération PDF avec bannière de l'entreprise
- Numéro du client sur la facture
- Envoi WhatsApp en 1 clic
- Photo stockée en IndexedDB (pas de QuotaExceededError)

### Tech
Next.js, TypeScript, Tailwind, jsPDF, IndexedDB

### Démo
👉 https://devis229-two.vercel.app/
