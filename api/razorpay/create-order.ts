/**
 * Vercel serverless function: creates a real Razorpay order using the
 * SECRET key, which must never touch the browser. The client sends the
 * amount (in paise) and plan id; we return the Razorpay order id to hand
 * to Razorpay Checkout.
 *
 * Env (server-side only, set in Vercel project settings):
 *   RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
 */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    res.status(500).json({ error: 'Payment is not configured yet. Please try again later.' });
    return;
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const { amount, currency = 'INR', planId } = body;

  if (!amount || typeof amount !== 'number' || amount < 100) {
    res.status(400).json({ error: 'Invalid amount' });
    return;
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

  try {
    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
      body: JSON.stringify({
        amount,
        currency,
        receipt: `rcpt_${Date.now()}`,
        notes: { planId: planId || '' },
      }),
    });
    const data = await rzpRes.json();
    if (!rzpRes.ok) {
      res.status(502).json({ error: data?.error?.description || 'Could not create order' });
      return;
    }
    res.status(200).json({ orderId: data.id, amount: data.amount, currency: data.currency });
  } catch {
    res.status(502).json({ error: 'Could not reach the payment gateway. Please retry.' });
  }
}
