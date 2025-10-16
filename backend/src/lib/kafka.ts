/**
 * Kafka Producer pour publier des événements
 * @module lib/kafka
 */

import { Kafka, Producer, Partitioners } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'wineshop-api',
  brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

let producer: Producer | null = null;

/**
 * Initialise et retourne le producer Kafka
 */
export async function getKafkaProducer(): Promise<Producer> {
  if (!producer) {
    producer = kafka.producer({
      createPartitioner: Partitioners.LegacyPartitioner
    });
    await producer.connect();
    console.log('✅ Kafka producer connecté');
  }
  return producer;
}

/**
 * Publie un événement dans un topic Kafka
 * @param topic Nom du topic
 * @param message Données à publier
 */
export async function publishEvent(
  topic: string,
  message: Record<string, any>
): Promise<void> {
  try {
    const prod = await getKafkaProducer();
    await prod.send({
      topic,
      messages: [
        {
          key: message.id || message.order_id || String(Date.now()),
          value: JSON.stringify({
            ...message,
            _published_at: new Date().toISOString(),
            _source: 'wineshop-api'
          }),
          timestamp: Date.now().toString()
        }
      ]
    });
    console.log(`📤 Event published to ${topic}:`, message.id || 'no-id');
  } catch (error) {
    console.error(`❌ Kafka publish error (${topic}):`, error);
    // Ne pas bloquer l'API si Kafka est down
    // En production: envoyer à un queue de retry (Redis)
  }
}

/**
 * Publie un changement de statut de commande
 */
export async function publishOrderStatusChange(
  orderId: string,
  oldStatus: string,
  newStatus: string,
  metadata: Record<string, any> = {}
): Promise<void> {
  await publishEvent('order-status', {
    order_id: orderId,
    old_status: oldStatus,
    new_status: newStatus,
    changed_at: new Date().toISOString(),
    ...metadata
  });
}

/**
 * Publie une mise à jour d'inventaire
 */
export async function publishInventoryUpdate(
  productId: string,
  oldQuantity: number,
  newQuantity: number,
  reason: string
): Promise<void> {
  await publishEvent('inventory-updates', {
    product_id: productId,
    old_quantity: oldQuantity,
    new_quantity: newQuantity,
    delta: newQuantity - oldQuantity,
    reason,
    timestamp: new Date().toISOString()
  });
}

/**
 * Ferme proprement le producer
 */
export async function closeKafkaProducer(): Promise<void> {
  if (producer) {
    await producer.disconnect();
    producer = null;
    console.log('🔌 Kafka producer déconnecté');
  }
}

// Fermeture gracieuse
process.on('SIGINT', async () => {
  await closeKafkaProducer();
  process.exit(0);
});

