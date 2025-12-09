import type { ReactNode } from 'react';
import './globals.css';
import ClientLayout from './ClientLayout';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (

        <ClientLayout>
          {children}
        </ClientLayout>

  );
}
