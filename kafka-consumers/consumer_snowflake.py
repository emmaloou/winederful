"""
Kafka Consumer -> Snowflake
Consomme les événements wine-orders et les enregistre dans Snowflake
"""
import os
import json
import time
from typing import List, Dict, Any

from kafka import KafkaConsumer
import snowflake.connector

# Configuration Kafka
KAFKA_BROKER = os.getenv("KAFKA_BROKER", "kafka:9092")
KAFKA_TOPIC = os.getenv("KAFKA_TOPIC", "wine-orders")
KAFKA_GROUP_ID = os.getenv("KAFKA_GROUP_ID", "wine-snowflake-consumer")
BATCH_SIZE = int(os.getenv("BATCH_SIZE", "50"))
BATCH_TIMEOUT_SECS = float(os.getenv("BATCH_TIMEOUT_SECS", "10"))

# Configuration Snowflake
SF_USER = os.getenv("SNOWFLAKE_USER")
SF_PASSWORD = os.getenv("SNOWFLAKE_PASSWORD")
SF_ACCOUNT = os.getenv("SNOWFLAKE_ACCOUNT")
SF_ROLE = os.getenv("SNOWFLAKE_ROLE", "SYSADMIN")
SF_WAREHOUSE = os.getenv("SNOWFLAKE_WAREHOUSE", "COMPUTE_WH")
SF_DATABASE = os.getenv("SNOWFLAKE_DATABASE", "WINESHOP")
SF_SCHEMA = os.getenv("SNOWFLAKE_SCHEMA", "RAW")


def get_snowflake_conn():
    """Connexion Snowflake et création des objets si nécessaire"""
    conn = snowflake.connector.connect(
        user=SF_USER,
        password=SF_PASSWORD,
        account=SF_ACCOUNT,
        role=SF_ROLE,
        warehouse=SF_WAREHOUSE,
    )
    
    cursor = conn.cursor()
    try:
        # Setup schema
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {SF_DATABASE}")
        cursor.execute(f"USE DATABASE {SF_DATABASE}")
        cursor.execute(f"CREATE SCHEMA IF NOT EXISTS {SF_SCHEMA}")
        cursor.execute(f"USE SCHEMA {SF_SCHEMA}")
        
        # Table pour les commandes
        cursor.execute(f"""
            CREATE TABLE IF NOT EXISTS {SF_SCHEMA}.ORDERS (
                ORDER_ID STRING PRIMARY KEY,
                USER_ID STRING,
                ITEMS VARIANT,
                TOTAL_EUR FLOAT,
                STATUS STRING,
                EVENT_TIMESTAMP TIMESTAMP_TZ,
                KAFKA_PARTITION NUMBER,
                KAFKA_OFFSET NUMBER,
                KAFKA_TIMESTAMP TIMESTAMP_TZ,
                RAW_EVENT VARIANT
            )
        """)
        
        print(f"✅ Snowflake setup OK: {SF_DATABASE}.{SF_SCHEMA}.ORDERS")
    finally:
        cursor.close()
    
    return conn


def parse_order_event(evt: Dict[str, Any]) -> Dict[str, Any]:
    """Parse un événement de commande"""
    return {
        "ORDER_ID": evt.get("order_id") or evt.get("id"),
        "USER_ID": evt.get("user_id") or evt.get("userId"),
        "ITEMS": evt.get("items", []),
        "TOTAL_EUR": evt.get("total") or evt.get("total_eur", 0),
        "STATUS": evt.get("status", "pending"),
        "EVENT_TIMESTAMP": evt.get("_published_at") or evt.get("timestamp"),
        "RAW_EVENT": evt,
    }


def insert_batch(conn, rows: List[Dict[str, Any]]):
    """Insère un batch d'événements dans Snowflake"""
    if not rows:
        return
    
    cursor = conn.cursor()
    try:
        for row in rows:
            cursor.execute(f"""
                INSERT INTO {SF_SCHEMA}.ORDERS 
                (ORDER_ID, USER_ID, ITEMS, TOTAL_EUR, STATUS, EVENT_TIMESTAMP,
                 KAFKA_PARTITION, KAFKA_OFFSET, KAFKA_TIMESTAMP, RAW_EVENT)
                SELECT 
                    %s, %s, PARSE_JSON(%s), %s, %s, TO_TIMESTAMP_TZ(%s),
                    %s, %s, TO_TIMESTAMP_TZ(%s), PARSE_JSON(%s)
            """, (
                row["ORDER_ID"],
                row["USER_ID"],
                json.dumps(row["ITEMS"]),
                row["TOTAL_EUR"],
                row["STATUS"],
                row["EVENT_TIMESTAMP"],
                row["KAFKA_PARTITION"],
                row["KAFKA_OFFSET"],
                row["KAFKA_TS"],
                json.dumps(row["RAW_EVENT"])
            ))
        
        conn.commit()
    finally:
        cursor.close()


def main():
    print(f"🔌 Kafka Consumer démarrage...")
    print(f"   Broker: {KAFKA_BROKER}")
    print(f"   Topic: {KAFKA_TOPIC}")
    print(f"   Group: {KAFKA_GROUP_ID}")
    
    # Connexion Kafka
    consumer = KafkaConsumer(
        KAFKA_TOPIC,
        bootstrap_servers=[KAFKA_BROKER],
        value_deserializer=lambda v: json.loads(v.decode("utf-8")),
        auto_offset_reset="earliest",
        enable_auto_commit=False,
        group_id=KAFKA_GROUP_ID,
    )
    
    # Connexion Snowflake
    conn = get_snowflake_conn()
    
    batch = []
    last_flush = time.time()
    
    try:
        print("✅ Consumer prêt, en attente d'événements...")
        
        for msg in consumer:
            evt = msg.value
            parsed = parse_order_event(evt)
            parsed["KAFKA_PARTITION"] = msg.partition
            parsed["KAFKA_OFFSET"] = msg.offset
            parsed["KAFKA_TS"] = int(msg.timestamp / 1000)
            
            batch.append(parsed)
            
            # Flush si batch plein ou timeout
            now = time.time()
            if len(batch) >= BATCH_SIZE or (now - last_flush) >= BATCH_TIMEOUT_SECS:
                insert_batch(conn, batch)
                consumer.commit()
                print(f"✅ Flushed {len(batch)} events to Snowflake")
                batch.clear()
                last_flush = now
                
    except KeyboardInterrupt:
        print("\n⏹️  Arrêt du consumer...")
    finally:
        # Flush remaining
        if batch:
            try:
                insert_batch(conn, batch)
                consumer.commit()
                print(f"✅ Flushed {len(batch)} remaining events")
            except Exception as e:
                print(f"⚠️  Error flushing: {e}")
        
        consumer.close()
        conn.close()
        print("🔌 Consumer arrêté proprement")


if __name__ == "__main__":
    main()

