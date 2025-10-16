# 🔥 Intégration Kafka - Event Streaming

## 📋 Vue d'Ensemble

Cette intégration ajoute **Apache Kafka** comme Event Bus central pour découpler les microservices et permettre le streaming d'événements en temps réel.

## 🏗️ Architecture

```
User → API Express → PostgreSQL (sync)
                  ↓
               Kafka (async)
          Topics: wine-orders
                  payment-events
                  order-status
                  inventory-updates
                  ↓
      ┌───────────┼───────────┬───────────┐
      ▼           ▼           ▼           ▼
  Snowflake   MongoDB    Email        Airflow
  (analytics) (logs)   (notifications) (orchestration)
```

## 🎯 Topics Kafka

| Topic | Producer | Consumers | Retention | Usage |
|-------|----------|-----------|-----------|-------|
| `wine-orders` | API Backend | Snowflake, Airflow, MongoDB | 7 jours | Nouvelles commandes |
| `payment-events` | Stripe Webhook | Email Service, Analytics, MongoDB | 30 jours | Paiements confirmés |
| `order-status` | API Backend | Frontend, Email, MongoDB | 7 jours | Màj statut commande |
| `inventory-updates` | Inventory Service | PostgreSQL, Analytics, MongoDB | 7 jours | Màj stock temps réel |

---

## 🚀 Démarrage

### 1. Configuration

Copier `.env.example` vers `.env` et remplir les variables Kafka/Snowflake :

```bash
cp .env.example .env
nano .env
```

Variables minimales :
```bash
KAFKA_BROKER=kafka:9092
KAFKA_TOPIC_ORDERS=wine-orders
KAFKA_TOPIC_PAYMENTS=payment-events
```

### 2. Lancer les services

```bash
# Lancer avec Kafka + MongoDB + Consumers
docker-compose up -d

# Vérifier les services
docker-compose ps

# Logs Kafka
docker-compose logs -f kafka

# Logs consumers
docker-compose logs -f kafka-consumer-snowflake
docker-compose logs -f kafka-consumer-email
docker-compose logs -f kafka-consumer-mongodb
```

### 3. Accès aux interfaces

- **Kafka UI** : http://kafka.localhost:8080 (via Traefik) ou http://localhost:8080
- **MongoDB Express** : http://mongo.localhost:8081 ou http://localhost:8081
- **API Backend** : http://api.localhost:4000
- **Frontend** : http://app.localhost:3000

---

## 💻 Utilisation Backend

### Publier un événement

```typescript
import { publishEvent } from './lib/kafka';

// Dans une route Express
router.post('/api/commandes', async (req, res) => {
  // 1. Créer commande en DB (sync)
  const order = await prisma.order.create({ 
    data: {
      userId: req.user.id,
      items: req.body.items,
      total: calculateTotal(req.body.items)
    }
  });
  
  // 2. Publier événement Kafka (async)
  await publishEvent('wine-orders', {
    order_id: order.id,
    user_id: order.userId,
    items: order.items,
    total: order.total,
    status: 'pending',
    timestamp: new Date().toISOString()
  });
  
  res.json({ data: order });
});
```

### Webhook Stripe (paiement confirmé)

```typescript
import { publishEvent } from './lib/kafka';

router.post('/api/webhooks/stripe', async (req, res) => {
  const event = req.body;
  
  // Vérifier signature Stripe
  const signature = req.headers['stripe-signature'];
  const webhookEvent = stripe.webhooks.constructEvent(
    req.rawBody,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
  
  if (webhookEvent.type === 'payment_intent.succeeded') {
    const charge = webhookEvent.data.object;
    const orderId = charge.metadata.order_id;
    
    // Màj DB
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'paid' }
    });
    
    // Publier événement paiement
    await publishEvent('payment-events', {
      order_id: orderId,
      amount: charge.amount / 100,
      currency: charge.currency,
      payment_method: charge.payment_method,
      user_email: charge.receipt_email,
      status: 'paid',
      timestamp: new Date().toISOString()
    });
  }
  
  res.sendStatus(200);
});
```

### Helpers pour événements spécifiques

