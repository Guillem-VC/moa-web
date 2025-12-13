'use client';

import Link from 'next/link';
import { ShoppingBag, User, ChevronDown, Search, X } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useUser } from './UserContext';
import { supabase } from '@/lib/supabaseClient';

export default function Navbar() {
  const user = useUser();
  const { items, resetCart } = useCartStore();
  const router = useRouter();

  const [searchOpen, setSearchOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);

  const lastScrollY = useRef(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY.current && window.scrollY > 100) {
        setShowNavbar(false);
        setSearchOpen(false);
      } else {
        setShowNavbar(true);
      }
      lastScrollY.current = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setSearchOpen(false);
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {}
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    resetCart();
    router.push('/');
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
              {/* Search */}
              <div ref={searchRef}>
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="p-2 rounded-full hover:bg-gray-200 transition-all"
                >
                  {searchOpen ? <X className="w-6 h-6 text-gray-700" /> : <Search className="w-6 h-6 text-gray-700" />}
                </button>
              </div>

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
                <Link href="/login">
                  <User className="w-6 h-6 text-gray-700 hover:text-rose-600 cursor-pointer transition-all" />
                </Link>
              )}
              {user && (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowNavbar(prev => !prev)}
                    className="flex items-center gap-1 w-10 h-10 rounded-full bg-rose-600 text-white justify-center font-semibold shadow hover:bg-rose-700 transition-all"
                  >
                    {user.email ? user.email[0].toUpperCase() : 'U'}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Search bar just below navbar */}
        <div className={`w-full bg-white border-t border-gray-200 transition-max-h duration-300 overflow-hidden ${searchOpen ? 'max-h-24 py-2' : 'max-h-0 py-0'}`}>
          <div className="w-full px-4 md:px-8">
            <div className="flex items-center gap-4 bg-white rounded-md px-4 py-2 shadow-md">
              <Search className="w-6 h-6 text-gray-700" />
              <input ref={searchInputRef} type="text" placeholder="Search for..." className="w-full focus:outline-none focus:ring-2 focus:ring-rose-500" />
              <button onClick={() => setSearchOpen(false)}>
                <X className="w-6 h-6 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-28" />
    </>
  );
}
