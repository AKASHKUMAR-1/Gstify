import type { InvoiceData } from '../types';

// localStorage keys — each is referenced through this module so a rename
// only ever happens in one place.
export const STORAGE_KEY = 'gst_invoice_seller_details';
export const HISTORY_KEY = 'gst_invoice_history';
export const CLIENTS_KEY = 'gst_invoice_clients';
export const PRODUCTS_KEY = 'gst_invoice_products';
export const PLAN_KEY = 'gst_invoice_plan';
export const USAGE_KEY = 'gst_invoice_usage';
export const RECURRING_KEY = 'gst_invoice_recurring';
export const STATUSES_KEY = 'gst_invoice_statuses';
export const THEME_KEY = 'theme';
export const SESSION_KEY = 'gstify_session';

export type PlanTier = 'free' | 'basic' | 'premium' | 'enterprise' | 'pro';

export const FREE_LIMITS = {
  monthlyDownloads: 25,
  maxClients: 25,
  maxProducts: 100,
  maxHistory: 20,
};

/** A blank invoice with sensible defaults for a new session. */
export function createInitialInvoice(): InvoiceData {
  return {
    seller: { name: '', address: '', email: '', phone: '', gstin: '' },
    buyer: { name: '', address: '', state: '', gstin: '' },
    meta: {
      invoiceNumber: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    items: [
      {
        id: crypto.randomUUID(),
        description: 'Web Development Services',
        hsnSac: '998311',
        quantity: 1,
        rate: 15000,
        gstPercentage: 18,
      },
    ],
    isInterState: false,
  };
}
