npm install @stripe/stripe-js

import { loadStripe } from '@stripe/stripe-js';
import { useState } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type Item = {
  name: string;
  price: number;
  quantity: number;
};

export default function CheckoutButton({ items, customerEmail }: { items: Item[], customerEmail: string }) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    const stripe = await stripePromise;

    // Call backend API route to create checkout session
    const response = await fetch('/api/checkout_sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, customerEmail }),
    });

    const { sessionId } = await response.json();

    // Redirect user to Stripe-hosted checkout page
    const { error } = await stripe!.redirectToCheckout({ sessionId });

    if (error) {
      console.error(error);
      // Handle error (show message to user)
    }
    setLoading(false);
  };

  return (
    <button onClick={handleCheckout} disabled={loading}>
      {loading ? 'Processing...' : 'Pay Now'}
    </button>
  );
}
