'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const checkRecovery = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      // Comprovem si hi ha sessió (temporal de recovery o normal)
      if (!session) {
        setMessage('No hay sesión activa. Vuelve a pedir reset de contraseña.');
      }

      setReady(true);
    };
    checkRecovery();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setMessage('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setMessage(error.message || 'Error actualizando contraseña');
    } else {
      setMessage('✅ Contraseña actualitzada correctamente!');

      // Logout per eliminar sessió temporal
      await supabase.auth.signOut();
      setTimeout(() => router.push('/signin'), 2000);
    }
  };

  if (!ready) return null;

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img src="https://sopotey.com/blog/wp-content/uploads/2024/04/ropa-de-marca-original.jpg"
             className="w-full h-full object-cover opacity-50 blur-md" />
        <div className="absolute inset-0 bg-white/40"></div>
      </div>
      <div className="relative z-10 w-full max-w-md p-8 bg-white/80 backdrop-blur-md shadow-lg rounded-2xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Restablece tu contraseña</h1>
        {message && <p className={`mb-4 text-center ${message.includes('correctament') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}

        <form onSubmit={handleSubmit}>
          <input type="password" placeholder="Nueva contraseña" value={password} onChange={(e) => setPassword(e.target.value)}
                 className="w-full p-2 mb-4 border border-gray-300 rounded placeholder-gray-500 text-black focus:outline-none focus:ring-2 focus:ring-rose-500" required />
          <input type="password" placeholder="Repite la contraseña" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                 className="w-full p-2 mb-4 border border-gray-300 rounded placeholder-gray-500 text-black focus:outline-none focus:ring-2 focus:ring-rose-500" required />
          <button type="submit" disabled={loading}
                  className="w-full bg-rose-600 text-white p-2 rounded hover:bg-rose-700 transition font-medium">
            {loading ? 'Actualizando...' : 'Cambiar contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}
