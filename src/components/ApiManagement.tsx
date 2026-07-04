import React, { useState, useEffect } from 'react';
import { Key, Copy, Check, Terminal, ExternalLink, RefreshCw } from 'lucide-react';
import type { ApiKey } from '../types';

const API_STORAGE_KEY = 'gst_invoice_api_keys';

const ApiManagement: React.FC = () => {
  const [keys, setKeys] = useState<ApiKey[]>(() => {
    const saved = localStorage.getItem(API_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(API_STORAGE_KEY, JSON.stringify(keys));
  }, [keys]);

  const generateKey = () => {
    const newKey: ApiKey = {
      id: crypto.randomUUID(),
      name: `Production Key ${keys.length + 1}`,
      key: `gst_${crypto.randomUUID().replace(/-/g, '')}`,
      createdAt: new Date().toISOString(),
      status: 'active'
    };
    setKeys([newKey, ...keys]);
  };

  const copyToClipboard = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const revokeKey = (id: string) => {
    setKeys(keys.map(k => k.id === id ? { ...k, status: 'revoked' as const } : k));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-[Playfair_Display]">API Access</h2>
          <p className="text-slate-500 dark:text-slate-400">Integrate GSTify with your own applications and workflows.</p>
        </div>
        <button 
          onClick={generateKey}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:shadow-lg transition-all"
        >
          <Key size={18} />
          Generate New Key
        </button>
      </div>

      <div className="grid gap-4">
        {keys.map(k => (
          <div key={k.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${k.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <h3 className="font-bold">{k.name}</h3>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-2">
                Created on {new Date(k.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 group relative">
              <code className="text-amber-600 dark:text-amber-400 font-mono text-sm break-all">
                {k.status === 'active' ? k.key : '••••••••••••••••••••••••••••••••'}
              </code>
              {k.status === 'active' && (
                <button 
                  onClick={() => copyToClipboard(k.key, k.id)}
                  className="ml-auto p-2 text-slate-400 hover:text-amber-500 transition-colors"
                >
                  {copiedKeyId === k.id ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                </button>
              )}
            </div>

            <div className="mt-4 flex items-center justify-end gap-4">
              {k.status === 'active' ? (
                <button 
                  onClick={() => revokeKey(k.id)}
                  className="text-xs text-red-500 font-bold uppercase tracking-wider hover:underline"
                >
                  Revoke Key
                </button>
              ) : (
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Revoked</span>
              )}
            </div>
          </div>
        ))}

        {keys.length === 0 && (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <Terminal size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">No API keys generated yet.</p>
          </div>
        )}
      </div>

      <div className="bg-slate-900 text-white rounded-2xl p-8 border border-white/10 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Terminal size={120} />
        </div>
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-white/10">
              <Terminal size={20} className="text-amber-400" />
            </div>
            <h3 className="text-xl font-bold">Quick Integration Guide</h3>
          </div>

          <p className="text-slate-400 mb-6 text-sm">Use your API key to generate invoices programmatically. All requests must be sent over HTTPS.</p>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Generate Invoice (cURL)</span>
                <span className="text-xs text-green-400 font-mono">POST /v1/invoices</span>
              </div>
              <pre className="bg-black/50 p-4 rounded-xl border border-white/10 text-xs font-mono text-slate-300 overflow-x-auto">
                {`curl -X POST https://api.gstify.com/v1/invoices \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "buyer": { "name": "Client Name", "gstin": "29ABCDE1234F1Z5" },
    "items": [{ "description": "Consulting", "rate": 5000, "qty": 1 }]
  }'`}
              </pre>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <button className="flex items-center gap-2 text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors">
              <ExternalLink size={16} />
              Full Documentation
            </button>
            <button className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors">
              <RefreshCw size={16} />
              WSDL / Swagger Specs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiManagement;
