import React, { useState, useEffect, useRef } from 'react';
import { FileText, Download, Eye, Edit2, Moon, Sun, Share2, Printer, MessageCircle, Mail, History, Trash2, Copy, Send, Users, Terminal, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { ClientRecord, InvoiceData, InvoiceRecord, ProductRecord, RecurringInvoiceTemplate, InvoiceStatus } from './types';
import type { SubscriptionPlan, PaymentTransaction, UserSubscription, PlanType, SubscriptionStatus } from './types';
import { InvoiceEditor } from './components/InvoiceEditor';
import { InvoiceTemplate } from './components/InvoiceTemplate';
import { InvoiceTemplatePremium } from './components/InvoiceTemplatePremium';
import { RecurringInvoices } from './components/RecurringInvoices';
import { InvoiceStatusTracker } from './components/InvoiceStatusTracker';
import { TemplateSelector } from './components/TemplateSelector';
import type { InvoiceTemplate as InvoiceTemplateType } from './components/TemplateSelector';
import { SubscriptionPlans } from './components/SubscriptionPlans';
import { PaymentModal } from './components/PaymentModal';
import { PaymentSuccess } from './components/PaymentSuccess';
import { DemoPaymentCheckout } from './components/DemoPaymentCheckout';
import TeamManagement from './components/TeamManagement';
import ApiManagement from './components/ApiManagement';
import AccountManager from './components/AccountManager';
import { AuthModal } from './components/AuthModal';
import {
  PaymentService,
  SUBSCRIPTION_PLANS,
  loadSubscription,
  saveSubscription,
  isSubscriptionActive,
  getSubscriptionDaysRemaining,
  clearSubscription,
  activateEarlyBirdTrial,
} from './utils/paymentGateway';

const STORAGE_KEY = 'gst_invoice_seller_details';
const HISTORY_KEY = 'gst_invoice_history';
const CLIENTS_KEY = 'gst_invoice_clients';
const PRODUCTS_KEY = 'gst_invoice_products';
const INVOICE_SEQUENCE_KEY = 'gst_invoice_sequence_by_fy';
const PLAN_KEY = 'gst_invoice_plan';
const USAGE_KEY = 'gst_invoice_usage';

type PlanTier = 'free' | 'basic' | 'premium' | 'enterprise' | 'pro';

const FREE_LIMITS = {
  monthlyDownloads: 25,
  maxClients: 25,
  maxProducts: 100,
  maxHistory: 20,
};

const initialData: InvoiceData = {
  seller: {
    name: '',
    address: '',
    email: '',
    phone: '',
    gstin: '',
  },
  buyer: {
    name: '',
    address: '',
    state: '',
    gstin: '',
  },
  meta: {
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  items: [
    {
      id: crypto.randomUUID(),
      description: 'Web Development Services',
      hsnSac: '998311',
      quantity: 1,
      rate: 15000,
      gstPercentage: 18,
    },
  ],
  isInterState: false,
};

export default function App() {
  const [data, setData] = useState<InvoiceData>(initialData);
  const [isPreview, setIsPreview] = useState(false);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [invoiceHistory, setInvoiceHistory] = useState<InvoiceRecord[]>([]);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [planTier, setPlanTier] = useState<PlanTier>('free');
  const [isTeamOpen, setIsTeamOpen] = useState(false);
  const [isApiOpen, setIsApiOpen] = useState(false);
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('gstify_session') === 'true';
  });
  const [usage, setUsage] = useState(() => {
    const month = new Date().toISOString().slice(0, 7);
    const saved = localStorage.getItem(USAGE_KEY);
    if (!saved) return { month, downloads: 0 };
    try {
      const parsed = JSON.parse(saved);
      if (parsed?.month !== month) return { month, downloads: 0 };
      return { month, downloads: Number(parsed.downloads || 0) };
    } catch {
      return { month, downloads: 0 };
    }
  });
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  const isPremium = planTier === 'pro' || planTier === 'premium' || planTier === 'enterprise';
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [isYearlyPricing, setIsYearlyPricing] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedPlanOnLanding, setSelectedPlanOnLanding] = useState<PlanTier | null>(null);

  const [earlyBirdSpots, setEarlyBirdSpots] = useState(() => {
    let saved = localStorage.getItem('gstify_earlybird');
    if (!saved) {
      saved = (850 + Math.floor(Math.random() * 50)).toString();
      localStorage.setItem('gstify_earlybird', saved);
    }
    return parseInt(saved, 10);
  });

  useEffect(() => {
    // Only increment slowly on mount to simulate traffic
    const current = earlyBirdSpots;
    if (current < 999 && Math.random() > 0.4) {
      const increment = Math.floor(Math.random() * 3) + 1;
      const newVal = Math.min(1000, current + increment);
      setEarlyBirdSpots(newVal);
      localStorage.setItem('gstify_earlybird', newVal.toString());
    }
  }, []); // Run once on startup

  const activatePlanFree = (tier: PlanTier) => {
    const now = new Date();
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days trial
    const subscription: UserSubscription = {
      id: `SUB-TRIAL-${Date.now().toString(36).toUpperCase()}`,
      planId: tier === 'enterprise' ? 'enterprise-plan-monthly' : (tier === 'pro' ? 'pro-plan-monthly' : 'free-plan'),
      planType: tier as PlanType,
      status: (tier === 'free' ? 'active' : 'trial') as SubscriptionStatus,
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      paymentTransactionId: 'FREE_TRIAL_ACTIVATION',
      autoRenewal: false,
      createdAt: now.toISOString(),
      lastPaymentDate: now.toISOString(),
      nextBillingDate: endDate.toISOString(),
      usage: {
        invoicesUsed: 0,
        clientsUsed: 0,
        templatesUsed: 0,
      },
    };
    saveSubscription(subscription);
    setUserSubscription(subscription);
    setPlanTier(tier);
    setIsLoggedIn(true);
    localStorage.setItem('gstify_session', 'true');
    localStorage.setItem(PLAN_KEY, tier);
    setShowLandingPage(false);
  };

  const handleSelectPlanLanding = (tier: PlanTier) => {
    if (!isLoggedIn) {
      setSelectedPlanOnLanding(tier);
      setIsAuthOpen(true);
    } else {
      activatePlanFree(tier);
    }
  };

  const handleGetStarted = () => {
    if (!isLoggedIn) {
      setIsAuthOpen(true);
    } else {
      setShowLandingPage(false);
    }
  };

  const handleAuthSuccess = (name: string, email: string) => {
    setIsAuthOpen(false);
    const targetTier = selectedPlanOnLanding || 'pro'; // Default to pro trial
    activatePlanFree(targetTier);
    alert(`🎉 Welcome ${name}!\n\nYour 30-Day Free Trial for the ${targetTier.toUpperCase()} Plan is now active!`);
  };

  const getFinancialYear = (dateString: string) => {
    const date = new Date(dateString || Date.now());
    const year = date.getFullYear();
    const startYear = date.getMonth() >= 3 ? year : year - 1;
    const endShort = String(startYear + 1).slice(-2);
    return `${startYear}-${endShort}`;
  };

  const formatInvoiceNumber = (fy: string, seq: number) => `INV/${fy}/${String(seq).padStart(4, '0')}`;

  const getSuggestedInvoiceNumber = (dateString: string) => {
    const fy = getFinancialYear(dateString);
    const raw = localStorage.getItem(INVOICE_SEQUENCE_KEY);
    const parsed: Record<string, number> = raw ? JSON.parse(raw) : {};
    const nextSeq = (parsed[fy] || 0) + 1;
    return formatInvoiceNumber(fy, nextSeq);
  };

  const reserveNextInvoiceNumber = (dateString: string) => {
    const fy = getFinancialYear(dateString);
    const raw = localStorage.getItem(INVOICE_SEQUENCE_KEY);
    const parsed: Record<string, number> = raw ? JSON.parse(raw) : {};
    const nextSeq = (parsed[fy] || 0) + 1;
    parsed[fy] = nextSeq;
    localStorage.setItem(INVOICE_SEQUENCE_KEY, JSON.stringify(parsed));
    return formatInvoiceNumber(fy, nextSeq);
  };

  const validateInvoice = (invoiceData: InvoiceData) => {
    const errors: Record<string, string> = {};
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

    if (!invoiceData.seller.name.trim()) errors.sellerName = 'Seller business name is required';
    if (invoiceData.seller.gstin && !gstRegex.test(invoiceData.seller.gstin.toUpperCase())) {
      errors.sellerGstin = 'Seller GSTIN format is invalid';
    }
    if (!invoiceData.buyer.name.trim()) errors.buyerName = 'Buyer name is required';
    if (invoiceData.buyer.gstin && !gstRegex.test(invoiceData.buyer.gstin.toUpperCase())) {
      errors.buyerGstin = 'Buyer GSTIN format is invalid';
    }
    if (!invoiceData.meta.invoiceDate) errors.invoiceDate = 'Invoice date is required';
    if (!invoiceData.meta.dueDate) errors.dueDate = 'Due date is required';
    if (invoiceData.meta.invoiceDate && invoiceData.meta.dueDate && invoiceData.meta.dueDate < invoiceData.meta.invoiceDate) {
      errors.dueDate = 'Due date cannot be before invoice date';
    }
    if (!invoiceData.meta.invoiceNumber.trim()) errors.invoiceNumber = 'Invoice number is required';

    if (invoiceData.items.length === 0) {
      errors.items = 'At least one line item is required';
    } else {
      invoiceData.items.forEach((item, index) => {
        if (!item.description.trim()) errors[`item_${index}_description`] = `Item ${index + 1}: description is required`;
        if (item.quantity <= 0) errors[`item_${index}_quantity`] = `Item ${index + 1}: quantity must be greater than 0`;
        if (item.rate < 0) errors[`item_${index}_rate`] = `Item ${index + 1}: rate cannot be negative`;
      });
    }

    setValidationErrors(errors);
    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  };

  const [selectedTemplate, setSelectedTemplate] = useState('default');
  const [isRecurringOpen, setIsRecurringOpen] = useState(false);
  const [recurringTemplates, setRecurringTemplates] = useState<RecurringInvoiceTemplate[]>([]);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [invoiceStatuses, setInvoiceStatuses] = useState<InvoiceStatus[]>([]);
  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false);

  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const closeAllFeatures = () => {
    setIsRecurringOpen(false);
    setIsStatusOpen(false);
    setIsTemplateSelectorOpen(false);
    setIsTeamOpen(false);
    setIsApiOpen(false);
    setIsManagerOpen(false);
    setIsHistoryOpen(false);
    setActiveFeature(null);
  };

  const openFeature = (feature: string) => {
    closeAllFeatures();
    setActiveFeature(feature);
    if (feature === 'recurring') setIsRecurringOpen(true);
    if (feature === 'status') setIsStatusOpen(true);
    if (feature === 'template') setIsTemplateSelectorOpen(true);
    if (feature === 'team') setIsTeamOpen(true);
    if (feature === 'api') setIsApiOpen(true);
    if (feature === 'manager') setIsManagerOpen(true);
    if (feature === 'history') setIsHistoryOpen(true);
  };

  const toggleFeature = (feature: string) => {
    if (activeFeature === feature) {
      closeAllFeatures();
    } else {
      openFeature(feature);
    }
  };

  const invoiceTemplates: InvoiceTemplateType[] = [
    {
      id: 'midnight-noir',
      name: 'Midnight Noir',
      description: 'Bold dark header with gold accents. Ideal for luxury brands.',
      category: 'professional',
      color: '#1a1a2e',
      accent: '#c8a45e',
      font: 'serif',
      isPremium: false,
      preview: '',
      styleOverrides: { templateIndex: '0' }
    },
    {
      id: 'ocean-depths',
      name: 'Ocean Depths',
      description: 'Deep teal gradient. Great for consultancies.',
      category: 'professional',
      color: '#0a3d62',
      accent: '#1289A7',
      font: 'modern',
      isPremium: true,
      preview: '',
      styleOverrides: { templateIndex: '1' }
    },
    {
      id: 'crimson-edge',
      name: 'Crimson Edge',
      description: 'Sharp burgundy with clean lines. Perfect for legal and finance.',
      category: 'professional',
      color: '#6F1E1E',
      accent: '#B33939',
      font: 'serif',
      isPremium: true,
      preview: '',
      styleOverrides: { templateIndex: '2' }
    },
    {
      id: 'forest-estate',
      name: 'Forest Estate',
      description: 'Rich forest green with warm cream. Suited for organic brands.',
      category: 'retail',
      color: '#1B4332',
      accent: '#2D6A4F',
      font: 'sans',
      isPremium: true,
      preview: '',
      styleOverrides: { templateIndex: '3' }
    },
    {
      id: 'slate-copper',
      name: 'Slate & Copper',
      description: 'Cool slate gray paired with warm copper accents. Modern industrial.',
      category: 'creative',
      color: '#2d3436',
      accent: '#b87333',
      font: 'sans',
      isPremium: true,
      preview: '',
      styleOverrides: { templateIndex: '4' }
    },
    {
      id: 'royal-indigo',
      name: 'Royal Indigo',
      description: 'Deep indigo with ivory. Commands authority for B2B invoices.',
      category: 'professional',
      color: '#1a1a4e',
      accent: '#3d3d8e',
      font: 'sans',
      isPremium: true,
      preview: '',
      styleOverrides: { templateIndex: '5' }
    },
    {
      id: 'charcoal-ember',
      name: 'Charcoal Ember',
      description: 'Dark charcoal base with fiery orange accent. Energetic and memorable.',
      category: 'it',
      color: '#2c2c2c',
      accent: '#e17055',
      font: 'modern',
      isPremium: true,
      preview: '',
      styleOverrides: { templateIndex: '6' }
    },
    {
      id: 'arctic-frost',
      name: 'Arctic Frost',
      description: 'Clean white with ice blue accent. Minimalist and ultra-modern.',
      category: 'minimal',
      color: '#ffffff',
      accent: '#0984e3',
      font: 'sans',
      isPremium: true,
      preview: '',
      styleOverrides: { templateIndex: '7' }
    },
    {
      id: 'sunset-terracotta',
      name: 'Sunset Terracotta',
      description: 'Warm terracotta and clay tones. Artisan feel for studios.',
      category: 'creative',
      color: '#A0522D',
      accent: '#CD853F',
      font: 'serif',
      isPremium: true,
      preview: '',
      styleOverrides: { templateIndex: '8' }
    },
    {
      id: 'obsidian-gold',
      name: 'Obsidian Gold',
      description: 'Pure black with opulent gold. Ultimate premium for luxury goods.',
      category: 'professional',
      color: '#0a0a0a',
      accent: '#d4a843',
      font: 'serif',
      isPremium: true,
      preview: '',
      styleOverrides: { templateIndex: '9' }
    },
    {
      id: 'emerald-silk',
      name: 'Emerald Silk',
      description: 'Lush emerald with silk-smooth gradients. Timeless elegance.',
      category: 'professional',
      color: '#064e3b',
      accent: '#10b981',
      font: 'serif',
      isPremium: true,
      preview: '',
      styleOverrides: { templateIndex: '10' }
    },
    {
      id: 'bronze-age',
      name: 'Bronze Age',
      description: 'Antiqued bronze with parchment cream. Historical gravitas.',
      category: 'professional',
      color: '#78350f',
      accent: '#b45309',
      font: 'serif',
      isPremium: true,
      preview: '',
      styleOverrides: { templateIndex: '11' }
    },
    {
      id: 'nordic-steel',
      name: 'Nordic Steel',
      description: 'Cool steel gray with icy highlights. Scandinavian minimalism.',
      category: 'minimal',
      color: '#1e293b',
      accent: '#64748b',
      font: 'sans',
      isPremium: true,
      preview: '',
      styleOverrides: { templateIndex: '12' }
    },
    {
      id: 'plum-royale',
      name: 'Plum Royale',
      description: 'Deep plum with champagne accents. Sophisticated and regal.',
      category: 'professional',
      color: '#4a1d6a',
      accent: '#7c3aed',
      font: 'serif',
      isPremium: true,
      preview: '',
      styleOverrides: { templateIndex: '13' }
    },
    {
      id: 'sahara-sand',
      name: 'Sahara Sand',
      description: 'Warm sandy tones with desert-inspired palette. Earthy warmth.',
      category: 'retail',
      color: '#92400e',
      accent: '#d97706',
      font: 'serif',
      isPremium: true,
      preview: '',
      styleOverrides: { templateIndex: '14' }
    },
    {
      id: 'midnight-sapphire',
      name: 'Midnight Sapphire',
      description: 'Deep sapphire blue with silver. Corporate and refined.',
      category: 'professional',
      color: '#0f172a',
      accent: '#334155',
      font: 'sans',
      isPremium: true,
      preview: '',
      styleOverrides: { templateIndex: '15' }
    },
    {
      id: 'olive-branch',
      name: 'Olive Branch',
      description: 'Military olive with natural cream. Sturdy and dependable.',
      category: 'retail',
      color: '#365314',
      accent: '#4d7c0f',
      font: 'sans',
      isPremium: true,
      preview: '',
      styleOverrides: { templateIndex: '16' }
    },
    {
      id: 'rose-quartz',
      name: 'Rose Quartz',
      description: 'Soft dusty rose with charcoal. Modern feminine aesthetic.',
      category: 'creative',
      color: '#881337',
      accent: '#e11d48',
      font: 'serif',
      isPremium: true,
      preview: '',
      styleOverrides: { templateIndex: '17' }
    },
    {
      id: 'graphite-mint',
      name: 'Graphite Mint',
      description: 'Dark graphite with fresh mint green accent. Tech-forward.',
      category: 'it',
      color: '#18181b',
      accent: '#34d399',
      font: 'modern',
      isPremium: true,
      preview: '',
      styleOverrides: { templateIndex: '18' }
    },
    {
      id: 'saffron-heritage',
      name: 'Saffron Heritage',
      description: 'Indian saffron and marigold. Cultural pride and warmth.',
      category: 'professional',
      color: '#9a3412',
      accent: '#ea580c',
      font: 'serif',
      isPremium: true,
      preview: '',
      styleOverrides: { templateIndex: '19' }
    },
    {
      id: 'steel-blue-pro',
      name: 'Steel Blue Pro',
      description: 'Corporate steel blue. Professional and trustworthy.',
      category: 'professional',
      color: '#1e3a5f',
      accent: '#3b82f6',
      font: 'sans',
      isPremium: true,
      preview: '',
      styleOverrides: { templateIndex: '20' }
    },
    {
      id: 'copper-canyon',
      name: 'Copper Canyon',
      description: 'Burnt sienna and canyon reds. Warm American Southwest.',
      category: 'retail',
      color: '#7c2d12',
      accent: '#c2410c',
      font: 'serif',
      isPremium: true,
      preview: '',
      styleOverrides: { templateIndex: '21' }
    },
    {
      id: 'jade-dynasty',
      name: 'Jade Dynasty',
      description: 'Imperial jade green with gold. East Asian luxury influence.',
      category: 'professional',
      color: '#065f46',
      accent: '#059669',
      font: 'serif',
      isPremium: true,
      preview: '',
      styleOverrides: { templateIndex: '22' }
    },
    {
      id: 'slate-storm',
      name: 'Slate Storm',
      description: 'Dramatic dark slate with electric cyan bolt. Bold impact.',
      category: 'it',
      color: '#0f172a',
      accent: '#06b6d4',
      font: 'modern',
      isPremium: true,
      preview: '',
      styleOverrides: { templateIndex: '23' }
    },
    {
      id: 'vintage-cream',
      name: 'Vintage Cream',
      description: 'Parchment cream with sepia accents. Nostalgic and charming.',
      category: 'minimal',
      color: '#fefce8',
      accent: '#a16207',
      font: 'serif',
      isPremium: true,
      preview: '',
      styleOverrides: { templateIndex: '24' }
    },
    {
      id: 'neon-noir',
      name: 'Neon Noir',
      description: 'Dark base with neon lime accent. Edgy startup vibe.',
      category: 'it',
      color: '#0a0a0a',
      accent: '#84cc16',
      font: 'modern',
      isPremium: true,
      preview: '',
      styleOverrides: { templateIndex: '25' }
    },
    {
      id: 'pearl-ash',
      name: 'Pearl Ash',
      description: 'Soft ash gray with pearl white. Understated sophistication.',
      category: 'minimal',
      color: '#f5f5f4',
      accent: '#a8a29e',
      font: 'sans',
      isPremium: true,
      preview: '',
      styleOverrides: { templateIndex: '26' }
    },
    {
      id: 'wine-country',
      name: 'Wine Country',
      description: 'Deep wine with sage green. Refined and cultivated.',
      category: 'professional',
      color: '#4c1d95',
      accent: '#a78bfa',
      font: 'serif',
      isPremium: true,
      preview: '',
      styleOverrides: { templateIndex: '27' }
    },
    {
      id: 'carbon-flame',
      name: 'Carbon Flame',
      description: 'Carbon black with flame gradient. High-octane energy.',
      category: 'it',
      color: '#09090b',
      accent: '#f97316',
      font: 'modern',
      isPremium: true,
      preview: '',
      styleOverrides: { templateIndex: '28' }
    },
    {
      id: 'arctic-aurora',
      name: 'Arctic Aurora',
      description: 'Northern lights gradient. Ethereal and premium.',
      category: 'professional',
      color: '#0c1220',
      accent: '#6366f1',
      font: 'sans',
      isPremium: true,
      preview: '',
      styleOverrides: { templateIndex: '29' }
    }
  ];

  const [showPricingPage, setShowPricingPage] = useState(false);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(() => loadSubscription());

  // Payment flow state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentPlan, setSelectedPaymentPlan] = useState<SubscriptionPlan | null>(null);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [lastTransactionId, setLastTransactionId] = useState<string>('');
  const [showDemoCheckout, setShowDemoCheckout] = useState(false);
  const [demoUserDetails, setDemoUserDetails] = useState<{ name: string; email: string; phone: string } | null>(null);

  // Check if real Razorpay key is configured
  const hasRazorpayKey = !!(import.meta as any).env?.VITE_RAZORPAY_KEY && !(import.meta as any).env.VITE_RAZORPAY_KEY.includes('YOUR_KEY');

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Initialize session and sync status on mount
  useEffect(() => {
    // 1. Load seller details
    const savedSeller = localStorage.getItem(STORAGE_KEY);
    if (savedSeller) {
      try {
        const parsedSeller = JSON.parse(savedSeller);
        setData(prev => ({ ...prev, seller: { ...prev.seller, ...parsedSeller } }));
      } catch (e) {
        console.error('Failed to parse saved seller details');
      }
    }

    // 2. Sync Plan Tier with Subscription (Only if logged in)
    const sub = loadSubscription();
    setUserSubscription(sub);
    
    if (isLoggedIn && sub && isSubscriptionActive(sub) && sub.planType !== 'free') {
      setPlanTier(sub.planType as PlanTier);
    } else {
      setPlanTier('free');
    }

    // 3. Reset usage if month has changed (in case app was left open)
    const currentMonth = new Date().toISOString().slice(0, 7);
    if (usage.month !== currentMonth) {
      setUsage({ month: currentMonth, downloads: 0 });
    }
  }, []);

  // Save seller details to local storage whenever they change
  useEffect(() => {
    if (data.seller && Object.keys(data.seller).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.seller));
    }
  }, [data.seller]);

  // Handle dark mode toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setIsShareMenuOpen(false);
      }
      if (historyRef.current && !historyRef.current.contains(event.target as Node)) {
        setIsHistoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load invoice history from local storage
  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setInvoiceHistory(parsed);
      } catch (e) {
        console.error('Failed to parse invoice history');
      }
    }
  }, []);

  // Load saved clients
  useEffect(() => {
    const saved = localStorage.getItem(CLIENTS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setClients(Array.isArray(parsed) ? parsed : []);
      } catch {
        console.error('Failed to parse clients');
      }
    }
  }, []);

  // Load saved products
  useEffect(() => {
    const saved = localStorage.getItem(PRODUCTS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProducts(Array.isArray(parsed) ? parsed : []);
      } catch {
        console.error('Failed to parse products');
      }
    }
  }, []);

  // Load recurring templates
  useEffect(() => {
    const saved = localStorage.getItem('gst_invoice_recurring');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRecurringTemplates(Array.isArray(parsed) ? parsed : []);
      } catch {
        console.error('Failed to parse recurring templates');
      }
    }
  }, []);

  // Load invoice statuses
  useEffect(() => {
    const saved = localStorage.getItem('gst_invoice_statuses');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setInvoiceStatuses(Array.isArray(parsed) ? parsed : []);
      } catch {
        console.error('Failed to parse invoice statuses');
      }
    }
  }, []);

  // Check for due recurring invoices on load
  useEffect(() => {
    if (recurringTemplates.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const due = recurringTemplates.filter(t => t.isActive && t.nextDueDate <= today);
      if (due.length > 0 && !showLandingPage) {
        // Just a gentle notification in console for now, UI notification can be added later
        console.log(`${due.length} recurring invoices are due for generation!`);
      }
    }
  }, [recurringTemplates, showLandingPage]);

  // Set initial auto invoice number once
  useEffect(() => {
    if (!data.meta.invoiceNumber.trim()) {
      setData(prev => ({
        ...prev,
        meta: {
          ...prev.meta,
          invoiceNumber: getSuggestedInvoiceNumber(prev.meta.invoiceDate),
        },
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Function to save invoice to history
  const saveToHistory = (invoiceData: InvoiceData) => {
    const historyLimit = isPremium ? 200 : FREE_LIMITS.maxHistory;
    const record: InvoiceRecord = {
      id: crypto.randomUUID(),
      data: invoiceData,
      createdAt: new Date().toISOString(),
    };
    const updated = [record, ...invoiceHistory].slice(0, historyLimit);
    setInvoiceHistory(updated);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  };

  // Function to load invoice from history
  const loadFromHistory = (record: InvoiceRecord) => {
    setData(record.data);
    setIsHistoryOpen(false);
  };

  // Function to delete from history
  const deleteFromHistory = (id: string) => {
    const updated = invoiceHistory.filter(record => record.id !== id);
    setInvoiceHistory(updated);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  };

  useEffect(() => {
    localStorage.setItem(PLAN_KEY, planTier);
  }, [planTier]);

  useEffect(() => {
    localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
  }, [usage]);

  // ==================== PAYMENT FLOW HANDLERS ====================

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    if (plan.type === 'free') return;
    setSelectedPaymentPlan(plan);
    setPaymentError(null);
    setShowPaymentModal(true);
  };

  const handlePaymentInitiate = (userDetails: { name: string; email: string; phone: string }) => {
    if (!selectedPaymentPlan) return;

    setPaymentProcessing(true);
    setPaymentError(null);

    // Bypass Razorpay entirely: instantly activate plan free for 30 days
    setTimeout(() => {
      const mockTransactionId = `PAY-FREE-${Date.now().toString(36).toUpperCase()}`;
      handlePaymentComplete(
        mockTransactionId,
        `ORD-FREE-${Date.now().toString(36).toUpperCase()}`,
        'free_trial_signature',
        userDetails
      );
      setPaymentProcessing(false);
    }, 1000);
  };

  // Shared payment completion handler (used by both real Razorpay and demo checkout)
  const handlePaymentComplete = (
    paymentId: string,
    orderId: string,
    signature: string,
    userDetails: { name: string; email: string; phone: string }
  ) => {
    if (!selectedPaymentPlan) return;

    const transaction: PaymentTransaction = {
      id: paymentId,
      orderId,
      gateway: 'razorpay',
      gatewayPaymentId: paymentId,
      gatewaySignature: signature,
      planId: selectedPaymentPlan.id,
      amount: 0,
      currency: selectedPaymentPlan.currency,
      status: 'success',
      email: userDetails.email,
      phone: userDetails.phone,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    const now = new Date();
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days trial

    const subscription: UserSubscription = {
      id: `SUB-TRIAL-${Date.now().toString(36).toUpperCase()}`,
      planId: selectedPaymentPlan.id,
      planType: selectedPaymentPlan.type,
      status: 'trial',
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      paymentTransactionId: paymentId,
      autoRenewal: false,
      createdAt: now.toISOString(),
      lastPaymentDate: now.toISOString(),
      nextBillingDate: endDate.toISOString(),
      usage: {
        invoicesUsed: 0,
        clientsUsed: 0,
        templatesUsed: 0,
      },
    };

    saveSubscription(subscription);
    
    // Save transaction mock to local storage
    try {
      const saved = localStorage.getItem('gst_invoice_transactions');
      const transactions = saved ? JSON.parse(saved) : [];
      transactions.unshift(transaction);
      localStorage.setItem('gst_invoice_transactions', JSON.stringify(transactions.slice(0, 50)));
    } catch (e) {
      console.error(e);
    }

    // Update app state
    const planType = selectedPaymentPlan.type;
    setUserSubscription(subscription);
    setPlanTier(planType);
    setIsLoggedIn(true);
    localStorage.setItem('gstify_session', 'true');
    localStorage.setItem(PLAN_KEY, planType);
    setLastTransactionId(paymentId);

    // Close modals and show success
    setShowPaymentModal(false);
    setShowDemoCheckout(false);
    setPaymentProcessing(false);
    setShowPaymentSuccess(true);

    console.log('✅ Plan activated successfully (free trial):', { subscription, transaction });
  };

  const handlePaymentSuccessClose = () => {
    setShowPaymentSuccess(false);
    setSelectedPaymentPlan(null);
    setShowLandingPage(false); // Take user to the app
    setShowPricingPage(false);
  };

  const handlePaymentModalClose = () => {
    if (!paymentProcessing) {
      setShowPaymentModal(false);
      setSelectedPaymentPlan(null);
      setPaymentError(null);
    }
  };

  const saveCurrentBuyerAsClient = () => {
    if (!isPremium && clients.length >= FREE_LIMITS.maxClients) {
      alert(`Free plan limit reached: max ${FREE_LIMITS.maxClients} clients. Upgrade to Premium for unlimited clients.`);
      return;
    }
    if (!data.buyer.name.trim()) {
      alert('Client name required before saving');
      return;
    }
    const record: ClientRecord = {
      id: crypto.randomUUID(),
      name: data.buyer.name.trim(),
      address: data.buyer.address.trim(),
      state: data.buyer.state.trim(),
      gstin: data.buyer.gstin.trim().toUpperCase(),
      createdAt: new Date().toISOString(),
    };

    const deduped = clients.filter(
      c => !(c.name.toLowerCase() === record.name.toLowerCase() && c.gstin.toLowerCase() === record.gstin.toLowerCase())
    );
    const updated = [record, ...deduped].slice(0, 200);
    setClients(updated);
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(updated));
  };

  const loadClientIntoBuyer = (clientId: string) => {
    const selected = clients.find(c => c.id === clientId);
    if (!selected) return;
    setData(prev => ({
      ...prev,
      buyer: {
        name: selected.name,
        address: selected.address,
        state: selected.state,
        gstin: selected.gstin,
      },
    }));
  };

  const saveCurrentItemAsProduct = (itemId: string) => {
    if (!isPremium && products.length >= FREE_LIMITS.maxProducts) {
      alert(`Free plan limit reached: max ${FREE_LIMITS.maxProducts} products. Upgrade to Premium for unlimited products.`);
      return;
    }
    const item = data.items.find(i => i.id === itemId);
    if (!item || !item.description.trim()) {
      alert('Product description required before saving');
      return;
    }
    const product: ProductRecord = {
      id: crypto.randomUUID(),
      name: item.description.trim(),
      hsnSac: item.hsnSac.trim(),
      rate: item.rate,
      gstPercentage: item.gstPercentage,
      createdAt: new Date().toISOString(),
    };

    const deduped = products.filter(
      p => !(p.name.toLowerCase() === product.name.toLowerCase() && p.hsnSac === product.hsnSac && p.gstPercentage === product.gstPercentage)
    );
    const updated = [product, ...deduped].slice(0, 500);
    setProducts(updated);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated));
  };

  const applyProductToItem = (productId: string, itemId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    setData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId
          ? {
              ...item,
              description: product.name,
              hsnSac: product.hsnSac,
              rate: product.rate,
              gstPercentage: product.gstPercentage,
            }
          : item
      ),
    }));
  };

  const handleAutoInvoiceNumber = () => {
    const next = reserveNextInvoiceNumber(data.meta.invoiceDate);
    setData(prev => ({ ...prev, meta: { ...prev.meta, invoiceNumber: next } }));
  };

  const saveRecurringTemplate = (template: RecurringInvoiceTemplate) => {
    const existing = recurringTemplates.findIndex(t => t.id === template.id);
    let updated;
    if (existing >= 0) {
      updated = [...recurringTemplates];
      updated[existing] = template;
    } else {
      updated = [template, ...recurringTemplates];
    }
    setRecurringTemplates(updated);
    localStorage.setItem('gst_invoice_recurring', JSON.stringify(updated));
  };

  const deleteRecurringTemplate = (id: string) => {
    const updated = recurringTemplates.filter(t => t.id !== id);
    setRecurringTemplates(updated);
    localStorage.setItem('gst_invoice_recurring', JSON.stringify(updated));
  };

  const generateFromRecurring = (template: RecurringInvoiceTemplate) => {
    const today = new Date().toISOString().split('T')[0];
    const due = new Date();
    due.setDate(due.getDate() + 7);
    
    // Set the data into the editor
    setData({
      ...template.invoiceData,
      meta: {
        invoiceNumber: getSuggestedInvoiceNumber(today),
        invoiceDate: today,
        dueDate: due.toISOString().split('T')[0],
      }
    });
    
    setIsRecurringOpen(false);
    
    // Update the next due date for the template
    const getNextDate = (frequency: string, fromDate: string) => {
      const date = new Date(fromDate);
      if (frequency === 'monthly') date.setMonth(date.getMonth() + 1);
      else if (frequency === 'quarterly') date.setMonth(date.getMonth() + 3);
      else if (frequency === 'yearly') date.setFullYear(date.getFullYear() + 1);
      return date.toISOString().split('T')[0];
    };
    
    const updatedTemplate = {
      ...template,
      lastGeneratedDate: today,
      nextDueDate: getNextDate(template.frequency, template.nextDueDate <= today ? today : template.nextDueDate)
    };
    
    saveRecurringTemplate(updatedTemplate);
    alert(`Generated invoice from ${template.name}! Please review and save/download.`);
  };

  const updateInvoiceStatus = (invoiceId: string, status: string, notes?: string) => {
    const existing = invoiceStatuses.find(s => s.invoiceId === invoiceId);
    let updated;
    if (existing) {
      updated = invoiceStatuses.map(s => 
        s.invoiceId === invoiceId 
          ? { ...s, status, notes, updatedAt: new Date().toISOString() } 
          : s
      );
    } else {
      updated = [
        {
          id: crypto.randomUUID(),
          invoiceId,
          status,
          notes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        ...invoiceStatuses
      ];
    }
    setInvoiceStatuses(updated);
    localStorage.setItem('gst_invoice_statuses', JSON.stringify(updated));
  };

  const sendPaymentReminder = (invoiceId: string, method: 'whatsapp' | 'email') => {
    const invoice = invoiceHistory.find(i => i.id === invoiceId);
    if (!invoice) return;
    
    const total = invoice.data.items.reduce((acc, item) => acc + (item.quantity * item.rate * (1 + item.gstPercentage/100)), 0).toFixed(2);
    const dueDate = new Date(invoice.data.meta.dueDate);
    const isOverdue = dueDate < new Date();
    const days = Math.ceil((new Date().getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const message = `Hi ${invoice.data.buyer.name},\n\nThis is a friendly ${isOverdue ? 'reminder' : 'reminder'} that your invoice ${invoice.data.meta.invoiceNumber} for amount \u20B9${total} ${isOverdue ? `is now ${days} days overdue` : `is due on ${invoice.data.meta.dueDate}`}.\n\nPlease make payment at your earliest convenience.\n\nThank you,\n${invoice.data.seller.name}`;
    
    if (method === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    } else if (method === 'email') {
      window.open(`mailto:?subject=Reminder: Invoice ${invoice.data.meta.invoiceNumber}${isOverdue ? ' Overdue' : ''}&body=${encodeURIComponent(message)}`, '_blank');
    }
    
    updateInvoiceStatus(invoiceId, isOverdue ? 'overdue' : 'sent', `Reminder sent via ${method}`);
    alert(`Reminder opened in ${method}. Please send the message in the new window.`);
  };

  const generatePdfBlob = async (element: HTMLElement): Promise<{ blob: Blob, fileName: string }> => {
    try {
      // Create a clone to avoid modifying original
      const clonedElement = element.cloneNode(true) as HTMLElement;
      
      // Add temporary styles to handle color parsing issues
      const styleSheet = document.createElement('style');
      styleSheet.textContent = `
        * {
          color-space: srgb !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        html, body {
          background: white !important;
          color: #000 !important;
        }
        img {
          max-width: 100% !important;
          height: auto !important;
          display: block !important;
        }
      `;
      clonedElement.appendChild(styleSheet);
      
      // Recursively fix computed styles to avoid oklch which html2canvas doesn't support well
      const fixStyles = (el: Element) => {
        const style = window.getComputedStyle(el);
        const element = el as HTMLElement;
        
        const propertiesToFix: Array<{ css: string, inline: keyof CSSStyleDeclaration }> = [
          { css: 'color', inline: 'color' },
          { css: 'background-color', inline: 'backgroundColor' },
          { css: 'border-color', inline: 'borderColor' },
          { css: 'fill', inline: 'fill' },
          { css: 'stroke', inline: 'stroke' },
        ];

        propertiesToFix.forEach(({ css, inline }) => {
          const value = style.getPropertyValue(css);
          if (value && (value.includes('oklch') || value.includes('var('))) {
            // Replace with computed hex/rgb if possible, or fallback
            // html2canvas works better with explicit colors
            if (inline === 'color') element.style.color = value.includes('oklch') ? '#000000' : value;
            else if (inline === 'backgroundColor') element.style.backgroundColor = value.includes('oklch') ? '#ffffff' : value;
            else if (inline === 'borderColor') element.style.borderColor = value.includes('oklch') ? '#dddddd' : value;
          }
        });
        
        for (let i = 0; i < el.children.length; i++) {
          fixStyles(el.children[i]);
        }
      };
      
      // Temporarily add to DOM for rendering (hidden but layout-able)
      clonedElement.style.position = 'fixed';
      clonedElement.style.left = '-9999px';
      clonedElement.style.top = '0';
      clonedElement.style.width = '210mm'; // Standard A4 width
      clonedElement.style.visibility = 'visible'; // Must be visible for html2canvas
      document.body.appendChild(clonedElement);
      
      // Run fixStyles after appending so getComputedStyle works correctly
      fixStyles(clonedElement);
      
      try {
        const canvas = await html2canvas(clonedElement, { 
          scale: 2, 
          useCORS: true,
          logging: false,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: clonedElement.offsetWidth,
          height: clonedElement.offsetHeight,
          windowWidth: clonedElement.offsetWidth,
        });
        
        document.body.removeChild(clonedElement);
        
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        const fileName = `${data.meta.invoiceNumber || 'Invoice'}.pdf`;
        
        return { 
          blob: pdf.output('blob'),
          fileName 
        };
      } catch (canvasError) {
        if (clonedElement.parentNode) document.body.removeChild(clonedElement);
        throw canvasError;
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  };

  const handleDownload = async () => {
    try {
      if (!isPremium && usage.downloads >= FREE_LIMITS.monthlyDownloads) {
        alert(`Free plan monthly download limit (${FREE_LIMITS.monthlyDownloads}) reached. Upgrade to Premium for unlimited downloads.`);
        return;
      }

      // Validation
      const validation = validateInvoice(data);
      if (!validation.valid) {
        const firstFewErrors = Object.values(validation.errors).slice(0, 3).join('\n\u2022 ');
        alert(`\u274C Please fix validation errors:\n\u2022 ${firstFewErrors}`);
        return;
      }
      
      console.log('\u{1F4C4} Starting PDF generation...');
      
      if (!isPreview) {
        setIsPreview(true);
        // Wait for preview to render
        await new Promise(resolve => setTimeout(resolve, 600));
      }
      
      const element = document.getElementById('invoice-capture-area');
      if (!element) {
        alert('Invoice template not found. Please try again.');
        return;
      }
      
      const { blob, fileName } = await generatePdfBlob(element);
      
      // Save file
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
      
      console.log('\u2705 PDF downloaded successfully!');
      
      // Save to history
      const historyLimit = isPremium ? 200 : FREE_LIMITS.maxHistory;
      const record: InvoiceRecord = {
        id: crypto.randomUUID(),
        data,
        createdAt: new Date().toISOString(),
      };
      const nextHistory = [record, ...invoiceHistory].slice(0, historyLimit);
      setInvoiceHistory(nextHistory);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));

      setUsage(prev => ({ ...prev, downloads: prev.downloads + 1 }));
      
    } catch (error) {
      console.error('\u274C Download error:', error);
      alert(`\u274C Error downloading PDF: ${(error as Error).message}`);
    }
  };

  const handlePrint = async () => {
    if (!isPreview) {
      setIsPreview(true);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    window.print();
  };

  const handleShare = async (method: 'whatsapp' | 'email' | 'gmail' | 'native') => {
    setIsShareMenuOpen(false);
    
    if (!isPreview) {
      setIsPreview(true);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    const element = document.getElementById('invoice-capture-area');
    if (!element) return;

    try {
      if (method === 'native' && navigator.share) {
        const { blob, fileName } = await generatePdfBlob(element);
        const file = new File([blob], fileName, { type: 'application/pdf' });
        
        // Use canShare if available, otherwise just try sharing
        const shareData = {
          title: `Invoice ${data.meta.invoiceNumber}`,
          text: `Please find attached the invoice ${data.meta.invoiceNumber}.`,
          files: [file]
        };

        if (navigator.canShare && navigator.canShare(shareData)) {
          await navigator.share(shareData);
          return;
        } else if (!navigator.canShare) {
          // Fallback share if canShare is not available but share is
          await navigator.share(shareData);
          return;
        }
      }
      
      // Fallback for WhatsApp/Email
      const totalAmount = data.items.reduce((acc, item) => acc + (item.quantity * item.rate * (1 + item.gstPercentage/100)), 0).toFixed(2);
      const text = `Hello, please find the details for Invoice ${data.meta.invoiceNumber} for amount Rs. ${totalAmount}.\n\nThank you!`;
      
      if (method === 'whatsapp') {
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      } else if (method === 'email') {
        window.open(`mailto:?subject=Invoice ${data.meta.invoiceNumber}&body=${encodeURIComponent(text)}`, '_blank');
      } else if (method === 'gmail') {
        // Gmail compose window - user can manually attach PDF if needed
        const gmailSubject = `Invoice ${data.meta.invoiceNumber} - ${data.seller.name}`;
        const gmailBody = `Dear,\n\nPlease find attached the invoice ${data.meta.invoiceNumber}.\n\nInvoice Details:\n- Date: ${data.meta.invoiceDate}\n- Amount: Rs. ${totalAmount}\n- From: ${data.seller.name}\n\nThank you!`;
        
        window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=&subject=${encodeURIComponent(gmailSubject)}&body=${encodeURIComponent(gmailBody)}`, '_blank');
      } else {
        alert("Your browser doesn't support direct file sharing. You can download the PDF and share it manually.");
      }
    } catch (err) {
      console.error("Error sharing:", err);
      alert('Error preparing share. Please try again.');
    }
  };

  return (
    <>
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 flex flex-col">

      {showLandingPage ? (
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
                  \u1F680 Launching Limited-Time Free Tier for Solo Creators
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
                <div className="absolute top-5 right-6 text-6xl font-serif text-amber-500/10">â€</div>
                <div className="text-amber-500 mb-5 text-lg">â˜…â˜…â˜…â˜…â˜…</div>
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
                <div className="absolute top-5 right-6 text-6xl font-serif text-amber-500/10">â€</div>
                <div className="text-amber-500 mb-5 text-lg">â˜…â˜…â˜…â˜…â˜…</div>
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
                <div className="absolute top-5 right-6 text-6xl font-serif text-amber-500/10">â€</div>
                <div className="text-amber-500 mb-5 text-lg">â˜…â˜…â˜…â˜…â˜…</div>
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
                <div className="absolute top-5 right-6 text-6xl font-serif text-amber-500/10">â€</div>
                <div className="text-amber-500 mb-5 text-lg">â˜…â˜…â˜…â˜…â˜…</div>
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
                <div className="absolute top-5 right-6 text-6xl font-serif text-amber-500/10">â€</div>
                <div className="text-amber-500 mb-5 text-lg">â˜…â˜…â˜…â˜…â˜†</div>
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
                <div className="absolute top-5 right-6 text-6xl font-serif text-amber-500/10">â€</div>
                <div className="text-amber-500 mb-5 text-lg">â˜…â˜…â˜…â˜…â˜…</div>
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
                <div className="text-4xl font-bold font-[Playfair_Display] mb-2">{'\u20B9'}0</div>
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
                    if (!isLoggedIn) setPlanTier('free');
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
              <p className="text-slate-500 dark:text-slate-400 text-sm">{'\u00A9'} 2025 GSTify Inc. All rights reserved. Made with {'\u2764\uFE0F'} in India.</p>
            </div>
          </footer>
        </main>
      ) : (
        <>
          {/* Top Navigation Bar - Hidden when printing */}
          <nav className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 print:hidden transition-colors duration-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[4rem] py-2 flex items-center justify-between flex-wrap gap-y-3">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setShowLandingPage(true)}
                  className="flex items-center gap-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-amber-500 transition-colors text-sm font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                  Home
                </button>
                <div 
                  className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setShowLandingPage(true)}
                  title="Back to Landing Page"
                >
                <svg viewBox="0 0 200 50" height="32" className="drop-shadow-sm">
                  <defs>
                    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#d4af37" stopOpacity="1" />
                      <stop offset="50%" stopColor="#f3e5ab" stopOpacity="1" />
                      <stop offset="100%" stopColor="#c5a028" stopOpacity="1" />
                    </linearGradient>
                    <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#0f172a" stopOpacity="1" />
                      <stop offset="100%" stopColor="#334155" stopOpacity="1" />
                    </linearGradient>
                  </defs>
                  <g transform="translate(0, 2) scale(0.45)">
                    <path d="M20,0 L70,0 L90,20 L90,90 Q90,100 80,100 L20,100 Q10,100 10,90 L10,10 Q10,0 20,0 Z" className="fill-slate-200 dark:fill-slate-700" />
                    <path d="M70,0 L70,20 L90,20" className="fill-slate-300 dark:fill-slate-600" opacity="0.5"/>
                    <path d="M50,35 C35,35 25,45 25,55 C25,75 50,90 50,90 C50,90 75,75 75,55 C75,45 65,35 50,35 Z" fill="url(#goldGradient)" />
                    <text x="50" y="68" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="32" fill="white" textAnchor="middle">{'\u20B9'}</text>
                    <circle cx="85" cy="15" r="12" fill="#10b981" stroke="white" strokeWidth="2"/>
                    <path d="M79,15 L83,19 L91,11" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </g>
                  <text x="55" y="32" fontFamily="'Playfair Display', serif" fontWeight="700" fontSize="26" className="fill-slate-900 dark:fill-white" letterSpacing="-0.5">
                    GSTify
                  </text>
                  <text x="56" y="43" fontFamily="'Outfit', sans-serif" fontWeight="500" fontSize="8" className="fill-slate-500 dark:fill-slate-400" letterSpacing="1.2">
                    INVOICE GENERATOR
                  </text>
                </svg>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2.5 ml-auto px-2 sm:px-4 flex-wrap">
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="flex-shrink-0 p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-200 hover:scale-105"
                  aria-label="Toggle Dark Mode"
                >
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {isPreview ? (
                  <button
                    onClick={() => setIsPreview(false)}
                    className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all duration-200 hover:scale-105 print:hidden shadow-sm"
                  >
                    <Edit2 size={16} /> 
                    <span className="hidden sm:inline">Back to Edit</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsPreview(true)}
                    className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 hover:scale-105 shadow-sm"
                  >
                    <Eye size={16} /> 
                    <span className="hidden sm:inline">Preview</span>
                  </button>
                )}
                
                <button
                  onClick={handlePrint}
                  className="hidden sm:flex flex-shrink-0 items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 hover:scale-105 print:hidden shadow-sm"
                >
                  <Printer size={16} /> 
                  <span>Print</span>
                </button>

                <button
                  onClick={() => toggleFeature('recurring')}
                  className={`flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 shadow-sm ${
                    activeFeature === 'recurring'
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 ring-2 ring-indigo-500'
                      : 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span className="hidden lg:inline">Recurring</span>
                  {recurringTemplates.some(t => t.isActive && t.nextDueDate <= new Date().toISOString().split('T')[0]) && (
                    <span className="flex h-2 w-2 relative -ml-1 -mt-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  )}
                </button>

                <button
                  onClick={() => toggleFeature('status')}
                  className={`flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 shadow-sm ${
                    activeFeature === 'status'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300 ring-2 ring-amber-500'
                      : 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-800 hover:bg-amber-100'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span className="hidden lg:inline">Status</span>
                </button>

                <button
                  onClick={() => toggleFeature('template')}
                  className={`flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 shadow-sm ${
                    activeFeature === 'template'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300 ring-2 ring-purple-500'
                      : 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/40 border border-purple-200 dark:border-purple-800 hover:bg-purple-100'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
                  <span className="hidden lg:inline">Template</span>
                </button>

                {planTier === 'enterprise' && (
                  <>
                    <button
                      onClick={() => toggleFeature('team')}
                      className={`flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 shadow-sm ${
                        activeFeature === 'team'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 ring-2 ring-emerald-500'
                          : 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                      }`}
                    >
                      <Users size={16} />
                      <span className="hidden lg:inline">Team</span>
                    </button>
                    <button
                      onClick={() => toggleFeature('api')}
                      className={`flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 shadow-sm ${
                        activeFeature === 'api'
                          ? 'bg-slate-100 text-slate-700 dark:bg-slate-900/60 dark:text-slate-300 ring-2 ring-slate-500'
                          : 'text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Terminal size={16} />
                      <span className="hidden md:inline">API</span>
                    </button>
                  </>
                )}

                <div className="relative" ref={historyRef}>
                  <button
                    onClick={() => toggleFeature('history')}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors relative ${
                      activeFeature === 'history'
                        ? 'bg-slate-100 text-slate-700 dark:bg-slate-900/60 dark:text-slate-300 ring-2 ring-slate-500 animate-pulse'
                        : 'text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <History size={16} /> <span className="hidden sm:inline">History</span>
                    {invoiceHistory.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {invoiceHistory.length}
                      </span>
                    )}
                  </button>
                  {activeFeature === 'history' && (
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 z-50 max-h-96 overflow-y-auto">
                      {invoiceHistory.length === 0 ? (
                        <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">
                          No invoice history yet. Download an invoice to save it to history.
                        </div>
                      ) : (
                        <div className="py-1">
                          {invoiceHistory.map((record) => (
                            <div key={record.id} className="flex items-center justify-between px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700 last:border-b-0">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                                  {record.data.meta.invoiceNumber}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {new Date(record.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 ml-2">
                                <button
                                  onClick={() => loadFromHistory(record)}
                                  className="p-1 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-600 rounded transition-colors"
                                  title="Load this invoice"
                                >
                                  <Copy size={14} />
                                </button>
                                <button
                                  onClick={() => deleteFromHistory(record.id)}
                                  className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-slate-600 rounded transition-colors"
                                  title="Delete this invoice"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="hidden md:flex flex-shrink-0 items-center gap-2 px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-600 text-xs">
                  {isPremium ? (
                    <span className="font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      {'\u2728'} {userSubscription?.planType === 'enterprise' ? 'Enterprise' : 'PRO'}
                      {userSubscription && (
                        <span className="text-slate-400 dark:text-slate-500 font-normal normal-case ml-1">
                          {getSubscriptionDaysRemaining(userSubscription)}d left
                        </span>
                      )}
                    </span>
                  ) : (
                    <>
                      <span className="font-semibold uppercase tracking-wide">FREE</span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {usage.downloads}/{FREE_LIMITS.monthlyDownloads} downloads
                      </span>
                      <button
                        onClick={() => handlePlanSelect(SUBSCRIPTION_PLANS.find(p => p.type === 'pro')!)}
                        className="px-2 py-1 rounded bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold hover:from-indigo-600 hover:to-blue-600 transition-all"
                      >
                        {'\u26A1'} Upgrade
                      </button>
                    </>
                  )}
                </div>


                <div className="relative" ref={shareMenuRef}>
                  <button
                    onClick={() => setIsShareMenuOpen(!isShareMenuOpen)}
                    className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 hover:scale-105 print:hidden shadow-sm"
                  >
                    <Share2 size={16} /> <span className="hidden sm:inline">Share</span>
                  </button>
                  {isShareMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 z-50 py-1">
                      <button onClick={() => handleShare('whatsapp')} className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                        <MessageCircle size={16} className="text-green-500" /> WhatsApp
                      </button>
                      <button onClick={() => handleShare('gmail')} className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                        <Mail size={16} className="text-red-500" /> Gmail (Web)
                      </button>
                      <button onClick={() => handleShare('email')} className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                        <Mail size={16} className="text-blue-500" /> Email
                      </button>
                      <button onClick={() => handleShare('native')} className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                        <Share2 size={16} className="text-indigo-500" /> More Options
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleDownload}
                  className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-1.5 sm:py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition-all duration-200 hover:scale-105 print:hidden shadow-md"
                >
                  <Download size={16} /> 
                  <span className="hidden sm:inline">Download PDF</span>
                </button>
              </div>
            </div>
          </nav>

      <main className="p-4 sm:p-8">
        {isPreview ? (
          <div id="invoice-capture-area" className="print:m-0 print:p-0">
            {isPremium ? (
              <InvoiceTemplatePremium data={data} template={invoiceTemplates.find(t => t.id === selectedTemplate)} />
            ) : (
              <InvoiceTemplate data={data} showWatermark={true} />
            )}
          </div>
        ) : (
          <div className="print:hidden">
            <div className="max-w-5xl mx-auto mb-6">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create Invoice</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Fill in the details below. Seller details are automatically saved to your browser.</p>
            </div>
            {Object.keys(validationErrors).length > 0 && (
              <div className="max-w-5xl mx-auto mb-4 rounded-md border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                <p className="font-semibold mb-1">Please fix these issues:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {Object.entries(validationErrors).slice(0, 8).map(([key, value]) => (
                    <li key={key}>{value}</li>
                  ))}
                </ul>
              </div>
            )}
            {/* Sections with state persistence */}
            <div className={!isRecurringOpen ? 'hidden' : ''}>
              <div className="mt-6 max-w-5xl mx-auto">
                <RecurringInvoices 
                  templates={recurringTemplates}
                  clients={clients}
                  onSave={saveRecurringTemplate}
                  onDelete={deleteRecurringTemplate}
                  onGenerate={generateFromRecurring}
                  isPremium={isPremium}
                  onClose={() => setIsRecurringOpen(false)}
                  currentInvoiceData={data}
                />
              </div>
            </div>

            <div className={!isStatusOpen ? 'hidden' : ''}>
              <div className="mt-6 max-w-5xl mx-auto">
                <InvoiceStatusTracker
                  statuses={invoiceStatuses}
                  history={invoiceHistory}
                  onUpdateStatus={updateInvoiceStatus}
                  onSendReminder={sendPaymentReminder}
                  isPremium={isPremium}
                  onClose={() => setIsStatusOpen(false)}
                />
              </div>
            </div>

            <div className={!isTemplateSelectorOpen ? 'hidden' : ''}>
              <div className="mt-6 max-w-5xl mx-auto">
                <TemplateSelector
                  templates={invoiceTemplates}
                  selectedTemplate={selectedTemplate}
                  onSelectTemplate={(id) => {
                    setSelectedTemplate(id);
                    setIsTemplateSelectorOpen(false);
                  }}
                  isPremium={isPremium}
                  onClose={() => setIsTemplateSelectorOpen(false)}
                />
              </div>
            </div>

            <div className={!isTeamOpen ? 'hidden' : ''}>
              <div className="mt-6 max-w-5xl mx-auto">
                <div className="mb-4">
                  <button 
                    onClick={() => setIsTeamOpen(false)}
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    {'\u2190'} Back to Editor
                  </button>
                </div>
                <TeamManagement />
              </div>
            </div>

            <div className={!isApiOpen ? 'hidden' : ''}>
              <div className="mt-6 max-w-5xl mx-auto">
                <div className="mb-4">
                  <button 
                    onClick={() => setIsApiOpen(false)}
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    {'\u2190'} Back to Editor
                  </button>
                </div>
                <ApiManagement />
              </div>
            </div>

            {/* Main Editor View - Hidden when a major secondary view is open */}
            <div className={isRecurringOpen || isStatusOpen || isTemplateSelectorOpen || isTeamOpen || isApiOpen ? 'hidden' : ''}>
              <div className="max-w-5xl mx-auto space-y-8">
                {planTier === 'enterprise' && (
                  <AccountManager />
                )}
                <InvoiceEditor
                  data={data}
                  onChange={setData}
                  clients={clients}
                  products={products}
                  onSaveClient={saveCurrentBuyerAsClient}
                  onSelectClient={loadClientIntoBuyer}
                  onSaveProduct={saveCurrentItemAsProduct}
                  onApplyProduct={applyProductToItem}
                  onAutoGenerateInvoiceNumber={handleAutoInvoiceNumber}
                />
              </div>
            </div>
          </div>
        )}
      </main>
         </>
      )}

      {/* ==================== PAYMENT MODALS ==================== */}
      
      {/* Payment Details Modal */}
      {showPaymentModal && selectedPaymentPlan && (
        <PaymentModal
          plan={selectedPaymentPlan}
          onClose={handlePaymentModalClose}
          onPaymentInitiate={handlePaymentInitiate}
          isProcessing={paymentProcessing}
          error={paymentError}
        />
      )}

      {/* Demo Payment Checkout (when no Razorpay key) */}
      {showDemoCheckout && selectedPaymentPlan && demoUserDetails && (
        <DemoPaymentCheckout
          amount={Math.round(selectedPaymentPlan.price * 1.18 * 100)}
          currency={selectedPaymentPlan.currency}
          planName={selectedPaymentPlan.name}
          userName={demoUserDetails.name}
          userEmail={demoUserDetails.email}
          userPhone={demoUserDetails.phone}
          onSuccess={(paymentId, orderId, signature) => {
            handlePaymentComplete(paymentId, orderId, signature, demoUserDetails);
          }}
          onError={(error) => {
            setShowDemoCheckout(false);
            setShowPaymentModal(true);
            setPaymentError(error.message);
          }}
          onClose={() => {
            setShowDemoCheckout(false);
            setDemoUserDetails(null);
          }}
        />
      )}

      {/* Payment Success Modal */}
      {showPaymentSuccess && selectedPaymentPlan && userSubscription && (
        <PaymentSuccess
          subscription={userSubscription}
          plan={selectedPaymentPlan}
          transactionId={lastTransactionId}
          onContinue={handlePaymentSuccessClose}
        />
      )}

      {isAuthOpen && (
        <AuthModal
          onClose={() => setIsAuthOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
    </>
  );
}

