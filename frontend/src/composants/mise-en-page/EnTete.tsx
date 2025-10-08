'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { usePanier } from '@/contexts/PanierContext';
import ModalConnexion from '@/composants/auth/ModalConnexion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://api.localhost';

interface ProduitRecherche {
  id: string;
  reference: string;
  name?: string;
  color: string | null;
  producer: string | null;
  priceEur: number | string | null;
  vintage: number | null;
}

export default function EnTete() {
  const router = useRouter();
  const { user, deconnexion } = useAuth();
  const { nombreArticles } = usePanier();
  const [modalOuverte, setModalOuverte] = useState(false);
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [rechercheOuverte, setRechercheOuverte] = useState(false);
  const [termeRecherche, setTermeRecherche] = useState('');
  const [resultatsRecherche, setResultatsRecherche] = useState<ProduitRecherche[]>([]);
  const [rechercheEnCours, setRechercheEnCours] = useState(false);
  const rechercheRef = useRef<HTMLDivElement>(null);

  // Fermer la recherche en cliquant à l'extérieur
  useEffect(() => {
    function gererClicExterieur(event: MouseEvent) {
      if (rechercheRef.current && !rechercheRef.current.contains(event.target as Node)) {
        setRechercheOuverte(false);
      }
    }

    if (rechercheOuverte) {
      document.addEventListener('mousedown', gererClicExterieur);
      return () => document.removeEventListener('mousedown', gererClicExterieur);
    }
  }, [rechercheOuverte]);

  // Effectuer la recherche avec debounce
  useEffect(() => {
    if (termeRecherche.length < 2) {
      setResultatsRecherche([]);
      return;
    }

    setRechercheEnCours(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/api/produits?limit=100`, {
          cache: 'no-store',
        });

        if (res.ok) {
          const data = await res.json();
          const produits = data.donnees || [];

          // Filtrer côté client
          const resultats = produits.filter((p: ProduitRecherche) => {
            const recherche = termeRecherche.toLowerCase();
            return (
              p.name?.toLowerCase().includes(recherche) ||
              p.reference.toLowerCase().includes(recherche) ||
              p.producer?.toLowerCase().includes(recherche) ||
              p.color?.toLowerCase().includes(recherche)
            );
          });

          setResultatsRecherche(resultats.slice(0, 5));
        }
      } catch (error) {
        console.error('Erreur recherche:', error);
      } finally {
        setRechercheEnCours(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [termeRecherche]);

  const naviguerVersProduit = (id: string) => {
    setRechercheOuverte(false);
    setTermeRecherche('');
    setResultatsRecherche([]);
    router.push(`/produits/${id}`);
  };

  return (
    <>
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-8">
            <Link href="/" className="flex items-center space-x-3 group">
              <span className="text-3xl group-hover:scale-110 transition-transform">🍷</span>
              <div>
                <span className="text-2xl font-bold text-[#8B1538] tracking-tight">WineShop</span>
                <p className="text-xs text-gray-500 -mt-0.5">Vins d'exception</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center space-x-1">
              <Link href="/" className="px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700 hover:text-[#8B1538]">Accueil</Link>
              <Link href="/catalogue" className="px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700 hover:text-[#8B1538]">Catalogue</Link>
            </nav>

            <div className="flex items-center space-x-4">
              {/* Barre de recherche */}
              <div className="relative flex-1 max-w-md" ref={rechercheRef}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher un vin..."
                    value={termeRecherche}
                    onChange={(e) => setTermeRecherche(e.target.value)}
                    onFocus={() => setRechercheOuverte(true)}
                    className="w-full px-5 py-2.5 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1538]/20 focus:border-[#8B1538] focus:bg-white transition-all text-sm"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    {rechercheEnCours ? (
                      <div className="animate-spin h-4 w-4 border-2 border-[#8B1538] border-t-transparent rounded-full"></div>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    )}
                  </span>
                </div>

                {/* Dropdown résultats */}
                {rechercheOuverte && termeRecherche.length >= 2 && (
                  <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-96 overflow-y-auto z-50">
                    {resultatsRecherche.length > 0 ? (
                      <div className="p-2">
                        {resultatsRecherche.map((produit) => (
                          <button
                            key={produit.id}
                            onClick={() => naviguerVersProduit(produit.id)}
                            className="w-full px-4 py-3 hover:bg-gray-50 rounded-xl transition-all text-left flex items-center gap-4 group"
                          >
                            <div className="text-2xl group-hover:scale-110 transition-transform">🍷</div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-900 truncate group-hover:text-[#8B1538] transition-colors">
                                {produit.name || produit.reference}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {produit.producer} {produit.vintage ? `• ${produit.vintage}` : ''}
                              </div>
                            </div>
                            <div className="text-[#8B1538] font-bold text-sm">
                              {produit.priceEur ? `${Number(produit.priceEur).toFixed(2)}€` : ''}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-10 text-center text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <p className="font-medium">Aucun résultat</p>
                        <p className="text-sm mt-1 text-gray-400">Essayez un autre terme</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <Link href="/panier" className="relative group p-2.5 hover:bg-gray-50 rounded-xl transition-all">
                <svg className="w-6 h-6 text-gray-700 group-hover:text-[#8B1538] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {nombreArticles > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#8B1538] text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center font-bold px-1.5 shadow-md">
                    {nombreArticles}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setMenuOuvert(!menuOuvert)}
                    className="flex items-center space-x-3 hover:bg-gray-50 px-3 py-2 rounded-xl transition-all border border-gray-200"
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-[#8B1538] to-[#6B0F2A] text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
                      {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                    </div>
                    <span className="font-medium text-sm hidden md:block text-gray-700">{user.name || user.email.split('@')[0]}</span>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${menuOuvert ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {menuOuvert && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl py-2 border border-gray-100">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user.name || 'Utilisateur'}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          deconnexion();
                          setMenuOuvert(false);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-600 font-medium text-sm flex items-center gap-2 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setModalOuverte(true)}
                  className="px-5 py-2.5 bg-[#8B1538] text-white rounded-xl font-semibold hover:bg-[#6B0F2A] transition-all shadow-sm hover:shadow-md"
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
