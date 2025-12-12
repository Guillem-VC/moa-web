'use client';
import type { ReactNode } from 'react';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { UserContext, type User } from '@/components/UserContext';

export default function RootLayout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(undefined);

  useEffect(() => {
    const initUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null); // ara és compatible amb tipus User
    };
    initUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null); // també compatible
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <html lang="es">
      <body className="flex flex-col min-h-screen">
        <UserContext.Provider value={user}>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </UserContext.Provider>
      </body>
    </html>
  );
}
