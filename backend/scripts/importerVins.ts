import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface VinCSV {
  reference: string;
  color?: string;
  country?: string;
  region?: string;
  appellation?: string;
  vintage?: string;
  grapes?: string;
  alcoholPercent?: string;
  bottleSizeL?: string;
  sweetness?: string;
  tannin?: string;
  acidity?: string;
  rating?: string;
  priceEur?: string;
  producer?: string;
  stockQuantity?: string;
}

async function importerVins(cheminFichier: string) {
  console.log(`📂 Lecture du fichier: ${cheminFichier}`);

  const contenu = fs.readFileSync(cheminFichier, 'utf-8');
  const lignes = contenu.split('\n').filter(l => l.trim());

  // Skip header
  const [entete, ...donnees] = lignes;
  const colonnes = entete.split(',').map(c => c.trim());

  console.log(`📊 ${donnees.length} vins à importer`);
  console.log(`📋 Colonnes détectées: ${colonnes.join(', ')}`);

  let imported = 0;
  let errors = 0;

  for (const ligne of donnees) {
    try {
      const valeurs = ligne.split(',').map(v => v.trim());
      const vin: any = {};

      colonnes.forEach((col, idx) => {
        const valeur = valeurs[idx] || null;
        vin[col] = valeur;
      });

      // Mapping vers le schéma Prisma
      await prisma.product.create({
        data: {
          reference: vin.reference || `VIN-${Date.now()}-${imported}`,
          name: vin.name || vin.reference,
          color: vin.color || null,
          country: vin.country || null,
          region: vin.region || null,
          appellation: vin.appellation || null,
          vintage: vin.vintage ? parseInt(vin.vintage) : null,
          grapes: vin.grapes || null,
          alcoholPercent: vin.alcoholPercent ? parseFloat(vin.alcoholPercent) : null,
          bottleSizeL: vin.bottleSizeL ? parseFloat(vin.bottleSizeL) : null,
          sweetness: vin.sweetness || null,
          tannin: vin.tannin || null,
          acidity: vin.acidity || null,
          rating: vin.rating ? parseFloat(vin.rating) : null,
          priceEur: vin.priceEur ? parseFloat(vin.priceEur) : null,
          producer: vin.producer || null,
          stockQuantity: vin.stockQuantity ? parseInt(vin.stockQuantity) : 10,
        }
      });

      imported++;
      if (imported % 50 === 0) {
        console.log(`✅ ${imported} vins importés...`);
      }
    } catch (error: any) {
      errors++;
      console.error(`❌ Erreur ligne ${imported + errors}:`, error.message);
    }
  }

  console.log(`\n✅ Import terminé:`);
  console.log(`   - Succès: ${imported} vins`);
  console.log(`   - Erreurs: ${errors}`);
}

// Exécution
const csvPath = process.argv[2] || path.join(__dirname, '../../merge_catalog_wine.csv');

importerVins(csvPath)
  .catch(console.error)
  .finally(() => prisma.$disconnect());
