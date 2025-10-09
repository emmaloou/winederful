'use client';

import { useState, useEffect } from 'react';
import EnTete from '@/composants/mise-en-page/EnTete';
import PiedDePage from '@/composants/mise-en-page/PiedDePage';
import CarteProduit from '@/composants/produit/CarteProduit';
import SkeletonProduit from '@/composants/produit/SkeletonProduit';
import { Produit } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://api.localhost';

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
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue';
      console.error('Erreur:', err);
      setErreur(message);
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
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#8B1538] via-[#6B0F2A] to-[#4A0A1C] text-white py-20 overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDEzNGgxMnYxMmgtMTJ6bS03NiAwaDEydjEySDI0em03NiAyNGgxMnYxMkgxMDB6bS03NiAwaDEydjEySDE0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-3xl">
              <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">Notre Sélection</h1>
              <p className="text-xl text-white/90">
                Découvrez {produits.length} vins d'exception soigneusement sélectionnés
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-6 py-10">
          {/* Filtres */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 mb-10">
            <h2 className="text-base font-semibold mb-4 text-gray-700 uppercase tracking-wide">Filtrer par type</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setFiltreActif('tous')}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                  filtreActif === 'tous'
                    ? 'bg-[#8B1538] text-white shadow-lg scale-105'
                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-[#8B1538] hover:text-[#8B1538]'
                }`}
              >
                Tous <span className="ml-1.5 opacity-70">({stats.total})</span>
              </button>

              <button
                onClick={() => setFiltreActif('red')}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                  filtreActif === 'red'
                    ? 'bg-red-600 text-white shadow-lg scale-105'
                    : 'bg-white border-2 border-red-200 text-red-700 hover:border-red-400'
                }`}
              >
                Rouge <span className="ml-1.5 opacity-70">({stats.red})</span>
              </button>

              <button
                onClick={() => setFiltreActif('white')}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                  filtreActif === 'white'
                    ? 'bg-amber-500 text-white shadow-lg scale-105'
                    : 'bg-white border-2 border-amber-200 text-amber-700 hover:border-amber-400'
                }`}
              >
                Blanc <span className="ml-1.5 opacity-70">({stats.white})</span>
              </button>

              <button
                onClick={() => setFiltreActif('rose')}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                  filtreActif === 'rose'
                    ? 'bg-pink-500 text-white shadow-lg scale-105'
                    : 'bg-white border-2 border-pink-200 text-pink-700 hover:border-pink-400'
                }`}
              >
                Rosé <span className="ml-1.5 opacity-70">({stats.rose})</span>
              </button>

              <button
                onClick={() => setFiltreActif('sparkling')}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                  filtreActif === 'sparkling'
                    ? 'bg-purple-600 text-white shadow-lg scale-105'
                    : 'bg-white border-2 border-purple-200 text-purple-700 hover:border-purple-400'
                }`}
              >
                Effervescent <span className="ml-1.5 opacity-70">({stats.sparkling})</span>
              </button>
            </div>
          </div>

          {/* Résultats */}
          {chargement ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <SkeletonProduit key={i} />
              ))}
            </div>
          ) : erreur ? (
            <div className="bg-red-50/80 backdrop-blur-sm border-2 border-red-200 rounded-2xl p-8 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800 font-semibold text-lg mb-4">{erreur}</p>
              <button
                onClick={chargerProduits}
                className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 shadow-md transition-all"
              >
                Réessayer
              </button>
            </div>
          ) : produitsFiltres.length === 0 ? (
            <div className="text-center py-32 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200">
              <svg className="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-gray-700 text-lg font-semibold mb-2">Aucun vin trouvé</p>
              <p className="text-gray-500 mb-6">Aucun produit ne correspond à vos critères</p>
              <button
                onClick={() => setFiltreActif('tous')}
                className="px-6 py-3 bg-[#8B1538] text-white rounded-xl font-semibold hover:bg-[#6B0F2A] shadow-md transition-all"
              >
                Réinitialiser
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between">
                <p className="text-gray-600">
                  <span className="font-bold text-[#8B1538] text-lg">{produitsFiltres.length}</span>
                  <span className="text-sm ml-2">produit{produitsFiltres.length > 1 ? 's' : ''}</span>
                </p>
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
