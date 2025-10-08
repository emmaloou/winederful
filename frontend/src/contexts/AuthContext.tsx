'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://api.localhost';

interface User {
  id: string;
  email: string;
  name: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  chargement: boolean;
  connexion: (email: string, password: string) => Promise<void>;
  inscription: (email: string, password: string, name?: string) => Promise<void>;
  deconnexion: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [chargement, setChargement] = useState(true);

  // Charger le token depuis localStorage au démarrage
  useEffect(() => {
    const tokenStocke = localStorage.getItem('authToken');
    if (tokenStocke) {
      setToken(tokenStocke);
      chargerProfil(tokenStocke);
    } else {
      setChargement(false);
    }
  }, []);

  async function chargerProfil(tokenAuth: string) {
    try {
      const res = await fetch(`${API_URL}/api/auth/profil`, {
        headers: {
          Authorization: `Bearer ${tokenAuth}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.donnees);
      } else {
        // Token invalide
        localStorage.removeItem('authToken');
        setToken(null);
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    } finally {
      setChargement(false);
    }
  }

  async function connexion(email: string, password: string) {
    const res = await fetch(`${API_URL}/api/auth/connexion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.erreur || 'Erreur de connexion');
    }

    const data = await res.json();
    const { token: nouveauToken, utilisateur } = data.donnees;

    localStorage.setItem('authToken', nouveauToken);
    setToken(nouveauToken);
    setUser(utilisateur);
  }

  async function inscription(email: string, password: string, name?: string) {
    const res = await fetch(`${API_URL}/api/auth/inscription`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.erreur || "Erreur lors de l'inscription");
    }

    const data = await res.json();
    const { token: nouveauToken, utilisateur } = data.donnees;

    localStorage.setItem('authToken', nouveauToken);
    setToken(nouveauToken);
    setUser(utilisateur);
  }

  function deconnexion() {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, token, chargement, connexion, inscription, deconnexion }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
}
