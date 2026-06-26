import type {
  SubscriptionPlan,
  PaymentTransaction,
  UserSubscription,
  PaymentGateway,
  PlanType,
} from '../types';

// ==================== LOCAL STORAGE KEYS ====================
const SUBSCRIPTION_KEY = 'gst_invoice_subscription';
const TRANSACTIONS_KEY = 'gst_invoice_transactions';

// ==================== SUBSCRIPTION PLANS CONFIGURATION ====================
// Prices matched with landing page: Starter \u20B90, Professional \u20B9499, Enterprise \u20B91499
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free-plan',
    type: 'free',
    name: 'Starter',
    description: 'For individual users just getting started',
    price: 0,
    currency: 'INR',
    interval: 'monthly',
    features: [
      '\u2705 Up to 25 Invoices per month',
      '\u2705 Basic GST Calculation',
      '\u2705 Standard PDF Export',
      '\u2705 Client database (25 clients)',
      '\u274C Premium templates',
      '\u274C GST Reports',
      '\u274C API Access',
    ],
    limits: {
      maxInvoices: 25,
      maxClients: 25,
      maxTemplates: 3,
      hasPremiumTemplates: false,
      hasApiAccess: false,
      hasTeamSupport: false,
    },
  },
  {
    id: 'pro-plan-monthly',
    type: 'pro',
    name: 'Professional',
    description: 'For growing businesses with advanced needs',
    price: 249,
    currency: 'INR',
    interval: 'monthly',
    features: [
      '\u2705 Unlimited Invoices',
      '\u2705 Advanced GST Reports (GSTR-1)',
      '\u2705 All Premium Templates',
      '\u2705 Unlimited Clients',
      '\u2705 Remove GSTify Branding',
      '\u2705 Priority Email Support',
      '\u2705 Recurring invoices',
      '\u2705 Email & WhatsApp notifications',
    ],
    limits: {
      maxInvoices: -1,
      maxClients: -1,
      maxTemplates: 50,
      hasPremiumTemplates: true,
      hasApiAccess: false,
      hasTeamSupport: false,
    },
    gatewayPlanId: 'plan_pro_249_monthly',
  },
  {
    id: 'pro-plan-yearly',
    type: 'pro',
    name: 'Professional Yearly',
    description: 'For growing businesses with advanced needs (Save 20%)',
    price: 2390,
    currency: 'INR',
    interval: 'yearly',
    features: [
      '\u2705 Unlimited Invoices',
      '\u2705 Advanced GST Reports (GSTR-1)',
      '\u2705 All Premium Templates',
      '\u2705 Unlimited Clients',
      '\u2705 Remove GSTify Branding',
      '\u2705 Priority Email Support',
      '\u2705 Recurring invoices',
      '\u2705 Email & WhatsApp notifications',
    ],
    limits: {
      maxInvoices: -1,
      maxClients: -1,
      maxTemplates: 50,
      hasPremiumTemplates: true,
      hasApiAccess: false,
      hasTeamSupport: false,
    },
    gatewayPlanId: 'plan_pro_2390_yearly',
  },
  {
    id: 'enterprise-plan-monthly',
    type: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations & teams',
    price: 499,
    currency: 'INR',
    interval: 'monthly',
    features: [
      '\u2705 Everything in Professional',
      '\u2705 Multi-user Access (5 Users)',
      '\u2705 API Access',
      '\u2705 Dedicated Account Manager',
      '\u2705 White-label invoices',
      '\u2705 Custom integrations',
      '\u2705 Priority support',
    ],
    limits: {
      maxInvoices: -1,
      maxClients: -1,
      maxTemplates: -1,
      hasPremiumTemplates: true,
      hasApiAccess: true,
      hasTeamSupport: true,
    },
    gatewayPlanId: 'plan_enterprise_499_monthly',
  },
  {
    id: 'enterprise-plan-yearly',
    type: 'enterprise',
    name: 'Enterprise Yearly',
    description: 'For large organizations & teams (Save 20%)',
    price: 4790,
    currency: 'INR',
    interval: 'yearly',
    features: [
      '\u2705 Everything in Professional',
      '\u2705 Multi-user Access (5 Users)',
      '\u2705 API Access',
      '\u2705 Dedicated Account Manager',
      '\u2705 White-label invoices',
      '\u2705 Custom integrations',
      '\u2705 Priority support',
    ],
    limits: {
      maxInvoices: -1,
      maxClients: -1,
      maxTemplates: -1,
      hasPremiumTemplates: true,
      hasApiAccess: true,
      hasTeamSupport: true,
    },
    gatewayPlanId: 'plan_enterprise_4790_yearly',
  },
];

