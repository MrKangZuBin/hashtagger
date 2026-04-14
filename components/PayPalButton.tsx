'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export function PayPalButton({ plan, yearly }: { plan: string; yearly: boolean }) {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState('');

  // Get the appropriate plan ID based on plan and billing cycle
  const getPlanId = () => {
    const planIds: Record<string, { monthly: string; yearly: string }> = {
      pro: {
        monthly: process.env.NEXT_PUBLIC_PAYPAL_PRO_MONTHLY_PLAN_ID || 'P-89K20521DL425110CNHOPAII',
        yearly: process.env.NEXT_PUBLIC_PAYPAL_PRO_YEARLY_PLAN_ID || '',
      },
      business: {
        monthly: process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_MONTHLY_PLAN_ID || '',
        yearly: process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_YEARLY_PLAN_ID || '',
      },
    };

    const planConfig = planIds[plan];
    if (!planConfig) return '';

    return yearly ? planConfig.yearly : planConfig.monthly;
  };

  useEffect(() => {
    // Load PayPal SDK
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&vault=true&intent=subscription`;
    script.async = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => setError('Failed to load PayPal SDK');
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !(window as any).paypal) return;

    const planId = getPlanId();
    if (!planId) {
      setError('Plan not configured');
      return;
    }

    try {
      (window as any).paypal.Buttons({
        style: {
          shape: 'rect',
          color: 'gold',
          layout: 'vertical',
          label: 'subscribe',
        },
        createSubscription: (data: any, actions: any) => {
          return actions.subscription.create({
            planId: planId,
          });
        },
        onApprove: (data: any) => {
          // Subscription created successfully
          console.log('Subscription created:', data.subscriptionID);

          // Save subscription to localStorage (in real app, send to backend)
          localStorage.setItem('hashtagger_subscription_id', data.subscriptionID);
          localStorage.setItem('hashtagger_user_plan', plan);
          localStorage.setItem('hashtagger_subscription_email', userEmail);

          // Redirect to success page
          router.push(`/checkout/${plan}?status=success&subscription=${data.subscriptionID}`);
        },
        onError: (err: any) => {
          console.error('PayPal error:', err);
          setError('Payment failed. Please try again.');
        },
      }).render('#paypal-button-container');
    } catch (err) {
      console.error('PayPal buttons error:', err);
      setError('Failed to initialize PayPal button');
    }
  }, [isLoaded, plan, yearly, userEmail, router]);

  return (
    <div className="space-y-4">
      {/* Email input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Email for subscription
        </label>
        <input
          type="email"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
          placeholder="your@email.com"
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
          required
        />
        <p className="mt-1 text-xs text-gray-500">
          Subscription confirmation will be sent to this email
        </p>
      </div>

      {/* PayPal Button Container */}
      {error ? (
        <div className="py-4 text-center text-sm text-red-500">{error}</div>
      ) : !isLoaded ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
          <span className="ml-2 text-gray-500">Loading PayPal...</span>
        </div>
      ) : (
        <div id="paypal-button-container" className="min-h-[150px]" />
      )}

      <p className="text-center text-xs text-gray-400">
        Secure payment via PayPal • Cancel anytime
      </p>
    </div>
  );
}