```typescript
import { publishOrderStatusChange, publishInventoryUpdate } from './lib/kafka';

// Changement de statut commande
await publishOrderStatusChange(
  orderId,
  'pending',
  'shipped',
  { tracking_number: '1Z999AA10123456784' }
);

// Mise à jour stock
await publishInventoryUpdate(
  productId,
  10,  // oldQuantity
  5,   // newQuantity
  'order_completed'
);
```

---

## 🔌 Consumers

### 1. Consumer Snowflake

**Fichier** : `kafka-consumers/consumer_snowflake.py`  
**Topic** : `wine-orders`  
**Destination** : Snowflake `WINESHOP.RAW.ORDERS`

**Configuration** :
```bash
SNOWFLAKE_USER=your_user
SNOWFLAKE_PASSWORD=your_password
SNOWFLAKE_ACCOUNT=abc12345.eu-west-1
SNOWFLAKE_WAREHOUSE=COMPUTE_WH
SNOWFLAKE_DATABASE=WINESHOP
SNOWFLAKE_SCHEMA=RAW
```

**Batch** : 50 événements ou 10s timeout

### 2. Consumer Email

**Fichier** : `kafka-consumers/consumer_email.py`  
**Topic** : `payment-events`  
**Action** : Envoie email confirmation commande

**Configuration SMTP** :
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=no-reply@wineshop.local
```

**Mode DRY-RUN** : Si pas de SMTP configuré, affiche les emails dans les logs.

### 3. Consumer MongoDB

**Fichier** : `kafka-consumers/consumer_mongodb.py`  
**Topics** : `wine-orders`, `payment-events`, `order-status`, `inventory-updates`  
**Destination** : MongoDB `wineshop_events.kafka_events`

**Utilité** :
- Audit trail complet de tous les événements
- Analytics historiques
- Debugging et replay d'événements
- Search full-text sur événements

---

## 📊 Monitoring

### Kafka UI

Accès : http://kafka.localhost:8080

**Fonctionnalités** :
- Visualiser tous les topics
- Explorer les messages (avec filters)
- Voir les consumer groups et leur lag
- Monitorer les partitions
- Ajuster les configurations

### MongoDB Express

Accès : http://mongo.localhost:8081 (admin / admin)

**Fonctionnalités** :
- Explorer la collection `kafka_events`
- Requêtes sur événements historiques
- Export JSON/CSV
- Statistiques par topic

### Logs Docker

```bash
# Kafka broker
docker-compose logs -f kafka

# Consumer Snowflake
docker-compose logs -f kafka-consumer-snowflake

# Consumer Email
docker-compose logs -f kafka-consumer-email

# Consumer MongoDB
docker-compose logs -f kafka-consumer-mongodb

# Tous les consumers
docker-compose logs -f kafka-consumer-snowflake kafka-consumer-email kafka-consumer-mongodb
```

---

## 🔧 Configuration Snowflake

### Setup utilisateur dédié

```sql
-- Créer utilisateur Kafka
CREATE USER kafka_consumer PASSWORD='strong-password';
GRANT ROLE SYSADMIN TO USER kafka_consumer;

-- Droits warehouse
GRANT USAGE ON WAREHOUSE COMPUTE_WH TO USER kafka_consumer;
GRANT OPERATE ON WAREHOUSE COMPUTE_WH TO USER kafka_consumer;

-- Droits database
GRANT USAGE ON DATABASE WINESHOP TO USER kafka_consumer;
GRANT CREATE SCHEMA ON DATABASE WINESHOP TO USER kafka_consumer;

-- Droits schema RAW
GRANT ALL ON SCHEMA WINESHOP.RAW TO USER kafka_consumer;
GRANT ALL ON ALL TABLES IN SCHEMA WINESHOP.RAW TO USER kafka_consumer;
GRANT ALL ON FUTURE TABLES IN SCHEMA WINESHOP.RAW TO USER kafka_consumer;
```

### Vérifier les données

```sql
-- Compter les événements
SELECT COUNT(*) FROM WINESHOP.RAW.ORDERS;

-- Derniers événements
SELECT * FROM WINESHOP.RAW.ORDERS 
ORDER BY EVENT_TIMESTAMP DESC 
LIMIT 10;

-- Événements par statut
SELECT STATUS, COUNT(*) as count
FROM WINESHOP.RAW.ORDERS
GROUP BY STATUS;
```

---

## 🐛 Troubleshooting

### Consumer ne démarre pas

```bash
# 1. Vérifier Kafka est healthy
docker-compose ps kafka

