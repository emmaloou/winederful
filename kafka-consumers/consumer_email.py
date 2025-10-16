"""
Kafka Consumer -> Email Service
Consomme les événements payment-events et envoie des emails
"""
import os
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from kafka import KafkaConsumer

KAFKA_BROKER = os.getenv("KAFKA_BROKER", "kafka:9092")
KAFKA_TOPIC = os.getenv("KAFKA_TOPIC", "payment-events")
KAFKA_GROUP_ID = os.getenv("KAFKA_GROUP_ID", "wine-email-service")

SMTP_HOST = os.getenv("SMTP_HOST", "localhost")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", "no-reply@wineshop.local")


def send_order_confirmation(order_id: str, user_email: str, total: float):
    """Envoie un email de confirmation de commande"""
    try:
        msg = MIMEMultipart()
        msg['From'] = FROM_EMAIL
        msg['To'] = user_email
        msg['Subject'] = f"Confirmation de commande #{order_id}"
        
        body = f"""
        Bonjour,
        
        Votre commande #{order_id} a été confirmée !
        Montant total : {total:.2f}€
        
        Merci pour votre confiance.
        
        L'équipe WineShop
        """
        
        msg.attach(MIMEText(body, 'plain'))
        
        # Envoi SMTP (désactivé si pas de config)
        if SMTP_USER and SMTP_PASS:
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
                server.starttls()
                server.login(SMTP_USER, SMTP_PASS)
                server.send_message(msg)
            print(f"✉️  Email envoyé à {user_email}")
        else:
            print(f"📧 [DRY-RUN] Email à {user_email}: Commande {order_id} confirmée ({total:.2f}€)")
            
    except Exception as e:
        print(f"❌ Erreur envoi email: {e}")


def main():
    print(f"📧 Email Consumer démarrage...")
    print(f"   Topic: {KAFKA_TOPIC}")
    
    consumer = KafkaConsumer(
        KAFKA_TOPIC,
        bootstrap_servers=[KAFKA_BROKER],
        value_deserializer=lambda v: json.loads(v.decode("utf-8")),
        auto_offset_reset="earliest",
        group_id=KAFKA_GROUP_ID,
    )
    
    print("✅ Consumer prêt...")
    
    try:
        for msg in consumer:
            evt = msg.value
            
            # Parse event
            order_id = evt.get("order_id") or evt.get("id")
            user_email = evt.get("user_email") or "user@example.com"
            total = evt.get("amount") or evt.get("total", 0)
            
            send_order_confirmation(order_id, user_email, total)
            
    except KeyboardInterrupt:
        print("\n⏹️  Arrêt du consumer...")
    finally:
        consumer.close()


if __name__ == "__main__":
    main()

