'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { ShoppingBag, User, ChevronDown } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export const UserContext = createContext<any>(undefined);
export const useUser = () => useContext(UserContext);

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { items, resetCart } = useCartStore();
  const [user, setUser] = useState<any>(undefined);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const router = useRouter();

  const lastScrollY = useRef(0);
  const menuRef = useRef<HTMLDivElement>(null);

  // Control scroll per amagar/mostrar navbar i tancar menú
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY.current && window.scrollY > 100) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }
      lastScrollY.current = window.scrollY;

      // Tanquem el menú si hi ha scroll
      if (menuOpen) setMenuOpen(false);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [menuOpen]);

  // Click fora del menú per tancar-lo
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Inicialitza user client-side
  useEffect(() => {
    const initUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    initUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    resetCart();
    setUser(null);
    router.push('/');
  };

  return (
    <UserContext.Provider value={user}>
      <nav
        className={`fixed top-0 left-0 w-full bg-white shadow-sm px-8 py-4 z-50 transition-transform duration-300 ${
          showNavbar ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="flex items-center justify-between">
           {/* Espai buit a l'esquerra */}
          <div className="flex items-center gap-6 w-1/3"></div>

          {/* Logo al centre */}
          <Link
            href="/"
            className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-bold text-rose-700"
          >
            Mōa
          </Link>
          <div className="flex items-center gap-6 relative">
            <Link href="/about" className="text-gray-700 hover:text-rose-600">Sobre nosotros</Link>
            <Link href="/cart" className="relative">
              <ShoppingBag className="w-6 h-6 text-gray-700 hover:text-rose-600" />
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {items.length}
                </span>
              )}
            </Link>

            {user === undefined && <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />}
            {user === null && <Link href="/login"><User className="w-6 h-6 text-gray-700 hover:text-rose-600 cursor-pointer" /></Link>}

            {user && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-1 w-10 h-10 rounded-full bg-rose-600 text-white justify-center font-semibold"
                >
                  {user.email[0].toUpperCase()} <ChevronDown className="w-4 h-4" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow-lg text-sm z-50">
                    <Link
                      href="/user"
                      className="block px-4 py-2 hover:bg-rose-50 text-gray-700"
                      onClick={() => setMenuOpen(false)}
                    >
                      Area Usuario
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 hover:bg-rose-50 text-gray-700"
                    >
                      Cerrar Sessión
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="pt-18">
        <div className="bg-yellow-400 text-center text-sm font-medium text-gray-800 py-2 shadow-sm">
          🚚 Envío gratis en pedidos superiores a 80 €
        </div>

        <main>{children}</main>
      </div>
    </UserContext.Provider>
  );
}
