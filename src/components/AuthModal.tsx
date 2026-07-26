import React, { useState } from 'react';
import { X, Lock, Mail, User, Loader2 } from 'lucide-react';
import { useAuth } from '../features/auth/useAuth';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (mode: 'signup' | 'login') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const { signUp, signIn, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleClick = async () => {
    setError(null);
    setIsGoogleLoading(true);
    const { error: authError } = await signInWithGoogle();
    if (authError) {
      setError(authError.message);
      setIsGoogleLoading(false);
    }
    // On success the browser redirects to Google, so nothing else runs here.
  };

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

          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={isGoogleLoading || isSubmitting}
            aria-busy={isGoogleLoading}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-lg border border-line bg-surface-1 hover:bg-surface-2 text-content-primary font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isGoogleLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.81z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.92l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.27v3.1C3.25 21.3 7.28 24 12 24z"/>
                <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.37-2.28v-3.1H1.27A11.98 11.98 0 0 0 0 12c0 1.93.46 3.76 1.27 5.38l4-3.1z"/>
                <path fill="#EA4335" d="M12 4.77c1.76 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.28 0 3.25 2.7 1.27 6.62l4 3.1C6.22 6.88 8.87 4.77 12 4.77z"/>
              </svg>
            )}
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-line" />
            <span className="text-xs text-content-muted">OR</span>
            <div className="flex-1 h-px bg-line" />
          </div>

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
