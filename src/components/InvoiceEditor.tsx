import React, { ChangeEvent, useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Upload, Search, X } from 'lucide-react';
import { ClientRecord, InvoiceData, InvoiceItem, ProductRecord } from '../types';

interface Props {
  data: InvoiceData;
  onChange: (data: InvoiceData) => void;
  clients: ClientRecord[];
  products: ProductRecord[];
  onSaveClient: () => void;
  onSelectClient: (clientId: string) => void;
  onSaveProduct: (itemId: string) => void;
  onApplyProduct: (productId: string, itemId: string) => void;
  onAutoGenerateInvoiceNumber: () => void;
}

const INDIAN_BANKS = [
  // Major Banks
  'State Bank of India (SBI)',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'IndusInd Bank',
  
  // Public Sector Banks
  'Union Bank of India',
  'Bank of Baroda',
  'Canara Bank',
  'Punjab National Bank',
  'Bank of India',
  'Central Bank of India',
  'Indian Bank',
  'IDBI Bank',
  'Bank of Maharashtra',
  'Dena Bank',
  
  // Private Banks
  'Yes Bank',
  'Federal Bank',
  'RBL Bank',
  'Bandhan Bank',
  'South Indian Bank',
  'Ratnakar Bank',
  'Karur Vysya Bank',
  'Jammu & Kashmir Bank',
  'Uttarakhand Gramin Bank',
  
  // Small Finance Banks
  'AU Small Finance Bank',
  'Ujjivan Small Finance Bank',
  'Capital Small Finance Bank',
  'ESAF Small Finance Bank',
  
  // Payments & Digital Banks
  'Paytm Payments Bank',
  'Airtel Payments Bank',
  'Amazon Pay',
  
  // Fintech & Digital Banks
  'Niyo',
  'Fampay',
  'Instapay',
  'OneFC',
  
  // Online Trading & Brokers
  'Zerodha',
  'Groww',
  'Upstox',
  'Angel One',
  'ICICI Direct',
  'HDFC Securities',
  'Yes Securities',
  
  // NBFCs & Financial Companies
  'Bajaj Finance',
  'Mahindra Finance',
  'TATA Capital',
  'Shriram Finance',
  
  // Regional & Cooperative Banks
  'Saraswat Bank',
  'TMREIS Cooperative',
  'Punjab State Cooperative Bank',
  
  'Other',
];

