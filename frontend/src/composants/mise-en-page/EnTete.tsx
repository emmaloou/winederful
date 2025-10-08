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
              {/* Barre de recherche */}
              <div className="relative" ref={rechercheRef}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher un vin..."
                    value={termeRecherche}
                    onChange={(e) => setTermeRecherche(e.target.value)}
                    onFocus={() => setRechercheOuverte(true)}
                    className="w-64 px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B1538] focus:border-transparent"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {rechercheEnCours ? (
                      <div className="animate-spin h-5 w-5 border-2 border-[#8B1538] border-t-transparent rounded-full"></div>
                    ) : (
                      '🔍'
                    )}
                  </span>
                </div>

                {/* Dropdown résultats */}
                {rechercheOuverte && termeRecherche.length >= 2 && (
                  <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
                    {resultatsRecherche.length > 0 ? (
                      <div className="py-2">
                        {resultatsRecherche.map((produit) => (
                          <button
                            key={produit.id}
                            onClick={() => naviguerVersProduit(produit.id)}
                            className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left flex items-center gap-3"
                          >
                            <div className="text-3xl">🍷</div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {produit.name || produit.reference}
                              </div>
                              <div className="text-sm text-gray-600">
                                {produit.producer} {produit.vintage ? `• ${produit.vintage}` : ''}
                              </div>
                            </div>
                            <div className="text-[#8B1538] font-bold">
                              {produit.priceEur ? `${Number(produit.priceEur).toFixed(2)}€` : ''}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-8 text-center text-gray-500">
                        <div className="text-4xl mb-2">🔍</div>
                        <p>Aucun résultat trouvé</p>
                        <p className="text-sm mt-1">Essayez avec un autre terme</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <Link href="/panier" className="relative group">
                <span className="text-2xl group-hover:scale-110 transition-transform inline-block">🛒</span>
                {nombreArticles > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#8B1538] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                    {nombreArticles}
                  </span>
                )}
              </Link>

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
