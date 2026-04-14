// Lemon Squeezy API configuration
// Get your API key from https://app.lemonsqueezy.com/settings/api

export const LEMON_CONFIG = {
  apiKey: process.env.LEMONSQUEEZY_API_KEY || '',
  baseUrl: 'https://api.lemonsqueezy.com/v1',
};

// Product IDs from your Lemon Squeezy dashboard
export const PRODUCTS = {
  pro: process.env.LEMONSQUEEZY_PRO_PRODUCT_ID || '',
  proYearly: process.env.LEMONSQUEEZY_PRO_YEARLY_PRODUCT_ID || '',
  business: process.env.LEMONSQUEEZY_BUSINESS_PRODUCT_ID || '',
  businessYearly: process.env.LEMONSQUEEZY_BUSINESS_YEARLY_PRODUCT_ID || '',
} as const;

export type PlanType = 'pro' | 'business';

export interface CheckoutSession {
  data: {
    id: string;
    attributes: {
      url: string;
      status: string;
      created_at: string;
    };
  };
}

export async function createCheckoutSession(
  productId: string,
  options?: {
    email?: string;
    name?: string;
    customData?: Record<string, string>;
  }
): Promise<CheckoutSession> {
  if (!LEMON_CONFIG.apiKey) {
    throw new Error('Lemon Squeezy API key not configured');
  }

  const response = await fetch(`${LEMON_CONFIG.baseUrl}/checkouts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LEMON_CONFIG.apiKey}`,
      'Content-Type': 'application/vnd.api+json',
      'Accept': 'application/vnd.api+json',
    },
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            email: options?.email,
            name: options?.name,
            custom: options?.customData,
          },
        },
        relationships: {
          store: {
            data: {
              type: 'stores',
              id: process.env.LEMONSQUEEZY_STORE_ID || '',
            },
          },
          variant: {
            data: {
              type: 'variants',
              id: productId,
            },
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Lemon Squeezy error: ${response.status} - ${error}`);
  }

  return response.json();
}

export function getCheckoutUrl(plan: PlanType, yearly: boolean): string {
  const productId = yearly
    ? PRODUCTS[`${plan}Yearly` as keyof typeof PRODUCTS]
    : PRODUCTS[plan];

  if (!productId) {
    // For demo, redirect to pricing
    return '/pricing';
  }

  // Use Lemon Squeezy hosted checkout
  const storeSlug = process.env.LEMONSQUEEZY_STORE_SLUG || 'your-store';
  return `https://hashtagger.lemonsqueezy.com/checkout/buy/${productId}`;
}
