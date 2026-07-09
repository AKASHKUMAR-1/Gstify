import React, { useState } from 'react';
import { X, Lock, Mail, User, Loader2 } from 'lucide-react';
import { useAuth } from '../features/auth/useAuth';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (mode: 'signup' | 'login') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const { signUp, signIn } = useAuth();
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const { error: authError } =
        mode === 'signup' ? await signUp(email, password) : await signIn(email, password);
      if (authError) {
        setError(authError.message);
        return;
      }
      onSuccess(mode);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={mode === 'signup' ? 'Create account' : 'Log in'}
        className="bg-surface-1 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-line animate-in zoom-in-95 duration-200"
      >
        <div className="relative h-24 bg-brand-600 flex items-center justify-center p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
          <div className="text-white text-center mt-6">
            <h2 className="text-2xl font-[Playfair_Display] font-bold">
              {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
            </h2>
          </div>
          <div className="absolute -bottom-6 w-12 h-12 bg-surface-1 rounded-full flex items-center justify-center shadow-lg">
            <User className="text-brand-600" size={24} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-10">
          <p className="text-center text-sm text-content-muted mb-6">
            {mode === 'signup' ? 'Sign up to claim your 1-Month Pro Trial' : 'Log in to your GSTify account'}
          </p>

          <div className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium mb-1.5 text-content-secondary">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-2 border border-line rounded-lg focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 focus:outline-none transition-all text-content-primary"
                    placeholder="Rahul Sharma"
                  />
                  <User size={18} className="absolute left-3.5 top-3 text-content-muted" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5 text-content-secondary">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-2 border border-line rounded-lg focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 focus:outline-none transition-all text-content-primary"
                  placeholder="rahul@company.com"
                />
                <Mail size={18} className="absolute left-3.5 top-3 text-content-muted" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-content-secondary">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-2 border border-line rounded-lg focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 focus:outline-none transition-all text-content-primary"
                  placeholder="••••••••"
                  minLength={6}
                />
                <Lock size={18} className="absolute left-3.5 top-3 text-content-muted" />
              </div>
            </div>
          </div>

          {error && (
            <p role="alert" className="mt-4 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="w-full mt-8 bg-brand-600 hover:bg-brand-700 text-on-brand py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 size={18} className="animate-spin" />}
            {mode === 'signup' ? 'Claim Offer & Start Invoicing' : 'Log In'}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signup' ? 'login' : 'signup');
              setError(null);
            }}
            className="w-full text-center text-xs text-brand-600 hover:text-brand-700 mt-4"
          >
            {mode === 'signup' ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
          </button>

          <p className="text-center text-xs text-content-muted mt-3">
            By signing up, you agree to our Terms and Conditions.
          </p>
        </form>
      </div>
    </div>
  );
};
