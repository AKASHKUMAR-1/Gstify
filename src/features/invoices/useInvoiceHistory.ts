import { useSupabaseSynced } from '../../lib/supabaseSync';
import type { InvoiceRecord } from '../../types';

const HISTORY_KEY = 'gst_invoice_history';

const toRow = (record: InvoiceRecord, userId: string) => ({
  id: record.id,
  user_id: userId,
  invoice_number: record.data.meta.invoiceNumber,
  data: record.data,
});

const fromRow = (row: Record<string, unknown>): InvoiceRecord => ({
  id: row.id as string,
  data: row.data as InvoiceRecord['data'],
  createdAt: (row.created_at as string) ?? new Date().toISOString(),
});

export function useInvoiceHistory(userId: string | null) {
  return useSupabaseSynced<InvoiceRecord>('invoices', userId, HISTORY_KEY, toRow, fromRow);
}
