'use client';

import { useUser } from '@/components/UserContext';

export default function UserPage() {
  const user = useUser();

  // Estat de càrrega global (AuthProvider)
  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Carregant sessió...</p>
      </div>
    );
  }

  // En producció això MAI hauria de passar gràcies al middleware
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-3xl font-display mb-4">
        Hola {user.email ?? 'Usuari'}
      </h1>

      <p className="text-muted-foreground">
        Aquesta és la teva àrea privada.
      </p>
    </div>
  );
}
