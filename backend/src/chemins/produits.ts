import { Router } from 'express';
import { obtenirProduits, obtenirProduitParId } from '../controleurs/produits';

const router = Router();

router.get('/', obtenirProduits);
router.get('/:id', obtenirProduitParId);

export default router;
