'use client';

import { createContext, useContext } from 'react';

// Tipus d'usuari segons Supabase
export type AuthUser = {
  id: string;
  email?: string;
  [key: string]: any;
};

export type UserState = AuthUser | null | undefined;

export const UserContext = createContext<UserState>(undefined);

export const useUser = () => useContext(UserContext);
