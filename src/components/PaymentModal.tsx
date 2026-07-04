import React, { useState } from 'react';
import { X, Shield, CreditCard, Loader2, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import type { SubscriptionPlan } from '../types';

interface PaymentModalProps {
  plan: SubscriptionPlan;
  onClose: () => void;
  onPaymentInitiate: (userDetails: { name: string; email: string; phone: string }) => void;
  isProcessing: boolean;
  error: string | null;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  plan,
  onClose,
  onPaymentInitiate,
  isProcessing,
  error,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = 'Name is required';
    if (!email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Invalid email format';
    if (!phone.trim()) errors.phone = 'Phone number is required';
    else if (phone.length !== 10 || !/^[6-9]/.test(phone)) errors.phone = '10 digit phone number (6-9 se shuru)';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onPaymentInitiate({
        name: name.trim(),
        email: email.trim(),
        phone: phone.replace(/[\s-]/g, '').replace(/^\+91/, ''),
      });
    }
  };

  const gstAmount = 0;
  const totalAmount = 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!isProcessing ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-[modalSlideUp_0.3s_ease-out]">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600 px-8 pt-8 pb-12">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-2 mb-3">
            <img src="https://i.ibb.co/2PqLdWk/gstify-icon.png" alt="GSTify" className="w-6 h-6 rounded" />
            <span className="text-white/80 text-sm font-medium uppercase tracking-wider">
              Upgrade to {plan.name}
            </span>
          </div>

          <h2 className="text-3xl font-bold text-white font-[Playfair_Display]">
            Activate Free Trial
          </h2>
        </div>

        {/* Plan Summary Card - overlapping header */}
        <div className="px-8 -mt-6">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{plan.name} Plan</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">30 Days Free Trial</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">FREE</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">for 30 days</div>
              </div>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-700 pt-3 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Plan Price</span>
                <span className="text-slate-700 dark:text-slate-300 line-through">₹{plan.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Trial Discount</span>
                <span className="text-emerald-600 dark:text-emerald-400">-₹{plan.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-dashed border-slate-300 dark:border-slate-600 pt-2 mt-2">
                <span className="text-slate-900 dark:text-white">Total due today</span>
                <span className="text-emerald-600 dark:text-emerald-400">₹0.00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
              <X size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setFormErrors(prev => { const { name: _, ...rest } = prev; return rest; }); }}
              placeholder="Aapka poora naam"
              disabled={isProcessing}
              className={`w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border ${formErrors.name ? 'border-red-400 dark:border-red-600' : 'border-slate-300 dark:border-slate-600'} focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-slate-900 dark:text-white placeholder-slate-400 disabled:opacity-60`}
            />
            {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setFormErrors(prev => { const { email: _, ...rest } = prev; return rest; }); }}
              placeholder="name@business.com"
              disabled={isProcessing}
              className={`w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border ${formErrors.email ? 'border-red-400 dark:border-red-600' : 'border-slate-300 dark:border-slate-600'} focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-slate-900 dark:text-white placeholder-slate-400 disabled:opacity-60`}
            />
            {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">+91</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10)); setFormErrors(prev => { const { phone: _, ...rest } = prev; return rest; }); }}
                placeholder="9876543210"
                disabled={isProcessing}
                maxLength={10}
                className={`w-full pl-14 pr-4 py-3 rounded-xl bg-white dark:bg-slate-800 border ${formErrors.phone ? 'border-red-400 dark:border-red-600' : 'border-slate-300 dark:border-slate-600'} focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-slate-900 dark:text-white placeholder-slate-400 disabled:opacity-60`}
              />
            </div>
            {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
          </div>

          {/* Pay Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-2"
          >
            {isProcessing ? (
              <>
                <Loader2 size={22} className="animate-spin" />
                Activating Free Trial...
              </>
            ) : (
              <>
                <Sparkles size={22} />
                Activate 30-Day Free Trial
              </>
            )}
          </button>

          {/* Security badges */}
          <div className="flex items-center justify-center gap-6 text-xs text-slate-400 dark:text-slate-500 pt-2">
            <div className="flex items-center gap-1.5">
              <Lock size={12} />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield size={12} />
              <span>Instant Activation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={12} />
              <span>30 Days Free Access</span>
            </div>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};
