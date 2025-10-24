'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { UserCircle } from 'lucide-react'

export default function UserMenu() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data?.user || null)
    }
    fetchUser()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const handleClick = () => {
    if (user) router.push('/user')
    else router.push('/login')
  }

  const getInitial = () => {
    if (!user) return null
    const name = user.user_metadata?.full_name || user.email
    return name?.charAt(0)?.toUpperCase()
  }

  return (
    <button
      onClick={handleClick}
      className="w-10 h-10 flex items-center justify-center rounded-full bg-rose-500 text-white text-lg font-semibold hover:bg-rose-600 transition"
    >
      {user ? (
        getInitial()
      ) : (
        <UserCircle className="w-6 h-6 text-gray-700" />
      )}
    </button>
  )
}
