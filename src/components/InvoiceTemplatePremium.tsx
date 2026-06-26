import React from 'react';
import { InvoiceData } from '../types';
import { formatCurrency, numberToWordsIndian } from '../utils/formatters';
import type { InvoiceTemplate as InvoiceTemplateType } from './TemplateSelector';

interface Props {
  data: InvoiceData;
  template?: InvoiceTemplateType;
}

export const InvoiceTemplatePremium: React.FC<Props> = ({ data, template }) => {
  const templateIndex = parseInt(template?.styleOverrides?.templateIndex ?? '0', 10);
  const { seller, buyer, meta, items, isInterState } = data;

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
  const roundOff = Math.round(grandTotal);

  // 30 Premium Templates
  const templates = [
    { name: "Midnight Noir", colors: ["#1a1a2e", "#c8a45e", "#16213e", "#e8e6e3"], font: "'Playfair Display', serif" },
    { name: "Ocean Depths", colors: ["#0a3d62", "#1289A7", "#079992", "#e8f8f5"], font: "'Space Grotesk', sans-serif" },
    { name: "Crimson Edge", colors: ["#6F1E1E", "#B33939", "#e8e8e8", "#2c2c2c"], font: "'Cormorant Garamond', serif" },
    { name: "Forest Estate", colors: ["#1B4332", "#2D6A4F", "#D8F3DC", "#2c2c2c"], font: "'Outfit', sans-serif" },
    { name: "Slate & Copper", colors: ["#2d3436", "#b87333", "#dfe6e9", "#636e72"], font: "'Sora', sans-serif" },
    { name: "Royal Indigo", colors: ["#1a1a4e", "#3d3d8e", "#f0eff4", "#e8e6e3"], font: "'Manrope', sans-serif" },
    { name: "Charcoal Ember", colors: ["#2c2c2c", "#e17055", "#fafafa", "#636e72"], font: "'Space Grotesk', sans-serif" },
    { name: "Arctic Frost", colors: ["#ffffff", "#0984e3", "#f0f4f8", "#2d3436"], font: "'Outfit', sans-serif" },
    { name: "Sunset Terracotta", colors: ["#A0522D", "#CD853F", "#FFF8F0", "#5C4033"], font: "'Cormorant Garamond', serif" },
    { name: "Obsidian Gold", colors: ["#0a0a0a", "#d4a843", "#f5f0e1", "#333333"], font: "'Playfair Display', serif" },
    { name: "Emerald Silk", colors: ["#064e3b", "#10b981", "#ecfdf5", "#1a1a1a"], font: "'Libre Baskerville', serif" },
    { name: "Bronze Age", colors: ["#78350f", "#b45309", "#fef3c7", "#44403c"], font: "'DM Serif Display', serif" },
    { name: "Nordic Steel", colors: ["#1e293b", "#64748b", "#f1f5f9", "#334155"], font: "'Sora', sans-serif" },
    { name: "Plum Royale", colors: ["#4a1d6a", "#7c3aed", "#f5f0ff", "#2d2d2d"], font: "'Fraunces', serif" },
    { name: "Sahara Sand", colors: ["#92400e", "#d97706", "#fffbeb", "#78350f"], font: "'Bodoni Moda', serif" },
    { name: "Midnight Sapphire", colors: ["#0f172a", "#334155", "#e2e8f0", "#94a3b8"], font: "'Manrope', sans-serif" },
    { name: "Olive Branch", colors: ["#365314", "#4d7c0f", "#f7fee7", "#1a2e05"], font: "'Outfit', sans-serif" },
    { name: "Rose Quartz", colors: ["#881337", "#e11d48", "#fff1f2", "#374151"], font: "'Fraunces', serif" },
    { name: "Graphite Mint", colors: ["#18181b", "#34d399", "#f0fdf4", "#52525b"], font: "'Space Grotesk', sans-serif" },
    { name: "Saffron Heritage", colors: ["#9a3412", "#ea580c", "#fff7ed", "#7c2d12"], font: "'DM Serif Display', serif" },
    { name: "Steel Blue Pro", colors: ["#1e3a5f", "#3b82f6", "#eff6ff", "#64748b"], font: "'Manrope', sans-serif" },
    { name: "Copper Canyon", colors: ["#7c2d12", "#c2410c", "#fef2f2", "#44403c"], font: "'Bodoni Moda', serif" },
    { name: "Jade Dynasty", colors: ["#065f46", "#059669", "#ecfdf5", "#d4a843"], font: "'Cormorant Garamond', serif" },
    { name: "Slate Storm", colors: ["#0f172a", "#06b6d4", "#ecfeff", "#334155"], font: "'Sora', sans-serif" },
    { name: "Vintage Cream", colors: ["#fefce8", "#a16207", "#fffbeb", "#78716c"], font: "'Libre Baskerville', serif" },
    { name: "Neon Noir", colors: ["#0a0a0a", "#84cc16", "#171717", "#52525b"], font: "'Space Grotesk', sans-serif" },
    { name: "Pearl Ash", colors: ["#f5f5f4", "#a8a29e", "#fafaf9", "#292524"], font: "'Outfit', sans-serif" },
    { name: "Wine Country", colors: ["#4c1d95", "#a78bfa", "#f5f3ff", "#365314"], font: "'Fraunces', serif" },
    { name: "Carbon Flame", colors: ["#09090b", "#f97316", "#18181b", "#71717a"], font: "'Sora', sans-serif" },
    { name: "Arctic Aurora", colors: ["#0c1220", "#6366f1", "#eef2ff", "#a78bfa"], font: "'Manrope', sans-serif" }
  ];

  const tpl = templates[Math.min(templateIndex, templates.length - 1)];
  const c = tpl.colors;
  const font = tpl.font;

  const isLight = [7, 12, 20, 24, 26].includes(templateIndex);
  const textColor = isLight ? '#2d3436' : '#1a1a1a';
  const mutedColor = isLight ? '#636e72' : '#666';
  const accent = c[1];
  const accentLight = isLight ? c[2] : '#f5f5f5';

  return (
    <div className="w-full max-w-[800px] mx-auto bg-white shadow-lg print:shadow-none">
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${c[0]}, ${c[1]})`, padding: '32px 38px' }}>
        <h1 style={{ fontFamily: font, fontSize: '26px', fontWeight: 700, color: isLight ? textColor : '#fff', marginBottom: '6px' }}>
          {seller.name || 'Business Name'}
        </h1>
        <p style={{ fontSize: '11.5px', color: isLight ? mutedColor : 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>
          {seller.address}
          {seller.gstin && <><br />GSTIN: {seller.gstin}</>}
          {seller.phone && <> | {seller.phone}</>}
          {seller.email && <> | {seller.email}</>}
        </p>
      </div>

      {/* Invoice Info */}
      <div style={{ padding: '22px 38px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '18px' }}>
        <div style={{ flex: 1, minWidth: '210px' }}>
          <div style={{ fontSize: '9.5px', textTransform: 'uppercase', letterSpacing: '2px', color: accent, fontWeight: 600, marginBottom: '9px' }}>Bill To</div>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '3px' }}>{buyer.name || 'Customer Name'}</div>
          <div style={{ fontSize: '11.5px', color: mutedColor, lineHeight: 1.7 }}>
            {buyer.address}
            {buyer.gstin && <><br />GSTIN: {buyer.gstin}</>}
            {buyer.state && <><br />State: {buyer.state}</>}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px 22px', fontSize: '12.5px' }}>
          <div>
            <span style={{ color: mutedColor, fontSize: '10.5px', display: 'block' }}>Invoice No.</span>
            <strong>{meta.invoiceNumber}</strong>
          </div>
          <div>
            <span style={{ color: mutedColor, fontSize: '10.5px', display: 'block' }}>Date</span>
            <strong>{meta.invoiceDate}</strong>
          </div>
          <div>
            <span style={{ color: mutedColor, fontSize: '10.5px', display: 'block' }}>Due Date</span>
            <strong>{meta.dueDate}</strong>
          </div>
          <div>
            <span style={{ color: mutedColor, fontSize: '10.5px', display: 'block' }}>Place of Supply</span>
            <strong>{buyer.state || '-'}</strong>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div style={{ padding: '0 38px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: accentLight }}>
              <th style={{ padding: '9px 10px', textAlign: 'left', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: accent, fontWeight: 600, borderBottom: `2px solid ${accent}` }}>Description</th>
              <th style={{ padding: '9px 10px', textAlign: 'center', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: accent, fontWeight: 600, borderBottom: `2px solid ${accent}` }}>Qty</th>
              <th style={{ padding: '9px 10px', textAlign: 'right', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: accent, fontWeight: 600, borderBottom: `2px solid ${accent}` }}>Rate</th>
              <th style={{ padding: '9px 10px', textAlign: 'right', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: accent, fontWeight: 600, borderBottom: `2px solid ${accent}` }}>Amount</th>
              <th style={{ padding: '9px 10px', textAlign: 'right', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: accent, fontWeight: 600, borderBottom: `2px solid ${accent}` }}>Tax</th>
              <th style={{ padding: '9px 10px', textAlign: 'right', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: accent, fontWeight: 600, borderBottom: `2px solid ${accent}` }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => {
              const amt = item.quantity * item.rate;
              const tax = amt * item.gstPercentage / 100;
              return (
                <tr key={i}>
                  <td style={{ padding: '9px 10px', borderBottom: '1px solid #eee', fontSize: '12.5px' }}>
                    {item.description}
                    {item.hsnSac && <br />}
                    {item.hsnSac && <span style={{ color: mutedColor, fontSize: '10.5px' }}>HSN: {item.hsnSac}</span>}
                  </td>
                  <td style={{ padding: '9px 10px', borderBottom: '1px solid #eee', fontSize: '12.5px', textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ padding: '9px 10px', borderBottom: '1px solid #eee', fontSize: '12.5px', textAlign: 'right' }}>{formatCurrency(item.rate)}</td>
                  <td style={{ padding: '9px 10px', borderBottom: '1px solid #eee', fontSize: '12.5px', textAlign: 'right' }}>{formatCurrency(amt)}</td>
                  <td style={{ padding: '9px 10px', borderBottom: '1px solid #eee', fontSize: '12.5px', textAlign: 'right' }}>{item.gstPercentage}%</td>
                  <td style={{ padding: '9px 10px', borderBottom: '1px solid #eee', fontSize: '12.5px', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(amt + tax)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div style={{ padding: '22px 38px', display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ width: '270px' }}>
          <div style={{ border: '1px solid #eee', borderRadius: '7px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 14px', background: accentLight, fontSize: '12.5px', fontWeight: 600 }}>
              <span>Taxable Amount</span><span>{formatCurrency(totals.subTotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 14px', fontSize: '12.5px', borderTop: '1px solid #eee' }}>
              <span>GST @ {items[0]?.gstPercentage || 18}%</span>
              <span>{formatCurrency(totals.totalTax)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '13px 14px', background: accent, color: '#fff', fontSize: '15px', fontWeight: 700, borderRadius: '0 0 7px 7px' }}>
              <span>Grand Total</span>
              <span>{formatCurrency(roundOff)}</span>
            </div>
          </div>
          <div style={{ fontSize: '11.5px', color: mutedColor, marginTop: '7px', textAlign: 'right' }}>
            Amount in Words: <strong>{numberToWordsIndian(roundOff)} Rupees Only</strong>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '14px 38px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ fontSize: '10.5px', color: mutedColor }}>
          This is a computer-generated invoice. E & OE.
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '10.5px', color: mutedColor, marginBottom: '28px' }}>Authorised Signatory</div>
          <div style={{ width: '110px', borderTop: '1px solid #000' }}></div>
        </div>
      </div>
    </div>
  );
};
