# 🔥 Kafka - Mode d'Emploi

## 🎯 Statut : EN PAUSE par défaut

Kafka et ses services associés (MongoDB, consumers) sont configurés avec le **profile `kafka`**, ce qui signifie qu'ils **ne démarrent pas automatiquement**.

Cela évite :
- ❌ Trop de logs
- ❌ Consommation excessive de ressources
- ❌ Messages d'erreur si Kafka n'est pas nécessaire

---

## 🚀 Démarrage SANS Kafka (par défaut)

```bash
# Lance uniquement les services de base
docker-compose up -d

# Services lancés :
# ✅ Traefik (reverse proxy)
# ✅ API Backend (Express)
# ✅ Frontend (Next.js)
# ✅ PostgreSQL
# ✅ Redis
# ✅ MinIO

# ❌ Kafka (non lancé)
# ❌ MongoDB (non lancé)
# ❌ Consumers (non lancés)
```

---

## 🔥 Démarrage AVEC Kafka

Quand tu veux activer Kafka pour tester l'event streaming :

```bash
# Option 1 : Lancer TOUT (services de base + Kafka)
docker-compose --profile kafka up -d

# Option 2 : Ajouter Kafka à un stack déjà running
docker-compose up -d  # Services de base
docker-compose --profile kafka up -d  # Ajoute Kafka

# Services Kafka lancés :
# ✅ Zookeeper (coordination)
# ✅ Kafka (broker :9092)
# ✅ Kafka UI (http://kafka.localhost:8080)
# ✅ MongoDB (:27017)
# ✅ Mongo Express (http://mongo.localhost:8081)
# ✅ Consumer Snowflake
# ✅ Consumer Email
# ✅ Consumer MongoDB
```

---

## 🛑 Arrêter Kafka (garder le reste)

```bash
# Arrêter uniquement les services Kafka
docker-compose --profile kafka down

# OU arrêter tout puis relancer sans Kafka
docker-compose down
docker-compose up -d  # Sans --profile kafka
```

---

## 📊 Vérifier les Services

```bash
# Voir tous les services (actifs et inactifs)
docker-compose ps -a

# Voir uniquement les services actifs
docker-compose ps

# Logs Kafka si activé
docker-compose logs -f kafka
docker-compose logs -f kafka-consumer-snowflake
```

---

## 🧪 Tester Kafka

### 1. Lancer Kafka

```bash
docker-compose --profile kafka up -d
```

### 2. Accéder aux interfaces

- **Kafka UI** : http://kafka.localhost:8080
  - Voir les topics
  - Explorer les messages
  - Monitorer consumer groups

- **MongoDB Express** : http://mongo.localhost:8081 (admin/admin)
  - Collection `wineshop_events.kafka_events`
  - Voir tous les événements enregistrés

### 3. Publier un événement test

```typescript
// Dans le backend, via une route test
import { publishEvent } from './lib/kafka';

// Exemple : route de test
app.post('/api/test/kafka', async (req, res) => {
  await publishEvent('wine-orders', {
    order_id: 'TEST-001',
    user_id: 'user-123',
    items: [{ product_id: 'vin-1', quantity: 2 }],
    total: 50.00,
    status: 'pending'
  });
  
  res.json({ message: 'Event published to Kafka!' });
});
```

### 4. Vérifier réception

**Dans Kafka UI** :
- Topic `wine-orders` → Messages → Voir l'événement

**Dans MongoDB Express** :
- Database `wineshop_events` → Collection `kafka_events` → Voir l'événement

**Logs consumers** :
```bash
docker-compose logs kafka-consumer-mongodb
# ✅ Event logged: wine-orders -> TEST-001
```

---

## ⚙️ Configuration Backend

Le backend est **compatible Kafka** mais fonctionne **sans Kafka** :

```typescript
// backend/src/lib/kafka.ts
export async function publishEvent(topic, message) {
  try {
    // Tente de publier sur Kafka
    await producer.send(...)
  } catch (error) {
    // Si Kafka est down : pas de blocage
    console.error('Kafka publish error:', error);
    // L'API continue de fonctionner normalement
  }
}
```

**Résultat** :
- ✅ Kafka actif → Événements publiés
- ✅ Kafka inactif → API fonctionne quand même (logs d'erreur seulement)

---

## 🎯 Cas d'Usage

### Développement quotidien (SANS Kafka)

```bash
docker-compose up -d
# Développe frontend/backend normalement
# Pas de logs Kafka parasites
```

### Test Event Streaming (AVEC Kafka)

```bash
docker-compose --profile kafka up -d
# Teste les événements
# Vérifie les consumers
# Explore Kafka UI
```

### Production (configuration à part)

En production, Kafka sera probablement :
- Kafka managé (AWS MSK, Confluent Cloud)
- Configuration séparée du docker-compose
- Variables d'env `KAFKA_BROKER` pointant vers cluster distant

---

## 📚 Ressources

- **Documentation complète** : `docs/KAFKA_INTEGRATION.md`
- **Code Producer** : `backend/src/lib/kafka.ts`
- **Consumers** : `kafka-consumers/*.py`
- **Topics** : `wine-orders`, `payment-events`, `order-status`, `inventory-updates`

---

**En résumé** :
- Par défaut : Kafka **OFF** ✅ (rapide, propre)
- Pour tester : `docker-compose --profile kafka up -d` ✅
- Backend compatible dans les 2 cas ✅

