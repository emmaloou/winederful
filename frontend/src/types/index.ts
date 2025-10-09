// Types pour les produits
export interface Produit {
  id: string;
  reference: string;
  name: string;
  color: 'red' | 'white' | 'rose' | 'rosé' | 'sparkling' | null;
  region: string | null;
  appellation: string | null;
  vintage: number | null;
  grapes: string | null;
  alcoholPercent: number | null;
  bottleSizeL: number | null;
  sweetness: string | null;
  tannin: string | null;
  acidity: string | null;
  rating: number | string | null;
  priceEur: number | string | null;
  producer: string | null;
  stockQuantity: number;
  description: string | null;
  images?: ProduitImage[];
}

export interface ProduitImage {
  id: string;
  productId: string;
  objectKey: string;
  contentType: string;
  size: number;
  url?: string;
}

// Types pour l'API
export interface ApiResponse<T> {
  donnees?: T;
  data?: T;
  success?: boolean;
  erreur?: string;
  error?: string;
  message?: string;
  enCache?: boolean;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Types pour l'authentification
export interface User {
  id: string;
  email: string;
  name: string | null;
}

export interface AuthResponse {
  token: string;
  utilisateur: User;
}

// Types pour le panier
export interface ItemPanier {
  id: string;
  reference: string;
  name?: string;
  priceEur: number;
  color: string | null;
  producer: string | null;
  stockQuantity: number;
  quantity: number;
}

// Types pour les erreurs
export interface AppError {
  message: string;
  code?: string;
  details?: unknown;
}
