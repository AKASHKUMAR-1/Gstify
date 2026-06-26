export interface SellerDetails {
  name: string;
  address: string;
  email: string;
  phone: string;
  gstin: string;
  logo?: string;
  signature?: string;
  paymentMethod?: 'bank' | 'upi' | 'none';
  bankName?: string;
  customBankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  upiId?: string;
}

export interface BuyerDetails {
  name: string;
  address: string;
  state: string;
  gstin: string;
}

export interface InvoiceMeta {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  hsnSac: string;
  quantity: number;
  rate: number;
  gstPercentage: number;
}

export interface InvoiceData {
  seller: SellerDetails;
  buyer: BuyerDetails;
  meta: InvoiceMeta;
  items: InvoiceItem[];
  isInterState: boolean;
  createdAt?: string;
}

export interface InvoiceRecord {
  id: string;
  data: InvoiceData;
  createdAt: string;
}

export interface ClientRecord {
  id: string;
  name: string;
  address: string;
  state: string;
  gstin: string;
  createdAt: string;
}

export interface ProductRecord {
  id: string;
  name: string;
  hsnSac: string;
  rate: number;
  gstPercentage: number;
  createdAt: string;
}

export interface RecurringInvoiceTemplate {
  id: string;
  name: string;
  description: string;
  frequency: 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate?: string;
  isActive: boolean;
  invoiceData: Omit<InvoiceData, 'meta'> & {
    meta: Omit<InvoiceMeta, 'invoiceNumber' | 'invoiceDate' | 'dueDate'>;
  };
  createdAt: string;
  lastGeneratedDate?: string;
  nextDueDate: string;
}

export interface InvoiceStatus {
  id: string;
  invoiceId: string;
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue';
  sentAt?: string;
  viewedAt?: string;
  paidAt?: string;
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderTemplate {
  id: string;
  name: string;
  daysBefore: number;
  message: string;
  isActive: boolean;
  createdAt: string;
}

export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'dropdown';
  options?: string[];
  isRequired: boolean;
  createdAt: string;
}

export interface ReportData {
  period: string;
  totalInvoices: number;
  totalAmount: number;
  totalPaid: number;
  totalPending: number;
  gstCollected: number;
  topCustomers: Array<{
    name: string;
    amount: number;
    invoiceCount: number;
  }>;
  monthlyBreakdown: Array<{
    month: string;
    amount: number;
    count: number;
  }>;
}

// ========== PAYMENT & SUBSCRIPTION TYPES ==========

export type PlanType = 'free' | 'basic' | 'pro' | 'enterprise';
export type PaymentGateway = 'razorpay' | 'stripe';
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trial';

export interface SubscriptionPlan {
  id: string;
  type: PlanType;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'quarterly' | 'yearly';
  features: string[];
  limits: {
    maxInvoices: number;
    maxClients: number;
    maxTemplates: number;
    hasPremiumTemplates: boolean;
    hasApiAccess: boolean;
    hasTeamSupport: boolean;
  };
  gatewayPlanId?: string;
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  gateway: PaymentGateway;
  gatewayPaymentId?: string;
  gatewaySignature?: string;
  planId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  userId?: string;
  email?: string;
  phone?: string;
  createdAt: string;
  completedAt?: string;
  failureReason?: string;
}

export interface UserSubscription {
  id: string;
  planId: string;
  planType: PlanType;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  paymentTransactionId: string;
  autoRenewal: boolean;
  createdAt: string;
  lastPaymentDate?: string;
  nextBillingDate?: string;
  usage: {
    invoicesUsed: number;
    clientsUsed: number;
    templatesUsed: number;
  };
}

export interface PaymentWebhookEvent {
  id: string;
  event: string;
  gateway: PaymentGateway;
  payload: any;
  receivedAt: string;
  processed: boolean;
  processedAt?: string;
}

// ========== ENTERPRISE FEATURES TYPES ==========

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  joinedAt: string;
  avatar?: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsedAt?: string;
  status: 'active' | 'revoked';
}

export interface AccountManagerDetails {
  name: string;
  position: string;
  email: string;
  phone: string;
  avatar?: string;
  availability: string;
}
