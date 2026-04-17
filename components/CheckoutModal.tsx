'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { PayPalButton } from '@/components/PayPalButton';

interface CheckoutModalProps {
  plan: string;
  yearly: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export function CheckoutModal({ plan, yearly, isOpen, onClose }: CheckoutModalProps) {
  const [status, setStatus] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);

  // Get QR code image path based on plan and billing cycle
  const getQrCodeUrl = () => {
    const qrUrls: Record<string, { monthly: string; yearly: string }> = {
      pro: {
        monthly: '/images/Hashtagger-Pro-qrcode.png',
        yearly: '/images/Hashtagger-Pro-Yearly-qrcode.png',
      },
      business: {
        monthly: '/images/Hashtagger-Bus-qrcode.png',
        yearly: '/images/Hashtagger-Bus-Yearly-qrcode.png',
      },
    };
    const config = qrUrls[plan];
    if (!config) return '';
    return yearly ? config.yearly : config.monthly;
  };

  useEffect(() => {
    // Check for success status
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      setStatus('success');
      setSubscriptionId(params.get('subscription'));
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

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

  // Success state
  if (status === 'success') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-gray-900">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="mt-6 text-2xl font-bold">Payment Successful!</h2>
            <p className="mt-2 text-gray-500">
              Your {plan} subscription has been activated. Check your email for details.
            </p>
            {subscriptionId && (
              <p className="mt-1 text-xs text-gray-400">Subscription ID: {subscriptionId}</p>
            )}
            <button
              onClick={onClose}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 font-medium text-white transition-transform hover:scale-105"
            >
              Start Using Hashtagger
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 dark:bg-gray-900">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold">Subscribe to {planName}</h2>
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
            onBeginCheckout={onClose}
          />

          {getQrCodeUrl() && (
            <div className="mt-6 border-t pt-6">
              <p className="text-center text-sm text-gray-500 mb-3">Or scan QR code to pay</p>
              <div className="flex justify-center">
                <img
                  src={getQrCodeUrl()}
                  alt={`${plan} ${yearly ? 'yearly' : 'monthly'} QR code`}
                  className="w-48 h-48 object-contain"
                />
              </div>
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          By subscribing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
