import crypto from 'crypto';

/**
 * Vercel serverless function: verifies a Razorpay payment signature with
 * the SECRET key. This is the step that makes a payment "real" — the
 * client can never fake success because only the server holds the secret
 * needed to reproduce the HMAC signature Razorpay sends back.
 */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    res.status(500).json({ error: 'Payment is not configured yet.' });
    return;
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400).json({ valid: false, error: 'Missing payment fields' });
    return;
  }

  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  const valid =
    expected.length === razorpay_signature.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(razorpay_signature));

  res.status(valid ? 200 : 400).json({ valid });
}
