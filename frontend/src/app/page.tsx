import Link from 'next/link';
import EnTete from '@/composants/mise-en-page/EnTete';
import PiedDePage from '@/composants/mise-en-page/PiedDePage';
import ListeProduits from '@/composants/produit/ListeProduits';
import '@/styles/globals.css';
import { Produit } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://api.localhost';

interface ResultatProduits {
  produits: Produit[];
  erreur: string | null;
}

async function obtenirProduits(): Promise<ResultatProduits> {
  try {
    const res = await fetch(`${API_URL}/api/produits`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!res.ok) {
      return {
        produits: [],
        erreur: `Erreur serveur: ${res.status}`
      };
    }

    const data = await res.json();
    return {
      produits: (data.donnees || []) as Produit[],
      erreur: null
    };
  } catch (error) {
    return {
      produits: [],
      erreur: 'Impossible de charger les produits. Vérifiez votre connexion.'
    };
  }
}

export default async function Page() {
  const { produits, erreur } = await obtenirProduits();
  const produitsAffichage = produits.slice(0, 8); // Afficher max 8 sur homepage
  return (
    <>
      <EnTete />
      <main className="min-h-screen">
        <section className="bg-gradient-to-br from-[#8B1538] to-[#6B0F2A] text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-4">🍷 Découvrez notre sélection de vins d'exception</h1>
            <p className="text-xl mb-8 opacity-90">Plus de 500 références des meilleurs domaines français</p>
            <Link href="/catalogue">
              <button className="bg-white text-[#8B1538] px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors">
                Explorer le catalogue
              </button>
            </Link>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Sélection du moment</h2>
            <Link href="/catalogue" className="text-[#8B1538] hover:underline font-medium">
              Voir tout le catalogue →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <ListeProduits produitsInitiaux={produitsAffichage} erreur={erreur} />
          </div>
        </section>
      </main>
      <PiedDePage />
    </>
  );
}