// ==================== SUBSCRIPTION PERSISTENCE ====================

export function saveSubscription(subscription: UserSubscription): void {
  localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription));
}

export function loadSubscription(): UserSubscription | null {
  try {
    const saved = localStorage.getItem(SUBSCRIPTION_KEY);
    if (!saved) return null;
    const subscription: UserSubscription = JSON.parse(saved);
    return subscription;
  } catch {
    return null;
  }
}

export function clearSubscription(): void {
  localStorage.removeItem(SUBSCRIPTION_KEY);
}

export function isSubscriptionActive(subscription: UserSubscription | null): boolean {
  if (!subscription) return false;
  if (subscription.status !== 'active' && subscription.status !== 'trial') return false;
  const endDate = new Date(subscription.endDate);
  return endDate > new Date();
}

export function getSubscriptionDaysRemaining(subscription: UserSubscription | null): number {
  if (!subscription) return 0;
  const endDate = new Date(subscription.endDate);
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function getSubscriptionPlan(subscription: UserSubscription | null): SubscriptionPlan | null {
  if (!subscription) return null;
  return SUBSCRIPTION_PLANS.find(p => p.id === subscription.planId) || null;
}

export function activateEarlyBirdTrial(): UserSubscription {
  const now = new Date();
  const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days trial
  
  const subscription: UserSubscription = {
    id: `SUB-TRIAL-${Date.now().toString(36).toUpperCase()}`,
    planId: 'pro-plan-monthly', // Giving them Pro features for the trial
    planType: 'pro',
    status: 'trial',
    startDate: now.toISOString(),
    endDate: endDate.toISOString(),
    paymentTransactionId: 'EARLY_BIRD_FREE',
    autoRenewal: false,
    createdAt: now.toISOString(),
    lastPaymentDate: now.toISOString(),
    nextBillingDate: endDate.toISOString(),
    usage: {
      invoicesUsed: 0,
      clientsUsed: 0,
      templatesUsed: 0,
    },
  };

  saveSubscription(subscription);
  return subscription;
}

// ==================== TRANSACTION PERSISTENCE ====================

export function saveTransaction(transaction: PaymentTransaction): void {
  try {
    const saved = localStorage.getItem(TRANSACTIONS_KEY);
    const transactions: PaymentTransaction[] = saved ? JSON.parse(saved) : [];
    transactions.unshift(transaction);
    // Keep last 50 transactions
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions.slice(0, 50)));
  } catch {
    console.error('Failed to save transaction');
  }
}

