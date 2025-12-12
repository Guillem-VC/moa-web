'use client';

import Link from 'next/link';
import { ShoppingBag, User, ChevronDown, Menu } from 'lucide-react';
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
  const router = useRouter();

  const lastScrollY = useRef(0);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY.current && window.scrollY > 100) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }
      lastScrollY.current = window.scrollY;
      if (menuOpen) setMenuOpen(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [menuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
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
    <nav
      className={`fixed top-0 left-0 w-full bg-background/80 backdrop-blur-md border-b border-border/50 px-6 py-3 z-50 transition-transform duration-300 ${
        showNavbar ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 w-1/3 md:w-1/4">
          <button className="md:hidden p-2 rounded-2xl bg-muted hover:bg-accent/10 transition-all">
            <Menu className="w-6 h-6 text-foreground" />
          </button>
        </div>

        <Link
          href="/"
          className="absolute left-1/2 transform -translate-x-1/2 text-2xl md:text-3xl font-display font-semibold text-foreground select-none"
        >
          Mōa
        </Link>

        <div className="flex items-center gap-4 md:gap-6 relative">
          <Link
            href="/about"
            className="text-muted-foreground hover:text-foreground font-medium text-sm md:text-base transition-colors"
          >
            Sobre nosotros
          </Link>

          <Link href="/cart" className="relative">
            <ShoppingBag className="w-6 h-6 text-muted-foreground hover:text-foreground transition-all" />
            {items.length > 0 && (
              <span className="absolute -top-2 -right-2 h-5 w-5 bg-primary text-primary-foreground text-xs flex items-center justify-center rounded-2xl font-medium shadow-soft animate-fade-in">
                {items.length}
              </span>
            )}
          </Link>

          {user === undefined && (
            <div className="w-8 h-8 rounded-2xl bg-muted animate-pulse" />
          )}

          {user === null && (
            <Link href="/login">
              <User className="w-6 h-6 text-muted-foreground hover:text-foreground cursor-pointer transition-all" />
            </Link>
          )}

          {user && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-1 w-10 h-10 rounded-2xl bg-primary text-primary-foreground justify-center font-medium shadow-soft hover:bg-primary/90 transition-all"
              >
                {user.email ? user.email[0].toUpperCase() : 'U'} <ChevronDown className="w-4 h-4" />

              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-background border border-border rounded-2xl shadow-soft text-sm z-50 animate-fade-in">
                  <Link
                    href="/user"
                    className="block px-4 py-2 hover:bg-accent/10 text-foreground transition-all"
                    onClick={() => setMenuOpen(false)}
                  >
                    Area Usuario
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-accent/10 text-foreground transition-all"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
