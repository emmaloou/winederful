import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const vinsTest = [
  {
    reference: 'CH-MARGAUX-2015',
    name: 'Château Margaux 2015',
    color: 'red',
    country: 'France',
    region: 'Bordeaux',
    appellation: 'Margaux',
    vintage: 2015,
    grapes: 'Cabernet Sauvignon, Merlot',
    alcoholPercent: 13.5,
    bottleSizeL: 0.75,
    sweetness: 'dry',
    tannin: 'high',
    acidity: 'medium',
    rating: 96,
    priceEur: 450,
    producer: 'Château Margaux',
    stockQuantity: 12
  },
  {
    reference: 'DRC-ROMANEE-2018',
    name: 'Domaine de la Romanée-Conti 2018',
    color: 'red',
    country: 'France',
    region: 'Bourgogne',
    appellation: 'Romanée-Conti Grand Cru',
    vintage: 2018,
    grapes: 'Pinot Noir',
    alcoholPercent: 13,
    bottleSizeL: 0.75,
    sweetness: 'dry',
    tannin: 'medium',
    acidity: 'high',
    rating: 98,
    priceEur: 1200,
    producer: 'Domaine de la Romanée-Conti',
    stockQuantity: 3
  },
  {
    reference: 'COTES-RHONE-2020',
    name: 'Côtes du Rhône Villages 2020',
    color: 'red',
    country: 'France',
    region: 'Rhône',
    appellation: 'Côtes du Rhône Villages',
    vintage: 2020,
    grapes: 'Grenache, Syrah',
    alcoholPercent: 14,
    bottleSizeL: 0.75,
    sweetness: 'dry',
    tannin: 'medium',
    acidity: 'medium',
    rating: 85,
    priceEur: 15.90,
    producer: 'Domaine des Tourelles',
    stockQuantity: 50
  },
  {
    reference: 'CHABLIS-GC-2019',
    name: 'Chablis Grand Cru Les Clos 2019',
    color: 'white',
    country: 'France',
    region: 'Bourgogne',
    appellation: 'Chablis Grand Cru',
    vintage: 2019,
    grapes: 'Chardonnay',
    alcoholPercent: 13,
    bottleSizeL: 0.75,
    sweetness: 'dry',
    tannin: null,
    acidity: 'high',
    rating: 92,
    priceEur: 65,
    producer: 'William Fèvre',
    stockQuantity: 25
  },
  {
    reference: 'SANCERRE-2021',
    name: 'Sancerre Blanc 2021',
    color: 'white',
    country: 'France',
    region: 'Loire',
    appellation: 'Sancerre',
    vintage: 2021,
    grapes: 'Sauvignon Blanc',
    alcoholPercent: 12.5,
    bottleSizeL: 0.75,
    sweetness: 'dry',
    tannin: null,
    acidity: 'high',
    rating: 90,
    priceEur: 28,
    producer: 'Domaine Vacheron',
    stockQuantity: 40
  },
  {
    reference: 'CHATEAUNEUF-2017',
    name: 'Châteauneuf-du-Pape 2017',
    color: 'red',
    country: 'France',
    region: 'Rhône',
    appellation: 'Châteauneuf-du-Pape',
    vintage: 2017,
    grapes: 'Grenache, Syrah, Mourvèdre',
    alcoholPercent: 14.5,
    bottleSizeL: 0.75,
    sweetness: 'dry',
    tannin: 'high',
    acidity: 'medium',
    rating: 94,
    priceEur: 55,
    producer: 'Château de Beaucastel',
    stockQuantity: 18
  },
  {
    reference: 'CHAMPAGNE-NV',
    name: 'Champagne Brut Réserve NV',
    color: 'sparkling',
    country: 'France',
    region: 'Champagne',
    appellation: 'Champagne',
    vintage: null,
    grapes: 'Chardonnay, Pinot Noir, Pinot Meunier',
    alcoholPercent: 12,
    bottleSizeL: 0.75,
    sweetness: 'brut',
    tannin: null,
    acidity: 'high',
    rating: 88,
    priceEur: 45,
    producer: 'Bollinger',
    stockQuantity: 30
  },
  {
    reference: 'PROVENCE-ROSE-2022',
    name: 'Côtes de Provence Rosé 2022',
    color: 'rose',
    country: 'France',
    region: 'Provence',
    appellation: 'Côtes de Provence',
    vintage: 2022,
    grapes: 'Grenache, Cinsault',
    alcoholPercent: 12.5,
    bottleSizeL: 0.75,
    sweetness: 'dry',
    tannin: 'low',
    acidity: 'medium',
    rating: 86,
    priceEur: 18,
    producer: 'Château Minuty',
    stockQuantity: 60
  }
];

async function creerVinsTest() {
  console.log('🍷 Création de vins de test...');

  for (const vin of vinsTest) {
    try {
      await prisma.product.create({ data: vin });
      console.log(`✅ ${vin.name}`);
    } catch (error: any) {
      console.error(`❌ ${vin.name}:`, error.message);
    }
  }

  const total = await prisma.product.count();
  console.log(`\n✅ ${total} vins dans la base de données`);
}

creerVinsTest()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
