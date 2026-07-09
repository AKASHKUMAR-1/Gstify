import type { InvoiceData } from '../../types';

const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

export interface InvoiceValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

/** Pure validation of an invoice; returns errors keyed by field. */
export function validateInvoice(invoiceData: InvoiceData): InvoiceValidationResult {
  const errors: Record<string, string> = {};

  if (!invoiceData.seller.name.trim()) errors.sellerName = 'Seller business name is required';
  if (invoiceData.seller.gstin && !GST_REGEX.test(invoiceData.seller.gstin.toUpperCase())) {
    errors.sellerGstin = 'Seller GSTIN format is invalid';
  }
  if (!invoiceData.buyer.name.trim()) errors.buyerName = 'Buyer name is required';
  if (invoiceData.buyer.gstin && !GST_REGEX.test(invoiceData.buyer.gstin.toUpperCase())) {
    errors.buyerGstin = 'Buyer GSTIN format is invalid';
  }
  if (!invoiceData.meta.invoiceDate) errors.invoiceDate = 'Invoice date is required';
  if (!invoiceData.meta.dueDate) errors.dueDate = 'Due date is required';
  if (
    invoiceData.meta.invoiceDate &&
    invoiceData.meta.dueDate &&
    invoiceData.meta.dueDate < invoiceData.meta.invoiceDate
  ) {
    errors.dueDate = 'Due date cannot be before invoice date';
  }
  if (!invoiceData.meta.invoiceNumber.trim()) errors.invoiceNumber = 'Invoice number is required';

  if (invoiceData.items.length === 0) {
    errors.items = 'At least one line item is required';
  } else {
    invoiceData.items.forEach((item, index) => {
      if (!item.description.trim()) errors[`item_${index}_description`] = `Item ${index + 1}: description is required`;
      if (item.quantity <= 0) errors[`item_${index}_quantity`] = `Item ${index + 1}: quantity must be greater than 0`;
      if (item.rate < 0) errors[`item_${index}_rate`] = `Item ${index + 1}: rate cannot be negative`;
    });
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
