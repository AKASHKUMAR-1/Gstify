import { useSupabaseSynced } from '../../lib/supabaseSync';
import type { ProductRecord } from '../../types';

const PRODUCTS_KEY = 'gst_invoice_products';

const toRow = (product: ProductRecord, userId: string) => ({
  id: product.id,
  user_id: userId,
  name: product.name,
  rate: product.rate,
  hsn_sac: product.hsnSac,
  gst_percentage: product.gstPercentage,
});

const fromRow = (row: Record<string, unknown>): ProductRecord => ({
  id: row.id as string,
  name: (row.name as string) ?? '',
  hsnSac: (row.hsn_sac as string) ?? '',
  rate: Number(row.rate ?? 0),
  gstPercentage: Number(row.gst_percentage ?? 18),
  createdAt: (row.created_at as string) ?? new Date().toISOString(),
});

export function useProducts(userId: string | null) {
  return useSupabaseSynced<ProductRecord>('products', userId, PRODUCTS_KEY, toRow, fromRow);
}
