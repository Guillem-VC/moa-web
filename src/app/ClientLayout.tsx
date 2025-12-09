'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ShoppingBag, User, ChevronDown } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export const UserContext = createContext<any>(undefined);
export const useUser = () => useContext(UserContext);

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { items, resetCart } = useCartStore();
  const [user, setUser] = useState<any>(undefined);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    checkUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    resetCart();
    setMenuOpen(false);
    setUser(null);
    router.push('/');
  };

  return (
    <UserContext.Provider value={user}>
      <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-sm sticky top-0 z-50">
        <Link href="/" className="text-2xl font-bold text-rose-700">Mōa</Link>
        <div className="flex items-center gap-6 relative">
          <Link href="/about" className="text-gray-700 hover:text-rose-600 font-medium transition">Sobre nosotros</Link>
          <Link href="/cart" className="relative">
            <ShoppingBag className="w-6 h-6 text-gray-700 hover:text-rose-600 transition" />
            {items.length > 0 && <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-xs px-2 py-0.5 rounded-full">{items.length}</span>}
          </Link>

          {user === undefined && <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />}
          {user === null && <Link href="/cart"><User className="w-6 h-6 text-gray-700 hover:text-rose-600 transition cursor-pointer" /></Link>}

          {user && (
            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-1 w-10 h-10 rounded-full bg-rose-600 text-white justify-center font-semibold cursor-pointer select-none">
                {user.email[0].toUpperCase()} <ChevronDown className="w-4 h-4" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow-lg text-sm z-50">
                  <Link href="/user" className="block px-4 py-2 hover:bg-rose-50 text-gray-700" onClick={() => setMenuOpen(false)}>Àrea d’usuari</Link>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-rose-50 text-gray-700">Tancar sessió</button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      <div className="bg-yellow-400 text-center text-sm font-medium text-gray-800 py-2 shadow-sm">
        🚚 Envío gratis en pedidos superiores a 80 €
      </div>

      <main>{children}</main>
    </UserContext.Provider>
  );
}