# 2. Voir les logs d'erreur
docker-compose logs kafka-consumer-snowflake

# 3. Tester connexion Kafka manuellement
docker-compose exec kafka kafka-topics --bootstrap-server localhost:9092 --list
```

### Messages ne sont pas consommés

```bash
# 1. Vérifier le topic existe
docker-compose exec kafka kafka-topics \
  --bootstrap-server localhost:9092 \
  --list

# 2. Consommer manuellement pour tester
docker-compose exec kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic wine-orders \
  --from-beginning

# 3. Vérifier le consumer group
docker-compose exec kafka kafka-consumer-groups \
  --bootstrap-server localhost:9092 \
  --describe \
  --group wine-snowflake-consumer
```

### Snowflake connection failed

```bash
# 1. Vérifier les credentials dans .env
cat .env | grep SNOWFLAKE

# 2. Tester connexion depuis container
docker-compose exec kafka-consumer-snowflake python -c "
import snowflake.connector
import os
conn = snowflake.connector.connect(
    user=os.getenv('SNOWFLAKE_USER'),
    password=os.getenv('SNOWFLAKE_PASSWORD'),
    account=os.getenv('SNOWFLAKE_ACCOUNT')
)
print('✅ Connection OK')
"

# 3. Vérifier le warehouse est running
# Dans Snowflake Web UI : ALTER WAREHOUSE COMPUTE_WH RESUME;
```

### MongoDB connection issues

```bash
# 1. Vérifier MongoDB est up
docker-compose ps mongodb

# 2. Tester connexion
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# 3. Voir les collections
docker-compose exec mongodb mongosh wineshop_events --eval "db.kafka_events.countDocuments()"
```

---

## 🎯 Flux de Données Complet

### Exemple : Commande d'une bouteille de vin

```
1. User clique "Commander" sur frontend
   ↓
2. POST /api/commandes → API Backend
   ↓
3. Backend :
   - Enregistre commande en PostgreSQL (status: pending)
   - Publie événement → Kafka topic "wine-orders"
   ↓
4. Kafka dispatche vers 3 consumers :
   ├─ Consumer Snowflake → Enregistre dans DW (analytics)
   ├─ Consumer MongoDB → Log événement (audit)
   └─ (Airflow écoutera ce topic dans le futur)
   ↓
5. User paie via Stripe
   ↓
6. Webhook Stripe → /api/webhooks/stripe
   ↓
7. Backend :
   - Màj commande PostgreSQL (status: paid)
   - Publie événement → Kafka topic "payment-events"
   ↓
8. Kafka dispatche vers 3 consumers :
   ├─ Consumer Email → Envoie "Paiement confirmé"
   ├─ Consumer Snowflake → Màj metrics CA
   └─ Consumer MongoDB → Log paiement
   ↓
9. ✅ Commande finalisée, emails envoyés, analytics à jour
```

---

## 📚 Ressources

### Documentation

- **Kafka** : https://kafka.apache.org/documentation/
- **KafkaJS** : https://kafka.js.org/docs/getting-started
- **kafka-python** : https://kafka-python.readthedocs.io/
- **Snowflake Connector** : https://docs.snowflake.com/en/user-guide/python-connector.html
- **MongoDB** : https://www.mongodb.com/docs/manual/

### Best Practices

1. **Idempotence** : Toujours utiliser un `order_id` unique comme clé Kafka
2. **Error Handling** : Ne jamais bloquer l'API si Kafka est down
3. **Schema Evolution** : Ajouter nouveaux champs, ne jamais supprimer
4. **Monitoring** : Surveiller le lag des consumers (Kafka UI)
5. **Retention** : Configurer selon criticité (7j, 30j, 90j)

---

## 🚀 Prochaines Étapes

- [ ] Intégrer Airflow comme consumer Kafka
- [ ] Ajouter Prometheus/Grafana pour metrics temps réel
- [ ] Implémenter Schema Registry pour validation Avro
- [ ] Ajouter Kafka Connect JDBC Sink pour PostgreSQL
- [ ] Setup Dead Letter Queue (DLQ) pour messages échoués

---

**Version** : 1.0  
**Dernière mise à jour** : Octobre 2025  
**Mainteneur** : POC Team

