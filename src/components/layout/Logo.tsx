interface LogoProps {
  /** Hide the wordmark and show only the badge (for a collapsed sidebar). */
  compact?: boolean;
  className?: string;
}

/**
 * GSTify brand mark: a rounded brand-coloured badge with a stylised
 * invoice + rupee glyph, next to a clean wordmark. Flat, professional,
 * and theme-aware (uses design tokens).
 */
export function Logo({ compact = false, className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span className="grid place-items-center w-9 h-9 rounded-[10px] bg-brand-600 shadow-sm shrink-0">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M6 3.5h8.5L19 8v11.5A1.5 1.5 0 0 1 17.5 21h-11A1.5 1.5 0 0 1 5 19.5v-14A1.5 1.5 0 0 1 6.5 3.5Z"
            fill="var(--on-brand)"
            fillOpacity="0.16"
            stroke="var(--on-brand)"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M14 3.5V8h4.5" stroke="var(--on-brand)" strokeWidth="1.6" strokeLinejoin="round" fill="none" />
          <path
            d="M9.2 11h5.6M9.2 11c0 1.5 1.2 2.4 2.8 2.4M9.2 11h1.3c1.7 0 2.9 1 2.9 2.4 0 1.3-1.2 2.3-2.9 2.3H9.2l3.4 3.1"
            stroke="var(--on-brand)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="block text-[17px] font-semibold tracking-tight text-content-primary">GSTify</span>
          <span className="block text-[10px] font-medium tracking-[0.14em] text-content-muted mt-0.5">
            INVOICE SUITE
          </span>
        </span>
      )}
    </div>
  );
}
