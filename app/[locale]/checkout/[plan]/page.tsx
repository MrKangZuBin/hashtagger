'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { PayPalProvider } from '@/components/PayPalProvider';
import { PayPalButton } from '@/components/PayPalButton';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') || 'pro';
  const yearly = searchParams.get('yearly') === 'true';
  const status = searchParams.get('status');
  const subscriptionId = searchParams.get('subscription');

  // Handle successful payment return
  useEffect(() => {
    if (status === 'success' && plan) {
      const validPlans = ['pro', 'business'];
      if (validPlans.includes(plan)) {
        localStorage.setItem('hashtagger_user_plan', plan);
      }
    }
  }, [plan, status]);

  // Show success page
  if (status === 'success') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="mt-6 text-2xl font-bold">Payment Successful!</h1>
          <p className="mt-2 text-gray-500">
            Your {plan} subscription has been activated. Check your email for details.
          </p>
          {subscriptionId && (
            <p className="mt-1 text-xs text-gray-400">Subscription ID: {subscriptionId}</p>
          )}
          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 font-medium text-white transition-transform hover:scale-105"
          >
            Start Using Hashtagger
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Show payment page
  const planName = `${plan.charAt(0).toUpperCase() + plan.slice(1)} ${yearly ? 'Yearly' : 'Monthly'}`;
  const price = yearly
    ? plan === 'pro'
      ? '$90/year'
      : '$290/year'
    : plan === 'pro'
    ? '$9/month'
    : '$29/month';

  const features = plan === 'pro'
    ? ['Unlimited generations', 'Image analysis', 'Banned tag filtering', 'Multi-platform', '30-day history', 'Competition analysis']
    : ['Everything in Pro', 'CSV bulk generation', '5 team members', 'API access', 'Custom prompts', 'Priority support'];

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h1 className="text-xl font-bold">Subscribe to {planName}</h1>
            <p className="mt-1 text-2xl font-bold text-violet-600">{price}</p>

            <ul className="mt-4 space-y-2">
              {features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>

            <div className="mt-6 border-t pt-6">
              <PayPalButton
                plan={plan}
                yearly={yearly}
              />
            </div>

            <p className="mt-4 text-center text-xs text-gray-400">
              By subscribing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>

          <Link
            href="/pricing"
            className="mt-4 block text-center text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ← Back to Pricing
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <PayPalProvider>
      <CheckoutContent />
    </PayPalProvider>
  );
}
