import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { InvoiceTemplatePremium } from '../InvoiceTemplatePremium';
import type { InvoiceTemplate as InvoiceTemplateType } from '../TemplateSelector';

type PlanTier = 'free' | 'basic' | 'premium' | 'enterprise' | 'pro';

interface LandingPageProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
  setPlanTier: (val: PlanTier) => void;
  setShowLandingPage: (val: boolean) => void;
  handleGetStarted: () => void;
  handleSelectPlanLanding: (tier: PlanTier) => void;
  isYearlyPricing: boolean;
  setIsYearlyPricing: (val: boolean) => void;
  invoiceTemplates: InvoiceTemplateType[];
  loadSubscription: () => any;
  isSubscriptionActive: (sub: any) => boolean;
}

export function LandingPage({
  isDarkMode,
  setIsDarkMode,
  isLoggedIn,
  setIsLoggedIn,
  setPlanTier,
  setShowLandingPage,
  handleGetStarted,
  handleSelectPlanLanding,
  isYearlyPricing,
  setIsYearlyPricing,
  invoiceTemplates,
  loadSubscription,
  isSubscriptionActive,
}: LandingPageProps) {
  return (
    <main className="flex-1 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-[Outfit]">

      {/* Navigation Bar */}
      <nav className="sticky top-0 w-full z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-3 font-[Playfair_Display] font-bold text-xl cursor-pointer"
            onClick={() => setShowLandingPage(true)}
          >
            <svg width="30" height="30" viewBox="0 0 100 100">
              <path d="M20,10 L60,10 L80,30 L80,80 Q80,90 70,90 L20,90 Q10,90 10,80 L10,20 Q10,10 20,10 Z" className="fill-slate-900 dark:fill-white"/>
              <path d="M45,40 C35,40 25,50 25,60 C25,75 45,85 45,85 C45,85 65,75 65,60 C65,50 55,40 45,40 Z" className="fill-amber-500"/>
            </svg>
            GSTify
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="text-slate-600 dark:text-slate-400 hover:text-amber-500 transition-colors duration-200">Features</a>
            <a href="#pricing" className="text-slate-600 dark:text-slate-400 hover:text-amber-500 transition-colors duration-200">Pricing</a>
            {isLoggedIn ? (
              <button
                onClick={() => {
                  setIsLoggedIn(false);
                  setPlanTier('free');
                  localStorage.removeItem('gstify_session');
                }}
                className="text-red-500 hover:text-red-600 transition-colors duration-200"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => {
                  const sub = loadSubscription();
                  if (sub && isSubscriptionActive(sub)) {
                    setIsLoggedIn(true);
                    localStorage.setItem('gstify_session', 'true');
                    setPlanTier(sub.planType as PlanTier);
                    setShowLandingPage(false);
                  } else {
                    alert("Please buy a plan first or use 'Get Started' for free version.");
                  }
                }}
                className="text-amber-600 hover:text-amber-500 transition-colors duration-200"
              >
                Login
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 hover:scale-105"
            >
              {isDarkMode ?
                <Sun size={18} className="text-amber-400" /> :
                <Moon size={18} className="text-slate-600" />
              }
            </button>
            <button
              onClick={handleGetStarted}
              className="hidden sm:block px-5 py-2.5 rounded-full font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:-translate-y-0.5 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Get Started
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowLandingPage(false)}
              className="md:hidden w-9 h-9 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center shadow-md"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12h18M3 6h18M3 18h18"/>
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6 bg-gradient-to-br from-sky-50 to-white dark:from-slate-950 dark:to-slate-900 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 z-10">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold text-sm mb-6 animate-pulse">
              🚀 Launching Limited-Time Free Tier for Solo Creators
            </div>

            <h1 className="text-[clamp(2.5rem,5vw,3.5rem)] font-[Playfair_Display] font-bold leading-tight mb-6">
              Effortless Invoicing for <span className="text-amber-500 italic">Modern India</span>
            </h1>

            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-8 max-w-xl">
              Create professional GST-compliant invoices in seconds. Track payments, manage clients, and grow your business with the most premium billing tool.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleGetStarted}
                className="px-7 py-3.5 rounded-full font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:-translate-y-1 transition-all shadow-xl hover:shadow-2xl"
              >
                Create Invoice Free
              </button>
              <button
                onClick={() => setShowLandingPage(false)}
                className="px-7 py-3.5 rounded-full font-semibold border-2 border-slate-200 dark:border-slate-700 hover:border-slate-900 dark:hover:border-white transition-colors"
              >
                View Live Demo
              </button>
            </div>
          </div>

          <div className="flex-1 max-w-xl w-full z-10 perspective-[1000px]">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-1 transform rotate-y-[-10deg] rotate-x-[5deg] hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-500 animate-[float_6s_ease-in-out_infinite]">
              <InvoiceTemplatePremium
                data={{
                  seller: {
                    name: 'Tech Solutions Pvt Ltd',
                    address: '123 Business Park, Mumbai',
                    email: 'support@techsolutions.in',
                    phone: '9876543210',
                    gstin: '27ABCDE1234F1Z5'
                  },
                  buyer: {
                    name: 'Acme Corporation',
                    address: '456 Commercial Street, Bangalore',
                    state: 'Karnataka',
                    gstin: '29XYZAB5678C2Z1'
                  },
                  meta: {
                    invoiceNumber: 'INV/2025-26/0001',
                    invoiceDate: '2025-11-04',
                    dueDate: '2025-11-11'
                  },
                  items: [
                    {
                      id: '1',
                      description: 'Website Development Services',
                      hsnSac: '998311',
                      quantity: 1,
                      rate: 15000,
                      gstPercentage: 18
                    }
                  ],
                  isInterState: false
                }}
                template={invoiceTemplates[0]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-white dark:bg-slate-950">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 font-[Playfair_Display]">Why Choose GSTify?</h2>
          <p className="text-slate-500 dark:text-slate-400">Designed for freelancers, small businesses, and agencies who demand precision and style.</p>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <div className="group bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer">
            <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-5 group-hover:bg-amber-500/10 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-amber-500 transition-colors">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">GST Compliant</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Automatically calculate CGST, SGST, and IGST based on latest tax slabs and place of supply rules.</p>
          </div>

          {/* Feature 2 */}
          <div className="group bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer">
            <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-5 group-hover:bg-amber-500/10 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-amber-500 transition-colors">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Bank-Grade Security</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">All data stays 100% offline in your browser. No server calls. Complete privacy guaranteed.</p>
          </div>

          {/* Feature 3 */}
          <div className="group bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer">
            <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-5 group-hover:bg-amber-500/10 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-amber-500 transition-colors">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">One-Click Export</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Professional PDF generation in single click. Share directly to WhatsApp, Email or Gmail.</p>
          </div>

          {/* Feature 4 */}
          <div className="group bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer">
            <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-5 group-hover:bg-amber-500/10 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-amber-500 transition-colors">
                <rect width="7" height="7" x="3" y="3" rx="1"/>
                <rect width="7" height="7" x="14" y="3" rx="1"/>
                <rect width="7" height="7" x="14" y="14" rx="1"/>
                <rect width="7" height="7" x="3" y="14" rx="1"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">30 Premium Templates</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Beautiful professional invoice templates. Impress your clients with premium designs.</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-6 bg-slate-50 dark:bg-slate-900 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl"></div>

        <div className="max-w-3xl mx-auto text-center mb-16 relative z-10">
          <h2 className="text-3xl font-bold mb-4 font-[Playfair_Display]">Loved by <span className="text-amber-500">10,000+</span> Businesses</h2>
          <p className="text-slate-500 dark:text-slate-400">Dekhiye Indian business owners kya kehte hain GSTify ke baare mein. Humare customers ki satisfaction hi hamari pehchan hai.</p>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {/* Testimonial 1 */}
          <div className="group bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 hover:border-amber-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl relative">
            <div className="absolute top-5 right-6 text-6xl font-serif text-amber-500/10">"</div>
            <div className="text-amber-500 mb-5 text-lg">★★★★★</div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-8 italic">"Pehle GST invoice banana ek bada headache tha. GSTify ke aane ke baad meri accounting mein 70% waqt bach gaya hai. Interface bahut smooth hai."</p>
            <div className="flex items-center gap-4">
              <img src="https://ui-avatars.com/api/?name=Rajesh+Kumar&background=0f172a&color=d4af37" alt="Rajesh Kumar" className="w-12 h-12 rounded-full border-2 border-amber-500" />
              <div>
                <div className="font-semibold">Rajesh Kumar</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Owner, Kumar Electronics</div>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="group bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 hover:border-amber-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl relative">
            <div className="absolute top-5 right-6 text-6xl font-serif text-amber-500/10">"</div>
            <div className="text-amber-500 mb-5 text-lg">★★★★★</div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-8 italic">"Main ek freelance graphic designer hoon. Mujhe professional invoices chahiye hote the client ke liye. GSTify ne meri image bahut improve ki hai."</p>
            <div className="flex items-center gap-4">
              <img src="https://ui-avatars.com/api/?name=Priya+Sharma&background=0f172a&color=d4af37" alt="Priya Sharma" className="w-12 h-12 rounded-full border-2 border-amber-500" />
              <div>
                <div className="font-semibold">Priya Sharma</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Freelance Designer</div>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="group bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 hover:border-amber-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl relative">
            <div className="absolute top-5 right-6 text-6xl font-serif text-amber-500/10">"</div>
            <div className="text-amber-500 mb-5 text-lg">★★★★★</div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-8 italic">"Auto GST calculation feature mere liye best hai. Maine kai tools try kiye par GSTify ka simplicity aur accuracy unmatched hai. Highly recommended!"</p>
            <div className="flex items-center gap-4">
              <img src="https://ui-avatars.com/api/?name=Amit+Verma&background=0f172a&color=d4af37" alt="Amit Verma" className="w-12 h-12 rounded-full border-2 border-amber-500" />
              <div>
                <div className="font-semibold">Amit Verma</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">CA & Tax Consultant</div>
              </div>
            </div>
          </div>

          {/* Testimonial 4 */}
          <div className="group bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 hover:border-amber-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl relative">
            <div className="absolute top-5 right-6 text-6xl font-serif text-amber-500/10">"</div>
            <div className="text-amber-500 mb-5 text-lg">★★★★★</div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-8 italic">"Dark mode support ek premium touch deta hai. Raat ko bhi kaam karna aasan hai. Support team bhi bahut helpful hai."</p>
            <div className="flex items-center gap-4">
              <img src="https://ui-avatars.com/api/?name=Sneha+Patel&background=0f172a&color=d4af37" alt="Sneha Patel" className="w-12 h-12 rounded-full border-2 border-amber-500" />
              <div>
                <div className="font-semibold">Sneha Patel</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Boutique Owner</div>
              </div>
            </div>
          </div>

          {/* Testimonial 5 */}
          <div className="group bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 hover:border-amber-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl relative">
            <div className="absolute top-5 right-6 text-6xl font-serif text-amber-500/10">"</div>
            <div className="text-amber-500 mb-5 text-lg">★★★★☆</div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-8 italic">"Bahut acha tool hai. Sirf mobile app ka wait kar raha hoon. Web version par currently mera poora kaam chal raha hai."</p>
            <div className="flex items-center gap-4">
              <img src="https://ui-avatars.com/api/?name=Vikram+Singh&background=0f172a&color=d4af37" alt="Vikram Singh" className="w-12 h-12 rounded-full border-2 border-amber-500" />
              <div>
                <div className="font-semibold">Vikram Singh</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Logistics Manager</div>
              </div>
            </div>
          </div>

          {/* Testimonial 6 */}
          <div className="group bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 hover:border-amber-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl relative">
            <div className="absolute top-5 right-6 text-6xl font-serif text-amber-500/10">"</div>
            <div className="text-amber-500 mb-5 text-lg">★★★★★</div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-8 italic">"Export to PDF feature crystal clear quality deta hai. Mere clients hamesha mujhe compliment karte hain professional invoice ke liye."</p>
            <div className="flex items-center gap-4">
              <img src="https://ui-avatars.com/api/?name=Anjali+Rao&background=0f172a&color=d4af37" alt="Anjali Rao" className="w-12 h-12 rounded-full border-2 border-amber-500" />
              <div>
                <div className="font-semibold">Anjali Rao</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Interior Designer</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-white dark:bg-slate-950 relative">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 font-[Playfair_Display]">Simple, Transparent Pricing</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-10">Koi chhupa hua charge nahi. Aap apne business ke hisaab sahi plan choose karein.</p>

          <div className="flex items-center justify-center gap-4 font-medium">
            <span className={`transition-colors ${!isYearlyPricing ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-400'}`}>Monthly</span>
            <button
              onClick={() => setIsYearlyPricing(!isYearlyPricing)}
              className={`relative w-14 h-8 rounded-full transition-colors ${isYearlyPricing ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform transform ${isYearlyPricing ? 'translate-x-6 left-1' : 'left-1'}`}></div>
            </button>
            <span className={`transition-colors ${isYearlyPricing ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-400'}`}>
              Yearly <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full text-xs font-bold ml-1">Save 20%</span>
            </span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 items-stretch pt-6">
          {/* Starter Plan */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-lg flex flex-col">
            <h3 className="text-xl font-semibold mb-3">Starter</h3>
            <div className="text-4xl font-bold font-[Playfair_Display] mb-2">₹0</div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-8">Forever Free</div>

            <ul className="space-y-4 mb-8 text-left">
              <li className="flex items-center gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 flex-shrink-0"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Up to 25 Invoices/month</span>
              </li>
              <li className="flex items-center gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 flex-shrink-0"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Basic GST Calculation</span>
              </li>
              <li className="flex items-center gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 flex-shrink-0"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Standard PDF Export</span>
              </li>
              <li className="flex items-center gap-3 text-slate-400 opacity-50">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                <span>No GST Reports</span>
              </li>
            </ul>

            <button
              onClick={() => {
                setPlanTier('free');
                setShowLandingPage(false);
              }}
              className="w-full py-3 rounded-full border-2 border-slate-200 dark:border-slate-700 font-semibold hover:border-slate-900 dark:hover:border-white transition-colors"
            >
              Get Started Free
            </button>
          </div>

          {/* Professional Plan - Free Trial */}
          <div className="relative rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-b from-amber-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-2xl p-8 border-2 border-amber-500 shadow-2xl ring-2 ring-amber-400 ring-offset-2 dark:ring-offset-slate-950 relative flex flex-col h-full justify-between">
              <div>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-900 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Most Popular
                </div>
                <h3 className="text-xl font-semibold mb-3">Professional</h3>
                <div className="text-4xl font-bold font-[Playfair_Display] mb-2">₹0</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-8">30-Day Free Trial</div>

                <ul className="space-y-4 mb-8 text-left">
                  <li className="flex items-center gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 flex-shrink-0"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>Unlimited Invoices</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 flex-shrink-0"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>Advanced GST Reports (GSTR-1)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 flex-shrink-0"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>Remove GSTify Branding</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 flex-shrink-0"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>Priority Email Support</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleSelectPlanLanding('pro')}
                className="w-full py-3 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold transition-all shadow-lg hover:shadow-xl cursor-pointer"
              >
                Try Free for 30 Days
              </button>
            </div>
          </div>

          {/* Enterprise Plan - Free Trial */}
          <div className="relative rounded-2xl overflow-hidden">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-lg flex flex-col h-full justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-3">Enterprise</h3>
                <div className="text-4xl font-bold font-[Playfair_Display] mb-2">₹0</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-8">30-Day Free Trial</div>

                <ul className="space-y-4 mb-8 text-left">
                  <li className="flex items-center gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 flex-shrink-0"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>Everything in Pro</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 flex-shrink-0"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>Multi-user Access (5 Users)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 flex-shrink-0"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>API Access</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 flex-shrink-0"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>Dedicated Account Manager</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleSelectPlanLanding('enterprise')}
                className="w-full py-3 rounded-full border-2 border-slate-200 dark:border-slate-700 font-semibold hover:border-slate-900 dark:hover:border-white transition-colors cursor-pointer"
              >
                Try Free for 30 Days
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-6 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 font-[Playfair_Display]">Chalein baat shuru karte hain.</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Koi sawaal hai? Humari team aapki madad ke liye taiyar hai. Niche diye gaye details se humse contact karein.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Contact Info */}
            <div className="space-y-6">
              {/* Address Card */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-amber-500 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Our Location</h3>
                  <p className="text-slate-500 dark:text-slate-400">Online Workspace<br/>Operating entirely from India</p>
                </div>
              </div>

              {/* Email Card */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-amber-500 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Email Us</h3>
                  <p className="text-slate-500 dark:text-slate-400">akash906kr@gmail.com<br/>akash906kr@gmail.com</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-xl">
              <form onSubmit={(e) => { e.preventDefault(); alert('Message sent successfully! Thank you for contacting us.'); }}>
                <div className="grid gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                      placeholder="Aapka naam"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                      placeholder="name@company.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Subject</label>
                    <select className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all">
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="sales">Sales Question</option>
                      <option value="feedback">Feedback</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Message</label>
                    <textarea
                      rows={5}
                      className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
                      placeholder="Apna message yahan likhein..."
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-lg hover:-translate-y-0.5 transition-all shadow-lg hover:shadow-xl"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 font-[Playfair_Display] font-bold text-xl mb-4">
            <svg width="30" height="30" viewBox="0 0 100 100">
              <path d="M20,10 L60,10 L80,30 L80,80 Q80,90 70,90 L20,90 Q10,90 10,80 L10,20 Q10,10 20,10 Z" className="fill-slate-900 dark:fill-white"/>
              <path d="M45,40 C35,40 25,50 25,60 C25,75 45,85 45,85 C45,85 65,75 65,60 C65,50 55,40 45,40 Z" className="fill-amber-500"/>
            </svg>
            GSTify
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">© 2025 GSTify Inc. All rights reserved. Made with ❤️ in India.</p>
        </div>
      </footer>
    </main>
  );
}
