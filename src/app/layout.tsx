'use client';

import type { ReactNode } from 'react';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer'
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function RootLayout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null | undefined>(undefined);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);


  return (
    <html lang="es">
      <body className="flex flex-col min-h-screen">
        <Navbar />
        <CartDrawer />
        <main className="flex-1 pt-[104px]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
