const INVOICE_SEQUENCE_KEY = 'gst_invoice_sequence_by_fy';

/** Indian financial year (Apr–Mar) for a date, formatted e.g. "2025-26". */
export function getFinancialYear(dateString: string): string {
  const date = new Date(dateString || Date.now());
  const year = date.getFullYear();
  const startYear = date.getMonth() >= 3 ? year : year - 1;
  const endShort = String(startYear + 1).slice(-2);
  return `${startYear}-${endShort}`;
}

export function formatInvoiceNumber(fy: string, seq: number): string {
  return `INV/${fy}/${String(seq).padStart(4, '0')}`;
}

function readSequenceMap(): Record<string, number> {
  const raw = localStorage.getItem(INVOICE_SEQUENCE_KEY);
  return raw ? (JSON.parse(raw) as Record<string, number>) : {};
}

/** Next invoice number for the date's FY without consuming the sequence. */
export function getSuggestedInvoiceNumber(dateString: string): string {
  const fy = getFinancialYear(dateString);
  const nextSeq = (readSequenceMap()[fy] || 0) + 1;
  return formatInvoiceNumber(fy, nextSeq);
}

/** Next invoice number, incrementing and persisting the FY sequence. */
export function reserveNextInvoiceNumber(dateString: string): string {
  const fy = getFinancialYear(dateString);
  const map = readSequenceMap();
  const nextSeq = (map[fy] || 0) + 1;
  map[fy] = nextSeq;
  localStorage.setItem(INVOICE_SEQUENCE_KEY, JSON.stringify(map));
  return formatInvoiceNumber(fy, nextSeq);
}
