import { notFound } from 'next/navigation';
import Link from 'next/link';
import EnTete from '@/composants/mise-en-page/EnTete';
import PiedDePage from '@/composants/mise-en-page/PiedDePage';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://api.localhost';

interface Produit {
  id: string;
  reference: string;
  name?: string;
  color: string | null;
  country: string | null;
  region: string | null;
  appellation: string | null;
  vintage: number | null;
  grapes: string | null;
  alcoholPercent: number | null;
  bottleSizeL: number | null;
  sweetness: string | null;
  tannin: string | null;
  acidity: string | null;
  rating: number | null;
  priceEur: number | string | null;
  producer: string | null;
  stockQuantity: number;
  description: string | null;
}

async function obtenirProduit(id: string): Promise<Produit | null> {
  try {
    const res = await fetch(`${API_URL}/api/produits/${id}`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data.donnees || null;
  } catch (error) {
    console.error('Erreur fetch produit:', error);
    return null;
  }
}

function obtenirCouleurClasse(couleur: string | null): string {
  switch (couleur) {
    case 'red':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'white':
      return 'bg-yellow-50 text-yellow-800 border-yellow-300';
    case 'rose':
    case 'rosé':
      return 'bg-pink-100 text-pink-800 border-pink-300';
    case 'sparkling':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

function obtenirNomCouleur(couleur: string | null): string {
  switch (couleur) {
    case 'red':
      return '🍷 Rouge';
    case 'white':
      return '🥂 Blanc';
    case 'rose':
    case 'rosé':
      return '🌸 Rosé';
    case 'sparkling':
      return '🍾 Effervescent';
    default:
      return couleur || 'Non spécifié';
  }
}

export default async function DetailProduitPage({ params }: { params: { id: string } }) {
  const produit = await obtenirProduit(params.id);

  if (!produit) {
    notFound();
  }

  const prix = typeof produit.priceEur === 'number'
    ? produit.priceEur.toFixed(2)
    : produit.priceEur || 'N/A';

  const enStock = produit.stockQuantity > 0;

  return (
    <>
      <EnTete />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm text-gray-600">
            <Link href="/" className="hover:text-[#8B1538]">Accueil</Link>
            {' > '}
            <Link href="/catalogue" className="hover:text-[#8B1538]">Catalogue</Link>
            {' > '}
            <span className="text-gray-900 font-medium">{produit.name || produit.reference}</span>
          </nav>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8 p-8">
              {/* Image Section */}
              <div className="flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-12">
                <div className="text-center">
                  <div className="text-8xl mb-4">🍷</div>
                  <p className="text-gray-500 text-sm">Image à venir</p>
                </div>
              </div>

              {/* Info Section */}
              <div className="space-y-6">
                {/* Header */}
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${obtenirCouleurClasse(produit.color)}`}>
                    {obtenirNomCouleur(produit.color)}
                  </span>
                  <h1 className="text-4xl font-bold text-gray-900 mt-3">
                    {produit.name || produit.reference}
                  </h1>
                  {produit.producer && (
                    <p className="text-xl text-gray-600 mt-2">
                      {produit.producer}
                    </p>
                  )}
                </div>

                {/* Prix */}
                <div className="border-t border-b border-gray-200 py-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-[#8B1538]">{prix}€</span>
                    {produit.bottleSizeL && (
                      <span className="text-gray-500">/ {produit.bottleSizeL}L</span>
                    )}
                  </div>
                  {produit.rating && (
                    <div className="flex items-center mt-2">
                      <span className="text-yellow-500 text-lg">
                        {'⭐'.repeat(Math.round(produit.rating / 20))}
                      </span>
                      <span className="ml-2 text-gray-600">{produit.rating}/100</span>
                    </div>
                  )}
                </div>

                {/* Stock */}
                <div>
                  {enStock ? (
                    <p className="text-green-600 font-medium flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-green-600 rounded-full"></span>
                      En stock ({produit.stockQuantity} disponible{produit.stockQuantity > 1 ? 's' : ''})
                    </p>
                  ) : (
                    <p className="text-red-600 font-medium flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-red-600 rounded-full"></span>
                      Rupture de stock
                    </p>
                  )}
                </div>

                {/* Boutons Action */}
                <div className="space-y-3">
                  <button
                    disabled={!enStock}
                    className={`w-full py-4 rounded-lg font-bold text-lg transition-colors ${
                      enStock
                        ? 'bg-[#8B1538] text-white hover:bg-[#6B0F2A]'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {enStock ? '🛒 Ajouter au panier' : 'Indisponible'}
                  </button>
                  <button className="w-full py-3 rounded-lg font-medium border-2 border-[#8B1538] text-[#8B1538] hover:bg-gray-50 transition-colors">
                    ♥ Ajouter aux favoris
                  </button>
                </div>

                {/* Caractéristiques */}
                <div className="border-t border-gray-200 pt-6">
                  <h2 className="text-xl font-bold mb-4">Caractéristiques</h2>
                  <dl className="grid grid-cols-2 gap-4 text-sm">
                    {produit.region && (
                      <>
                        <dt className="text-gray-600">Région</dt>
                        <dd className="font-medium">{produit.region}</dd>
                      </>
                    )}
                    {produit.country && (
                      <>
                        <dt className="text-gray-600">Pays</dt>
                        <dd className="font-medium">{produit.country}</dd>
                      </>
                    )}
                    {produit.appellation && (
                      <>
                        <dt className="text-gray-600">Appellation</dt>
                        <dd className="font-medium">{produit.appellation}</dd>
                      </>
                    )}
                    {produit.vintage && (
                      <>
                        <dt className="text-gray-600">Millésime</dt>
                        <dd className="font-medium">{produit.vintage}</dd>
                      </>
                    )}
                    {produit.grapes && (
                      <>
                        <dt className="text-gray-600">Cépages</dt>
                        <dd className="font-medium">{produit.grapes}</dd>
                      </>
                    )}
                    {produit.alcoholPercent && (
                      <>
                        <dt className="text-gray-600">Alcool</dt>
                        <dd className="font-medium">{produit.alcoholPercent}%</dd>
                      </>
                    )}
                  </dl>
                </div>

                {/* Notes de Dégustation */}
                {(produit.sweetness || produit.tannin || produit.acidity) && (
                  <div className="border-t border-gray-200 pt-6">
                    <h2 className="text-xl font-bold mb-4">Notes de dégustation</h2>
                    <div className="space-y-2 text-sm">
                      {produit.sweetness && (
                        <p>
                          <span className="text-gray-600">Sucrosité :</span>{' '}
                          <span className="font-medium">{produit.sweetness}</span>
                        </p>
                      )}
                      {produit.tannin && (
                        <p>
                          <span className="text-gray-600">Tanins :</span>{' '}
                          <span className="font-medium">{produit.tannin}</span>
                        </p>
                      )}
                      {produit.acidity && (
                        <p>
                          <span className="text-gray-600">Acidité :</span>{' '}
                          <span className="font-medium">{produit.acidity}</span>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Description */}
                {produit.description && (
                  <div className="border-t border-gray-200 pt-6">
                    <h2 className="text-xl font-bold mb-4">Description</h2>
                    <p className="text-gray-700 leading-relaxed">{produit.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Retour au catalogue */}
          <div className="mt-8 text-center">
            <Link
              href="/catalogue"
              className="inline-block px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              ← Retour au catalogue
            </Link>
          </div>
        </div>
      </main>
      <PiedDePage />
    </>
  );
}
