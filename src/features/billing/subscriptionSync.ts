import { supabase } from '../../lib/supabase';
import { SUBSCRIPTION_PLANS } from '../../utils/paymentGateway';
import type { UserSubscription } from '../../types';

/**
 * Subscription persistence in Supabase so a paid plan follows the user to
 * any device/browser (localStorage is only a same-device cache). One row
 * per user in the `subscriptions` table.
 */
export async function fetchSubscription(userId: string): Promise<UserSubscription | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) return null;

  const row = data[0] as Record<string, any>;
  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === row.plan_id);
  const endIso = row.current_period_end ?? new Date().toISOString();
  const createdIso = row.created_at ?? new Date().toISOString();

  return {
    id: row.id,
    planId: row.plan_id,
    planType: (plan?.type ?? 'pro') as UserSubscription['planType'],
    status: (row.status ?? 'active') as UserSubscription['status'],
    startDate: createdIso,
    endDate: endIso,
    paymentTransactionId: row.razorpay_subscription_id ?? '',
    autoRenewal: false,
    createdAt: createdIso,
    lastPaymentDate: createdIso,
    nextBillingDate: endIso,
    usage: { invoicesUsed: 0, clientsUsed: 0, templatesUsed: 0 },
  };
}

export async function upsertSubscription(userId: string, sub: UserSubscription): Promise<void> {
  await supabase.from('subscriptions').delete().eq('user_id', userId);
  await supabase.from('subscriptions').insert({
    user_id: userId,
    plan_id: sub.planId,
    status: sub.status,
    razorpay_subscription_id: sub.paymentTransactionId,
    current_period_end: sub.endDate,
  });
}

export async function recordTransaction(
  userId: string,
  t: { orderId: string; paymentId: string; amount: number; currency: string }
): Promise<void> {
  await supabase.from('transactions').insert({
    user_id: userId,
    order_id: t.orderId,
    razorpay_payment_id: t.paymentId,
    amount: t.amount,
    currency: t.currency,
    status: 'success',
  });
}
