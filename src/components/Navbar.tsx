import { useState } from 'react';
import { Menu, MessageCircle, X } from 'lucide-react';
import { BUSINESS_INFO } from '../data/businessInfo';

const NAV_LINKS = [
  { label: 'Properties', href: '#properties' },
  { label: 'Areas', href: '#areas' },
  { label: 'Services', href: '#services' },
  { label: 'Calculator', href: '#calculator' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand mark + single-line wordmark */}
        <a
          href="#top"
          className="flex items-center gap-3 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] rounded-md"
        >
          <img
            src={BUSINESS_INFO.logoUrl}
            alt="Iqbal Memon Estate logo"
            className="h-10 w-10 object-contain rounded-sm bg-white border border-[#E2E8F0] p-0.5"
            referrerPolicy="no-referrer"
          />
          <span className="font-display text-lg sm:text-xl font-semibold tracking-tight text-[#0F172A]">
            {BUSINESS_INFO.brandName}
          </span>
        </a>

        {/* Zone 2: Concise single-line navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#475569]"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="whitespace-nowrap shrink-0 hover:text-[#0F172A] transition-colors py-1 border-b-2 border-transparent hover:border-[#C5A059]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Single Primary Action + Mobile Drawer Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href={BUSINESS_INFO.primaryWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#16A34A] hover:bg-[#15803D] rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-xs"
          >
            <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>WhatsApp Us</span>
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[#E2E8F0] bg-white px-4 py-4 space-y-1 shadow-md">
          <nav aria-label="Mobile Navigation" className="flex flex-col space-y-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-3 rounded-lg text-base font-medium text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="pt-3 mt-2 border-t border-[#E2E8F0]">
            <a
              href={BUSINESS_INFO.primaryWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-[#16A34A] hover:bg-[#15803D] rounded-lg transition-colors"
            >
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
              <span>WhatsApp Us ({BUSINESS_INFO.primaryPhoneDisplay})</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
