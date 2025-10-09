'use client';

import { Produit } from '@/types';
import CarteProduit from './CarteProduit';

interface Props {
  produitsInitiaux: Produit[];
  erreur?: string | null;
}

export default function ListeProduits({ produitsInitiaux, erreur }: Props) {
  if (erreur) {
    return (
      <div className="col-span-4 bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
        <svg className="w-16 h-16 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-red-800 font-semibold text-lg mb-2">Erreur de chargement</p>
        <p className="text-red-600 text-sm">{erreur}</p>
      </div>
    );
  }

  if (produitsInitiaux.length === 0) {
    return (
      <div className="col-span-4 text-center py-12 text-gray-500">
        Aucun produit disponible pour le moment
      </div>
    );
  }

  return (
    <>
      {produitsInitiaux.map((produit) => (
        <CarteProduit key={produit.id} produit={produit} />
      ))}
    </>
  );
}
