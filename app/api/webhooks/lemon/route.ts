import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/auth';

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

// Map Lemon Squeezy status to our plan status
function mapLemonStatus(status: string): string {
  switch (status) {
    case 'active':
      return 'active';
    case 'cancelled':
      return 'cancelled';
    case 'expired':
      return 'expired';
    case 'paused':
      return 'paused';
    default:
      return status;
  }
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

    const userId = event.meta.custom_data?.user_id;
    const plan = event.meta.custom_data?.plan;

    // Handle subscription events
    switch (eventName) {
      case 'subscription_created':
      case 'subscription_updated':
        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              plan: plan as any,
              subscriptionStatus: mapLemonStatus(event.data.attributes.status || ''),
              subscriptionEndDate: event.data.attributes.ends_at ? new Date(event.data.attributes.ends_at) : null,
            },
          });
          console.log(`Subscription ${eventName} updated for user ${userId}`);
        }
        break;

      case 'subscription_cancelled':
      case 'subscription_expired':
        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              subscriptionStatus: mapLemonStatus(eventName === 'subscription_cancelled' ? 'cancelled' : 'expired'),
              // Keep the plan but mark as inactive
            },
          });
          console.log(`Subscription ${eventName} for user ${userId}`);
        }
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
