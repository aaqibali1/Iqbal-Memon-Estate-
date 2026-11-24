import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from 'lucide-react';
import { BUSINESS_INFO } from '../data/businessInfo';

const FOOTER_LINKS = [
  { label: 'Properties', href: '#properties' },
  { label: 'Interactive Map', href: '#map-explorer' },
  { label: '3D Villa Preview', href: '#architectural-3d' },
  { label: 'Video Studio', href: '#video-studio' },
  { label: 'Calculator', href: '#calculator' },
  { label: 'Services', href: '#services' },
  { label: 'DHA Areas', href: '#areas' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

export function Footer() {
  return (
    <footer className="bg-[#0F172A] text-slate-300 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-white/10">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={BUSINESS_INFO.logoUrl}
                alt="Iqbal Memon Estate logo"
                referrerPolicy="no-referrer"
                className="w-11 h-11 rounded-md bg-white p-1 object-contain"
              />
              <span className="font-display text-xl font-semibold text-white">
                {BUSINESS_INFO.brandName}
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed max-w-md">
              {BUSINESS_INFO.bio}
            </p>
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href={BUSINESS_INFO.socials.facebook.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Iqbal Memon Estate on Facebook"
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-200 hover:border-[#C5A059] hover:text-[#E2C68B] transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={BUSINESS_INFO.socials.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Iqbal Memon Estate on Instagram"
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-200 hover:border-[#C5A059] hover:text-[#E2C68B] transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={BUSINESS_INFO.socials.youtube.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Watch Iqbal Memon Estate on YouTube"
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-200 hover:border-[#C5A059] hover:text-[#E2C68B] transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3">
            <h3 className="font-display text-base font-semibold text-white mb-4">Quick Links</h3>
            <ul className="grid grid-cols-2 md:grid-cols-1 gap-2 text-sm">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-slate-300 hover:text-[#E2C68B] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Office Contact */}
          <div className="md:col-span-4 space-y-3 text-sm">
            <h3 className="font-display text-base font-semibold text-white mb-4">
              DHA Phase 8 Office
            </h3>
            <p className="flex items-start gap-2.5 text-slate-300">
              <MapPin className="w-4 h-4 text-[#C5A059] shrink-0 mt-1" aria-hidden="true" />
              <span>{BUSINESS_INFO.officeAddress}</span>
            </p>
            <p className="flex items-start gap-2.5 text-slate-300 tabular-nums">
              <Phone className="w-4 h-4 text-[#C5A059] shrink-0 mt-1" aria-hidden="true" />
              <span className="flex flex-col gap-0.5">
                <a href={BUSINESS_INFO.primaryPhoneTel} className="hover:text-[#E2C68B]">
                  {BUSINESS_INFO.primaryPhoneDisplay}
                </a>
                <a href={BUSINESS_INFO.secondaryPhoneTel} className="hover:text-[#E2C68B]">
                  {BUSINESS_INFO.secondaryPhoneDisplay}
                </a>
              </span>
            </p>
            <p className="flex items-center gap-2.5 text-slate-300">
              <Mail className="w-4 h-4 text-[#C5A059] shrink-0" aria-hidden="true" />
              <a href={`mailto:${BUSINESS_INFO.email}`} className="hover:text-[#E2C68B] break-all">
                {BUSINESS_INFO.email}
              </a>
            </p>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>&copy; 2026 Iqbal Memon Estate. All rights reserved.</p>
          <p>DHA Phase 8, Karachi &middot; Residential &amp; Commercial Property Consultancy</p>
        </div>
      </div>
    </footer>
  );
}
