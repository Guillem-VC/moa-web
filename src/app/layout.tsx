'use client';
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import './globals.css';
import Link from 'next/link';
import { ShoppingBag, User, ChevronDown } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

// 🔹 Context per compartir l'usuari
export const UserContext = createContext<any>(null);

// Hook personalitzat per usar l'usuari més fàcilment
export const useUser = () => useContext(UserContext);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { items, resetCart } = useCartStore();
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      // 1️⃣ Comprova si hi ha sessió
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        return;
      }

      // 2️⃣ Si no hi ha sessió, mira si hi ha hash amb token (OAuth redirect)
      if (window.location.hash.includes('access_token')) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.hash);
        if (error) {
          console.error('Error recuperant sessió del redirect OAuth:', error);
          setUser(null);
          return;
        }
        setUser(data.session?.user ?? null);

        // neteja hash per no tenir tokens a la URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    initAuth();

    // Listener global d'autenticació
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) setUser(session.user);
      else setUser(null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);


  // 🔹 Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    resetCart();
    setMenuOpen(false);
    setUser(null);
    router.push('/');
  };

  // 🔹 Timeout per inactivitat
  useEffect(() => {
    let logoutTimer: NodeJS.Timeout | null = null;

    const resetTimer = () => {
      if (logoutTimer) clearTimeout(logoutTimer);
      logoutTimer = setTimeout(async () => {
        await supabase.auth.signOut();
        resetCart();
        setUser(null);
        router.push('/');
      }, 1800000); //30 minuts
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);

    resetTimer();

    return () => {
      if (logoutTimer) clearTimeout(logoutTimer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
    };
  }, [user]);

  // 🔹 Tanca el menú si fem click fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  return (
    <UserContext.Provider value={user}>
      <html lang="es">
        <body className="bg-gradient-to-b from-white via-rose-50 to-white">
          <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-sm sticky top-0 z-50">
            {/* LOGO */}
            <Link href="/" className="text-2xl font-bold text-rose-700">Mōa</Link>

            {/* DRETA */}
            <div className="flex items-center gap-6 relative">
              <Link href="/about" className="text-gray-700 hover:text-rose-600 font-medium transition">Sobre nosotros</Link>

              <Link href="/cart" className="relative">
                <ShoppingBag className="w-6 h-6 text-gray-700 hover:text-rose-600 transition" />
                {items.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-xs px-2 py-0.5 rounded-full">{items.length}</span>
                )}
              </Link>

              {user ? (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-1 w-10 h-10 rounded-full bg-rose-600 text-white justify-center font-semibold cursor-pointer select-none"
                  >
                    {user.email[0].toUpperCase()}
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow-lg text-sm z-50">
                      <Link
                        href="/user"
                        className="block px-4 py-2 hover:bg-rose-50 text-gray-700"
                        onClick={() => setMenuOpen(false)}
                      >
                        Àrea d’usuari
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 hover:bg-rose-50 text-gray-700"
                      >
                        Tancar sessió
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login">
                  <User className="w-6 h-6 text-gray-700 hover:text-rose-600 transition cursor-pointer" />
                </Link>
              )}
            </div>
          </nav>

          <div className="bg-yellow-400 text-center text-sm font-medium text-gray-800 py-2 shadow-sm">
            🚚 Envío gratis en pedidos superiores a 80 €
          </div>

          {children}
        </body>
      </html>
    </UserContext.Provider>
  );
}
