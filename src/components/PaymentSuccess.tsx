import React, { useEffect, useState } from 'react';
import { CheckCircle2, Sparkles, ArrowRight, Download, Calendar, CreditCard } from 'lucide-react';
import type { UserSubscription, SubscriptionPlan } from '../types';

interface PaymentSuccessProps {
  subscription: UserSubscription;
  plan: SubscriptionPlan;
  transactionId: string;
  onContinue: () => void;
}

export const PaymentSuccess: React.FC<PaymentSuccessProps> = ({
  subscription,
  plan,
  transactionId,
  onContinue,
}) => {
  const [showContent, setShowContent] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState<Array<{ id: number; left: string; delay: string; color: string; duration: string }>>([]);

  useEffect(() => {
    // Generate confetti
    const colors = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f97316', '#06b6d4'];
    const pieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 0.8}s`,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: `${1.5 + Math.random() * 2}s`,
    }));
    setConfettiPieces(pieces);

    // Show content after animation
    const timer = setTimeout(() => setShowContent(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const endDate = new Date(subscription.endDate);
  const formattedEndDate = endDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confettiPieces.map((piece) => (
          <div
            key={piece.id}
            className="absolute -top-4 w-3 h-3 rounded-sm"
            style={{
              left: piece.left,
              backgroundColor: piece.color,
              animation: `confettiFall ${piece.duration} ${piece.delay} ease-out forwards`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        ))}
      </div>

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-[successPop_0.5s_ease-out]">
        {/* Green header glow */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-emerald-500/20 to-transparent pointer-events-none" />

        <div className="px-8 pt-10 pb-8 text-center relative">
          {/* Animated checkmark */}
          <div className="mx-auto mb-6 relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-[checkBounce_0.6s_ease-out]">
              <CheckCircle2 size={48} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="absolute -top-2 -right-2">
              <Sparkles size={28} className="text-amber-400 animate-pulse" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-[Playfair_Display] mb-2">
            Payment Successful! 🎉
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            Aapka <span className="font-semibold text-emerald-600 dark:text-emerald-400">{plan.name} Plan</span> activate ho gaya hai!
          </p>

          {/* Details Card */}
          <div className={`bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 text-left space-y-4 mb-8 transition-all duration-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                <CreditCard size={18} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Transaction ID</p>
                <p className="text-sm font-mono font-semibold text-slate-900 dark:text-white">{transactionId.slice(0, 20)}...</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <Download size={18} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Amount Paid</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">₹{(plan.price * 1.18).toFixed(2)} (incl. GST)</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                <Calendar size={18} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Valid Until</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{formattedEndDate}</p>
              </div>
            </div>
          </div>

          {/* Features unlocked */}
          <div className={`mb-8 transition-all duration-500 delay-200 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Features Unlocked</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {['Unlimited Invoices', 'Premium Templates', 'GST Reports', 'Priority Support'].map((feature) => (
                <span
                  key={feature}
                  className="px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium border border-indigo-200 dark:border-indigo-800"
                >
                  ✨ {feature}
                </span>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={onContinue}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
          >
            Start Creating Invoices
            <ArrowRight size={20} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes successPop {
          0% { opacity: 0; transform: scale(0.8); }
          50% { transform: scale(1.02); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes checkBounce {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
