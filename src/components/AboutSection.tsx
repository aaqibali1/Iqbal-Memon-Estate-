import { Clock, ExternalLink, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { BUSINESS_INFO } from '../data/businessInfo';

const PILLARS = [
  {
    title: 'Honest Valuation & Direct Deals',
    text: 'Every price indication is benchmarked against verified DHA Karachi transactions—no inflated margins or speculative promises.',
  },
  {
    title: 'Clear Title & Transfer Support',
    text: 'From initial Bayana token to NDC clearance and DHA Karachi transfer completion, every document step is verified carefully.',
  },
  {
    title: 'Local Phase 8 Presence',
    text: 'Based directly on Murtaza Lane 1 in DHA Phase 8, our team inspects plots, streets, and construction quality firsthand.',
  },
];

export function AboutSection() {
  return (
    <section id="about" className="py-16 lg:py-24 bg-white border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          {/* Left Philosophy Column */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div>
              <p className="text-sm font-medium text-[#9A7835]">About Iqbal Memon Estate</p>
              <h2 className="mt-1 font-display text-3xl sm:text-4xl font-semibold text-[#0F172A] text-balance">
                Honest Advice, Professional Service &amp; Trusted Investment Solutions
              </h2>
              <p className="mt-4 text-base text-[#475569] leading-relaxed">
                {BUSINESS_INFO.bio} Whether you are acquiring a family residence in DHA Phase 8,
                leasing a corporate showroom on Murtaza or Zulfiqar Commercial, or positioning
                capital in high-growth residential plots across Phases 5, 6, 7, and 8, our advisory
                is grounded in transparency and long-term relationships.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-6 border-t border-[#E2E8F0]">
              {PILLARS.map((pillar) => (
                <div key={pillar.title} className="space-y-1.5">
                  <ShieldCheck className="w-5 h-5 text-[#C5A059]" aria-hidden="true" />
                  <h3 className="font-display text-base font-semibold text-[#0F172A]">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-[#475569] leading-relaxed">{pillar.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Visit Our Office Card */}
          <div className="lg:col-span-5 bg-[#0F172A] text-white rounded-2xl p-7 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 pb-5 border-b border-white/10">
                <img
                  src={BUSINESS_INFO.logoUrl}
                  alt="Iqbal Memon Estate official emblem"
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-lg bg-white p-1 object-contain"
                />
                <div>
                  <p className="text-xs font-medium text-[#E2C68B]">DHA Phase 8 Headquarters</p>
                  <h3 className="font-display text-2xl font-semibold text-white">
                    Visit Our Office
                  </h3>
                </div>
              </div>

              <div className="mt-6 space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-semibold text-slate-300">Office Address</p>
                    <p className="mt-0.5 text-white leading-relaxed">
                      {BUSINESS_INFO.officeAddress}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-semibold text-slate-300">Direct Lines</p>
                    <p className="mt-0.5 text-white tabular-nums">
                      <a href={BUSINESS_INFO.primaryPhoneTel} className="hover:text-[#E2C68B]">
                        {BUSINESS_INFO.primaryPhoneDisplay}
                      </a>
                      <span className="mx-2 text-slate-500">&middot;</span>
                      <a href={BUSINESS_INFO.secondaryPhoneTel} className="hover:text-[#E2C68B]">
                        {BUSINESS_INFO.secondaryPhoneDisplay}
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-semibold text-slate-300">Visiting Hours</p>
                    <p className="mt-0.5 text-slate-200">{BUSINESS_INFO.officeHours}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-white/10">
              <a
                href={BUSINESS_INFO.googleMapsQueryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-[#0F172A] bg-[#C5A059] hover:bg-[#B08D46] rounded-lg transition-colors whitespace-nowrap"
              >
                <ExternalLink className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Get Directions on Google Maps</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
