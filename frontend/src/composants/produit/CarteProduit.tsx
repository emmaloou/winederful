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
      <div className="carte-produit group">
        <div className="relative h-48 mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
          <span className="text-6xl group-hover:scale-110 transition-transform">🍷</span>
          {produit.rating && produit.rating >= 90 && (
            <div className="absolute top-2 right-2 bg-[#D4AF37] text-white text-xs font-bold px-2 py-1 rounded-full">
              ⭐ {produit.rating}/100
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-full ${couleurBadge}`}>
              {produit.color === 'red' ? 'Rouge' : produit.color === 'white' ? 'Blanc' : 'Rosé'}
            </span>
            <span className={`badge-stock ${stockBadge}`}>
              {stockTexte}
            </span>
          </div>

          <h3 className="font-bold text-lg line-clamp-2 group-hover:text-[#8B1538] transition-colors">
            {produit.name || produit.reference}
          </h3>

          <p className="text-sm text-gray-600">
            {produit.producer || 'Producteur inconnu'}
          </p>

          {produit.region && produit.vintage && (
            <p className="text-xs text-gray-500">
              {produit.region} • {produit.vintage}
            </p>
          )}

          <div className="flex items-end justify-between pt-2 border-t">
            <div>
              <span className="text-2xl font-bold text-[#8B1538]">
                {produit.priceEur ? `${Number(produit.priceEur).toFixed(2)}€` : 'Prix NC'}
              </span>
              <span className="text-xs text-gray-500 ml-1">/ bouteille</span>
            </div>
            <button
              onClick={handleAjouterAuPanier}
              disabled={produit.stockQuantity === 0 || ajoutEnCours}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                produit.stockQuantity === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : ajoutEnCours
                  ? 'bg-green-600 text-white'
                  : 'bg-[#8B1538] text-white hover:bg-[#6B0F2A]'
              }`}
            >
              {ajoutEnCours ? '✓' : produit.stockQuantity > 0 ? 'Ajouter' : 'Indisponible'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
