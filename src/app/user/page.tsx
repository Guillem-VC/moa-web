'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/UserContext';

export default function UserPage() {
  const user = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user !== undefined) setLoading(false);
    if (user === null) router.push('/');
  }, [user, router]);

  if (loading) return <div style={{ backgroundColor: 'yellow', minHeight: '100vh' }}>Carregant sessió...</div>;
  if (!user) return null;

  return (
    <div style={{ backgroundColor: 'lightblue', minHeight: '100vh', padding: '2rem' }}>
      <h1 style={{ color: '#333', fontSize: '2rem' }}>Hola {user.email ?? 'Usuari'}</h1>
      <p>Això és la teva àrea d'usuari.</p>
    </div>
  );
}
