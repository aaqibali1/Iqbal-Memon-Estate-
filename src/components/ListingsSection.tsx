import { Heart, RotateCcw, Search } from 'lucide-react';
import {
  PROPERTY_AREAS,
  PROPERTY_TYPES,
  type PropertyArea,
  type PropertyListing,
  type PropertyPurpose,
  type PropertyType,
} from '../data/properties';
import type { ListingFilters, SortOption } from '../utils/calculations';
import { PropertyCard } from './PropertyCard';

interface ListingsSectionProps {
  listings: PropertyListing[];
  totalCount: number;
  filters: ListingFilters;
  shortlistedIds: string[];
  onChangeFilters: (next: Partial<ListingFilters>) => void;
  onResetFilters: () => void;
  onToggleShortlist: (id: string) => void;
  onSelectProperty: (property: PropertyListing) => void;
}

export function ListingsSection({
  listings,
  totalCount,
  filters,
  shortlistedIds,
  onChangeFilters,
  onResetFilters,
  onToggleShortlist,
  onSelectProperty,
}: ListingsSectionProps) {
  const hasActiveFilters =
    filters.purpose !== 'All' ||
    filters.area !== 'All' ||
    filters.type !== 'All' ||
    filters.keyword.trim() !== '' ||
    filters.shortlistedOnly ||
    filters.sortBy !== 'featured';

  return (
    <section id="properties" className="py-16 lg:py-24 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-[#E2E8F0]">
          <div>
            <p className="text-sm font-medium text-[#9A7835]">Curated DHA Portfolio</p>
            <h2 className="mt-1 font-display text-3xl sm:text-4xl font-semibold text-[#0F172A] text-balance">
              Verified Residential &amp; Commercial Listings
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() =>
                onChangeFilters({ shortlistedOnly: !filters.shortlistedOnly })
              }
              aria-pressed={filters.shortlistedOnly}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filters.shortlistedOnly
                  ? 'bg-[#0F172A] text-white border-[#0F172A]'
                  : 'bg-white text-[#0F172A] border-[#CBD5E1] hover:border-[#0F172A]'
              }`}
            >
              <Heart
                className={`w-4 h-4 ${
                  filters.shortlistedOnly ? 'fill-[#C5A059] text-[#C5A059]' : 'text-[#9A7835]'
                }`}
                aria-hidden="true"
              />
              <span className="tabular-nums">
                Shortlisted ({shortlistedIds.length})
              </span>
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-[#475569] hover:text-[#0F172A] bg-white border border-[#E2E8F0] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls Toolbar */}
        <div className="mt-6 bg-white rounded-xl border border-[#E2E8F0] p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
            {/* Purpose Segmented Control */}
            <div className="lg:col-span-3">
              <span className="block text-xs font-semibold text-[#475569] mb-1.5">
                Purpose
              </span>
              <div
                role="group"
                aria-label="Filter by purpose"
                className="grid grid-cols-3 p-1 bg-[#F1F5F9] rounded-lg"
              >
                {(['All', 'Buy', 'Rent'] as const).map((p) => {
                  const active = filters.purpose === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => onChangeFilters({ purpose: p as 'All' | PropertyPurpose })}
                      aria-pressed={active}
                      className={`py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                        active
                          ? 'bg-white text-[#0F172A] shadow-xs'
                          : 'text-[#475569] hover:text-[#0F172A]'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Area */}
            <div className="lg:col-span-2">
              <label
                htmlFor="filter-area"
                className="block text-xs font-semibold text-[#475569] mb-1.5"
              >
                DHA Area
              </label>
              <select
                id="filter-area"
                value={filters.area}
                onChange={(e) =>
                  onChangeFilters({ area: e.target.value as 'All' | PropertyArea })
                }
                className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] bg-white text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
              >
                <option value="All">All DHA Areas</option>
                {PROPERTY_AREAS.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            {/* Property Type */}
            <div className="lg:col-span-2">
              <label
                htmlFor="filter-type"
                className="block text-xs font-semibold text-[#475569] mb-1.5"
              >
                Property Type
              </label>
              <select
                id="filter-type"
                value={filters.type}
                onChange={(e) =>
                  onChangeFilters({ type: e.target.value as 'All' | PropertyType })
                }
                className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] bg-white text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
              >
                <option value="All">All Types</option>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Keyword Search */}
            <div className="lg:col-span-3">
              <label
                htmlFor="filter-keyword"
                className="block text-xs font-semibold text-[#475569] mb-1.5"
              >
                Keyword Search
              </label>
              <div className="relative">
                <Search
                  className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="filter-keyword"
                  type="text"
                  value={filters.keyword}
                  onChange={(e) => onChangeFilters({ keyword: e.target.value })}
                  placeholder="e.g. Murtaza, Corner, Pool, IME-801"
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-[#CBD5E1] bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="lg:col-span-2">
              <label
                htmlFor="filter-sort"
                className="block text-xs font-semibold text-[#475569] mb-1.5"
              >
                Sort By
              </label>
              <select
                id="filter-sort"
                value={filters.sortBy}
                onChange={(e) =>
                  onChangeFilters({ sortBy: e.target.value as SortOption })
                }
                className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] bg-white text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="size-desc">Size: Largest First</option>
              </select>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#475569]">
            <p className="tabular-nums" data-testid="listings-count">
              Showing <span className="font-semibold text-[#0F172A]">{listings.length}</span> of{' '}
              <span className="font-semibold text-[#0F172A]">{totalCount}</span> curated DHA Karachi
              properties
            </p>
            <p className="hidden sm:block">
              Click any property to inspect full specifications or request a private viewing
            </p>
          </div>
        </div>

        {/* Listings Grid or Empty State */}
        {listings.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                isShortlisted={shortlistedIds.includes(property.id)}
                onToggleShortlist={onToggleShortlist}
                onSelect={onSelectProperty}
              />
            ))}
          </div>
        ) : (
          <div className="mt-10 bg-white rounded-xl border border-[#E2E8F0] p-12 text-center max-w-xl mx-auto">
            <h3 className="font-display text-2xl font-semibold text-[#0F172A]">
              No matching properties found
            </h3>
            <p className="mt-2 text-sm text-[#475569]">
              {filters.shortlistedOnly
                ? 'You have not shortlisted any properties matching these filters yet. Click the heart icon on any listing to save it here.'
                : 'Try broadening your DHA phase, property type, or keyword criteria — or contact our DHA Phase 8 desk for off-market inventory.'}
            </p>
            <button
              type="button"
              onClick={onResetFilters}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0F172A] hover:bg-[#1E293B] rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
