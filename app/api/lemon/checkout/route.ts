import { NextRequest, NextResponse } from 'next/server';

const LEMONSQUEEZY_API_KEY = process.env.LEMONSQUEEZY_API_KEY || '';
const LEMONSQUEEZY_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID || '';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface ProductVariant {
  productId: string;
  yearlyVariantId: string;
  monthlyVariantId: string;
}

const PRODUCT_VARIANTS: Record<string, ProductVariant> = {
  pro: {
    productId: process.env.LEMONSQUEEZY_PRO_PRODUCT_ID || '',
    yearlyVariantId: process.env.LEMONSQUEEZY_PRO_YEARLY_PRODUCT_ID || '',
    monthlyVariantId: process.env.LEMONSQUEEZY_PRO_PRODUCT_ID || '', // Use same for monthly if no separate ID
  },
  business: {
    productId: process.env.LEMONSQUEEZY_BUSINESS_PRODUCT_ID || '',
    yearlyVariantId: process.env.LEMONSQUEEZY_BUSINESS_YEARLY_PRODUCT_ID || '',
    monthlyVariantId: process.env.LEMONSQUEEZY_BUSINESS_PRODUCT_ID || '',
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan, yearly } = body;

    if (!plan || !PRODUCT_VARIANTS[plan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    if (!LEMONSQUEEZY_API_KEY || !LEMONSQUEEZY_STORE_ID) {
      return NextResponse.json(
        { error: 'Lemon Squeezy not configured. Please set LEMONSQUEEZY_API_KEY and LEMONSQUEEZY_STORE_ID in .env.local' },
        { status: 503 }
      );
    }

    const variant = PRODUCT_VARIANTS[plan];
    const variantId = yearly ? variant.yearlyVariantId : variant.monthlyVariantId;

    if (!variantId) {
      return NextResponse.json(
        { error: `Product variant not configured for ${plan} ${yearly ? 'yearly' : 'monthly'}` },
        { status: 503 }
      );
    }

    // Create Lemon Squeezy checkout session
    const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LEMONSQUEEZY_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.api+json',
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            checkout_data: {
              email: body.email || undefined,
              custom: {
                plan,
              },
            },
            product_options: {
              redirect_url: `${APP_URL}/checkout/${plan}?status=success&plan=${plan}`,
            },
            checkout_options: {
              embed: false,
              media: true,
              logo: true,
            },
          },
          relationships: {
            store: {
              data: {
                type: 'stores',
                id: LEMONSQUEEZY_STORE_ID,
              },
            },
            variant: {
              data: {
                type: 'variants',
                id: variantId,
              },
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Lemon Squeezy checkout error:', error);
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const checkoutUrl = data.data?.attributes?.url;

    if (!checkoutUrl) {
      return NextResponse.json(
        { error: 'No checkout URL returned' },
        { status: 500 }
      );
    }

    return NextResponse.json({ checkoutUrl });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout' },
      { status: 500 }
    );
  }
}
