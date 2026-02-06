'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Carrega del perfil
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile({ ...data, email: user.email, id: user.id })
      setLoading(false)
    }

    fetchProfile()
  }, [])

  // Guardar dades editables
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

  // Autocompletat ciutat i país quan s'introdueix codi postal
  const handlePostalChange = async (postal: string) => {
    setProfile({ ...profile, postal_code: postal })

    if (postal.length >= 4) {
      try {
        const res = await fetch(`https://api.zippopotam.us/es/${postal}`)
        if (!res.ok) return

        const data = await res.json()
        if (data.places && data.places.length > 0) {
          const place = data.places[0]
          setProfile((prev: any) => ({
            ...prev,
            city: place['place name'] || prev.city,
            country: place['country'] || prev.country
          }))
        }
      } catch (err) {
        console.error('Error fetching postal info:', err)
      }
    }
  }

  if (loading) return <p className="text-center mt-10 text-gray-500">Carregant perfil...</p>

  return (
    <div className="max-w-2xl mx-auto bg-beige-50 shadow-lg p-8 mt-10 rounded-3xl">
      <h1 className="text-3xl font-bold mb-8 text-center text-rose-700">Perfil d’usuari</h1>

      {/* Nom complet */}
      <div className="mb-6">
        <label className="block mb-2 text-gray-700 font-medium">Nom complet</label>
        <input
          type="text"
          value={profile?.full_name || ''}
          onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 transition"
        />
      </div>

      {/* Correu (no editable) */}
      <div className="mb-6">
        <label className="block mb-2 text-gray-500 font-medium">Correu electrònic</label>
        <input
          type="text"
          value={profile?.email || ''}
          disabled
          className="w-full p-3 border border-gray-300 bg-gray-100 rounded-xl cursor-not-allowed"
        />
      </div>

      {/* Telèfon */}
      <div className="mb-6">
        <label className="block mb-2 text-gray-700 font-medium">Telèfon</label>
        <input
          type="text"
          value={profile?.phone || ''}
          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 transition"
        />
      </div>

      {/* Adreça */}
      <div className="mb-6">
        <label className="block mb-2 text-gray-700 font-medium">Adreça</label>
        <input
          type="text"
          value={profile?.address || ''}
          onChange={(e) => setProfile({ ...profile, address: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 transition"
        />
      </div>

      {/* Ciutat i Codi Postal */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <label className="block mb-2 text-gray-700 font-medium">Codi postal</label>
          <input
            type="text"
            value={profile?.postal_code || ''}
            onChange={(e) => handlePostalChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 transition"
          />
        </div>
        <div className="flex-1">
          <label className="block mb-2 text-gray-700 font-medium">Ciutat</label>
          <input
            type="text"
            value={profile?.city || ''}
            onChange={(e) => setProfile({ ...profile, city: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 transition"
          />
        </div>
      </div>

      {/* País */}
      <div className="mb-8">
        <label className="block mb-2 text-gray-700 font-medium">País</label>
        <input
          type="text"
          value={profile?.country || ''}
          onChange={(e) => setProfile({ ...profile, country: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 transition"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-rose-600 text-white p-4 rounded-2xl hover:bg-rose-700 transition font-medium text-lg"
      >
        {saving ? 'Guardant...' : 'Guardar canvis'}
      </button>
    </div>
  )
}
