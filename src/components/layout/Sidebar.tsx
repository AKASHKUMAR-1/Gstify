import { FilePlus2, Repeat, Activity, LayoutGrid, Users, Terminal, History, Moon, Sun, Sparkles, ChevronLeft, X } from 'lucide-react';
import { Logo } from './Logo';

export interface SidebarProps {
  activeFeature: string | null;
  onSelectEditor: () => void;
  onToggleFeature: (feature: string) => void;
  isEnterprise: boolean;
  isPremium: boolean;
  planLabel: string;
  daysRemaining?: number | null;
  usageDownloads: number;
  freeLimit: number;
  onUpgrade: () => void;
  isDarkMode: boolean;
  onToggleDark: () => void;
  onHome: () => void;
  recurringDue: boolean;
  historyCount: number;
  /** Mobile drawer state. */
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  key: string;
  label: string;
  icon: typeof FilePlus2;
  active: boolean;
  onClick: () => void;
  badge?: 'dot' | number;
}

export function Sidebar(props: SidebarProps) {
  const {
    activeFeature, onSelectEditor, onToggleFeature, isEnterprise, isPremium,
    planLabel, daysRemaining, usageDownloads, freeLimit, onUpgrade,
    isDarkMode, onToggleDark, onHome, recurringDue, historyCount,
    mobileOpen, onCloseMobile,
  } = props;

  const editorActive = !['recurring', 'status', 'template', 'team', 'api', 'history'].includes(activeFeature ?? '');

  const items: NavItem[] = [
    { key: 'editor', label: 'New invoice', icon: FilePlus2, active: editorActive, onClick: onSelectEditor },
    { key: 'recurring', label: 'Recurring', icon: Repeat, active: activeFeature === 'recurring', onClick: () => onToggleFeature('recurring'), badge: recurringDue ? 'dot' : undefined },
    { key: 'status', label: 'Payment status', icon: Activity, active: activeFeature === 'status', onClick: () => onToggleFeature('status') },
    { key: 'template', label: 'Templates', icon: LayoutGrid, active: activeFeature === 'template', onClick: () => onToggleFeature('template') },
    { key: 'history', label: 'History', icon: History, active: activeFeature === 'history', onClick: () => onToggleFeature('history'), badge: historyCount > 0 ? historyCount : undefined },
  ];

  if (isEnterprise) {
    items.push(
      { key: 'team', label: 'Team', icon: Users, active: activeFeature === 'team', onClick: () => onToggleFeature('team') },
      { key: 'api', label: 'API keys', icon: Terminal, active: activeFeature === 'api', onClick: () => onToggleFeature('api') },
    );
  }

  const content = (
    <div className="flex h-full flex-col bg-surface-1 border-r border-line w-64">
      {/* Brand */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-line">
        <button onClick={onHome} className="flex items-center" aria-label="GSTify home">
          <Logo />
        </button>
        <button
          onClick={onCloseMobile}
          className="md:hidden p-1.5 rounded-lg text-content-secondary hover:bg-surface-2"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => { item.onClick(); onCloseMobile(); }}
              aria-current={item.active ? 'page' : undefined}
              className={`group w-full flex items-center gap-3 px-3 py-2 rounded-[10px] text-sm font-medium transition-colors ${
                item.active
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-content-secondary hover:bg-surface-2 hover:text-content-primary'
              }`}
            >
              <Icon size={18} className="shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge === 'dot' && (
                <span className="w-2 h-2 rounded-full bg-red-500" aria-label="Due" />
              )}
              {typeof item.badge === 'number' && (
                <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full bg-surface-2 text-content-secondary min-w-[20px] text-center">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer: plan + controls */}
      <div className="px-3 py-3 border-t border-line space-y-2">
        {isPremium ? (
          <div className="rounded-[10px] bg-surface-2 px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-content-primary">
              <Sparkles size={14} className="text-brand-600" />
              {planLabel}
            </div>
            {typeof daysRemaining === 'number' && (
              <p className="text-xs text-content-muted mt-0.5">{daysRemaining} days remaining</p>
            )}
          </div>
        ) : (
          <div className="rounded-[10px] bg-surface-2 px-3 py-2.5">
            <p className="text-xs text-content-secondary">
              <span className="font-semibold text-content-primary">Free plan</span> · {usageDownloads}/{freeLimit} downloads
            </p>
            <button
              onClick={onUpgrade}
              className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-brand-600 text-on-brand text-sm font-semibold hover:bg-brand-700 transition-colors"
            >
              <Sparkles size={14} /> Upgrade to Pro
            </button>
          </div>
        )}

        <div className="flex items-center gap-1">
          <button
            onClick={onToggleDark}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-[10px] text-sm font-medium text-content-secondary hover:bg-surface-2 hover:text-content-primary transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            <span>{isDarkMode ? 'Light' : 'Dark'}</span>
          </button>
          <button
            onClick={onHome}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-[10px] text-sm font-medium text-content-secondary hover:bg-surface-2 hover:text-content-primary transition-colors"
            aria-label="Back to home"
            title="Back to home"
          >
            <ChevronLeft size={16} /> Home
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: sticky full-height sidebar */}
      <aside className="hidden md:block shrink-0 sticky top-0 h-screen print:hidden">{content}</aside>

      {/* Mobile: slide-over drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 print:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onCloseMobile} aria-hidden="true" />
          <div className="absolute left-0 top-0 h-full">{content}</div>
        </div>
      )}
    </>
  );
}
