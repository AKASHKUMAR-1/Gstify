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
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Palette size={24} className="text-indigo-600 dark:text-indigo-400" />
          Invoice Templates
        </h2>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
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
            className="px-3 py-1.5 text-sm rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
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
              className={`relative rounded-xl border-2 overflow-hidden transition-all ${
                isSelected
                  ? 'border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-800'
                  : isLocked
                  ? 'border-slate-200 dark:border-slate-700 opacity-60'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer'
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
                  <div className="absolute top-3 right-3 bg-indigo-600 rounded-full p-1">
                    <Check size={16} />
                  </div>
                )}
                <span className="text-xl tracking-wide">TEMPLATE</span>
              </div>

              <div className="p-4 bg-white dark:bg-slate-800">
                <h3 className="font-semibold text-slate-900 dark:text-white">{template.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{template.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-slate-500 capitalize px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-full">
                    {template.category}
                  </span>
                  <button
                    className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
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