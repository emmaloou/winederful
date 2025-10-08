'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePanier } from '@/contexts/PanierContext';

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

interface Props {
  produit: Produit;
}

export default function CarteProduit({ produit }: Props) {
  const { ajouterAuPanier } = usePanier();
  const [ajoutEnCours, setAjoutEnCours] = useState(false);
  const couleurBadge = produit.color === 'red' ? 'bg-red-100 text-red-800' : 
                       produit.color === 'white' ? 'bg-yellow-50 text-yellow-800' : 
                       'bg-pink-100 text-pink-800';

  const stockBadge = produit.stockQuantity > 20 ? 'disponible' : 
                     produit.stockQuantity > 0 ? 'limite' : 'rupture';
  
  const stockTexte = produit.stockQuantity > 20 ? 'En stock' :
                     produit.stockQuantity > 0 ? `${produit.stockQuantity} restants` :
                     'Rupture';

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
    }, 1500);
  };

  return (
    <Link href={`/produits/${produit.id}`}>
      <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200">
        <div className="relative h-64 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="text-7xl group-hover:scale-110 transition-transform duration-300 filter drop-shadow-lg">🍷</span>
          {produit.rating && produit.rating >= 90 && (
            <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md">
              ⭐ {produit.rating}
            </div>
          )}
        </div>

        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-md ${couleurBadge}`}>
              {produit.color === 'red' ? 'Rouge' : produit.color === 'white' ? 'Blanc' : 'Rosé'}
            </span>
            <span className={`badge-stock ${stockBadge} text-xs font-medium px-2.5 py-1 rounded-md`}>
              {stockTexte}
            </span>
          </div>

          <h3 className="font-semibold text-lg line-clamp-2 text-gray-900 group-hover:text-[#8B1538] transition-colors">
            {produit.name || produit.reference}
          </h3>

          <p className="text-sm text-gray-600 font-medium">
            {produit.producer || 'Producteur inconnu'}
          </p>

          {produit.region && produit.vintage && (
            <p className="text-xs text-gray-500 flex items-center gap-1.5">
              <span>📍</span>
              {produit.region} • {produit.vintage}
            </p>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
              <div className="text-2xl font-bold text-[#8B1538]">
                {produit.priceEur ? `${Number(produit.priceEur).toFixed(2)}€` : 'Prix NC'}
              </div>
              <span className="text-xs text-gray-400">TTC</span>
            </div>
            <button
              onClick={handleAjouterAuPanier}
              disabled={produit.stockQuantity === 0 || ajoutEnCours}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm ${
                produit.stockQuantity === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : ajoutEnCours
                  ? 'bg-emerald-500 text-white scale-95'
                  : 'bg-[#8B1538] text-white hover:bg-[#6B0F2A] hover:shadow-md active:scale-95'
              }`}
            >
              {ajoutEnCours ? '✓ Ajouté' : produit.stockQuantity > 0 ? '+ Panier' : 'Épuisé'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
