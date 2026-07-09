import React from 'react';
import { Check, Palette, Eye } from 'lucide-react';

export interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  category: 'professional' | 'creative' | 'minimal' | 'retail' | 'it' | 'consulting';
  color: string;
  accent: string;
  font: 'sans' | 'serif' | 'modern';
  isPremium: boolean;
  preview: string;
  styleOverrides: Record<string, string>;
}

interface Props {
  templates: InvoiceTemplate[];
  selectedTemplate: string;
  onSelectTemplate: (templateId: string) => void;
  isPremium: boolean;
  onClose: () => void;
}

export const TemplateSelector: React.FC<Props> = ({
  templates,
  selectedTemplate,
  onSelectTemplate,
  isPremium,
  onClose
}) => {
  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'professional', name: 'Professional' },
    { id: 'it', name: 'IT & Software' },
    { id: 'consulting', name: 'Consulting' },
    { id: 'retail', name: 'Retail & Ecommerce' },
    { id: 'minimal', name: 'Minimal' },
    { id: 'creative', name: 'Creative' },
  ];

  return (
    <div className="bg-surface-1 rounded-[12px] shadow-sm border border-line p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-content-primary flex items-center gap-2">
          <Palette size={24} className="text-brand-600" />
          Invoice Templates
        </h2>
        <button onClick={onClose} className="text-content-secondary hover:text-content-primary">
          Close
        </button>
      </div>

      {!isPremium && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg text-amber-800 dark:text-amber-300">
          <h3 className="font-semibold mb-1">Premium Feature</h3>
          <p className="text-sm">Upgrade to Premium to unlock all 30 premium invoice templates. Free users get the Default template with a watermark.</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(category => (
          <button
            key={category.id}
            className="px-3 py-1.5 text-sm rounded-[10px] bg-surface-2 text-content-secondary hover:text-content-primary transition-colors"
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(template => {
          const isSelected = selectedTemplate === template.id;
          const isLocked = template.isPremium && !isPremium;

          return (
            <div
              key={template.id}
              onClick={() => !isLocked && onSelectTemplate(template.id)}
              className={`relative rounded-[12px] border-2 overflow-hidden transition-all ${
                isSelected
                  ? 'border-brand-500 ring-2 ring-brand-100'
                  : isLocked
                  ? 'border-line opacity-60'
                  : 'border-line hover:border-line-strong cursor-pointer'
              }`}
            >
              <div
                className="h-40 flex items-center justify-center text-white font-bold"
                style={{
                  background: `linear-gradient(135deg, ${template.color}, ${template.accent})`
                }}
              >
                {isLocked && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-white text-slate-900 px-3 py-1 rounded-full text-sm font-medium">
                      Premium
                    </span>
                  </div>
                )}
                {isSelected && (
                  <div className="absolute top-3 right-3 bg-brand-600 text-on-brand rounded-full p-1">
                    <Check size={16} />
                  </div>
                )}
                <span className="text-xl tracking-wide">TEMPLATE</span>
              </div>

              <div className="p-4 bg-surface-1">
                <h3 className="font-semibold text-content-primary">{template.name}</h3>
                <p className="text-sm text-content-muted mt-1">{template.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-content-secondary capitalize px-2 py-0.5 bg-surface-2 rounded-full">
                    {template.category}
                  </span>
                  <button
                    className="p-1.5 rounded-[10px] text-content-secondary hover:bg-surface-2 hover:text-brand-600 transition-colors"
                    title="Preview Template"
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};