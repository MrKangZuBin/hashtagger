import { NextRequest, NextResponse } from 'next/server';

const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox';

async function getAccessToken(): Promise<string> {
  const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
  const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');

  const response = await fetch(`https://api-m.${PAYPAL_MODE}.com/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  return data.access_token;
}

// Capture PayPal order after user approves
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderID, email } = body;

    if (!orderID) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    const accessToken = await getAccessToken();

    // Capture the order
    const captureResponse = await fetch(`https://api-m.${PAYPAL_MODE}.com/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!captureResponse.ok) {
      const error = await captureResponse.text();
      console.error('PayPal capture error:', error);
      return NextResponse.json({ error: 'Failed to capture payment' }, { status: 500 });
    }

    const captureData = await captureResponse.json();

    // Get plan info from custom_id
    const purchaseUnit = captureData.purchase_units?.[0];
    const customData = purchaseUnit?.custom_id ? JSON.parse(purchaseUnit.custom_id) : {};
    const { plan, yearly } = customData;

    // Here you would normally:
    // 1. Save the subscription to your database
    // 2. Send confirmation email
    // 3. Activate the user's subscription

    console.log('Payment captured:', {
      orderID: captureData.id,
      status: captureData.status,
      plan,
      yearly,
      email: captureData.payer?.email_address || email,
    });

    return NextResponse.json({
      success: true,
      orderID: captureData.id,
      status: captureData.status,
      plan,
      yearly,
    });
  } catch (error) {
    console.error('PayPal capture error:', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}
