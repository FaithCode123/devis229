'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nom, setNom] = useState('')
  const [isInscription, setIsInscription] = useState(true)
  const router = useRouter()

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    alert('Bouton cliqué, jessaie de créer le compte...')
    if (isInscription) {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        alert('ERREUR Supabase: ' + error.message)
        return
      }
      if (data.user) {
        const { error: profilError } = await supabase.from('profiles').insert({
          id: data.user.id,
          email: email,
          nom_entreprise: nom,
          essais_utilises: 0,
          est_payant: false
        })
        if (profilError) alert('ERREUR profil: ' + profilError.message)
        else {
          alert('Compte créé ! Tu as 3 devis gratuits.')
          router.push('/dashboard')
        }
      } else {
        alert('Pas de user retourné, vérifie ton email pour confirmer')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (!error) router.push('/dashboard')
      else alert('ERREUR connexion: ' + error.message)
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">Devis229</h1>
        <p className="text-center text-sm text-gray-500">3 devis gratuits, ensuite 5.000 F / mois</p>
        {isInscription && (
          <input value={nom} onChange={e=>setNom(e.target.value)} placeholder="Nom de ton entreprise" className="w-full border p-3 rounded" required />
        )}
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" className="w-full border p-3 rounded" required />
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mot de passe" type="password" className="w-full border p-3 rounded" required />
        <button className="w-full bg-green-600 text-white p-3 rounded font-bold">
          {isInscription ? "Créer mon compte - 3 gratuits" : "Se connecter"}
        </button>
        <button onClick={()=>router.push('/mot-de-passe-oublie')} className="w-full text-sm text-blue-600 mt-3 underline">Mot de passe oublié ?</button>
        <p onClick={()=>setIsInscription(!isInscription)} className="text-center text-sm text-blue-600 cursor-pointer">
          {isInscription ? "Déjà un compte ? Se connecter" : "Pas de compte ? Créer un compte"}
        </p>
      </form>
    </div>
  )
}