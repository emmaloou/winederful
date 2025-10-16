import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { Pool } from 'pg'; // PostgreSQL client
import Redis from 'ioredis'; // Redis client

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2022-11-15' });

// Setup Postgres pool (adjust connection details)
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Setup Redis client (adjust connection details)
const redis = new Redis(process.env.REDIS_URL!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { items, customerEmail } = req.body;

    try {
      // Create a Stripe Checkout Session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: customerEmail,
        line_items: items.map((item: any) => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.name,
              // add description or images if needed
            },
            unit_amount: item.price * 100, // amount in cents
          },
          quantity: item.quantity,
        })),
        success_url: `${process.env.DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.DOMAIN}/cancel`,
      });

      // Optional: Store session ID in Redis cache for quick access
      await redis.set(`checkout_session:${session.id}`, JSON.stringify(session), 'EX', 3600);

      // Send session ID to frontend to redirect user to Stripe Checkout
      res.status(200).json({ sessionId: session.id });
    } catch (error) {
      console.error('Error creating Stripe session:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
