/**
 * ✅ RAZORPAY WEBHOOK HANDLER
 * This file is meant for server-side (backend) usage.
 * In a frontend-only setup, webhook handling is simulated.
 * For production, deploy this as an Express/Next.js API route.
 */

import type { PaymentWebhookEvent, UserSubscription } from '../types';
import { PaymentService, SUBSCRIPTION_PLANS, saveSubscription, saveTransaction } from './paymentGateway';

/**
 * Verify Razorpay Webhook Signature
 * In production, use crypto.createHmac on the server side
 */
export function verifyRazorpayWebhook(
  rawBody: string,
  signatureHeader: string
): boolean {
  // NOTE: This verification MUST happen on the server side in production
  // The frontend cannot securely verify webhook signatures
  console.log('⚠️ Webhook verification should be done server-side');
  return true;
}

/**
 * ✅ Payment Success Webhook Processor
 * Called when payment is successful
 * 1. Transaction record save
 * 2. Subscription activate
 * 3. Payment invoice generate
 */
export async function processPaymentSuccessWebhook(
  eventData: any
): Promise<{ success: boolean; subscription?: UserSubscription; invoice?: any }> {
  try {
    const payment = eventData.payload.payment.entity;
    const orderId = payment.order_id;
    const paymentId = payment.id;
    const amount = payment.amount / 100;
    const planId = payment.notes?.plan_id;

    console.log(`✅ Payment Success Received: ${paymentId} ₹${amount}`);

    // Step 1: Plan find karo
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!plan) {
      throw new Error(`Plan not found: ${planId}`);
    }

    // Step 2: Payment Service initialize karo
    const paymentService = new PaymentService('razorpay');

    // Step 3: Transaction record banao
    const transaction = {
      id: paymentId,
      orderId,
      gateway: 'razorpay' as const,
      gatewayPaymentId: paymentId,
      planId: plan.id,
      amount,
      currency: payment.currency,
      status: 'success' as const,
      email: payment.email,
      phone: payment.contact,
      createdAt: new Date(payment.created_at * 1000).toISOString(),
      completedAt: new Date().toISOString(),
    };

    // Step 4: Subscription auto activate
    const subscription = paymentService.activateSubscription(plan, transaction);

    // Step 5: Automatic GST Invoice generate
    const invoice = paymentService.generatePaymentInvoice(transaction, plan);

    console.log(`✅ Subscription Active: ${subscription.id}`);
    console.log(`✅ Invoice Generated: ${invoice.meta.invoiceNumber}`);

    return {
      success: true,
      subscription,
      invoice
    };

  } catch (error) {
    console.error('❌ Webhook Processing Failed:', error);
    return { success: false };
  }
}

/**
 * Webhook Event Router
 */
export async function handleRazorpayWebhook(
  event: PaymentWebhookEvent
): Promise<{ success: boolean }> {
  switch (event.event) {
    case 'payment.captured':
      return processPaymentSuccessWebhook(event.payload);

    case 'subscription.activated':
      console.log('✅ Subscription Activated Event');
      return { success: true };

    case 'subscription.charged':
      console.log('✅ Renewal Payment Success');
      return processPaymentSuccessWebhook(event.payload);

    default:
      console.log(`ℹ️ Ignored Event: ${event.event}`);
      return { success: true };
  }
}