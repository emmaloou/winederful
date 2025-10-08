import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { gestionErreurs } from './middlewares/gestionErreurs';
import cheminsProduits from './chemins/produits';
import cheminsAuth from './chemins/authentification';
import { connecterBaseDeDonnees } from './config/baseDeDonnees';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://app.localhost', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req: Request, res: Response) => {
  res.json({ statut: 'ok', horodatage: new Date().toISOString() });
});

app.use('/api/produits', cheminsProduits);
app.use('/api/auth', cheminsAuth);

app.use((req: Request, res: Response) => {
  res.status(404).json({ erreur: 'Route non trouvée', chemin: req.path });
});

app.use(gestionErreurs);

// Démarrage avec connexion DB
async function demarrer() {
  try {
    await connecterBaseDeDonnees();
    app.listen(PORT, () => {
      console.log('🚀 API démarrée sur port', PORT);
    });
  } catch (error) {
    console.error('❌ Erreur démarrage:', error);
    process.exit(1);
  }
}

demarrer();