export function loadTransactions(): PaymentTransaction[] {
  try {
    const saved = localStorage.getItem(TRANSACTIONS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

// ==================== PAYMENT GATEWAY SERVICE ====================
export class PaymentService {
  private gateway: PaymentGateway;
  private apiKey: string;

  constructor(gateway: PaymentGateway = 'razorpay') {
    this.gateway = gateway;
    // Use Vite env variable for Razorpay key
    this.apiKey = (import.meta as any).env?.VITE_RAZORPAY_KEY || '';
  }

  // Generate unique order ID
  private generateOrderId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `ORD-${timestamp}-${random}`.toUpperCase();
  }

  // Create Order (client-side for demo; in production use backend API)
  async createOrder(plan: SubscriptionPlan): Promise<{ orderId: string; amount: number; currency: string }> {
    const orderId = this.generateOrderId();
    const amount = Math.round(plan.price * 1.18 * 100); // Price + GST in paise

    return {
      orderId,
      amount,
      currency: plan.currency,
    };
  }

  // Initialize Razorpay Payment Checkout
  initiateRazorpayPayment(
    plan: SubscriptionPlan,
    userDetails: { email: string; phone: string; name: string },
    onSuccess: (paymentId: string, orderId: string, signature: string) => void,
    onError: (error: { message: string; code?: string }) => void
  ) {
    const rzp = (window as any).Razorpay;

    if (!rzp) {
      onError({ message: 'Razorpay SDK not loaded. Please check your internet connection and refresh the page.' });
      return;
    }

    this.createOrder(plan).then((orderData) => {
      const options = {
        key: this.apiKey,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'GSTify',
        description: `${plan.name} Plan - Monthly Subscription`,
        order_id: orderData.orderId,
        prefill: {
          name: userDetails.name,
          email: userDetails.email,
          contact: `+91${userDetails.phone}`,
        },
        notes: {
          plan_id: plan.id,
          plan_name: plan.name,
        },
        image: 'https://i.ibb.co/gSTify-Logo.png',
        theme: {
          color: '#4f46e5',
          backdrop_color: 'rgba(0,0,0,0.6)',
        },
        handler: function (response: {
          razorpay_payment_id?: string;
          razorpay_order_id?: string;
          razorpay_signature?: string;
        }) {
          onSuccess(
            response.razorpay_payment_id || `pay_${Date.now().toString(36)}`,
            response.razorpay_order_id || orderData.orderId,
            response.razorpay_signature || 'demo_signature'
          );
        },
        modal: {
          ondismiss: function () {
            onError({ message: 'Payment cancelled. Aap dubara try kar sakte hain.' });
          },
          confirm_close: true,
          escape: true,
        },
      };

      try {
        const razorpayInstance = new rzp(options);
        razorpayInstance.on('payment.failed', function (response: {
          error?: { description: string; code?: string };
        }) {
          onError({
            message: response?.error?.description || 'Payment failed. Please try again.',
            code: response?.error?.code,
          });
        });
        razorpayInstance.open();
      } catch (err) {
        onError({ message: 'Failed to open payment window. Please try again.' });
      }
    }).catch((err) => {
      onError({ message: 'Failed to create order. Please try again.' });
    });
  }

  // Activate subscription after successful payment
  activateSubscription(
    plan: SubscriptionPlan,
    paymentTransaction: PaymentTransaction
  ): UserSubscription {
    const now = new Date();
    const endDate = new Date();

    switch (plan.interval) {
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'quarterly':
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case 'yearly':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
    }

    const subscription: UserSubscription = {
      id: `SUB-${Date.now().toString(36).toUpperCase()}`,
      planId: plan.id,
      planType: plan.type,
      status: 'active',
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      paymentTransactionId: paymentTransaction.id,
      autoRenewal: true,
      createdAt: now.toISOString(),
      lastPaymentDate: now.toISOString(),
      nextBillingDate: endDate.toISOString(),
      usage: {
        invoicesUsed: 0,
        clientsUsed: 0,
        templatesUsed: 0,
      },
    };

    // Persist subscription and transaction
    saveSubscription(subscription);
    saveTransaction(paymentTransaction);

    return subscription;
  }

  // Generate invoice for the subscription payment itself
  generatePaymentInvoice(
    transaction: PaymentTransaction,
    plan: SubscriptionPlan
  ) {
    const invoiceDate = new Date().toISOString().split('T')[0];

    return {
      seller: {
        name: 'GSTify Invoice Generator',
        address: 'Tech Park, Sector 5, Bangalore, Karnataka - 560001',
        email: 'billing@gstify.com',
        phone: '+91 98765 43210',
        gstin: '29ABCDE1234F1Z5',
      },
      buyer: {
        name: transaction.email || 'Customer',
        address: '',
        state: 'Karnataka',
        gstin: '',
      },
      meta: {
        invoiceNumber: `INV-SUB-${transaction.id.slice(0, 8).toUpperCase()}`,
        invoiceDate,
        dueDate: invoiceDate,
      },
      items: [
        {
          id: 'sub-fee',
          description: `${plan.name} Plan - Monthly Subscription`,
          hsnSac: '998314',
          quantity: 1,
          rate: plan.price,
          gstPercentage: 18,
        },
      ],
      isInterState: false,
      createdAt: transaction.createdAt,
    };
  }
}