import { useCallback, useEffect, useMemo, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { AboutSection } from './components/AboutSection';
import { AreaCalculator } from './components/AreaCalculator';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { GeminiChatWidget } from './components/GeminiChatWidget';
import { HeroSearch } from './components/HeroSearch';
import { InteractiveDhaMap } from './components/InteractiveDhaMap';
import { ListingsSection } from './components/ListingsSection';
import { Navbar } from './components/Navbar';
import { PropertyModal } from './components/PropertyModal';
import { ServicesAndAreas } from './components/ServicesAndAreas';
import { SocialAndMediaSection } from './components/SocialAndMediaSection';
import { ThreeDPropertyShowcase } from './components/ThreeDPropertyShowcase';
import { VideoStudioSection } from './components/VideoStudioSection';
import { BUSINESS_INFO } from './data/businessInfo';
import {
  PROPERTIES,
  type PropertyArea,
  type PropertyListing,
  type PropertyPurpose,
  type PropertyType,
} from './data/properties';
import { filterAndSortProperties, type ListingFilters } from './utils/calculations';

const SHORTLIST_STORAGE_KEY = 'ime_shortlisted_properties';

const DEFAULT_FILTERS: ListingFilters = {
  purpose: 'All',
  area: 'All',
  type: 'All',
  keyword: '',
  sortBy: 'featured',
  shortlistedOnly: false,
};

export default function App() {
  const [filters, setFilters] = useState<ListingFilters>(DEFAULT_FILTERS);
  const [selectedProperty, setSelectedProperty] = useState<PropertyListing | null>(null);
  const [contactPrefill, setContactPrefill] = useState<{ ref: string; area: string }>({
    ref: '',
    area: '',
  });
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState(false);

  const [shortlistedIds, setShortlistedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(SHORTLIST_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // Persist shortlisted properties in localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SHORTLIST_STORAGE_KEY, JSON.stringify(shortlistedIds));
    } catch {
      // Ignore storage failures in restricted contexts
    }
  }, [shortlistedIds]);

  // Listen for Google Maps Platform Demo Key quota events (Section 8 Case A)
  useEffect(() => {
    const onQuotaExceeded = () => setMapsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', onQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', onQuotaExceeded);
  }, []);

  const filteredListings = useMemo(
    () => filterAndSortProperties(PROPERTIES, filters, shortlistedIds),
    [filters, shortlistedIds],
  );

  const handleToggleShortlist = useCallback((id: string) => {
    setShortlistedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }, []);

  const handleChangeFilters = useCallback((next: Partial<ListingFilters>) => {
    setFilters((prev) => ({ ...prev, ...next }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleQuickSearch = useCallback(
    (params: {
      purpose: 'All' | PropertyPurpose;
      area: 'All' | PropertyArea;
      type: 'All' | PropertyType;
    }) => {
      setFilters({
        ...DEFAULT_FILTERS,
        purpose: params.purpose,
        area: params.area,
        type: params.type,
      });
      scrollToSection('properties');
    },
    [scrollToSection],
  );

  const handleSelectAreaCard = useCallback(
    (area: PropertyArea) => {
      setFilters({
        ...DEFAULT_FILTERS,
        area,
      });
      scrollToSection('properties');
    },
    [scrollToSection],
  );

  const handleRequestSiteVisit = useCallback(
    (property: PropertyListing) => {
      setSelectedProperty(null);
      setContactPrefill({
        ref: `${property.id} — ${property.title} (${property.priceDisplay})`,
        area: property.area,
      });
      scrollToSection('contact');
    },
    [scrollToSection],
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      {/* Non-intrusive Google Maps Platform Quota Notice (shown only when quota exceeded) */}
      {mapsQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      <Navbar />

      <main className="flex-1">
        <HeroSearch onQuickSearch={handleQuickSearch} />

        <ListingsSection
          listings={filteredListings}
          totalCount={PROPERTIES.length}
          filters={filters}
          shortlistedIds={shortlistedIds}
          onChangeFilters={handleChangeFilters}
          onResetFilters={handleResetFilters}
          onToggleShortlist={handleToggleShortlist}
          onSelectProperty={setSelectedProperty}
        />

        <InteractiveDhaMap
          listings={filteredListings}
          onSelectProperty={setSelectedProperty}
        />

        <ThreeDPropertyShowcase />

        <AreaCalculator />

        <ServicesAndAreas onSelectArea={handleSelectAreaCard} />

        <VideoStudioSection />

        <SocialAndMediaSection />

        <AboutSection />

        <ContactSection
          prefillReference={contactPrefill.ref}
          prefillArea={contactPrefill.area}
        />
      </main>

      <Footer />

      {/* Property Detail Modal */}
      <PropertyModal
        property={selectedProperty}
        isShortlisted={
          selectedProperty ? shortlistedIds.includes(selectedProperty.id) : false
        }
        onToggleShortlist={handleToggleShortlist}
        onClose={() => setSelectedProperty(null)}
        onRequestSiteVisit={handleRequestSiteVisit}
      />

      {/* Multi-Turn Gemini Property Concierge */}
      <GeminiChatWidget />

      {/* Floating WhatsApp Direct CTA */}
      <a
        href={BUSINESS_INFO.primaryWhatsAppUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Chat with Iqbal Memon Estate"
        aria-label="Chat with Iqbal Memon Estate on WhatsApp"
        className="group fixed bottom-4 right-3 sm:right-5 z-40 inline-flex items-center justify-center gap-2 w-11 h-11 sm:w-auto sm:h-auto sm:px-4 sm:py-2.5 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white shadow-lg transition-colors text-xs sm:text-sm font-semibold"
      >
        <MessageCircle className="w-5 h-5 sm:w-4 sm:h-4 shrink-0" aria-hidden="true" />
        <span className="hidden sm:inline">Chat with Iqbal Memon Estate</span>
      </a>
    </div>
  );
}
