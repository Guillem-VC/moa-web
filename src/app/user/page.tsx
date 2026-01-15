'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function UserPage() {
  const router = useRouter();
  const [user, setUser] = useState<any | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  // Carrega inicial de la sessió
  useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setUser(session.user);
      else setUser(null);
      setLoading(false);
    };

    loadUser();

    // Escolta canvis de sessió (login, logout, etc.)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setUser(session.user);
      else setUser(null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Redirigeix si no està logejat
  useEffect(() => {
    if (user === null) router.replace('/signin'); // o '/' si prefereixes
  }, [user, router]);

  if (loading || user === undefined) {
    return (
      <div style={{ backgroundColor: 'yellow', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Loading session...
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'lightblue', minHeight: '100vh', padding: '2rem' }}>
      <h1 style={{ color: '#333', fontSize: '2rem' }}>
        Hola {user.user_metadata?.full_name || 'Usuari'}
      </h1>
      <p>Això és la teva àrea d'usuari.</p>
      <pre style={{ background: '#fff', padding: '1rem', borderRadius: '0.5rem', overflowX: 'auto' }}>
        {JSON.stringify(user, null, 2)}
      </pre>
    </div>
  );
}
