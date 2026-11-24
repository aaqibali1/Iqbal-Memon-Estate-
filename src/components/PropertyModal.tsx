import { useEffect, useState } from 'react';
import {
  Bath,
  BedDouble,
  Building2,
  CalendarCheck,
  Check,
  Heart,
  MapPin,
  Maximize2,
  MessageCircle,
  Phone,
  X,
} from 'lucide-react';
import { BUSINESS_INFO } from '../data/businessInfo';
import type { PropertyListing } from '../data/properties';
import { buildWhatsAppUrl } from '../utils/calculations';

interface PropertyModalProps {
  property: PropertyListing | null;
  isShortlisted: boolean;
  onToggleShortlist: (id: string) => void;
  onClose: () => void;
  onRequestSiteVisit: (property: PropertyListing) => void;
}

export function PropertyModal({
  property,
  isShortlisted,
  onToggleShortlist,
  onClose,
  onRequestSiteVisit,
}: PropertyModalProps) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [property?.id]);

  useEffect(() => {
    if (!property) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [property, onClose]);

  if (!property) return null;

  const whatsAppHref = buildWhatsAppUrl(
    BUSINESS_INFO.primaryWhatsAppDigits,
    `Assalam-o-Alaikum Iqbal Memon Estate, I would like more details about listing ${property.id}: ${property.title} (${property.priceDisplay}) in ${property.subLocation}.`,
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="property-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0F172A]/75 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Close & Shortlist Controls */}
        <div className="relative aspect-[16/9] sm:aspect-[21/10] bg-[#0F172A] shrink-0 overflow-hidden">
          {!imgError ? (
            <img
              src={property.imageUrl}
              alt={property.title}
              onError={() => setImgError(true)}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <Building2 className="w-12 h-12 text-[#C5A059]" />
            </div>
          )}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/85 via-transparent to-[#0F172A]/45"
          />

          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleShortlist(property.id)}
              aria-label={isShortlisted ? 'Remove from shortlist' : 'Save to shortlist'}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                isShortlisted
                  ? 'bg-[#C5A059] text-[#0F172A]'
                  : 'bg-[#0F172A]/80 text-white hover:bg-[#0F172A]'
              }`}
            >
              <Heart className={`w-4 h-4 ${isShortlisted ? 'fill-[#0F172A]' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close property details"
              className="w-10 h-10 rounded-lg bg-[#0F172A]/80 text-white hover:bg-[#0F172A] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="absolute bottom-4 left-5 right-5 flex flex-wrap items-end justify-between gap-2 text-white">
            <div>
              <p className="text-xs font-medium text-[#E2C68B]">
                {property.statusLabel}
                {property.featured ? ' · Featured Listing' : ''} &middot; ID: {property.id}
              </p>
              <h2
                id="property-modal-title"
                className="font-display text-2xl sm:text-3xl font-semibold mt-0.5 leading-tight"
              >
                {property.title}
              </h2>
            </div>
            <p className="text-xl sm:text-2xl font-bold tabular-nums text-white">
              {property.priceDisplay}
            </p>
          </div>
        </div>

        {/* Scrollable Details Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6">
          <div className="flex items-center gap-2 text-sm text-[#475569]">
            <MapPin className="w-4 h-4 text-[#C5A059] shrink-0" aria-hidden="true" />
            <span>{property.subLocation}</span>
          </div>

          {/* Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-[#E2E8F0]">
            <div>
              <p className="text-xs text-[#475569]">Area / Size</p>
              <p className="mt-1 text-sm font-semibold text-[#0F172A] tabular-nums inline-flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-[#C5A059]" aria-hidden="true" />
                {property.sizeDisplay}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#475569]">Category</p>
              <p className="mt-1 text-sm font-semibold text-[#0F172A]">{property.type}</p>
            </div>
            <div>
              <p className="text-xs text-[#475569]">Bedrooms</p>
              <p className="mt-1 text-sm font-semibold text-[#0F172A] tabular-nums inline-flex items-center gap-1.5">
                <BedDouble className="w-3.5 h-3.5 text-[#C5A059]" aria-hidden="true" />
                {property.bedrooms > 0 ? `${property.bedrooms} Bedrooms` : 'Plot / Commercial'}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#475569]">Bathrooms</p>
              <p className="mt-1 text-sm font-semibold text-[#0F172A] tabular-nums inline-flex items-center gap-1.5">
                <Bath className="w-3.5 h-3.5 text-[#C5A059]" aria-hidden="true" />
                {property.bathrooms > 0 ? `${property.bathrooms} Bathrooms` : 'N/A'}
              </p>
            </div>
          </div>

          {/* Overview */}
          <div>
            <h3 className="font-display text-lg font-semibold text-[#0F172A]">
              Property Overview
            </h3>
            <p className="mt-2 text-sm text-[#475569] leading-relaxed">
              {property.description}
            </p>
          </div>

          {/* Key Highlights */}
          <div>
            <h3 className="font-display text-lg font-semibold text-[#0F172A]">
              Key Highlights
            </h3>
            <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {property.highlights.map((highlight) => (
                <li
                  key={highlight}
                  className="flex items-center gap-2 text-sm text-[#0F172A]"
                >
                  <Check className="w-4 h-4 text-[#C5A059] shrink-0" aria-hidden="true" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Direct Action CTAs */}
          <div className="pt-4 border-t border-[#E2E8F0] grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a
              href={whatsAppHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-[#16A34A] hover:bg-[#15803D] rounded-lg transition-colors whitespace-nowrap"
            >
              <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Inquire on WhatsApp</span>
            </a>

            <a
              href={BUSINESS_INFO.primaryPhoneTel}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-[#0F172A] bg-[#F8FAFC] hover:bg-[#E2E8F0] border border-[#CBD5E1] rounded-lg transition-colors whitespace-nowrap"
            >
              <Phone className="w-4 h-4 shrink-0 text-[#0F172A]" aria-hidden="true" />
              <span>Call {BUSINESS_INFO.primaryPhoneDisplay}</span>
            </a>

            <button
              type="button"
              onClick={() => onRequestSiteVisit(property)}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-[#0F172A] bg-[#C5A059] hover:bg-[#B08D46] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Request Site Visit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
