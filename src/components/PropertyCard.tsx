import { useState } from 'react';
import { Bath, BedDouble, Building2, Heart, Maximize2, MapPin } from 'lucide-react';
import type { PropertyListing } from '../data/properties';

interface PropertyCardProps {
  property: PropertyListing;
  isShortlisted: boolean;
  onToggleShortlist: (id: string) => void;
  onSelect: (property: PropertyListing) => void;
}

export function PropertyCard({
  property,
  isShortlisted,
  onToggleShortlist,
  onSelect,
}: PropertyCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <article className="group bg-white rounded-xl border border-[#E2E8F0] overflow-hidden flex flex-col transition-all duration-200 hover:shadow-lg hover:border-[#CBD5E1]">
      {/* Image Frame */}
      <div className="relative aspect-[4/3] bg-[#0F172A] overflow-hidden">
        {!imgError ? (
          <img
            src={property.imageUrl}
            alt={`${property.title} in ${property.area}`}
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-slate-300 p-6 text-center">
            <Building2 className="w-10 h-10 text-[#C5A059] mb-2" aria-hidden="true" />
            <span className="text-xs font-medium">{property.area}</span>
          </div>
        )}

        {/* Measured Bottom Contrast Scrim + Status Text */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0F172A]/80 via-[#0F172A]/35 to-transparent pointer-events-none"
        />
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs font-medium text-white">
          <span>
            {property.statusLabel}
            {property.featured ? ' · Featured' : ''}
          </span>
          <span className="tabular-nums text-slate-200">{property.id}</span>
        </div>

        {/* Shortlist Toggle Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleShortlist(property.id);
          }}
          aria-label={
            isShortlisted
              ? `Remove ${property.title} from shortlist`
              : `Shortlist ${property.title}`
          }
          aria-pressed={isShortlisted}
          className={`absolute top-3 right-3 w-10 h-10 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
            isShortlisted
              ? 'bg-[#C5A059] text-[#0F172A] shadow-sm'
              : 'bg-[#0F172A]/75 text-white hover:bg-[#0F172A]'
          }`}
        >
          <Heart
            className={`w-4 h-4 ${isShortlisted ? 'fill-[#0F172A]' : ''}`}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Card Body — Clean Unboxed Metadata */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-xs text-[#475569] mb-1.5">
          <span className="font-medium text-[#9A7835]">{property.area}</span>
          <span aria-hidden="true">&middot;</span>
          <span>{property.type}</span>
        </div>

        <h3 className="font-display text-lg font-semibold text-[#0F172A] leading-snug group-hover:text-[#9A7835] transition-colors">
          <button
            type="button"
            onClick={() => onSelect(property)}
            className="text-left focus-visible:outline-none focus-visible:underline cursor-pointer"
          >
            {property.title}
          </button>
        </h3>

        <p className="mt-1.5 text-xs text-[#475569] flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#9A7835] shrink-0" aria-hidden="true" />
          <span className="truncate">{property.subLocation}</span>
        </p>

        {/* Price */}
        <p className="mt-4 text-xl font-bold text-[#0F172A] tabular-nums">
          {property.priceDisplay}
        </p>

        {/* Specs Row */}
        <div className="mt-4 pt-4 border-t border-[#E2E8F0] flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#475569] tabular-nums">
          <span className="inline-flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-[#9A7835]" aria-hidden="true" />
            {property.sizeDisplay}
          </span>
          {property.bedrooms > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <BedDouble className="w-3.5 h-3.5 text-[#9A7835]" aria-hidden="true" />
              {property.bedrooms} Beds
            </span>
          )}
          {property.bathrooms > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <Bath className="w-3.5 h-3.5 text-[#9A7835]" aria-hidden="true" />
              {property.bathrooms} Baths
            </span>
          )}
        </div>

        <div className="mt-5 pt-1">
          <button
            type="button"
            onClick={() => onSelect(property)}
            className="w-full py-2.5 px-4 text-sm font-semibold text-[#0F172A] bg-[#F8FAFC] hover:bg-[#0F172A] hover:text-white border border-[#E2E8F0] hover:border-[#0F172A] rounded-lg transition-colors cursor-pointer"
          >
            View Details &amp; Inquire
          </button>
        </div>
      </div>
    </article>
  );
}
