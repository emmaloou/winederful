# 🚀 Guide Déploiement Netlify - Winederful Frontend

Ce guide vous permet de déployer le frontend Next.js sur Netlify.

---

## 📋 Fichiers nécessaires pour Netlify

Les fichiers suivants sont déjà configurés dans `/frontend` :

- ✅ `netlify.toml` - Configuration Netlify
- ✅ `next.config.mjs` - Configuration Next.js (output: standalone)
- ✅ `package.json` - Scripts de build

---

## 🚀 Déploiement sur Netlify - Étape par Étape

### Étape 1 : Créer un compte Netlify

1. Aller sur https://www.netlify.com/
2. Cliquer sur **"Sign up"**
3. Se connecter avec GitHub (recommandé)

---

### Étape 2 : Importer le projet depuis GitHub

1. Sur le dashboard Netlify, cliquer sur **"Add new site"** → **"Import an existing project"**

2. Choisir **"Deploy with GitHub"**

3. Autoriser Netlify à accéder à votre compte GitHub

4. Sélectionner le repository : **`emmaloou/winederful`**

5. Choisir la branche : **`front-end`** (ou `main` si vous voulez tout déployer)

---

### Étape 3 : Configurer le build

Dans la section **"Build settings"** :

#### Base directory
```
frontend
```
⚠️ **Important** : Netlify doit savoir que le code est dans le dossier `frontend/`

#### Build command
```
npm run build
```

#### Publish directory
```
frontend/.next
```

---

### Étape 4 : Configurer les variables d'environnement

Cliquer sur **"Advanced"** → **"New variable"**

Ajouter les variables suivantes :

| Variable | Valeur (exemple) | Description |
|----------|------------------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | URL de l'API backend (local pour tests) |
| `NEXTAUTH_URL` | `https://votre-site.netlify.app` | URL de votre site Netlify |
| `NEXTAUTH_SECRET` | `un-secret-32-caracteres-minimum` | Secret pour NextAuth |

**Note** : Pour l'instant, utiliser l'API locale. Plus tard, vous remplacerez par l'URL du backend en production.

---

### Étape 5 : Déployer

1. Cliquer sur **"Deploy site"**

2. Attendre que le build se termine (2-5 minutes)

3. Netlify vous donne une URL : `https://random-name-123456.netlify.app`

---

### Étape 6 : Tester le déploiement

1. Ouvrir l'URL de votre site Netlify

2. Vérifier que :
   - ✅ La page d'accueil s'affiche
   - ✅ Le catalogue de vins s'affiche
   - ✅ Le design Tailwind fonctionne
   - ⚠️ L'API backend ne fonctionnera pas encore (erreurs de connexion normales)

---

## 🔧 Configuration Avancée

### Personnaliser le nom de domaine

1. Dans Netlify Dashboard → **"Domain settings"**
2. Cliquer sur **"Options"** → **"Edit site name"**
3. Changer `random-name-123456` en `winederful-rayane`
4. URL devient : `https://winederful-rayane.netlify.app`

### Ajouter un domaine personnalisé (optionnel)

1. Acheter un domaine (ex: `winederful.com` sur Namecheap, OVH, etc.)
2. Dans Netlify → **"Domain settings"** → **"Add custom domain"**
3. Suivre les instructions pour configurer les DNS

---

## 🔗 Connecter le Frontend au Backend Production

Pour que votre frontend Netlify communique avec le backend, vous devez :

### Option 1 : Héberger le backend sur Railway (recommandé)

**Railway** : Plateforme gratuite pour héberger le backend Express + PostgreSQL

1. Aller sur https://railway.app/
2. Se connecter avec GitHub
3. Créer un nouveau projet : **"Deploy from GitHub repo"**
4. Sélectionner `emmaloou/winederful`, branche `back-end`
5. Railway détecte automatiquement le `Dockerfile` dans `backend/`
6. Ajouter les services :
   - **Backend** (Express)
   - **PostgreSQL** (database)
   - **Redis** (cache)
7. Railway vous donne une URL : `https://your-backend.railway.app`

8. **Mettre à jour la variable Netlify** :
   - Dans Netlify → **"Site settings"** → **"Environment variables"**
   - Modifier `NEXT_PUBLIC_API_URL` : `https://your-backend.railway.app`

9. **Redéployer le site Netlify** :
   - Netlify → **"Deploys"** → **"Trigger deploy"**

---

### Option 2 : Héberger le backend sur Render

**Render** : Alternative gratuite à Railway

1. Aller sur https://render.com/
2. Se connecter avec GitHub
3. Créer un **Web Service**
4. Connecter `emmaloou/winederful`, branche `back-end`
5. Configurer :
   - **Root Directory** : `backend`
   - **Build Command** : `npm install && npm run build`
   - **Start Command** : `npm start`
6. Ajouter PostgreSQL + Redis depuis Render Dashboard
7. Configurer les variables d'environnement
8. Récupérer l'URL : `https://winederful-api.onrender.com`

9. Mettre à jour `NEXT_PUBLIC_API_URL` dans Netlify

---

### Option 3 : Backend local (développement seulement)

⚠️ **Attention** : Ne fonctionne que si votre ordinateur est allumé et Docker tourne

1. Utiliser **ngrok** pour exposer le backend local :
   ```bash
   # Installer ngrok
   brew install ngrok  # macOS

   # Exposer le port 4000
   ngrok http 4000
   ```

