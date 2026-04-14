import { NextRequest, NextResponse } from 'next/server';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';
const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox'; // sandbox or live

const PRICES: Record<string, { monthly: number; yearly: number }> = {
  pro: { monthly: 900, yearly: 9000 }, // cents
  business: { monthly: 2900, yearly: 29000 },
};

// Get PayPal access token
async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');

  const response = await fetch(`https://api-m.${PAYPAL_MODE}.com/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error('Failed to get PayPal access token');
  }

  const data = await response.json();
  return data.access_token;
}

// Create PayPal order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan, yearly } = body;

    if (!plan || !PRICES[plan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      return NextResponse.json(
        { error: 'PayPal not configured. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in .env.local' },
        { status: 503 }
      );
    }

    const amount = yearly ? PRICES[plan].yearly : PRICES[plan].monthly;
    const currency = 'USD';
    const planName = `${plan.charAt(0).toUpperCase() + plan.slice(1)} ${yearly ? 'Yearly' : 'Monthly'}`;

    // Get access token
    const accessToken = await getAccessToken();

    // Create order
    const orderResponse = await fetch(`https://api-m.${PAYPAL_MODE}.com/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            description: `Hashtagger ${planName} Subscription`,
            amount: {
              currency_code: currency,
              value: (amount / 100).toFixed(2),
            },
            custom_id: JSON.stringify({ plan, yearly }),
          },
        ],
      }),
    });

    if (!orderResponse.ok) {
      const error = await orderResponse.text();
      console.error('PayPal order creation error:', error);
      return NextResponse.json({ error: 'Failed to create PayPal order' }, { status: 500 });
    }

    const orderData = await orderResponse.json();
    return NextResponse.json({ orderID: orderData.id });
  } catch (error) {
    console.error('PayPal API error:', error);
    return NextResponse.json(
      { error: 'Failed to process PayPal payment' },
      { status: 500 }
    );
  }
}
