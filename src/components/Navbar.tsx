'use client';

import Link from 'next/link';
import { ShoppingBag, User, ChevronDown, Search, X } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Navbar() {
  const [user, setUser] = useState<any | null | undefined>(undefined)
  const { items, resetCart } = useCartStore();
  const router = useRouter();

  // Estats
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Refs
  const lastScrollY = useRef(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

 useEffect(() => {
  const loadUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      setUser(null)
      return
    }

    try {
      const res = await fetch('/api/auth', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })

      if (!res.ok) {
        // només signOut si és un error definitiu
        setUser(null)
        return
      }

      const data = await res.json()
      setUser(data.user)
    } catch (err) {
      console.error('Error fetching user:', err)
      setUser(null)
    }
  }

  loadUser()

  const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
    // només recarregar si hi ha session vàlida
    if (session) loadUser()
    else setUser(null)
  })

  return () => listener.subscription.unsubscribe()
}, [])




  // Scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY.current && window.scrollY > 100) {
        setShowNavbar(false);
        setSearchOpen(false);
      } else {
        setShowNavbar(true);
      }
      lastScrollY.current = window.scrollY;
      if (menuOpen) setMenuOpen(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [menuOpen]);

  // Click outside per tancar menú i cerca
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false);
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input quan s'obre la cerca
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  // Cerca a Supabase
  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }

    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .ilike('name', `%${searchQuery}%`)
        .limit(10);

      if (!error && data) setSearchResults(data);
    };

    const timeout = setTimeout(fetchProducts, 300); // debounce
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    resetCart();
    window.location.href = '/'

  };

  return (
    <>
      {/* Navbar */}
      <div className={`fixed top-0 left-0 w-full z-50 transition-transform duration-300 ${showNavbar ? 'translate-y-0' : '-translate-y-full'}`}>
        {/* Banner */}
        <div className="w-full bg-[#f3e9dc] text-gray-800 text-sm md:text-base font-medium shadow-sm flex items-center justify-center py-3">
          Envío gratis en pedidos superiores a 80€
        </div>

        {/* Nav */}
        <nav className="w-full bg-white shadow-sm px-4 md:px-8 py-4 relative z-50">
          <div className="flex items-center justify-between">
            {/* Logo center */}
            <Link href="/" className="text-2xl md:text-3xl font-display font-bold text-rose-700 select-none mx-auto">
              Mōa
            </Link>

            {/* Right icons */}
            <div className="flex items-center gap-4 md:gap-6 absolute right-4">
              {/* Search button */}
              <button
                onClick={() => setSearchOpen(prev => !prev)}
                className="p-2 rounded-full hover:bg-gray-200 transition-all"
              >
                {searchOpen ? <X className="w-6 h-6 text-gray-700" /> : <Search className="w-6 h-6 text-gray-700" />}
              </button>

              {/* Cart */}
              <Link href="/cart" className="relative">
                <ShoppingBag className="w-6 h-6 text-gray-700 hover:text-rose-600 transition-all" />
                {items.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-xs px-2 py-0.5 rounded-full flex items-center justify-center font-medium shadow">
                    {items.length}
                  </span>
                )}
              </Link>

              {/* User */}
              {user === undefined && <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />}
              {user === null && (
                <Link href="/signin">
                  <User className="w-6 h-6 text-gray-700 hover:text-rose-600 cursor-pointer transition-all" />
                </Link>
              )}
              {user && (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-1 w-10 h-10 rounded-full bg-rose-600 text-white justify-center font-semibold shadow hover:bg-rose-700 transition-all"
                  >
                    {user.email ? user.email[0].toUpperCase() : 'U'}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow text-sm z-50">
                      <Link href="/user" className="block px-4 py-2 hover:bg-rose-50 text-gray-700" onClick={() => setMenuOpen(false)}>
                        Área Usuario
                      </Link>
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-rose-50 text-gray-700">
                        Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Search bar a pantalla completa */}
        {searchOpen && (
          <div ref={searchContainerRef} className="fixed top-28 left-0 w-screen bg-white z-50 shadow-md border-t border-gray-200 px-4 md:px-8 py-3">
            <div className="relative w-full">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar producto..."
                className="w-full px-12 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {/* Icones sobreposats */}
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-700" />
              <button
                onClick={() => setSearchOpen(false)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Resultats */}
            {searchResults.length > 0 && (
              <div className="mt-2 bg-white border border-gray-200 rounded-md shadow overflow-hidden">
                {searchResults.map((prod) => (
                  <Link
                    key={prod.id}
                    href={`/product/${prod.id}`}
                    className="block px-4 py-2 hover:bg-rose-50 text-gray-700"
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                  >
                    {prod.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Spacer for navbar */}
      <div className="h-24" />
    </>
  );
}
