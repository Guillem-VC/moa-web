'use client';

import { createContext, useContext } from 'react';

// Tipus d'usuari segons Supabase
export type User = {
  id: string;
  email?: string; // pot ser undefined
  [key: string]: any;
} | null | undefined;

// Context
export const UserContext = createContext<User>(undefined);

// Hook per accedir a l'usuari
export const useUser = () => useContext(UserContext);
