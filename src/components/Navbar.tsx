'use client';

import Link from 'next/link';
import { ShoppingBag, User, ChevronDown, Menu, Search } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useUser } from './UserContext';
import { supabase } from '@/lib/supabaseClient';

export default function Navbar() {
  const user = useUser();
  const { items, resetCart } = useCartStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const router = useRouter();

  const lastScrollY = useRef(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Show/hide on scroll
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

  // Click outside menu o cerca
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    resetCart();
    router.push('/');
  };

  return (
    <>
      {/* Banner promocional a sobre */}
      <div
        className={`fixed top-0 left-0 w-full z-50 transition-transform duration-300 ${
          showNavbar ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="w-full bg-[#f3e9dc] text-gray-800 text-sm md:text-base font-medium shadow-sm flex items-center justify-center h-10">
          Envío gratis en pedidos superiores a 80€
        </div>
      </div>

      {/* Navbar principal */}
      <nav
        className={`fixed top-7 left-0 w-full z-50 transition-transform duration-300 ${
          showNavbar ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="w-full bg-white shadow-sm px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Espai buit a l'esquerra */}
            <div className="flex items-center gap-6 w-1/3 md:w-1/4">
              <button className="md:hidden p-2 rounded-2xl bg-gray-200 hover:bg-gray-300 transition-all">
                <Menu className="w-6 h-6 text-gray-800" />
              </button>
            </div>

            {/* Logo al centre */}
            <Link
              href="/"
              className="absolute left-1/2 transform -translate-x-1/2 text-2xl md:text-3xl font-display font-bold text-rose-700 select-none"
            >
              Mōa
            </Link>

            {/* Enllaços i icones dreta: [User] – [Search] – [Cart] */}
            <div className="flex items-center gap-4 md:gap-6 relative">
              <Link
                href="/about"
                className="text-gray-700 hover:text-rose-600 font-medium text-sm md:text-base transition-colors"
              >
                Sobre nosotros
              </Link>

              {/* Icono de usuario */}
              {user === undefined && <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />}
              {user === null && (
                <Link href="/login">
                  <User className="w-6 h-6 text-gray-700 hover:text-rose-600 cursor-pointer transition-all" />
                </Link>
              )}
              {user && (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-1 w-10 h-10 rounded-full bg-rose-600 text-white justify-center font-semibold shadow hover:bg-rose-700 transition-all"
                  >
                    {user.email ? user.email[0].toUpperCase() : 'U'} <ChevronDown className="w-4 h-4" />
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow text-sm z-50">
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
                        Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Icono de búsqueda */}
              <div ref={searchRef} className="relative">
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="p-2 rounded-full hover:bg-gray-200 transition-all"
                >
                  <Search className="w-6 h-6 text-gray-700" />
                </button>
              </div>

              {/* Icono de carrito */}
              <Link href="/cart" className="relative">
                <ShoppingBag className="w-6 h-6 text-gray-700 hover:text-rose-600 transition-all" />
                {items.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-xs px-2 py-0.5 rounded-full flex items-center justify-center font-medium shadow">
                    {items.length}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Input de búsqueda desplegable sota navbar */}
          <div
            className={`transition-all duration-300 mt-2 ${
              searchOpen ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
            }`}
          >
            <input
              type="text"
              placeholder="Buscar producto..."
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>
      </nav>

      {/* Espai superior per no tapar contingut */}
      <div className="h-20"></div>
    </>
  );
}
