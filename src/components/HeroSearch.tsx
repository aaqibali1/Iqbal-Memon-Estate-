import { useState } from 'react';
import { Search } from 'lucide-react';
import { BUSINESS_INFO } from '../data/businessInfo';
import {
  HERO_IMAGE_URL,
  PROPERTY_AREAS,
  PROPERTY_TYPES,
  type PropertyArea,
  type PropertyPurpose,
  type PropertyType,
} from '../data/properties';

interface HeroSearchProps {
  onQuickSearch: (params: {
    purpose: 'All' | PropertyPurpose;
    area: 'All' | PropertyArea;
    type: 'All' | PropertyType;
  }) => void;
}

const TRUST_ITEMS = [
  { metric: '8K+ Community Followers', detail: 'Active Facebook & YouTube audience' },
  { metric: 'Sale, Purchase & Rental', detail: 'Direct-owner verified DHA deals' },
  { metric: 'Residential & Commercial', detail: 'Bungalows, plots & commercial lanes' },
  { metric: 'Honest Investment Advice', detail: 'Transparent valuation & documentation' },
];

export function HeroSearch({ onQuickSearch }: HeroSearchProps) {
  const [purpose, setPurpose] = useState<'All' | PropertyPurpose>('All');
  const [area, setArea] = useState<'All' | PropertyArea>('All');
  const [type, setType] = useState<'All' | PropertyType>('All');
  const [heroImgError, setHeroImgError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onQuickSearch({ purpose, area, type });
  };

  return (
    <section id="top" className="relative bg-[#0F172A] text-white">
      {/* Background Architectural Photograph + Measured Scrim */}
      <div className="relative min-h-[580px] lg:min-h-[640px] flex items-center">
        {!heroImgError ? (
          <img
            src={HERO_IMAGE_URL}
            alt="Contemporary luxury bungalow in DHA Phase 8, Karachi at dusk"
            onError={() => setHeroImgError(true)}
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]" />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/85 via-[#0F172A]/70 to-[#0F172A]/90"
        />

        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-sm font-medium tracking-wide text-[#E2C68B] mb-4">
              DHA Phase 8 Headquarters &middot; Trusted by 8,000+ Followers
            </p>
            <h1 className="font-display text-balance text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold leading-[1.12] tracking-tight text-white">
              Your Trusted Real Estate Partner in DHA Karachi
            </h1>
            <p className="mt-5 text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl">
              {BUSINESS_INFO.bio}
            </p>
          </div>

          {/* Interactive Quick-Search Bar */}
          <form
            onSubmit={handleSubmit}
            aria-label="Quick Property Search"
            className="mt-10 bg-white text-[#0F172A] rounded-xl shadow-2xl border border-[#E2E8F0] p-4 sm:p-5 max-w-5xl"
          >
            {/* Purpose Segmented Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-[#E2E8F0]">
              <div
                role="group"
                aria-label="Property purpose"
                className="inline-flex items-center p-1 bg-[#F1F5F9] rounded-lg"
              >
                {(['All', 'Buy', 'Rent'] as const).map((tab) => {
                  const active = purpose === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setPurpose(tab)}
                      aria-pressed={active}
                      className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                        active
                          ? 'bg-[#0F172A] text-white shadow-xs'
                          : 'text-[#475569] hover:text-[#0F172A]'
                      }`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>
              <span className="text-xs text-[#475569]">
                Murtaza Commercial &middot; Phase 8 &middot; Phase 6 &middot; Phase 5 &amp; 7
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-5">
                <label
                  htmlFor="hero-location"
                  className="block text-xs font-semibold text-[#475569] mb-1.5"
                >
                  Location
                </label>
                <select
                  id="hero-location"
                  value={area}
                  onChange={(e) => setArea(e.target.value as 'All' | PropertyArea)}
                  className="w-full h-11 px-3.5 rounded-lg border border-[#CBD5E1] bg-white text-sm font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                >
                  <option value="All">All DHA Karachi</option>
                  {PROPERTY_AREAS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-4">
                <label
                  htmlFor="hero-type"
                  className="block text-xs font-semibold text-[#475569] mb-1.5"
                >
                  Property Type
                </label>
                <select
                  id="hero-type"
                  value={type}
                  onChange={(e) => setType(e.target.value as 'All' | PropertyType)}
                  className="w-full h-11 px-3.5 rounded-lg border border-[#CBD5E1] bg-white text-sm font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                >
                  <option value="All">All Types</option>
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <button
                  type="submit"
                  className="w-full h-11 inline-flex items-center justify-center gap-2 px-5 text-sm font-semibold text-[#0F172A] bg-[#C5A059] hover:bg-[#B08D46] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Search className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Search Properties</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Compact Full-Width Trust Strip */}
      <div className="bg-[#0F172A] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST_ITEMS.map((item) => (
              <div key={item.metric} className="space-y-0.5">
                <p className="text-sm font-semibold text-[#E2C68B]">{item.metric}</p>
                <p className="text-xs text-slate-300">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
