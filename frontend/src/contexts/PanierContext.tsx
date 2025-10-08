'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface ArticlePanier {
  id: string;
  reference: string;
  name?: string;
  priceEur: number;
  color: string | null;
  producer: string | null;
  quantite: number;
  stockQuantity: number;
}

interface PanierContextType {
  articles: ArticlePanier[];
  nombreArticles: number;
  total: number;
  ajouterAuPanier: (produit: Omit<ArticlePanier, 'quantite'>) => void;
  retirerDuPanier: (id: string) => void;
  modifierQuantite: (id: string, quantite: number) => void;
  viderPanier: () => void;
}

const PanierContext = createContext<PanierContextType | undefined>(undefined);

export function PanierProvider({ children }: { children: ReactNode }) {
  const [articles, setArticles] = useState<ArticlePanier[]>([]);
  const [chargementInitial, setChargementInitial] = useState(true);

  // Charger le panier depuis localStorage au montage
  useEffect(() => {
    const panierSauvegarde = localStorage.getItem('panier');
    if (panierSauvegarde) {
      try {
        setArticles(JSON.parse(panierSauvegarde));
      } catch (error) {
        console.error('Erreur chargement panier:', error);
      }
    }
    setChargementInitial(false);
  }, []);

  // Sauvegarder le panier dans localStorage à chaque modification
  useEffect(() => {
    if (!chargementInitial) {
      localStorage.setItem('panier', JSON.stringify(articles));
    }
  }, [articles, chargementInitial]);

  const ajouterAuPanier = (produit: Omit<ArticlePanier, 'quantite'>) => {
    setArticles((prev) => {
      const articleExistant = prev.find((a) => a.id === produit.id);

      if (articleExistant) {
        // Incrémenter la quantité si l'article existe déjà
        return prev.map((a) =>
          a.id === produit.id
            ? { ...a, quantite: Math.min(a.quantite + 1, a.stockQuantity) }
            : a
        );
      } else {
        // Ajouter un nouvel article
        return [...prev, { ...produit, quantite: 1 }];
      }
    });
  };

  const retirerDuPanier = (id: string) => {
    setArticles((prev) => prev.filter((a) => a.id !== id));
  };

  const modifierQuantite = (id: string, quantite: number) => {
    if (quantite <= 0) {
      retirerDuPanier(id);
      return;
    }

    setArticles((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, quantite: Math.min(quantite, a.stockQuantity) }
          : a
      )
    );
  };

  const viderPanier = () => {
    setArticles([]);
  };

  const nombreArticles = articles.reduce((total, a) => total + a.quantite, 0);
  const total = articles.reduce((sum, a) => sum + a.priceEur * a.quantite, 0);

  return (
    <PanierContext.Provider
      value={{
        articles,
        nombreArticles,
        total,
        ajouterAuPanier,
        retirerDuPanier,
        modifierQuantite,
        viderPanier,
      }}
    >
      {children}
    </PanierContext.Provider>
  );
}

export function usePanier() {
  const context = useContext(PanierContext);
  if (!context) {
    throw new Error('usePanier doit être utilisé dans un PanierProvider');
  }
  return context;
}
