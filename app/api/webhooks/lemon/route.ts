import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Lemon Squeezy webhook handler
// Configure this URL in your Lemon Squeezy dashboard: https://app.lemonsqueezy.com/settings/webhooks

const WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || '';

interface LemonEvent {
  meta: {
    event_name: string;
    custom_data?: {
      user_id?: string;
      plan?: string;
    };
  };
  data: {
    id: string;
    attributes: {
      status?: string;
      ends_at?: string;
      user_email?: string;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-signature');

    if (!WEBHOOK_SECRET) {
      console.error('Lemon Squeezy webhook secret not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    // Verify webhook signature
    if (signature) {
      const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
      hmac.update(rawBody);
      const digest = hmac.digest('hex');

      if (digest !== signature) {
        console.error('Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const event: LemonEvent = JSON.parse(rawBody);
    const eventName = event.meta.event_name;

    console.log(`Received Lemon Squeezy webhook: ${eventName}`);

    // Handle subscription events
    switch (eventName) {
      case 'subscription_created':
      case 'subscription_updated':
        // Activate or update user subscription
        // In a real app, you'd update your database here
        console.log(`Subscription ${eventName}:`, {
          id: event.data.id,
          email: event.data.attributes.user_email,
          status: event.data.attributes.status,
        });
        break;

      case 'subscription_cancelled':
      case 'subscription_expired':
        // Deactivate user subscription
        console.log(`Subscription ${eventName}:`, {
          id: event.data.id,
        });
        break;

      case 'order_created':
        // Handle one-time purchase
        console.log('Order created:', event.data.id);
        break;

      default:
        console.log(`Unhandled event: ${eventName}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
