import { useSupabaseSynced } from '../../lib/supabaseSync';
import type { ClientRecord } from '../../types';

const CLIENTS_KEY = 'gst_invoice_clients';

const toRow = (client: ClientRecord, userId: string) => ({
  id: client.id,
  user_id: userId,
  name: client.name,
  address: client.address,
  state: client.state,
  gstin: client.gstin,
});

const fromRow = (row: Record<string, unknown>): ClientRecord => ({
  id: row.id as string,
  name: (row.name as string) ?? '',
  address: (row.address as string) ?? '',
  state: (row.state as string) ?? '',
  gstin: (row.gstin as string) ?? '',
  createdAt: (row.created_at as string) ?? new Date().toISOString(),
});

export function useClients(userId: string | null) {
  return useSupabaseSynced<ClientRecord>('clients', userId, CLIENTS_KEY, toRow, fromRow);
}
