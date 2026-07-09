const CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = CHECKOUT_SRC;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export interface StartCheckoutArgs {
  keyId: string;
  amount: number; // in paise
  currency: string;
  planId: string;
  planName: string;
  user: { name: string; email: string; phone: string };
  onSuccess: (paymentId: string, orderId: string, signature: string) => void;
  onError: (message: string) => void;
}

/**
 * Runs the full real Razorpay flow:
 *  1. load the Checkout script,
 *  2. ask our serverless function to create a real order (secret stays server-side),
 *  3. open Razorpay Checkout,
 *  4. on payment, verify the signature server-side before calling onSuccess.
 */
export async function startRazorpayCheckout(args: StartCheckoutArgs) {
  if (!args.keyId) {
    args.onError('Payment is not configured. Please try again later.');
    return;
  }

  const scriptOk = await loadRazorpayScript();
  if (!scriptOk) {
    args.onError('Could not load the payment window. Check your connection and retry.');
    return;
  }

  let order: { orderId: string; amount: number; currency: string };
  try {
    const res = await fetch('/api/razorpay/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: args.amount, currency: args.currency, planId: args.planId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Could not start payment');
    order = data;
  } catch (e: any) {
    args.onError(e?.message || 'Could not start payment. Please try again.');
    return;
  }

  const rzp = new (window as any).Razorpay({
    key: args.keyId,
    amount: order.amount,
    currency: order.currency,
    order_id: order.orderId,
    name: 'Gstify',
    description: `${args.planName} plan`,
    prefill: {
      name: args.user.name,
      email: args.user.email,
      contact: args.user.phone,
    },
    theme: { color: '#6d28d9' },
    handler: async (resp: any) => {
      try {
        const vr = await fetch('/api/razorpay/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: resp.razorpay_order_id,
            razorpay_payment_id: resp.razorpay_payment_id,
            razorpay_signature: resp.razorpay_signature,
          }),
        });
        const vd = await vr.json();
        if (vr.ok && vd.valid) {
          args.onSuccess(resp.razorpay_payment_id, resp.razorpay_order_id, resp.razorpay_signature);
        } else {
          args.onError('Payment could not be verified. If money was deducted, it will be refunded.');
        }
      } catch {
        args.onError('Payment verification failed. Please contact support if money was deducted.');
      }
    },
    modal: {
      ondismiss: () => args.onError('Payment cancelled.'),
      confirm_close: true,
    },
  });

  rzp.on('payment.failed', (r: any) => args.onError(r?.error?.description || 'Payment failed. Please try again.'));
  rzp.open();
}
