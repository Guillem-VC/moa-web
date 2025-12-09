import type { ReactNode } from 'react';
import './globals.css';
import ClientLayout from './clientLayout';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
