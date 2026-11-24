import { ArrowUpRight, Facebook, Instagram, Youtube } from 'lucide-react';
import { BUSINESS_INFO } from '../data/businessInfo';

const SOCIAL_CARDS = [
  {
    key: 'youtube',
    title: BUSINESS_INFO.socials.youtube.name,
    handle: BUSINESS_INFO.socials.youtube.handle,
    meta: 'Video Walkthroughs & DHA Market Updates',
    description: BUSINESS_INFO.socials.youtube.description,
    cta: BUSINESS_INFO.socials.youtube.cta,
    url: BUSINESS_INFO.socials.youtube.url,
    icon: Youtube,
    accentBg: 'bg-red-50 text-red-700 border-red-100',
  },
  {
    key: 'facebook',
    title: BUSINESS_INFO.socials.facebook.name,
    handle: `${BUSINESS_INFO.socials.facebook.handle} · ${BUSINESS_INFO.socials.facebook.followers}`,
    meta: 'Daily Hot Deals & Community Alerts',
    description: BUSINESS_INFO.socials.facebook.description,
    cta: BUSINESS_INFO.socials.facebook.cta,
    url: BUSINESS_INFO.socials.facebook.url,
    icon: Facebook,
    accentBg: 'bg-blue-50 text-blue-700 border-blue-100',
  },
  {
    key: 'instagram',
    title: BUSINESS_INFO.socials.instagram.name,
    handle: BUSINESS_INFO.socials.instagram.handle,
    meta: 'Visual Reels & Luxury Interior Previews',
    description: BUSINESS_INFO.socials.instagram.description,
    cta: BUSINESS_INFO.socials.instagram.cta,
    url: BUSINESS_INFO.socials.instagram.url,
    icon: Instagram,
    accentBg: 'bg-amber-50 text-[#9A7835] border-amber-100',
  },
];

export function SocialAndMediaSection() {
  return (
    <section id="media" className="py-16 lg:py-24 bg-[#F8FAFC] border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl pb-8 border-b border-[#E2E8F0]">
          <p className="text-sm font-medium text-[#9A7835]">
            Property Tours &amp; Market Channels
          </p>
          <h2 className="mt-1 font-display text-3xl sm:text-4xl font-semibold text-[#0F172A] text-balance">
            Follow Iqbal Memon Estate Across Digital Channels
          </h2>
          <p className="mt-2 text-sm text-[#475569]">
            Stay ahead of DHA Phase 8 price movements with bungalow video tours, direct-owner
            opportunities, and candid market insights published weekly.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {SOCIAL_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <a
                key={card.key}
                href={card.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white rounded-xl border border-[#E2E8F0] p-6 flex flex-col justify-between hover:shadow-lg hover:border-[#C5A059] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <div
                      className={`w-11 h-11 rounded-lg border flex items-center justify-center ${card.accentBg}`}
                    >
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <ArrowUpRight
                      className="w-4 h-4 text-[#64748B] group-hover:text-[#0F172A] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden="true"
                    />
                  </div>

                  <p className="mt-5 text-xs font-medium text-[#9A7835]">{card.meta}</p>
                  <h3 className="mt-1 font-display text-2xl font-semibold text-[#0F172A]">
                    {card.title}
                  </h3>
                  <p className="mt-0.5 text-xs font-semibold text-[#475569]">{card.handle}</p>

                  <p className="mt-3 text-sm text-[#475569] leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#F1F5F9] flex items-center justify-between text-sm font-semibold text-[#0F172A] group-hover:text-[#9A7835] transition-colors">
                  <span>{card.cta}</span>
                  <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
