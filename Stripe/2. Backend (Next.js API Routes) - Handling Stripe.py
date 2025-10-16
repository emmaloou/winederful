import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { Pool } from 'pg';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2022-11-15' });

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const config = {
  api: {
    bodyParser: false, // We need raw body to verify webhook signature
  },
};

import { buffer } from 'micro';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature']!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event type
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;

        // Here you can update your database records to mark payment complete
        // Example: store order info into PostgreSQL
        const client = await pgPool.connect();
        try {
          await client.query('BEGIN');
          await client.query(
            `INSERT INTO orders (stripe_session_id, customer_email, amount_total, payment_status)
             VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
            [session.id, session.customer_email, session.amount_total, 'paid']
          );
          await client.query('COMMIT');
        } catch (error) {
          await client.query('ROLLBACK');
          console.error('DB error during order insert:', error);
        } finally {
          client.release();
        }

        // Further tasks: Store receipts in MinIO, cache updates in Redis as required

        break;
      // Handle other event types as needed
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).json({ received: true });
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
