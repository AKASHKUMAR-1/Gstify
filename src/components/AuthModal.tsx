import React, { useState } from 'react';
import { X, Lock, Mail, User } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (name: string, email: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    onSuccess(name, email);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200">
        <div className="relative h-24 bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
          <div className="text-white text-center mt-6">
            <h2 className="text-2xl font-[Playfair_Display] font-bold">Create Account</h2>
          </div>
          <div className="absolute -bottom-6 w-12 h-12 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-lg">
            <User className="text-amber-500" size={24} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-10">
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-6">
            Sign up to claim your 1-Month Pro Trial
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:outline-none transition-all dark:text-white"
                  placeholder="Rahul Sharma"
                />
                <User size={18} className="absolute left-3.5 top-3 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:outline-none transition-all dark:text-white"
                  placeholder="rahul@company.com"
                />
                <Mail size={18} className="absolute left-3.5 top-3 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:outline-none transition-all dark:text-white"
                  placeholder="••••••••"
                  minLength={6}
                />
                <Lock size={18} className="absolute left-3.5 top-3 text-slate-400" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-lg font-semibold hover:-translate-y-0.5 transition-all shadow-md hover:shadow-lg"
          >
            Claim Offer & Start Invoicing
          </button>
          
          <p className="text-center text-xs text-slate-500 mt-4">
            By signing up, you agree to our Terms and Conditions.
          </p>
        </form>
      </div>
    </div>
  );
};