export const InvoiceEditor: React.FC<Props> = ({
  data,
  onChange,
  clients,
  products,
  onSaveClient,
  onSelectClient,
  onSaveProduct,
  onApplyProduct,
  onAutoGenerateInvoiceNumber,
}) => {
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  const [bankSearchText, setBankSearchText] = useState('');
  const [dropdownOpenDirection, setDropdownOpenDirection] = useState<'down' | 'up'>('down');
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [showIfscCode, setShowIfscCode] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsBankDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isBankDropdownOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isBankDropdownOpen]);

  // Handle dropdown toggle with smart positioning based on available space
  const handleDropdownToggle = () => {
    if (!isBankDropdownOpen && dropdownRef.current) {
      const button = dropdownRef.current.querySelector('button');
      if (button) {
        const rect = button.getBoundingClientRect();
        const dropdownHeight = 340; // max-h-80 is approximately 340px
        
        // Calculate space above and below
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        
        // If not enough space below but enough space above, open upward
        if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
          setDropdownOpenDirection('up');
        } else {
          setDropdownOpenDirection('down');
        }
      }
    }
    setIsBankDropdownOpen(!isBankDropdownOpen);
  };

  const filteredBanks = INDIAN_BANKS.filter(bank =>
    bank.toLowerCase().includes(bankSearchText.toLowerCase())
  );

  const handleBankSelect = (bank: string) => {
    onChange({ ...data, seller: { ...data.seller, bankName: bank } });
    setIsBankDropdownOpen(false);
    setBankSearchText('');
  };

  const handleSellerChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({ ...data, seller: { ...data.seller, [name]: value } });
  };

  // Mask account number - show only last 4 digits
  const maskAccountNumber = (accountNumber: string) => {
    if (!accountNumber) return '';
    if (accountNumber.length <= 4) return accountNumber;
    return '*'.repeat(accountNumber.length - 4) + accountNumber.slice(-4);
  };

  // Mask IFSC code - show only last 2 characters
  const maskIfscCode = (ifscCode: string) => {
    if (!ifscCode) return '';
    if (ifscCode.length <= 2) return ifscCode;
    return '*'.repeat(ifscCode.length - 2) + ifscCode.slice(-2);
  };

  const handleBuyerChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({ ...data, buyer: { ...data.buyer, [name]: value } });
  };

  const handleMetaChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ ...data, meta: { ...data.meta, [name]: value } });
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: string | number) => {
    const newItems = data.items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    );
    onChange({ ...data, items: newItems });
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: crypto.randomUUID(),
      description: '',
      hsnSac: '',
      quantity: 1,
      rate: 0,
      gstPercentage: 18,
    };
    onChange({ ...data, items: [...data.items, newItem] });
  };

  const removeItem = (id: string) => {
    onChange({ ...data, items: data.items.filter(item => item.id !== id) });
  };

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ ...data, seller: { ...data.seller, logo: reader.result as string } });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ ...data, seller: { ...data.seller, signature: reader.result as string } });
      };
      reader.readAsDataURL(file);
    }
  };

  const inputClasses = "w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors";
  const labelClasses = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";
  const cardClasses = "bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors duration-200";
  const headingClasses = "text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4";

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      
      {/* Seller & Meta Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className={cardClasses}>
          <h2 className={`${headingClasses} flex items-center justify-between`}>
            Seller Details
            <label className="cursor-pointer text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1">
              <Upload size={16} />
              Upload Logo
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </label>
          </h2>
          <div className="space-y-4">
            {data.seller.logo && (
              <div className="relative w-24 h-24 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900">
                <img src={data.seller.logo} alt="Logo" className="w-full h-full object-contain" />
                <button 
                  onClick={() => onChange({ ...data, seller: { ...data.seller, logo: undefined } })}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}
            <div>
              <label className={labelClasses}>Business Name</label>
              <input type="text" name="name" value={data.seller.name} onChange={handleSellerChange} className={inputClasses} placeholder="Your Company Name" />
            </div>
            <div>
              <label className={labelClasses}>Address</label>
              <textarea name="address" value={data.seller.address} onChange={handleSellerChange} rows={2} className={inputClasses} placeholder="Full Address"></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>Email</label>
                <input type="email" name="email" value={data.seller.email} onChange={handleSellerChange} className={inputClasses} placeholder="Email" />
              </div>
              <div>
                <label className={labelClasses}>Phone</label>
                <input type="text" name="phone" value={data.seller.phone} onChange={handleSellerChange} className={inputClasses} placeholder="Phone Number" />
              </div>
            </div>
            <div>
              <label className={labelClasses}>GSTIN</label>
              <input type="text" name="gstin" value={data.seller.gstin} onChange={handleSellerChange} className={`${inputClasses} uppercase`} placeholder="22AAAAA0000A1Z5" />
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 mt-4">
              <div className="flex items-center justify-between mb-4">
                <label className={labelClasses}>Authorized Signature</label>
                <label className="cursor-pointer text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1">
                  <Upload size={16} />
                  Upload Signature
                  <input type="file" accept="image/*" className="hidden" onChange={handleSignatureUpload} />
                </label>
              </div>
              {data.seller.signature && (
                <div className="relative w-40 h-20 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900">
                  <img src={data.seller.signature} alt="Signature" className="w-full h-full object-contain" />
                  <button 
                    onClick={() => onChange({ ...data, seller: { ...data.seller, signature: undefined } })}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 mt-4">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">Payment Method (Optional)</h3>
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => onChange({ ...data, seller: { ...data.seller, paymentMethod: 'none' } })}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${data.seller.paymentMethod === 'none' || !data.seller.paymentMethod ? 'bg-slate-300 dark:bg-slate-600 text-slate-900 dark:text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                >
                  None
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ ...data, seller: { ...data.seller, paymentMethod: 'bank' } })}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${data.seller.paymentMethod === 'bank' ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                >
                  Bank Transfer
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ ...data, seller: { ...data.seller, paymentMethod: 'upi' } })}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${data.seller.paymentMethod === 'upi' ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                >
                  UPI
                </button>
              </div>

              {data.seller.paymentMethod === 'bank' && (
                <div className="space-y-3">
                  <div ref={dropdownRef} className="relative">
                    <label className={labelClasses}>Bank Name</label>
                    <button
                      type="button"
                      onClick={handleDropdownToggle}
                      className={`${inputClasses} w-full text-left flex items-center justify-between bg-white dark:bg-slate-900`}
                    >
                      <span className={data.seller.bankName ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500'}>
                        {data.seller.bankName || 'Select a Bank'}
                      </span>
                      <span className={`text-slate-400 transition-transform duration-200 ${isBankDropdownOpen ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </button>

                    {isBankDropdownOpen && (
                      <div className={`absolute left-0 right-0 ${dropdownOpenDirection === 'down' ? 'top-full mt-1' : 'bottom-full mb-1'} bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-lg z-50`}>
                        {/* Search Input */}
                        <div className="sticky top-0 p-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                          <div className="relative flex items-center">
                            <Search size={16} className="absolute left-3 text-slate-400" />
                            <input
                              ref={searchInputRef}
                              type="text"
                              placeholder="Search banks..."
                              value={bankSearchText}
                              onChange={(e) => setBankSearchText(e.target.value)}
                              className="w-full pl-9 pr-8 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                            />
                            {bankSearchText && (
                              <button
                                type="button"
                                onClick={() => setBankSearchText('')}
                                className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Bank List */}
                        <div className="max-h-80 overflow-y-auto">
                          {/* Select a Bank Option - Always visible */}
                          <button
                            type="button"
                            onClick={() => {
                              onChange({ ...data, seller: { ...data.seller, bankName: '' } });
                              setIsBankDropdownOpen(false);
                              setBankSearchText('');
                            }}
                            className={`w-full text-left px-4 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border-b border-slate-100 dark:border-slate-700 transition-colors ${
                              !data.seller.bankName
                                ? 'bg-indigo-100 dark:bg-indigo-900/50 font-semibold text-indigo-700 dark:text-indigo-300'
                                : 'text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>Select a Bank</span>
                              {!data.seller.bankName && (
                                <span className="text-indigo-600 dark:text-indigo-400 font-bold">✓</span>
                              )}
                            </div>
                          </button>

                          {filteredBanks.length > 0 ? (
                            filteredBanks.map((bank) => (
                              <button
                                key={bank}
                                type="button"
                                onClick={() => handleBankSelect(bank)}
                                className={`w-full text-left px-4 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border-b border-slate-100 dark:border-slate-700 last:border-b-0 transition-colors ${
                                  data.seller.bankName === bank
                                    ? 'bg-indigo-100 dark:bg-indigo-900/50 font-semibold text-indigo-700 dark:text-indigo-300'
                                    : 'text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span>{bank}</span>
                                  {data.seller.bankName === bank && (
                                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">✓</span>
                                  )}
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                              <p>No banks found matching "{bankSearchText}"</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {data.seller.bankName === 'Other' && (
                    <div>
                      <label className={labelClasses}>Enter Bank Name</label>
                      <input 
                        type="text" 
                        value={data.seller.customBankName || ''} 
                        onChange={(e) => onChange({ ...data, seller: { ...data.seller, customBankName: e.target.value } })}
                        className={inputClasses} 
                        placeholder="Enter bank name" 
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClasses}>Account Number</label>
                      <div className="relative">
                        <input 
                          type={showAccountNumber ? 'text' : 'password'} 
                          name="accountNumber" 
                          value={data.seller.accountNumber || ''} 
                          onChange={handleSellerChange} 
                          className={`${inputClasses} pr-10`} 
                          placeholder="Account Number" 
                          autoComplete="off"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAccountNumber(!showAccountNumber)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                          {showAccountNumber ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className={labelClasses}>IFSC Code</label>
                      <div className="relative">
                        <input 
                          type={showIfscCode ? 'text' : 'password'} 
                          name="ifscCode" 
                          value={data.seller.ifscCode || ''} 
                          onChange={handleSellerChange} 
                          className={`${inputClasses} uppercase pr-10`} 
                          placeholder="IFSC Code" 
                          autoComplete="off"
                        />
                        <button
                          type="button"
                          onClick={() => setShowIfscCode(!showIfscCode)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                          {showIfscCode ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {data.seller.paymentMethod === 'upi' && (
                <div>
                  <label className={labelClasses}>UPI ID</label>
                  <input type="text" name="upiId" value={data.seller.upiId || ''} onChange={handleSellerChange} className={inputClasses} placeholder="yourname@upi" />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Format: name@bank (e.g., john@okhdfcbank, abc@upi)</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className={cardClasses}>
            <h2 className={headingClasses}>Invoice Details</h2>
            <div className="space-y-4">
              <div>
                <label className={labelClasses}>Invoice Number</label>
                <div className="flex gap-2">
                  <input type="text" name="invoiceNumber" value={data.meta.invoiceNumber} onChange={handleMetaChange} className={inputClasses} placeholder="INV-2023-001" />
                  <button
                    type="button"
                    onClick={onAutoGenerateInvoiceNumber}
                    className="px-3 py-2 whitespace-nowrap rounded-md text-sm font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/70 transition-colors"
                  >
                    Auto
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>Invoice Date</label>
                  <input type="date" name="invoiceDate" value={data.meta.invoiceDate} onChange={handleMetaChange} className={inputClasses} />
                </div>
                <div>
                  <label className={labelClasses}>Due Date</label>
                  <input type="date" name="dueDate" value={data.meta.dueDate} onChange={handleMetaChange} className={inputClasses} />
                </div>
              </div>
            </div>
          </div>

          <div className={cardClasses}>
            <h2 className={headingClasses}>Billed To</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              <select
                className={`${inputClasses} max-w-xs`}
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) onSelectClient(e.target.value);
                }}
              >
                <option value="">Load saved client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} {client.gstin ? `(${client.gstin})` : ''}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={onSaveClient}
                className="px-3 py-2 rounded-md text-sm font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/70 transition-colors"
              >
                Save Client
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={labelClasses}>Client Name</label>
                <input type="text" name="name" value={data.buyer.name} onChange={handleBuyerChange} className={inputClasses} placeholder="Client Business Name" />
              </div>
              <div>
                <label className={labelClasses}>Address</label>
                <textarea name="address" value={data.buyer.address} onChange={handleBuyerChange} rows={2} className={inputClasses} placeholder="Client Address"></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>State</label>
                  <input type="text" name="state" value={data.buyer.state} onChange={handleBuyerChange} className={inputClasses} placeholder="e.g. Maharashtra" />
                </div>
                <div>
                  <label className={labelClasses}>GSTIN</label>
                  <input type="text" name="gstin" value={data.buyer.gstin} onChange={handleBuyerChange} className={`${inputClasses} uppercase`} placeholder="Client GSTIN" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tax Type Toggle */}
      <div className={`${cardClasses} flex items-center justify-between`}>
        <div>
          <h2 className={headingClasses}>Tax Type</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Select how GST should be calculated based on the state.</p>
        </div>
        <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${!data.isInterState ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
            onClick={() => onChange({ ...data, isInterState: false })}
          >
            Same State (CGST + SGST)
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${data.isInterState ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
            onClick={() => onChange({ ...data, isInterState: true })}
          >
            Different State (IGST)
          </button>
        </div>
      </div>

      {/* Items Table */}
      <div className={`${cardClasses} overflow-x-auto`}>
        <h2 className={headingClasses}>Items</h2>
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="text-left text-sm font-medium text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <th className="pb-3 pr-4 w-1/3">Item Description</th>
              <th className="pb-3 px-4 w-32">HSN/SAC</th>
              <th className="pb-3 px-4 w-24">Qty</th>
              <th className="pb-3 px-4 w-32">Rate</th>
              <th className="pb-3 px-4 w-24">GST %</th>
              <th className="pb-3 pl-4 w-32 text-right">Amount</th>
              <th className="pb-3 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {data.items.map((item) => (
              <tr key={item.id}>
                <td className="py-3 pr-4">
                  <input type="text" value={item.description} onChange={(e) => handleItemChange(item.id, 'description', e.target.value)} className={inputClasses} placeholder="Description" />
                  <div className="mt-2 flex gap-2">
                    <select
                      className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md text-xs bg-white dark:bg-slate-900"
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) onApplyProduct(e.target.value, item.id);
                      }}
                    >
                      <option value="">Apply saved product</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} | ₹{product.rate}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => onSaveProduct(item.id)}
                      className="px-2 py-1 rounded-md text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/70 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <input type="text" value={item.hsnSac} onChange={(e) => handleItemChange(item.id, 'hsnSac', e.target.value)} className={inputClasses} placeholder="Code" />
                </td>
                <td className="py-3 px-4">
                  <input type="number" min="1" value={item.quantity || ''} onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)} className={inputClasses} />
                </td>
                <td className="py-3 px-4">
                  <input type="number" min="0" step="0.01" value={item.rate || ''} onChange={(e) => handleItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)} className={inputClasses} />
                </td>
                <td className="py-3 px-4">
                  <select value={item.gstPercentage} onChange={(e) => handleItemChange(item.id, 'gstPercentage', parseFloat(e.target.value))} className={inputClasses}>
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                  </select>
                </td>
                <td className="py-3 pl-4 text-right font-medium text-slate-700 dark:text-slate-300">
                  {((item.quantity * item.rate) * (1 + item.gstPercentage / 100)).toFixed(2)}
                </td>
                <td className="py-3 pl-4 text-right">
                  <button onClick={() => removeItem(item.id)} className="text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400 p-2 transition-colors" disabled={data.items.length === 1}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={addItem} className="mt-4 flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-md transition-colors">
          <Plus size={16} /> Add New Item Row
        </button>
      </div>
    </div>
  );
};
