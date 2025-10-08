'use client';

import Link from 'next/link';
import { usePanier } from '@/contexts/PanierContext';
import EnTete from '@/composants/mise-en-page/EnTete';
import PiedDePage from '@/composants/mise-en-page/PiedDePage';

export default function PanierPage() {
  const { articles, nombreArticles, total, modifierQuantite, retirerDuPanier, viderPanier } = usePanier();

  if (nombreArticles === 0) {
    return (
      <>
        <EnTete />
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-white rounded-xl shadow-md p-12">
                <div className="text-6xl mb-4">🛒</div>
                <h1 className="text-3xl font-bold mb-4">Votre panier est vide</h1>
                <p className="text-gray-600 mb-8">
                  Découvrez notre sélection de vins d'exception
                </p>
                <Link
                  href="/catalogue"
                  className="inline-block bg-[#8B1538] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#6B0F2A] transition-colors"
                >
                  Explorer le catalogue
                </Link>
              </div>
            </div>
          </div>
        </main>
        <PiedDePage />
      </>
    );
  }

  return (
    <>
      <EnTete />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">
                🛒 Mon panier ({nombreArticles} article{nombreArticles > 1 ? 's' : ''})
              </h1>
              <button
                onClick={viderPanier}
                className="text-red-600 hover:text-red-700 font-medium text-sm"
              >
                Vider le panier
              </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Liste des articles */}
              <div className="lg:col-span-2 space-y-4">
                {articles.map((article) => (
                  <div key={article.id} className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex gap-6">
                      {/* Image */}
                      <div className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-4xl">🍷</span>
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <Link href={`/produits/${article.id}`}>
                              <h3 className="font-bold text-lg hover:text-[#8B1538] transition-colors">
                                {article.name || article.reference}
                              </h3>
                            </Link>
                            <p className="text-sm text-gray-600 mt-1">
                              {article.producer}
                            </p>
                          </div>
                          <button
                            onClick={() => retirerDuPanier(article.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                            title="Retirer du panier"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          {/* Quantité */}
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">Quantité :</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => modifierQuantite(article.id, article.quantite - 1)}
                                className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center font-bold"
                              >
                                −
                              </button>
                              <span className="w-12 text-center font-medium">{article.quantite}</span>
                              <button
                                onClick={() => modifierQuantite(article.id, article.quantite + 1)}
                                disabled={article.quantite >= article.stockQuantity}
                                className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                +
                              </button>
                            </div>
                            {article.quantite >= article.stockQuantity && (
                              <span className="text-xs text-orange-600">Stock max atteint</span>
                            )}
                          </div>

                          {/* Prix */}
                          <div className="text-right">
                            <div className="text-sm text-gray-500">
                              {article.priceEur.toFixed(2)}€ × {article.quantite}
                            </div>
                            <div className="text-xl font-bold text-[#8B1538]">
                              {(article.priceEur * article.quantite).toFixed(2)}€
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Récapitulatif */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
                  <h2 className="text-xl font-bold mb-4">Récapitulatif</h2>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Sous-total</span>
                      <span>{total.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Livraison</span>
                      <span className="text-green-600 font-medium">Gratuite</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span className="text-[#8B1538]">{total.toFixed(2)}€</span>
                    </div>
                  </div>

                  <Link
                    href="/checkout"
                    className="block w-full bg-[#8B1538] text-white text-center py-3 rounded-lg font-bold hover:bg-[#6B0F2A] transition-colors mb-3"
                  >
                    Procéder au paiement
                  </Link>

                  <Link
                    href="/catalogue"
                    className="block w-full text-center py-3 text-gray-600 hover:text-[#8B1538] transition-colors"
                  >
                    Continuer mes achats
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <PiedDePage />
    </>
  );
}
