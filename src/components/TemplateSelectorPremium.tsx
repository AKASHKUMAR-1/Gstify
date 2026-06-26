import React, { useState, useEffect } from 'react';
import { X, Printer, Download, Check } from 'lucide-react';
import type { InvoiceTemplate } from './TemplateSelector';

interface Props {
  templates: InvoiceTemplate[];
  selectedTemplate: string;
  onSelectTemplate: (templateId: string) => void;
  isPremium: boolean;
  onClose: () => void;
}

export const TemplateSelectorPremium: React.FC<Props> = ({
  templates,
  selectedTemplate,
  onSelectTemplate,
  isPremium,
  onClose
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // These are the exact 10 premium templates with their colors from your HTML
  const premiumTemplates = [
    {
      name: "Midnight Noir",
      desc: "Bold dark header with gold accents. Ideal for luxury brands and high-end services.",
      colors: ["#1a1a2e", "#c8a45e", "#16213e", "#e8e6e3"],
      font: "'Playfair Display', serif",
      isPremium: false
    },
    {
      name: "Ocean Depths",
      desc: "Deep teal gradient header evoking trust and professionalism. Great for consultancies.",
      colors: ["#0a3d62", "#1289A7", "#079992", "#e8f8f5"],
      font: "'Space Grotesk', sans-serif",
      isPremium: true
    },
    {
      name: "Crimson Edge",
      desc: "Sharp burgundy header with clean lines. Perfect for law firms and financial services.",
      colors: ["#6F1E1E", "#B33939", "#e8e8e8", "#2c2c2c"],
      font: "'Cormorant Garamond', serif",
      isPremium: true
    },
    {
      name: "Forest Estate",
      desc: "Rich forest green with warm cream. Suited for organic brands, farms, and eco-businesses.",
      colors: ["#1B4332", "#2D6A4F", "#D8F3DC", "#2c2c2c"],
      font: "'Outfit', sans-serif",
      isPremium: true
    },
    {
      name: "Slate & Copper",
      desc: "Cool slate gray paired with warm copper accents. Modern industrial aesthetic.",
      colors: ["#2d3436", "#b87333", "#dfe6e9", "#636e72"],
      font: "'Sora', sans-serif",
      isPremium: true
    },
    {
      name: "Royal Indigo",
      desc: "Deep indigo with ivory details. Commands authority for enterprise and B2B invoices.",
      colors: ["#1a1a4e", "#3d3d8e", "#f0eff4", "#e8e6e3"],
      font: "'Manrope', sans-serif",
      isPremium: true
    },
    {
      name: "Charcoal Ember",
      desc: "Dark charcoal base with fiery orange accent. Energetic and memorable.",
      colors: ["#2c2c2c", "#e17055", "#fafafa", "#636e72"],
      font: "'Space Grotesk', sans-serif",
      isPremium: true
    },
    {
      name: "Arctic Frost",
      desc: "Clean white layout with ice blue accents. Minimalist and ultra-modern.",
      colors: ["#ffffff", "#0984e3", "#f0f4f8", "#2d3436"],
      font: "'Outfit', sans-serif",
      isPremium: true
    },
    {
      name: "Sunset Terracotta",
      desc: "Warm terracotta and clay tones. Artisan feel for creators, designers, and studios.",
      colors: ["#A0522D", "#CD853F", "#FFF8F0", "#5C4033"],
      font: "'Cormorant Garamond', serif",
      isPremium: true
    },
    {
      name: "Obsidian Gold",
      desc: "Pure black with opulent gold. The ultimate premium invoice for luxury goods.",
      colors: ["#0a0a0a", "#d4a843", "#f5f0e1", "#333333"],
      font: "'Playfair Display', serif",
      isPremium: true
    }
  ];

  const openPreview = (idx: number) => {
    setSelectedIdx(idx);
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  return (
    <div className="fixed inset-0 z-50 bg-[#0c0c0e] min-h-screen overflow-y-auto">
      {/* Noise overlay */}
      <div className="fixed inset-0 opacity-[0.025] pointer-events-none z-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: '128px 128px'
      }}></div>

      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        background: 'radial-gradient(ellipse at 30% 20%, rgba(200,164,94,0.04) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(200,164,94,0.03) 0%, transparent 50%)'
      }}></div>

      {/* Header */}
      <div className="relative z-10 pt-12 pb-8 px-6 text-center">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-[#6b6b6b] hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="inline-flex items-center gap-2 px-4 py-2 border border-[#2a2a2e] rounded-full text-xs uppercase tracking-[2px] text-[#c8a45e] mb-5" style={{
          background: 'rgba(200,164,94,0.05)'
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          10 Premium Templates
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{
          fontFamily: "'Playfair Display', serif",
          background: 'linear-gradient(135deg, #e8e6e3 30%, #c8a45e 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          GST Invoice Collection
        </h1>

        <p className="text-[#6b6b6b] max-w-xl mx-auto">
          Professionally designed, GST-compliant invoice templates. Click to preview, edit inline, and print instantly.
        </p>
      </div>

      {/* Template Grid */}
      <div className="relative z-10 px-6 pb-20 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {premiumTemplates.map((tpl, idx) => {
            const isLocked = tpl.isPremium && !isPremium;
            const isSelected = selectedTemplate === templates[idx]?.id;

            return (
              <div
                key={idx}
                className={`bg-[#161618] border border-[#2a2a2e] rounded-2xl overflow-hidden transition-all duration-400 cursor-pointer group hover:-translate-y-1.5 hover:border-[rgba(200,164,94,0.3)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.4),0_0_40px_rgba(200,164,94,0.05)] ${isSelected ? 'ring-2 ring-[#c8a45e]' : ''}`}
                onClick={() => !isLocked && onSelectTemplate(templates[idx]?.id)}
              >
                {/* Preview Area */}
                <div className="h-52 overflow-hidden relative">
                  {/* Mini gradient preview */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(135deg, ${tpl.colors[0]}, ${tpl.colors[1]})`
                    }}
                  ></div>

                  {/* Template name watermark */}
                  <div className="absolute inset-0 flex items-center justify-center text-white font-bold opacity-20 text-lg tracking-wider">
                    TEMPLATE
                  </div>

                  {/* Selected badge */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 bg-[#c8a45e] rounded-full p-1.5 text-black">
                      <Check size={16} />
                    </div>
                  )}

                  {/* Lock overlay */}
                  {isLocked && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="bg-white text-black px-3 py-1 rounded-full text-sm font-medium">
                        Premium
                      </span>
                    </div>
                  )}

                  {/* Gradient fade at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none" style={{
                    background: 'linear-gradient(transparent, #161618)'
                  }}></div>
                </div>

                {/* Info section */}
                <div className="p-5">
                  {/* Color dots */}
                  <div className="flex gap-1.5 mb-3">
                    {tpl.colors.map((c, i) => (
                      <span
                        key={i}
                        className="w-3.5 h-3.5 rounded-full border border-white/10"
                        style={{ background: c }}
                      ></span>
                    ))}
                  </div>

                  <h3 className="text-white font-semibold text-lg mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    {tpl.name}
                  </h3>
                  <p className="text-[#6b6b6b] text-sm mb-4 leading-relaxed">
                    {tpl.desc}
                  </p>

                  {/* Action buttons */}
                  <div className="flex gap-2.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); openPreview(idx); }}
                      className="flex-1 py-2.5 px-3 rounded-lg bg-transparent text-white border border-[#2a2a2e] text-sm font-semibold hover:border-[#c8a45e] hover:text-[#c8a45e] transition-all flex items-center justify-center gap-1.5"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      Preview
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); !isLocked && onSelectTemplate(templates[idx]?.id); }}
                      className="flex-1 py-2.5 px-3 rounded-lg text-[#0c0c0e] text-sm font-semibold hover:brightness-110 hover:scale-[1.02] transition-all flex items-center justify-center gap-1.5"
                      style={{ background: '#c8a45e' }}
                    >
                      <Check size={14} />
                      Select
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Preview Modal */}
      {isModalOpen && selectedIdx !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-start justify-center p-4 overflow-y-auto"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl w-full max-w-3xl my-5 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal toolbar */}
            <div className="sticky top-0 z-10 flex justify-end gap-2.5 p-3.5 border-b border-gray-100 rounded-t-xl bg-white/95 backdrop-blur-md">
              <button className="px-4 py-2 rounded-md border border-gray-200 bg-white text-sm font-semibold hover:bg-gray-50 flex items-center gap-1.5">
                <Download size={14} /> Save
              </button>
              <button
                className="px-4 py-2 rounded-md bg-black text-white text-sm font-semibold hover:bg-gray-800 flex items-center gap-1.5"
                onClick={() => window.print()}
              >
                <Printer size={14} /> Print
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-md bg-transparent text-gray-400 hover:text-black"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal body */}
            <div className="bg-white p-0">
              <div className="h-[1000px] bg-gray-50">
                {/* Actual preview will be rendered here */}
                <div className="flex items-center justify-center h-full text-gray-400">
                  Template Preview
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};