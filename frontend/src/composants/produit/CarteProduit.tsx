'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePanier } from '@/contexts/PanierContext';
import { Produit } from '@/types';

interface Props {
  produit: Produit;
}

export default function CarteProduit({ produit }: Props) {
  const { ajouterAuPanier } = usePanier();
  const [ajoutEnCours, setAjoutEnCours] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const couleurConfig = {
    red: { badge: 'bg-red-50 text-red-700 border border-red-200', gradient: 'from-red-50 to-red-100', icon: '🍷' },
    white: { badge: 'bg-amber-50 text-amber-700 border border-amber-200', gradient: 'from-amber-50 to-yellow-100', icon: '🥂' },
    rose: { badge: 'bg-pink-50 text-pink-700 border border-pink-200', gradient: 'from-pink-50 to-rose-100', icon: '🌸' },
    rosé: { badge: 'bg-pink-50 text-pink-700 border border-pink-200', gradient: 'from-pink-50 to-rose-100', icon: '🌸' },
    sparkling: { badge: 'bg-purple-50 text-purple-700 border border-purple-200', gradient: 'from-purple-50 to-indigo-100', icon: '🍾' },
  };

  const config = couleurConfig[produit.color as keyof typeof couleurConfig] || couleurConfig.red;

  const stockConfig = produit.stockQuantity > 20
    ? { badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200', text: 'En stock', icon: '✓' }
    : produit.stockQuantity > 0
    ? { badge: 'bg-orange-50 text-orange-700 border border-orange-200', text: `${produit.stockQuantity} restants`, icon: '⚡' }
    : { badge: 'bg-gray-100 text-gray-500 border border-gray-300', text: 'Rupture', icon: '✕' };

  const handleAjouterAuPanier = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setAjoutEnCours(true);
    ajouterAuPanier({
      id: produit.id,
      reference: produit.reference,
      name: produit.name,
      priceEur: typeof produit.priceEur === 'number' ? produit.priceEur : parseFloat(produit.priceEur || '0'),
      color: produit.color,
      producer: produit.producer,
      stockQuantity: produit.stockQuantity,
    });

    setTimeout(() => {
      setAjoutEnCours(false);
    }, 2000);
  };

  return (
    <Link href={`/produits/${produit.id}`}>
      <div
        className="group relative bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-200 hover:border-[#8B1538]/30 transform hover:-translate-y-2"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Badge Premium */}
        {produit.rating && Number(produit.rating) >= 95 && (
          <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 animate-pulse">
            <span className="text-sm">👑</span>
            <span>Premium</span>
          </div>
        )}

        {/* Image Section avec effet parallaxe */}
        <div className={`relative h-72 bg-gradient-to-br ${config.gradient} flex items-center justify-center overflow-hidden transition-all duration-700`}>
          {/* Overlay gradient animé */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/20 transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}></div>

          {/* Cercles décoratifs animés */}
          <div className="absolute inset-0 overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl transition-all duration-700 ${isHovered ? 'scale-150 translate-x-8 -translate-y-8' : 'scale-100'}`}></div>
            <div className={`absolute bottom-0 left-0 w-40 h-40 bg-white/15 rounded-full blur-2xl transition-all duration-700 ${isHovered ? 'scale-150 -translate-x-8 translate-y-8' : 'scale-100'}`}></div>
          </div>

          {/* Icône bouteille avec animation */}
          <span className={`relative text-8xl transition-all duration-500 filter drop-shadow-2xl ${isHovered ? 'scale-125 rotate-6' : 'scale-100'}`}>
            {config.icon}
          </span>

          {/* Badge Note */}
          {produit.rating && Number(produit.rating) >= 90 && (
            <div className={`absolute top-3 right-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`}>
              <span className="flex items-center gap-1">
                <span className="text-sm">⭐</span>
                <span>{produit.rating}</span>
              </span>
            </div>
          )}

          {/* Bouton Quick View au survol */}
          <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="bg-white/95 backdrop-blur-md px-6 py-3 rounded-full shadow-xl font-semibold text-[#8B1538] text-sm flex items-center gap-2 transform transition-all duration-300 hover:scale-105">
              <span>👁️</span>
              <span>Voir les détails</span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-4">
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${config.badge} transition-all duration-300 hover:scale-105`}>
              {produit.color === 'red' ? '🔴 Rouge' : produit.color === 'white' ? '⚪ Blanc' : produit.color === 'sparkling' ? '✨ Effervescent' : '🌸 Rosé'}
            </span>
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${stockConfig.badge} transition-all duration-300 hover:scale-105 flex items-center gap-1`}>
              <span className="text-[10px]">{stockConfig.icon}</span>
              {stockConfig.text}
            </span>
          </div>

          {/* Titre avec animation */}
          <h3 className="font-bold text-xl line-clamp-2 text-gray-900 group-hover:text-[#8B1538] transition-all duration-300 leading-tight min-h-[56px]">
            {produit.name || produit.reference}
          </h3>

          {/* Producteur avec icône */}
          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
            <span className="text-base">🏛️</span>
            <span className="line-clamp-1">{produit.producer || 'Producteur inconnu'}</span>
          </div>

          {/* Région et millésime */}
          {produit.region && produit.vintage && (
            <div className="flex items-center gap-3 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-xl">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="text-sm">📍</span>
                {produit.region}
              </span>
              <span className="text-gray-300">•</span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="text-sm">🗓️</span>
                {produit.vintage}
              </span>
            </div>
          )}

          {/* Prix et bouton CTA */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="space-y-1">
              <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#8B1538] to-[#6B0F2A]">
                {produit.priceEur ? `${Number(produit.priceEur).toFixed(2)}€` : 'Prix NC'}
              </div>
              <span className="text-xs text-gray-400 font-medium">TTC • Livraison offerte</span>
            </div>

            <button
              onClick={handleAjouterAuPanier}
              disabled={produit.stockQuantity === 0 || ajoutEnCours}
              className={`group/btn relative px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 overflow-hidden ${
                produit.stockQuantity === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : ajoutEnCours
                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/50 scale-105'
                  : 'bg-gradient-to-r from-[#8B1538] to-[#6B0F2A] text-white hover:shadow-xl hover:shadow-[#8B1538]/50 hover:scale-105 active:scale-95'
              }`}
            >
              {/* Effet shimmer au survol */}
              {!ajoutEnCours && produit.stockQuantity > 0 && (
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent transform -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></span>
              )}

              <span className="relative flex items-center gap-2">
                {ajoutEnCours ? (
                  <>
                    <span className="animate-bounce">✓</span>
                    <span>Ajouté !</span>
                  </>
                ) : produit.stockQuantity > 0 ? (
                  <>
                    <span className="text-base">🛒</span>
                    <span>Ajouter</span>
                  </>
                ) : (
                  <span>Épuisé</span>
                )}
              </span>
            </button>
          </div>
        </div>

        {/* Effet de brillance sur toute la carte au survol */}
        <div className={`absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}></div>
      </div>
    </Link>
  );
}
