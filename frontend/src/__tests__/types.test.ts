import { Produit, User, ApiResponse } from '@/types';

describe('Types', () => {
  describe('Produit', () => {
    it('devrait avoir tous les champs requis', () => {
      const produit: Produit = {
        id: '123',
        reference: 'TEST-001',
        name: 'Test Wine',
        color: 'red',
        region: 'Bordeaux',
        appellation: null,
        vintage: 2020,
        grapes: null,
        alcoholPercent: null,
        bottleSizeL: null,
        sweetness: null,
        tannin: null,
        acidity: null,
        rating: 90,
        priceEur: 25,
        producer: 'Test Producer',
        stockQuantity: 10,
        description: null,
      };

      expect(produit.id).toBe('123');
      expect(produit.reference).toBe('TEST-001');
      expect(produit.stockQuantity).toBe(10);
    });

    it('devrait accepter des valeurs null pour les champs optionnels', () => {
      const produit: Produit = {
        id: '123',
        reference: 'TEST-001',
        name: 'Test',
        color: null,
        region: null,
        appellation: null,
        vintage: null,
        grapes: null,
        alcoholPercent: null,
        bottleSizeL: null,
        sweetness: null,
        tannin: null,
        acidity: null,
        rating: null,
        priceEur: null,
        producer: null,
        stockQuantity: 0,
        description: null,
      };

      expect(produit.color).toBeNull();
      expect(produit.region).toBeNull();
    });

    it('devrait accepter différentes couleurs', () => {
      const rouge: Produit['color'] = 'red';
      const blanc: Produit['color'] = 'white';
      const rose: Produit['color'] = 'rose';
      const effervescent: Produit['color'] = 'sparkling';
      const vide: Produit['color'] = null;

      expect([rouge, blanc, rose, effervescent, vide]).toHaveLength(5);
    });
  });

  describe('User', () => {
    it('devrait avoir les champs requis', () => {
      const user: User = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      };

      expect(user.id).toBe('user-123');
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
    });

    it('devrait accepter name null', () => {
      const user: User = {
        id: 'user-123',
        email: 'test@example.com',
        name: null,
      };

      expect(user.name).toBeNull();
    });
  });

  describe('ApiResponse', () => {
    it('devrait accepter différents types de données', () => {
      const response1: ApiResponse<Produit[]> = {
        donnees: [],
        erreur: null,
      };

      const response2: ApiResponse<User> = {
        data: {
          id: '1',
          email: 'test@test.com',
          name: 'Test',
        },
        success: true,
      };

      expect(response1.donnees).toEqual([]);
      expect(response2.data?.id).toBe('1');
    });
  });
});
