import { render, screen } from '@testing-library/react';
import ListeProduits from '@/composants/produit/ListeProduits';
import { Produit } from '@/types';

// Mock du composant CarteProduit
jest.mock('@/composants/produit/CarteProduit', () => {
  return function MockCarteProduit({ produit }: { produit: Produit }) {
    return <div data-testid={`produit-${produit.id}`}>{produit.name}</div>;
  };
});

// Mock du PanierContext
jest.mock('@/contexts/PanierContext', () => ({
  usePanier: () => ({
    ajouterAuPanier: jest.fn(),
    panier: [],
    retirerDuPanier: jest.fn(),
    viderPanier: jest.fn(),
  }),
}));

describe('ListeProduits', () => {
  const produitsMock: Produit[] = [
    {
      id: '1',
      reference: 'TEST-001',
      name: 'Château Test 2020',
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
    },
    {
      id: '2',
      reference: 'TEST-002',
      name: 'Domaine Test Blanc',
      color: 'white',
      region: 'Bourgogne',
      appellation: null,
      vintage: 2021,
      grapes: null,
      alcoholPercent: null,
      bottleSizeL: null,
      sweetness: null,
      tannin: null,
      acidity: null,
      rating: 88,
      priceEur: 30,
      producer: 'Test Winery',
      stockQuantity: 5,
      description: null,
    },
  ];

  it('affiche les produits quand il n\'y a pas d\'erreur', () => {
    render(<ListeProduits produitsInitiaux={produitsMock} erreur={null} />);

    expect(screen.getByTestId('produit-1')).toBeInTheDocument();
    expect(screen.getByTestId('produit-2')).toBeInTheDocument();
    expect(screen.getByText('Château Test 2020')).toBeInTheDocument();
    expect(screen.getByText('Domaine Test Blanc')).toBeInTheDocument();
  });

  it('affiche un message d\'erreur quand il y a une erreur', () => {
    render(
      <ListeProduits
        produitsInitiaux={[]}
        erreur="Impossible de charger les produits"
      />
    );

    expect(screen.getByText('Erreur de chargement')).toBeInTheDocument();
    expect(screen.getByText('Impossible de charger les produits')).toBeInTheDocument();
  });

  it('affiche un message quand la liste est vide et qu\'il n\'y a pas d\'erreur', () => {
    render(<ListeProduits produitsInitiaux={[]} erreur={null} />);

    expect(screen.getByText('Aucun produit disponible pour le moment')).toBeInTheDocument();
  });

  it('affiche le bon nombre de produits', () => {
    render(<ListeProduits produitsInitiaux={produitsMock} erreur={null} />);

    const produits = screen.getAllByTestId(/^produit-/);
    expect(produits).toHaveLength(2);
  });
});
