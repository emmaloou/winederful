import { Router } from 'express';
import { inscription, connexion, obtenirProfil } from '../controleurs/authentification';
import { valider, schemas } from '../middlewares/validation';
import { requireAuth } from '../middlewares/authentification';

const router = Router();

router.post('/inscription', valider(schemas.register), inscription);
router.post('/connexion', valider(schemas.login), connexion);
router.get('/profil', requireAuth, obtenirProfil);

export default router;
