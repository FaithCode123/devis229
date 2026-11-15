'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Reset() {
  const [mdp, setMdp] = useState("")
  const router = useRouter()
  const changer = async () => {
    const { error } = await supabase.auth.updateUser({ password: mdp })
    if (error) alert(error.message)
    else { alert("Mot de passe changé ✅"); router.push('/login') }
  }
  return (
    <div className="min-h-screen p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold">Nouveau mot de passe</h1>
      <input type="password" value={mdp} onChange={e=>setMdp(e.target.value)} placeholder="Nouveau mot de passe" className="w-full border rounded-xl p-4 mt-4" />
      <button onClick={changer} className="w-full bg-green-600 text-white p-4 rounded-xl font-bold mt-3">Changer</button>
    </div>
  )
}