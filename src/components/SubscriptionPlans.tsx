import React, { useState } from 'react';
import { Check, X, Crown, Zap, Shield, Users, ChevronRight, Loader2 } from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '../utils/paymentGateway';
import type { SubscriptionPlan, UserSubscription } from '../types';

interface SubscriptionPlansProps {
  currentSubscription: UserSubscription | null;
  onSelectPlan: (plan: SubscriptionPlan) => void;
  onClose?: () => void;
}

export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({
  currentSubscription,
  onSelectPlan,
  onClose,
}) => {
  const [isYearlyPricing, setIsYearlyPricing] = useState(false);

  const displayedPlans = SUBSCRIPTION_PLANS.filter((plan) => {
    if (plan.type === 'free') return true;
    return plan.interval === (isYearlyPricing ? 'yearly' : 'monthly');
  });
  const getPlanIcon = (type: string) => {
    switch (type) {
      case 'pro': return <Crown className="w-5 h-5 text-amber-500" />;
      case 'enterprise': return <Users className="w-5 h-5 text-blue-500" />;
      case 'basic': return <Zap className="w-5 h-5 text-green-500" />;
      default: return <Shield className="w-5 h-5 text-gray-500 dark:text-gray-400" />;
    }
  };

  const isCurrentPlan = (plan: SubscriptionPlan) => {
    if (!currentSubscription) return plan.type === 'free';
    return currentSubscription.planType === plan.type;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400"
          >
            <X size={20} />
          </button>
        )}
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Choose Your Plan</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
          Select the perfect plan for your business needs. Upgrade anytime to unlock advanced features.
        </p>

        <div className="flex items-center justify-center gap-4 font-medium mb-4">
          <span className={`transition-colors ${!isYearlyPricing ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-400'}`}>Monthly</span>
          <button 
            onClick={() => setIsYearlyPricing(!isYearlyPricing)}
            className={`relative w-14 h-8 rounded-full transition-colors ${isYearlyPricing ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`}
          >
            <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform transform ${isYearlyPricing ? 'translate-x-6 left-1' : 'left-1'}`}></div>
          </button>
          <span className={`transition-colors ${isYearlyPricing ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-400'}`}>
            Yearly <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full text-xs font-bold ml-1">Save 20%</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch pt-6">
        {displayedPlans.map((plan) => {
          const isCurrent = isCurrentPlan(plan);
          const isPopular = plan.type === 'pro';

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border transition-all duration-300 hover:shadow-xl flex flex-col ${
                isPopular
                  ? 'border-indigo-500 bg-gradient-to-b from-indigo-50 to-white dark:from-slate-800 dark:to-slate-900 shadow-xl ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900'
                  : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600'
              }`}
            >
              {isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-indigo-600 text-white text-sm font-medium px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              {isCurrent && (
                <div className="absolute top-4 right-4">
                  <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-xs font-medium px-3 py-1 rounded-full">
                    Current Plan
                  </span>
                </div>
              )}

              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-2 mb-4">
                  {getPlanIcon(plan.type)}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">₹{plan.price}</span>
                  <span className="text-gray-500 dark:text-gray-400">/{plan.interval === 'monthly' ? 'mo' : plan.interval}</span>
                </div>

                <button
                  onClick={() => onSelectPlan(plan)}
                  disabled={plan.type === 'free' || isCurrent}
                  className={`w-full py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                    plan.type === 'free' || isCurrent
                      ? 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : isPopular
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl'
                      : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {plan.type === 'free' ? (
                    'Free Forever'
                  ) : isCurrent ? (
                    '✅ Active'
                  ) : (
                    <>
                      Upgrade Now
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="mt-6 space-y-3 flex-grow">
                  {plan.features.map((feature, index) => {
                    const hasFeature = feature.startsWith('✅');
                    return (
                      <div key={index} className="flex items-start gap-3">
                        {hasFeature ? (
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-gray-300 dark:text-gray-600 mt-0.5 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${hasFeature ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>
                          {feature.replace('✅ ', '').replace('❌ ', '')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 bg-gray-50 dark:bg-slate-800 rounded-2xl p-6 max-w-3xl mx-auto border border-gray-200 dark:border-slate-700">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">✅ Secure Payment with Razorpay</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            UPI, Cards, Net Banking, Wallets
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            256-bit SSL Encryption
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            PCI DSS Level 1 Compliant
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            Instant Plan Activation
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            Auto Invoice Generation
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            Cancel Anytime
          </div>
        </div>
      </div>
    </div>
  );
};