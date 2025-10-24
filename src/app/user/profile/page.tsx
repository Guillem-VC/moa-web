'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(data)
      setLoading(false)
    }

    fetchProfile()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: profile.full_name,
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        postal_code: profile.postal_code,
        country: profile.country,
      })

    if (error) alert(error.message)
    else alert('Perfil actualitzat correctament!')

    setSaving(false)
  }

  if (loading) return <p className="text-center mt-10">Carregant perfil...</p>

  return (
    <div className="max-w-lg mx-auto bg-white shadow p-6 mt-10 rounded">
      <h1 className="text-2xl font-bold mb-6 text-rose-700 text-center">Perfil d’usuari</h1>

      <label className="block mb-2 text-gray-600">Nom complet</label>
      <input
        type="text"
        value={profile?.full_name || ''}
        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
        className="w-full p-2 mb-4 border rounded"
      />

      <label className="block mb-2 text-gray-600">Telèfon</label>
      <input
        type="text"
        value={profile?.phone || ''}
        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
        className="w-full p-2 mb-4 border rounded"
      />

      <label className="block mb-2 text-gray-600">Adreça</label>
      <input
        type="text"
        value={profile?.address || ''}
        onChange={(e) => setProfile({ ...profile, address: e.target.value })}
        className="w-full p-2 mb-4 border rounded"
      />

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Ciutat"
          value={profile?.city || ''}
          onChange={(e) => setProfile({ ...profile, city: e.target.value })}
          className="w-1/2 p-2 mb-4 border rounded"
        />
        <input
          type="text"
          placeholder="Codi postal"
          value={profile?.postal_code || ''}
          onChange={(e) => setProfile({ ...profile, postal_code: e.target.value })}
          className="w-1/2 p-2 mb-4 border rounded"
        />
      </div>

      <input
        type="text"
        placeholder="País"
        value={profile?.country || ''}
        onChange={(e) => setProfile({ ...profile, country: e.target.value })}
        className="w-full p-2 mb-6 border rounded"
      />

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-rose-600 text-white p-2 rounded hover:bg-rose-700 transition"
      >
        {saving ? 'Guardant...' : 'Guardar canvis'}
      </button>
    </div>
  )
}
