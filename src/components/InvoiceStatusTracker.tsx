import React, { useState } from 'react';
import { Clock, CheckCircle, AlertTriangle, Send, Eye, DollarSign, MessageCircle, Mail } from 'lucide-react';
import { InvoiceStatus, InvoiceRecord } from '../types';

interface Props {
  statuses: InvoiceStatus[];
  history: InvoiceRecord[];
  onUpdateStatus: (invoiceId: string, status: string, notes?: string) => void;
  onSendReminder: (invoiceId: string, method: 'whatsapp' | 'email') => void;
  isPremium: boolean;
  onClose: () => void;
}

export const InvoiceStatusTracker: React.FC<Props> = ({
  statuses,
  history,
  onUpdateStatus,
  onSendReminder,
  isPremium,
  onClose
}) => {
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);

  const getStatusForInvoice = (invoiceId: string) => {
    return statuses.find(s => s.invoiceId === invoiceId) || { status: 'sent' };
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'paid': return 'bg-emerald-500 text-white';
      case 'overdue': return 'bg-red-500 text-white';
      case 'viewed': return 'bg-blue-500 text-white';
      case 'sent': return 'bg-indigo-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'paid': return <DollarSign size={14} />;
      case 'overdue': return <AlertTriangle size={14} />;
      case 'viewed': return <Eye size={14} />;
      case 'sent': return <Send size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const calculateDaysOverdue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diff = Math.ceil((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const invoiceWithStatus = history.map(record => ({
    ...record,
    status: getStatusForInvoice(record.id)
  })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock size={24} className="text-indigo-600 dark:text-indigo-400" />
          Invoice Status Tracker
          {!isPremium && <span className="ml-2 px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded-full border border-amber-200">Premium Feature</span>}
        </h2>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
          Close
        </button>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
          <Clock size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">No Invoices Yet</h3>
          <p className="text-slate-500 dark:text-slate-400">
            Download or send an invoice to track its status here.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {invoiceWithStatus.map(record => {
            const daysOverdue = calculateDaysOverdue(record.data.meta.dueDate);
            const status = record.status.status;
            
            return (
              <div 
                key={record.id} 
                className={`p-4 border rounded-lg transition-colors ${status === 'overdue' ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white">{record.data.meta.invoiceNumber}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full flex items-center gap-1 ${getStatusColor(status)}`}>
                        {getStatusIcon(status)}
                        <span className="capitalize">{status}</span>
                      </span>
                      {daysOverdue > 0 && status !== 'paid' && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          {daysOverdue} days overdue
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {record.data.buyer.name} • ₹{record.data.items.reduce((acc, i) => acc + (i.quantity * i.rate * (1 + i.gstPercentage/100)), 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      Due: {record.data.meta.dueDate} • Created: {new Date(record.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <button 
                        onClick={() => onSendReminder(record.id, 'whatsapp')}
                        className="p-2 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30 rounded-md transition-colors"
                        title="Send WhatsApp Reminder"
                      >
                        <MessageCircle size={18} />
                      </button>
                      <button 
                        onClick={() => onSendReminder(record.id, 'email')}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                        title="Send Email Reminder"
                      >
                        <Mail size={18} />
                      </button>
                    </div>

                    <select 
                      value={status} 
                      onChange={e => onUpdateStatus(record.id, e.target.value)}
                      className="ml-2 p-1.5 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                    >
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="viewed">Viewed</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};