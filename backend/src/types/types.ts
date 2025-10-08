import { Request } from 'express';

// Product types
export interface Product {
  id: string;
  reference: string;
  name: string;
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
  priceEur: number | null;
  producer: string | null;
  stockQuantity: number;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImage {
  id: string;
  productId: string;
  objectKey: string;
  contentType: string | null;
  size: bigint | null;
  createdAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  cached?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  cached?: boolean;
}

// Auth types
export interface User {
  id: string;
  email: string;
  name: string | null;
}

export interface AuthRequest extends Request {
  user?: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

// Cart types
export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product?: Product;
}

export interface Cart {
  id: string;
  userId: string | null;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}
