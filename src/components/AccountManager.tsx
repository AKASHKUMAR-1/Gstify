import React from 'react';
import { Mail, Phone, Calendar, ShieldCheck } from 'lucide-react';
import type { AccountManagerDetails } from '../types';

const AccountManager: React.FC = () => {
  const manager: AccountManagerDetails = {
    name: "Rajesh Kumar",
    position: "Senior Enterprise Success Manager",
    email: "rajesh.k@gstify.com",
    phone: "+91 99887 76655",
    avatar: "https://ui-avatars.com/api/?name=Rajesh+Kumar&background=0f172a&color=d4af37&size=128",
    availability: "Mon - Fri, 10:00 AM - 6:00 PM IST"
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-full -mr-16 -mt-16 transition-all group-hover:bg-amber-500/20"></div>
      
      <div className="relative flex flex-col md:flex-row items-center gap-8">
        <div className="relative">
          <img 
            src={manager.avatar} 
            alt={manager.name} 
            className="w-32 h-32 rounded-2xl object-cover ring-4 ring-amber-500/20 shadow-2xl"
          />
          <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white dark:border-slate-800"></div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
            <ShieldCheck size={14} />
            Dedicated Support
          </div>
          <h2 className="text-2xl font-bold mb-1 font-[Playfair_Display]">{manager.name}</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">{manager.position}</p>

          <div className="flex flex-col gap-4">
            <a 
              href={`mailto:${manager.email}`}
              className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-amber-500/50 transition-all group shadow-sm"
            >
              <div className="w-12 h-12 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-amber-500 shadow-sm transition-transform group-hover:scale-110">
                <Mail size={24} />
              </div>
              <div className="text-left">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Email Support</div>
                <div className="text-base font-semibold">{manager.email}</div>
              </div>
            </a>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
          <Calendar size={18} className="text-amber-500" />
          <span className="text-sm">Availability: <span className="font-semibold text-slate-700 dark:text-slate-200">{manager.availability}</span></span>
        </div>
        <button className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm">
          Schedule Meeting
        </button>
      </div>
    </div>
  );
};

export default AccountManager;