2. ngrok vous donne une URL : `https://abc123.ngrok.io`

3. Mettre à jour `NEXT_PUBLIC_API_URL` dans Netlify : `https://abc123.ngrok.io`

⚠️ **Limite** : L'URL ngrok change à chaque redémarrage (version gratuite)

---

## 🔐 Variables d'Environnement - Résumé

### Pour le Frontend (Netlify)

```bash
# URL de l'API backend
NEXT_PUBLIC_API_URL=https://your-backend.railway.app

# NextAuth (authentification)
NEXTAUTH_URL=https://winederful-rayane.netlify.app
NEXTAUTH_SECRET=un-secret-tres-long-32-caracteres-minimum

# Stripe (si paiements activés)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

### Pour le Backend (Railway/Render)

```bash
# Database (fourni par Railway/Render)
DATABASE_URL=postgresql://user:pass@host:5432/db

# Redis (fourni par Railway/Render)
REDIS_URL=redis://host:6379

# JWT
JWT_SECRET=super-secret-jwt-key-32-chars-min

# CORS (autoriser Netlify)
ALLOWED_ORIGINS=https://winederful-rayane.netlify.app

# Stripe (si paiements)
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

---

## 🔄 Workflow CI/CD Automatique

Une fois configuré, **chaque push sur GitHub déclenche un redéploiement** :

```bash
# 1. Modifier le code frontend
git add .
git commit -m "Update homepage"
git push origin front-end

# 2. Netlify détecte le push et redéploie automatiquement
# 3. Nouveau site disponible en 2-3 minutes
```

---

## 🐛 Troubleshooting

### Erreur "Build failed" sur Netlify

**Voir les logs** :
1. Netlify Dashboard → **"Deploys"** → Cliquer sur le build en erreur
2. Lire les logs pour identifier l'erreur

**Erreurs courantes** :

#### "Module not found"
```bash
# Solution : Vérifier que toutes les dépendances sont dans package.json
npm install <missing-package>
git add package.json
git commit -m "Fix dependencies"
git push
```

#### "Command failed: npm run build"
```bash
# Solution : Tester le build en local
cd frontend
npm run build

# Si erreur, corriger le code puis push
```

---

### Le site s'affiche mais l'API ne fonctionne pas

**Vérifier** :
1. La variable `NEXT_PUBLIC_API_URL` est correcte dans Netlify
2. Le backend est bien en ligne (ouvrir l'URL du backend dans le navigateur)
3. Le backend a configuré CORS pour autoriser l'origine Netlify

**Corriger le CORS backend** :

Dans `backend/src/index.ts` :
```typescript
import cors from 'cors';

app.use(cors({
  origin: [
    'https://winederful-rayane.netlify.app',
    'http://localhost:3000' // Pour dev local
  ],
  credentials: true
}));
```

---

### Les variables d'environnement ne sont pas prises en compte

⚠️ **Important** : Les variables `NEXT_PUBLIC_*` sont **compilées lors du build**

**Solution** :
1. Modifier la variable dans Netlify Dashboard
2. **Trigger un nouveau deploy** : Deploys → Trigger deploy → Deploy site

---

## 📊 Monitoring et Logs

### Voir les logs de production (Netlify)

1. Netlify Dashboard → **"Functions"** → **"Logs"**
2. Voir les erreurs en temps réel

### Voir les logs backend (Railway)

1. Railway Dashboard → Cliquer sur le service backend
2. Onglet **"Logs"** → Logs en temps réel

---

## ✅ Checklist Déploiement

Avant de partager le site en production :

### Frontend (Netlify)
- [ ] Site déployé sur Netlify
- [ ] Page d'accueil fonctionne
- [ ] Catalogue de vins s'affiche
- [ ] Design responsive (mobile + desktop)
- [ ] Variables d'environnement configurées
- [ ] Nom de domaine personnalisé (optionnel)

### Backend (Railway/Render)
- [ ] Backend déployé
- [ ] Base de données PostgreSQL créée
- [ ] Redis configuré
- [ ] Variables d'environnement configurées
- [ ] CORS autorise l'origine Netlify
- [ ] API accessible depuis Netlify

### Connexion Frontend ↔ Backend
- [ ] `NEXT_PUBLIC_API_URL` pointe vers le backend en prod
- [ ] Test inscription utilisateur fonctionne
- [ ] Test connexion fonctionne
- [ ] Catalogue de vins chargé depuis la DB
- [ ] Pas d'erreurs CORS

---

## 📞 Ressources

- **Netlify Docs** : https://docs.netlify.com/
- **Next.js on Netlify** : https://docs.netlify.com/frameworks/next-js/
- **Railway Docs** : https://docs.railway.app/
- **Render Docs** : https://render.com/docs

---

## 🎯 Prochaines Étapes

Une fois le frontend déployé sur Netlify :

1. **Héberger le backend** (Railway recommandé)
2. **Connecter à une DB PostgreSQL** en production
3. **Importer le catalogue de vins** (500+ vins CSV)
4. **Tester le flow complet** : inscription → connexion → catalogue → détail produit
5. **Ajouter les pages manquantes** : panier, checkout, profil
6. **Intégrer Stripe** pour les paiements
7. **Configurer Prometheus + Grafana** pour le monitoring

---

**Dernière mise à jour** : 8 Octobre 2025

Bon déploiement ! 🚀
