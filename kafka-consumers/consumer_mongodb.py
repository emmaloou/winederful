"""
Kafka Consumer -> MongoDB
Enregistre tous les événements dans MongoDB pour audit et analytics
"""
import os
import json
from datetime import datetime

from kafka import KafkaConsumer
from pymongo import MongoClient

KAFKA_BROKER = os.getenv("KAFKA_BROKER", "kafka:9092")
KAFKA_TOPICS = os.getenv("KAFKA_TOPICS", "wine-orders,payment-events,order-status,inventory-updates").split(",")
KAFKA_GROUP_ID = os.getenv("KAFKA_GROUP_ID", "wine-mongodb-logger")

MONGO_URI = os.getenv("MONGO_URI", "mongodb://mongodb:27017/")
MONGO_DB = os.getenv("MONGO_DB", "wineshop_events")
MONGO_COLLECTION = os.getenv("MONGO_COLLECTION", "kafka_events")


def main():
    print(f"🍃 MongoDB Consumer démarrage...")
    print(f"   Topics: {KAFKA_TOPICS}")
    print(f"   MongoDB: {MONGO_DB}.{MONGO_COLLECTION}")
    
    # Connexion MongoDB
    mongo_client = MongoClient(MONGO_URI)
    db = mongo_client[MONGO_DB]
    collection = db[MONGO_COLLECTION]
    
    # Créer index sur timestamp
    collection.create_index([("timestamp", -1)])
    collection.create_index([("topic", 1)])
    
    # Connexion Kafka (multi-topics)
    consumer = KafkaConsumer(
        *KAFKA_TOPICS,
        bootstrap_servers=[KAFKA_BROKER],
        value_deserializer=lambda v: json.loads(v.decode("utf-8")),
        auto_offset_reset="earliest",
        group_id=KAFKA_GROUP_ID,
    )
    
    print("✅ Consumer prêt, en attente d'événements...")
    
    try:
        for msg in consumer:
            # Document MongoDB
            doc = {
                "topic": msg.topic,
                "partition": msg.partition,
                "offset": msg.offset,
                "timestamp": datetime.fromtimestamp(msg.timestamp / 1000),
                "key": msg.key.decode("utf-8") if msg.key else None,
                "value": msg.value,
                "headers": dict(msg.headers) if msg.headers else {},
                "ingested_at": datetime.utcnow()
            }
            
            # Insert dans MongoDB
            collection.insert_one(doc)
            print(f"📝 Event logged: {msg.topic} -> {doc.get('value', {}).get('id', 'no-id')}")
            
    except KeyboardInterrupt:
        print("\n⏹️  Arrêt du consumer...")
    finally:
        consumer.close()
        mongo_client.close()
        print("🔌 Consumer arrêté proprement")


if __name__ == "__main__":
    main()

