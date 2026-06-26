import React, { useState } from 'react';
import { X, Smartphone, CreditCard, Building2, Wallet, ChevronRight, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';

interface DemoPaymentCheckoutProps {
  amount: number;
  currency: string;
  planName: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  onSuccess: (paymentId: string, orderId: string, signature: string) => void;
  onError: (error: { message: string }) => void;
  onClose: () => void;
}

type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'wallet' | null;
type PaymentStep = 'methods' | 'upi' | 'card' | 'netbanking' | 'wallet' | 'processing' | 'success';

const BANKS = [
  { id: 'sbi', name: 'State Bank of India', color: '#1a237e' },
  { id: 'hdfc', name: 'HDFC Bank', color: '#004b87' },
  { id: 'icici', name: 'ICICI Bank', color: '#f58220' },
  { id: 'axis', name: 'Axis Bank', color: '#97144d' },
  { id: 'kotak', name: 'Kotak Mahindra Bank', color: '#ed1c24' },
  { id: 'pnb', name: 'Punjab National Bank', color: '#1e3a5f' },
];

const WALLETS = [
  { id: 'paytm', name: 'Paytm', color: '#00BAF2', icon: '₱' },
  { id: 'phonepe', name: 'PhonePe', color: '#5f259f', icon: '📱' },
  { id: 'amazonpay', name: 'Amazon Pay', color: '#ff9900', icon: '🅰' },
  { id: 'freecharge', name: 'Freecharge', color: '#8bc34a', icon: '⚡' },
];

export const DemoPaymentCheckout: React.FC<DemoPaymentCheckoutProps> = ({
  amount,
  currency,
  planName,
  userName,
  userEmail,
  userPhone,
  onSuccess,
  onError,
  onClose,
}) => {
  const [step, setStep] = useState<PaymentStep>('methods');
  const [upiId, setUpiId] = useState('');
  const [upiApp, setUpiApp] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  const formattedAmount = `₹${(amount / 100).toFixed(2)}`;

  const simulatePayment = () => {
    setStep('processing');
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        const paymentId = `pay_demo_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
        const orderId = `order_demo_${Date.now().toString(36)}`;
        onSuccess(paymentId, orderId, 'demo_signature');
      }, 1200);
    }, 2000);
  };

  const goBack = () => {
    setStep('methods');
    setUpiId('');
    setUpiApp(null);
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setCardName('');
    setSelectedBank(null);
    setSelectedWallet(null);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      
      <div className="relative w-full max-w-[420px] bg-white rounded-xl shadow-2xl overflow-hidden animate-[rzpSlideUp_0.25s_ease-out]">
        {/* Header */}
        <div className="bg-[#1a1f36] text-white px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {step !== 'methods' && step !== 'processing' && step !== 'success' && (
                <button onClick={goBack} className="p-1 hover:bg-white/10 rounded transition-colors">
                  <ArrowLeft size={18} />
                </button>
              )}
              <div>
                <div className="font-semibold text-sm">GSTify</div>
                <div className="text-xs text-gray-400">{planName} Plan</div>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
              <X size={16} />
            </button>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
            <span className="text-gray-400 text-xs">{userEmail}</span>
            <span className="font-bold text-lg">{formattedAmount}</span>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[420px] overflow-y-auto">
          {/* Payment Methods */}
          {step === 'methods' && (
            <div className="p-1">
              {/* UPI */}
              <button
                onClick={() => setStep('upi')}
                className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors rounded-lg group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#5f259f]/10 flex items-center justify-center flex-shrink-0">
                  <Smartphone size={20} className="text-[#5f259f]" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-gray-900 text-sm">UPI</div>
                  <div className="text-xs text-gray-500">Pay using any UPI app</div>
                </div>
                <div className="flex items-center gap-1">
                  <img src="https://ui-avatars.com/api/?name=G&background=4285f4&color=fff&size=20&font-size=0.6&bold=true" alt="GPay" className="w-5 h-5 rounded" />
                  <img src="https://ui-avatars.com/api/?name=P&background=5f259f&color=fff&size=20&font-size=0.6&bold=true" alt="PhonePe" className="w-5 h-5 rounded" />
                  <img src="https://ui-avatars.com/api/?name=₱&background=00BAF2&color=fff&size=20&font-size=0.6&bold=true" alt="Paytm" className="w-5 h-5 rounded" />
                </div>
                <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600" />
              </button>

              <div className="mx-4 border-t border-gray-100" />

              {/* Card */}
              <button
                onClick={() => setStep('card')}
                className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors rounded-lg group"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <CreditCard size={20} className="text-blue-600" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-gray-900 text-sm">Card</div>
                  <div className="text-xs text-gray-500">Visa, Mastercard, RuPay</div>
                </div>
                <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600" />
              </button>

              <div className="mx-4 border-t border-gray-100" />

              {/* Net Banking */}
              <button
                onClick={() => setStep('netbanking')}
                className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors rounded-lg group"
              >
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <Building2 size={20} className="text-green-600" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-gray-900 text-sm">Net Banking</div>
                  <div className="text-xs text-gray-500">All Indian Banks</div>
                </div>
                <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600" />
              </button>

              <div className="mx-4 border-t border-gray-100" />

              {/* Wallets */}
              <button
                onClick={() => setStep('wallet')}
                className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors rounded-lg group"
              >
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                  <Wallet size={20} className="text-orange-600" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-gray-900 text-sm">Wallet</div>
                  <div className="text-xs text-gray-500">Paytm, PhonePe, Amazon Pay</div>
                </div>
                <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600" />
              </button>
            </div>
          )}

          {/* UPI Step */}
          {step === 'upi' && (
            <div className="p-5 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Choose UPI App</label>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { id: 'gpay', name: 'GPay', color: '#4285f4' },
                    { id: 'phonepe', name: 'PhonePe', color: '#5f259f' },
                    { id: 'paytm', name: 'Paytm', color: '#00BAF2' },
                    { id: 'navi', name: 'Navi', color: '#FF6B35' },
                  ].map(app => (
                    <button
                      key={app.id}
                      onClick={() => setUpiApp(app.id)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                        upiApp === app.id ? 'border-blue-500 bg-blue-50 scale-105' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: app.color }}>
                        {app.name[0]}
                      </div>
                      <span className="text-xs font-medium text-gray-700">{app.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-gray-500">or enter UPI ID</span></div>
              </div>

              <div>
                <input
                  type="text"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-sm"
                />
              </div>

              <button
                onClick={simulatePayment}
                disabled={!upiApp && !upiId.includes('@')}
                className="w-full py-3.5 rounded-lg bg-[#1a1f36] text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#2a2f46] transition-colors"
              >
                Pay {formattedAmount}
              </button>
            </div>
          )}

          {/* Card Step */}
          {step === 'card' && (
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})/g, '$1 ').trim())}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-sm font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Expiry</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={e => {
                      let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                      if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2);
                      setCardExpiry(v);
                    }}
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">CVV</label>
                  <input
                    type="password"
                    value={cardCvv}
                    onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    placeholder="•••"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-sm font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Name on Card</label>
                <input
                  type="text"
                  value={cardName}
                  onChange={e => setCardName(e.target.value)}
                  placeholder="JOHN DOE"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-sm uppercase"
                />
              </div>
              <button
                onClick={simulatePayment}
                disabled={cardNumber.replace(/\s/g, '').length < 15 || cardExpiry.length < 5 || cardCvv.length < 3}
                className="w-full py-3.5 rounded-lg bg-[#1a1f36] text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#2a2f46] transition-colors"
              >
                Pay {formattedAmount}
              </button>
            </div>
          )}

          {/* Net Banking Step */}
          {step === 'netbanking' && (
            <div className="p-5 space-y-4">
              <label className="block text-sm font-medium text-gray-700">Select Your Bank</label>
              <div className="space-y-2">
                {BANKS.map(bank => (
                  <button
                    key={bank.id}
                    onClick={() => setSelectedBank(bank.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                      selectedBank === bank.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: bank.color }}>
                      {bank.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </div>
                    <span className="text-sm font-medium text-gray-800">{bank.name}</span>
                    {selectedBank === bank.id && <CheckCircle2 size={16} className="text-blue-500 ml-auto" />}
                  </button>
                ))}
              </div>
              <button
                onClick={simulatePayment}
                disabled={!selectedBank}
                className="w-full py-3.5 rounded-lg bg-[#1a1f36] text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#2a2f46] transition-colors"
              >
                Pay {formattedAmount}
              </button>
            </div>
          )}

          {/* Wallet Step */}
          {step === 'wallet' && (
            <div className="p-5 space-y-4">
              <label className="block text-sm font-medium text-gray-700">Select Wallet</label>
              <div className="grid grid-cols-2 gap-3">
                {WALLETS.map(wallet => (
                  <button
                    key={wallet.id}
                    onClick={() => setSelectedWallet(wallet.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      selectedWallet === wallet.id ? 'border-blue-500 bg-blue-50 scale-105' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold" style={{ backgroundColor: wallet.color }}>
                      {wallet.icon}
                    </div>
                    <span className="text-sm font-medium text-gray-800">{wallet.name}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={simulatePayment}
                disabled={!selectedWallet}
                className="w-full py-3.5 rounded-lg bg-[#1a1f36] text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#2a2f46] transition-colors"
              >
                Pay {formattedAmount}
              </button>
            </div>
          )}

          {/* Processing */}
          {step === 'processing' && (
            <div className="p-12 flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-900">Processing Payment</p>
                <p className="text-sm text-gray-500 mt-1">Please wait, do not close this window...</p>
              </div>
            </div>
          )}

          {/* Success */}
          {step === 'success' && (
            <div className="p-12 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center animate-[successBounce_0.5s_ease-out]">
                <CheckCircle2 size={36} className="text-green-600" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-900 text-lg">Payment Successful!</p>
                <p className="text-sm text-gray-500 mt-1">{formattedAmount} paid successfully</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            Secured by
          </div>
          <div className="flex items-center gap-1">
            <svg width="80" height="16" viewBox="0 0 200 40">
              <text x="0" y="30" fontFamily="Arial" fontWeight="bold" fontSize="28" fill="#1a1f36">Razorpay</text>
            </svg>
          </div>
        </div>

        {/* Demo badge */}
        <div className="absolute top-[52px] right-0 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-l-md shadow-sm">
          DEMO MODE
        </div>
      </div>

      <style>{`
        @keyframes rzpSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes successBounce {
          0% { transform: scale(0); }
          60% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};
