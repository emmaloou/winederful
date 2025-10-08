'use client';

import { useState, useEffect } from 'react';
import EnTete from '@/composants/mise-en-page/EnTete';
import PiedDePage from '@/composants/mise-en-page/PiedDePage';
import CarteProduit from '@/composants/produit/CarteProduit';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://api.localhost';

interface Produit {
  id: string;
  reference: string;
  name?: string;
  color: string | null;
  region: string | null;
  vintage: number | null;
  priceEur: number | string | null;
  producer: string | null;
  rating: number | null;
  stockQuantity: number;
}

export default function CataloguePage() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [filtreActif, setFiltreActif] = useState<string>('tous');
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    chargerProduits();
  }, []);

  async function chargerProduits() {
    try {
      setChargement(true);
      setErreur(null);

      const res = await fetch(`${API_URL}/api/produits`, {
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error('Erreur lors du chargement des produits');
      }

      const data = await res.json();
      setProduits(data.donnees || []);
    } catch (err: any) {
      console.error('Erreur:', err);
      setErreur(err.message);
    } finally {
      setChargement(false);
    }
  }

  const produitsFiltres = produits.filter((p) => {
    if (filtreActif === 'tous') return true;
    if (filtreActif === 'red') return p.color === 'red';
    if (filtreActif === 'white') return p.color === 'white';
    if (filtreActif === 'rose') return p.color === 'rose' || p.color === 'rosé';
    if (filtreActif === 'sparkling') return p.color === 'sparkling';
    return true;
  });

  const stats = {
    total: produits.length,
    red: produits.filter((p) => p.color === 'red').length,
    white: produits.filter((p) => p.color === 'white').length,
    rose: produits.filter((p) => p.color === 'rose' || p.color === 'rosé').length,
    sparkling: produits.filter((p) => p.color === 'sparkling').length,
  };

  return (
    <>
      <EnTete />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#8B1538] to-[#6B0F2A] text-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">🍷 Catalogue de vins</h1>
            <p className="text-xl opacity-90">
              {produits.length} références des meilleurs domaines français
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          {/* Filtres */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-lg font-bold mb-4 text-gray-800">Filtrer par couleur</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setFiltreActif('tous')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  filtreActif === 'tous'
                    ? 'bg-[#8B1538] text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Tous ({stats.total})
              </button>

              <button
                onClick={() => setFiltreActif('red')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  filtreActif === 'red'
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                }`}
              >
                🍷 Rouge ({stats.red})
              </button>

              <button
                onClick={() => setFiltreActif('white')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  filtreActif === 'white'
                    ? 'bg-yellow-500 text-white shadow-lg'
                    : 'bg-yellow-50 text-yellow-800 hover:bg-yellow-100'
                }`}
              >
                🥂 Blanc ({stats.white})
              </button>

              <button
                onClick={() => setFiltreActif('rose')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  filtreActif === 'rose'
                    ? 'bg-pink-500 text-white shadow-lg'
                    : 'bg-pink-100 text-pink-800 hover:bg-pink-200'
                }`}
              >
                🌸 Rosé ({stats.rose})
              </button>

              <button
                onClick={() => setFiltreActif('sparkling')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  filtreActif === 'sparkling'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                }`}
              >
                🍾 Effervescent ({stats.sparkling})
              </button>
            </div>
          </div>

          {/* Résultats */}
          {chargement ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1538]"></div>
              <p className="mt-4 text-gray-600">Chargement du catalogue...</p>
            </div>
          ) : erreur ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-800 font-medium">❌ {erreur}</p>
              <button
                onClick={chargerProduits}
                className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Réessayer
              </button>
            </div>
          ) : produitsFiltres.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl">
              <p className="text-2xl mb-2">🔍</p>
              <p className="text-gray-600">Aucun vin trouvé avec ces critères</p>
              <button
                onClick={() => setFiltreActif('tous')}
                className="mt-4 px-6 py-2 bg-[#8B1538] text-white rounded-lg hover:bg-[#6B0F2A]"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4 text-gray-600">
                <span className="font-semibold">{produitsFiltres.length}</span> vins affichés
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {produitsFiltres.map((produit) => (
                  <CarteProduit key={produit.id} produit={produit} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <PiedDePage />
    </>
  );
}
