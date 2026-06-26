import React from 'react';
import { InvoiceData } from '../types';
import { formatCurrency, numberToWordsIndian } from '../utils/formatters';
import type { InvoiceTemplate as InvoiceTemplateType } from './TemplateSelector';

interface Props {
  data: InvoiceData;
  template?: InvoiceTemplateType;
  showWatermark?: boolean;
}

export const InvoiceTemplate: React.FC<Props> = ({ data, template, showWatermark }) => {
  const templateColor = template?.color || '#4f46e5';
  const templateAccent = template?.accent || '#6366f1';
  const { seller, buyer, meta, items, isInterState } = data;

  // Mask account number - show only last 4 digits
  const maskAccountNumber = (accountNumber: string) => {
    if (!accountNumber) return '';
    if (accountNumber.length <= 4) return accountNumber;
    return 'X'.repeat(accountNumber.length - 4) + accountNumber.slice(-4);
  };

  // Mask IFSC code - show only last 2 characters
  const maskIfscCode = (ifscCode: string) => {
    if (!ifscCode) return '';
    if (ifscCode.length <= 2) return ifscCode;
    return '*'.repeat(ifscCode.length - 2) + ifscCode.slice(-2);
  };

  const calculateItemTotals = (item: InvoiceData['items'][0]) => {
    const baseAmount = item.quantity * item.rate;
    const taxAmount = baseAmount * (item.gstPercentage / 100);
    const totalAmount = baseAmount + taxAmount;
    return { baseAmount, taxAmount, totalAmount };
  };

  const totals = items.reduce(
    (acc, item) => {
      const { baseAmount, taxAmount } = calculateItemTotals(item);
      acc.subTotal += baseAmount;
      acc.totalTax += taxAmount;
      return acc;
    },
    { subTotal: 0, totalTax: 0 }
  );

  const grandTotal = totals.subTotal + totals.totalTax;

  return (
    <div className="w-full max-w-[210mm] mx-auto bg-white p-8 text-slate-800 text-sm border border-slate-200 shadow-sm print:shadow-none print:border-none print:p-12 print:max-w-none relative overflow-hidden">
      {/* Watermark */}
      {showWatermark && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center -rotate-12 select-none opacity-5">
           <span className="text-[150px] font-bold tracking-widest text-[#1a1a2e]" style={{ fontFamily: "'Playfair Display', serif" }}>
            GSTify
          </span>
        </div>
      )}
      
      {/* Header */}
      <div className="flex justify-between items-start border-b border-slate-300 pb-6 mb-6">
        <div>
          {seller.logo && (
            <img src={seller.logo} alt="Logo" className="h-16 object-contain mb-4" />
          )}
          <h1 className="text-2xl font-bold text-slate-900 mb-1">{seller.name || 'Business Name'}</h1>
          <p className="text-slate-600 whitespace-pre-wrap">{seller.address || 'Business Address'}</p>
          <div className="mt-2 text-slate-600">
            {seller.email && <p>Email: {seller.email}</p>}
            {seller.phone && <p>Phone: {seller.phone}</p>}
            {seller.gstin && <p className="font-semibold mt-1">GSTIN: {seller.gstin}</p>}
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-bold uppercase tracking-wider mb-4" style={{ color: templateColor }}>Tax Invoice</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-left inline-grid">
            <span className="text-slate-500 font-medium">Invoice No:</span>
            <span className="font-semibold text-right">{meta.invoiceNumber || '-'}</span>
            <span className="text-slate-500 font-medium">Date:</span>
            <span className="font-semibold text-right">{meta.invoiceDate || '-'}</span>
            <span className="text-slate-500 font-medium">Due Date:</span>
            <span className="font-semibold text-right">{meta.dueDate || '-'}</span>
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div className="mb-8">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Billed To</h3>
        <h4 className="text-lg font-bold text-slate-900">{buyer.name || 'Client Name'}</h4>
        <p className="text-slate-600 whitespace-pre-wrap mt-1">{buyer.address || 'Client Address'}</p>
        {buyer.state && <p className="text-slate-600 mt-1">State: {buyer.state}</p>}
        {buyer.gstin && <p className="text-slate-800 font-semibold mt-2">GSTIN: {buyer.gstin}</p>}
      </div>

      {/* Items Table */}
      <table className="w-full mb-8 border-collapse">
        <thead>
          <tr className="bg-slate-50 border-y border-slate-300 text-slate-600">
            <th className="py-3 px-2 text-left font-semibold w-12">#</th>
            <th className="py-3 px-2 text-left font-semibold">Item Description</th>
            <th className="py-3 px-2 text-left font-semibold w-24">HSN/SAC</th>
            <th className="py-3 px-2 text-right font-semibold w-20">Qty</th>
            <th className="py-3 px-2 text-right font-semibold w-28">Rate</th>
            <th className="py-3 px-2 text-right font-semibold w-20">GST %</th>
            <th className="py-3 px-2 text-right font-semibold w-32">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {items.map((item, index) => {
            const { baseAmount } = calculateItemTotals(item);
            return (
              <tr key={item.id}>
                <td className="py-3 px-2 text-slate-500">{index + 1}</td>
                <td className="py-3 px-2 font-medium">{item.description}</td>
                <td className="py-3 px-2 text-slate-500">{item.hsnSac}</td>
                <td className="py-3 px-2 text-right">{item.quantity}</td>
                <td className="py-3 px-2 text-right">{formatCurrency(item.rate)}</td>
                <td className="py-3 px-2 text-right">{item.gstPercentage}%</td>
                <td className="py-3 px-2 text-right font-medium">{formatCurrency(baseAmount)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Summary */}
      <div className="flex justify-end mb-8">
        <div className="w-80">
          <div className="flex justify-between py-2 border-b border-slate-200">
            <span className="text-slate-600">Subtotal</span>
            <span className="font-medium">{formatCurrency(totals.subTotal)}</span>
          </div>
          
          {isInterState ? (
            <div className="flex justify-between py-2 border-b border-slate-200">
              <span className="text-slate-600">IGST</span>
              <span className="font-medium">{formatCurrency(totals.totalTax)}</span>
            </div>
          ) : (
            <>
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-600">CGST {totals.subTotal > 0 ? `(${(totals.totalTax / 2 / totals.subTotal * 100).toFixed(1)}%)` : ''}</span>
                <span className="font-medium">{formatCurrency(totals.totalTax / 2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-600">SGST {totals.subTotal > 0 ? `(${(totals.totalTax / 2 / totals.subTotal * 100).toFixed(1)}%)` : ''}</span>
                <span className="font-medium">{formatCurrency(totals.totalTax / 2)}</span>
              </div>
            </>
          )}
          
          <div className="flex justify-between py-3 border-b-2 border-slate-800 text-lg font-bold">
            <span>Grand Total</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Amount in Words */}
      <div className="mb-12">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Amount in Words</h3>
        <p className="font-medium text-slate-800 capitalize">
          Rupees {numberToWordsIndian(Math.round(grandTotal))}
        </p>
      </div>

      {/* Payment Details */}
      {seller.paymentMethod === 'bank' && (seller.bankName || seller.accountNumber || seller.ifscCode) && (
        <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">Bank Details for Payment</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            {(seller.bankName || seller.customBankName) && (
              <div>
                <p className="text-slate-600 font-medium">Bank Name</p>
                <p className="text-slate-900 font-semibold">{seller.bankName === 'Other' ? seller.customBankName : seller.bankName}</p>
              </div>
            )}
            {seller.accountNumber && (
              <div>
                <p className="text-slate-600 font-medium">Account No.</p>
                <p className="text-slate-900 font-semibold">{maskAccountNumber(seller.accountNumber)}</p>
              </div>
            )}
            {seller.ifscCode && (
              <div>
                <p className="text-slate-600 font-medium">IFSC Code</p>
                <p className="text-slate-900 font-semibold">{maskIfscCode(seller.ifscCode)}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {seller.paymentMethod === 'upi' && seller.upiId && (
        <div className="mb-8 p-4 bg-orange-50 rounded-lg border border-orange-200">
          <h3 className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-3">UPI for Payment</h3>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-slate-600 font-medium text-sm">UPI ID</p>
              <p className="text-slate-900 font-semibold text-lg">{seller.upiId}</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-slate-300 pt-8 flex justify-between items-end text-slate-500">
        <div>
          <p className="font-medium text-slate-800 mb-1">Terms & Conditions</p>
          <p>1. Please pay within the due date.</p>
          <p>2. Make all checks payable to {seller.name || 'the business'}.</p>
        </div>
        <div className="text-center flex flex-col items-center justify-end min-h-[80px]">
          {seller.signature ? (
            <img src={seller.signature} alt="Signature" className="h-16 object-contain mb-2 max-w-[12rem]" />
          ) : (
            <div className="h-16 w-48 border-b border-slate-300 mb-2"></div>
          )}
          <p>Authorized Signatory</p>
        </div>
      </div>
    </div>
  );
};
