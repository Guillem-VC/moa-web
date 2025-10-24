'use client';
import './globals.css';
import Link from 'next/link';
import { ShoppingBag, User, ChevronDown } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { items } = useCartStore();
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { resetCart } = useCartStore();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      // Només considerem l'usuari logejat si és "authenticated" i NO és recovery
      if (session?.user && session.user.aud === 'authenticated' && !session.user.recovery_sent_at) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    };
    checkUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user && session.user.aud === 'authenticated' && !session.user.recovery_sent_at) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    resetCart();        // <-- netegem el carrito local
    setMenuOpen(false);
    router.push('/');
  };

  // Tanquem el menú si fem clic fora
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
    <html lang="ca">
      <body className="bg-gradient-to-b from-white via-rose-50 to-white">
        <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-sm sticky top-0 z-50">
          <Link href="/" className="text-2xl font-bold text-rose-700">Mōa</Link>
          <div className="flex items-center gap-6 relative">
            <Link href="/cart" className="relative">
              <ShoppingBag className="w-6 h-6 text-gray-700 hover:text-rose-600 transition" />
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {items.length}
                </span>
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
                      onClick={() => handleLogout()}
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

        {children}
      </body>
    </html>
  );
}
