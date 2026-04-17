'use client';

import { useState } from 'react';
import { Loader2, ExternalLink } from 'lucide-react';

interface PayPalButtonProps {
  plan: string;
  yearly: boolean;
  onBeginCheckout?: () => void;
}

export function PayPalButton({ plan, yearly, onBeginCheckout }: PayPalButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Get the appropriate checkout link based on plan and billing cycle
  const getCheckoutLink = () => {
    const checkoutLinks: Record<string, { monthly: string; yearly: string }> = {
      pro: {
        monthly: process.env.NEXT_PUBLIC_PAYPAL_PRO_MONTHLY_CHECKOUT || 'https://www.paypal.com/ncp/payment/X3T9MHBXF4BQS',
        yearly: process.env.NEXT_PUBLIC_PAYPAL_PRO_YEARLY_CHECKOUT || process.env.NEXT_PUBLIC_PAYPAL_PRO_MONTHLY_CHECKOUT || 'https://www.paypal.com/ncp/payment/X3T9MHBXF4BQS',
      },
      business: {
        monthly: process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_MONTHLY_CHECKOUT || process.env.NEXT_PUBLIC_PAYPAL_PRO_MONTHLY_CHECKOUT || 'https://www.paypal.com/ncp/payment/X3T9MHBXF4BQS',
        yearly: process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_YEARLY_CHECKOUT || process.env.NEXT_PUBLIC_PAYPAL_PRO_MONTHLY_CHECKOUT || 'https://www.paypal.com/ncp/payment/X3T9MHBXF4BQS',
      },
    };

    const linkConfig = checkoutLinks[plan];
    if (!linkConfig) return null;

    return yearly ? linkConfig.yearly : linkConfig.monthly;
  };

  const handleCheckout = () => {
    const checkoutLink = getCheckoutLink();
    if (!checkoutLink) return;

    setIsLoading(true);

    // Save plan info to localStorage before redirect
    localStorage.setItem('hashtagger_pending_plan', plan);
    localStorage.setItem('hashtagger_pending_yearly', String(yearly));

    // Close modal and notify parent
    onBeginCheckout?.();

    // Open PayPal checkout in new tab
    window.open(checkoutLink, '_blank');
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleCheckout}
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-400 px-6 py-3 font-semibold text-black transition hover:bg-yellow-500 disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Redirecting to PayPal...
          </>
        ) : (
          <>
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c1.387 2.654-.186 5.718-3.656 6.787-1.564.48-3.32.576-5.024.576H10.12l-1.355 8.59h3.316a.641.641 0 0 0 .633-.54l.026-.17.5-3.185.032-.175a.641.641 0 0 1 .633-.54h.399c2.589 0 4.612-.528 5.61-2.054.826-1.266 1.143-2.873.914-4.573z"/>
            </svg>
            Pay with PayPal
            <ExternalLink className="h-4 w-4" />
          </>
        )}
      </button>

      <p className="text-center text-xs text-gray-400">
        Secure payment via PayPal • You will be redirected to complete payment
      </p>
    </div>
  );
}
