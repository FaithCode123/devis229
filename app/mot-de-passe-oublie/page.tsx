'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Oublie() {
  const [email, setEmail] = useState("")
  const envoyer = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    if (error) alert(error.message)
    else alert("Vérifie tes emails, je t'ai envoyé le lien de réinitialisation ✅")
  }
  return (
    <div className="min-h-screen p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold">Mot de passe oublié ?</h1>
      <p className="text-gray-500 mt-2">Mets ton email, on t'envoie un lien.</p>
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Ton email" className="w-full border rounded-xl p-4 mt-4" />
      <button onClick={envoyer} className="w-full bg-black text-white p-4 rounded-xl font-bold mt-3">Envoyer le lien</button>
    </div>
  )
}