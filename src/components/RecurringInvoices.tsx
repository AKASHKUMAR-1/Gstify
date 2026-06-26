import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Play, Calendar, CheckCircle, Clock } from 'lucide-react';
import { RecurringInvoiceTemplate, InvoiceData, ClientRecord } from '../types';

interface Props {
  templates: RecurringInvoiceTemplate[];
  clients: ClientRecord[];
  onSave: (template: RecurringInvoiceTemplate) => void;
  onDelete: (id: string) => void;
  onGenerate: (template: RecurringInvoiceTemplate) => void;
  isPremium: boolean;
  onClose: () => void;
  currentInvoiceData: InvoiceData; // To use as base when creating new
}

export const RecurringInvoices: React.FC<Props> = ({
  templates,
  clients,
  onSave,
  onDelete,
  onGenerate,
  isPremium,
  onClose,
  currentInvoiceData
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Partial<RecurringInvoiceTemplate>>({});

  const FREE_LIMIT = 2; // Only 2 recurring invoices for free plan

  const handleCreateNew = () => {
    if (!isPremium && templates.length >= FREE_LIMIT) {
      alert(`Free plan limited to ${FREE_LIMIT} recurring invoices. Upgrade to Premium for unlimited.`);
      return;
    }

    const { meta, ...baseData } = currentInvoiceData;
    
    setEditingTemplate({
      id: crypto.randomUUID(),
      name: `Recurring for ${currentInvoiceData.buyer.name || 'Client'}`,
      description: 'Monthly service',
      frequency: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      isActive: true,
      invoiceData: {
        ...baseData,
        meta: {} // Empty meta, will be filled on generation
      },
      createdAt: new Date().toISOString(),
      nextDueDate: getNextDate('monthly', new Date().toISOString().split('T')[0])
    });
    setIsEditing(true);
  };

  const handleEdit = (template: RecurringInvoiceTemplate) => {
    setEditingTemplate(template);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editingTemplate.name || !editingTemplate.startDate) {
      alert('Please fill required fields');
      return;
    }

    onSave(editingTemplate as RecurringInvoiceTemplate);
    setIsEditing(false);
  };

  const getNextDate = (frequency: 'monthly' | 'quarterly' | 'yearly', fromDate: string) => {
    const date = new Date(fromDate);
    if (frequency === 'monthly') date.setMonth(date.getMonth() + 1);
    else if (frequency === 'quarterly') date.setMonth(date.getMonth() + 3);
    else if (frequency === 'yearly') date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().split('T')[0];
  };

  const inputClasses = "w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white";
  const labelClasses = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";

  if (isEditing) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {editingTemplate.createdAt ? 'Edit Recurring Invoice' : 'New Recurring Invoice'}
          </h2>
          <button onClick={() => setIsEditing(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            Cancel
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={labelClasses}>Template Name</label>
            <input 
              type="text" 
              value={editingTemplate.name || ''} 
              onChange={e => setEditingTemplate({...editingTemplate, name: e.target.value})}
              className={inputClasses}
              placeholder="e.g. Monthly Retainer for Acme Corp"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>Frequency</label>
              <select 
                value={editingTemplate.frequency || 'monthly'} 
                onChange={e => {
                  const freq = e.target.value as any;
                  setEditingTemplate({
                    ...editingTemplate, 
                    frequency: freq,
                    nextDueDate: getNextDate(freq, editingTemplate.startDate || new Date().toISOString().split('T')[0])
                  });
                }}
                className={inputClasses}
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div>
              <label className={labelClasses}>Status</label>
              <select 
                value={editingTemplate.isActive ? 'active' : 'paused'} 
                onChange={e => setEditingTemplate({...editingTemplate, isActive: e.target.value === 'active'})}
                className={inputClasses}
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>Start Date</label>
              <input 
                type="date" 
                value={editingTemplate.startDate || ''} 
                onChange={e => {
                  const date = e.target.value;
                  setEditingTemplate({
                    ...editingTemplate, 
                    startDate: date,
                    nextDueDate: getNextDate(editingTemplate.frequency || 'monthly', date)
                  });
                }}
                className={inputClasses}
              />
            </div>
            <div>
              <label className={labelClasses}>End Date (Optional)</label>
              <input 
                type="date" 
                value={editingTemplate.endDate || ''} 
                onChange={e => setEditingTemplate({...editingTemplate, endDate: e.target.value})}
                className={inputClasses}
              />
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
            <button 
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Save Template
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock size={24} className="text-indigo-600 dark:text-indigo-400" />
            Recurring Invoices
            {!isPremium && <span className="ml-2 px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded-full border border-amber-200">Premium Feature</span>}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Automate your billing. Base data uses current editor contents.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Close
          </button>
          <button 
            onClick={handleCreateNew}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2"
          >
            <Plus size={16} /> New Recurring
          </button>
        </div>
      </div>

      {!isPremium && templates.length > 0 && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg text-amber-800 dark:text-amber-300 text-sm flex justify-between items-center">
          <span>You are using {templates.length} of {FREE_LIMIT} free recurring invoices.</span>
        </div>
      )}

      {templates.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
          <Clock size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">No Recurring Invoices</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4 max-w-md mx-auto">
            Set up automatic invoice generation for your retainers, subscriptions, and regular clients.
          </p>
          <button 
            onClick={handleCreateNew}
            className="px-4 py-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-900/60 font-medium"
          >
            Create Your First Template
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {templates.map(template => (
            <div key={template.id} className={`p-4 border rounded-lg transition-colors ${template.isActive ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 opacity-75'}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white">{template.name}</h3>
                    {template.isActive ? (
                      <span className="px-2 py-0.5 text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full flex items-center gap-1"><CheckCircle size={12} /> Active</span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 rounded-full">Paused</span>
                    )}
                    <span className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-full capitalize">
                      {template.frequency}
                    </span>
                  </div>
                  
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-4">
                    <span className="flex items-center gap-1"><Calendar size={14} /> Next: {template.nextDueDate}</span>
                    {template.lastGeneratedDate && <span>Last: {template.lastGeneratedDate}</span>}
                  </div>
                  
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Billed to: {template.invoiceData.buyer?.name || 'Unknown'} • ₹{template.invoiceData.items.reduce((acc, item) => acc + (item.quantity * item.rate * (1 + item.gstPercentage/100)), 0).toFixed(2)}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button 
                    onClick={() => onGenerate(template)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30 rounded-md transition-colors"
                    title="Generate Now"
                  >
                    <Play size={18} />
                  </button>
                  <button 
                    onClick={() => handleEdit(template)}
                    className="p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 rounded-md transition-colors"
                    title="Edit Template"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this recurring invoice?')) {
                        onDelete(template.id);
                      }
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-md transition-colors"
                    title="Delete Template"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
