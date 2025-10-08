'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ModalConnexion from '@/composants/auth/ModalConnexion';

export default function EnTete() {
  const { user, deconnexion } = useAuth();
  const [modalOuverte, setModalOuverte] = useState(false);
  const [menuOuvert, setMenuOuvert] = useState(false);

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-3xl">🍷</span>
              <span className="text-2xl font-bold text-[#8B1538]">WineShop</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="hover:text-[#8B1538] transition-colors">Accueil</Link>
              <Link href="/catalogue" className="hover:text-[#8B1538] transition-colors">Catalogue</Link>
            </nav>

            <div className="flex items-center space-x-4">
              <button className="relative">
                <span className="text-2xl">🛒</span>
                <span className="absolute -top-2 -right-2 bg-[#8B1538] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">0</span>
              </button>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setMenuOuvert(!menuOuvert)}
                    className="flex items-center space-x-2 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-[#8B1538] text-white rounded-full flex items-center justify-center font-bold">
                      {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                    </div>
                    <span className="font-medium hidden md:block">{user.name || user.email}</span>
                  </button>

                  {menuOuvert && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border">
                      <button
                        onClick={() => {
                          deconnexion();
                          setMenuOuvert(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                      >
                        Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setModalOuverte(true)}
                  className="bouton-principal"
                >
                  Connexion
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <ModalConnexion
        ouvert={modalOuverte}
        onFermer={() => setModalOuverte(false)}
      />
    </>
  );
}
