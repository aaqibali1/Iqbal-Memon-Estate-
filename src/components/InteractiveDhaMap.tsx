import { Component, type ReactNode, useCallback, useEffect, useState } from 'react';
import {
  APIProvider,
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import {
  Compass,
  ExternalLink,
  Globe,
  Loader2,
  MapPin,
  Navigation,
  Search,
  Sparkles,
} from 'lucide-react';
import { BUSINESS_INFO } from '../data/businessInfo';
import type { PropertyListing } from '../data/properties';

class MapErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

interface InteractiveDhaMapProps {
  listings: PropertyListing[];
  onSelectProperty: (property: PropertyListing) => void;
}

interface NearbyPlaceItem {
  id: string;
  name: string;
  address: string;
  position: { lat: number; lng: number };
  mapsUri?: string;
}

interface GroundingSource {
  type: 'web' | 'maps';
  title: string;
  uri: string;
  snippets?: string[];
}

const AMENITY_FILTERS = [
  { id: 'schools', label: 'Schools', query: 'Schools in DHA Phase 8 Karachi' },
  { id: 'hospitals', label: 'Hospitals', query: 'Hospitals near DHA Phase 8 Karachi' },
  { id: 'mosques', label: 'Mosques', query: 'Mosques in DHA Phase 8 Karachi' },
  { id: 'dining', label: 'Cafes & Dining', query: 'Restaurants Murtaza Commercial DHA Phase 8 Karachi' },
  { id: 'parks', label: 'Parks & Beach', query: 'Parks and Sea View DHA Phase 8 Karachi' },
] as const;

const GROUNDING_PROMPTS = [
  {
    mode: 'search' as const,
    label: 'DHA Phase 8 Market Trends',
    query: 'Latest DHA Phase 8 Karachi residential and commercial real estate market trends and plot demand',
  },
  {
    mode: 'search' as const,
    label: 'DHA Karachi Transfer & Tax Guide',
    query: 'Current DHA Karachi property transfer procedure, NDC requirements, and FBR property tax guidelines',
  },
  {
    mode: 'maps' as const,
    label: 'Top Amenities Near Murtaza Lane 1',
    query: 'What notable schools, hospitals, parks, and dining spots are near Murtaza Commercial Lane 1, DHA Phase 8, Karachi?',
  },
  {
    mode: 'maps' as const,
    label: 'Commercial Hubs in DHA Phase 8',
    query: 'List key commercial lanes and shopping destinations in DHA Phase 8 and Phase 6, Karachi.',
  },
];

function MapContent({
  listings,
  onSelectProperty,
  activeAmenity,
  onClearAmenity,
}: {
  listings: PropertyListing[];
  onSelectProperty: (property: PropertyListing) => void;
  activeAmenity: string | null;
  onClearAmenity: () => void;
}) {
  const placesLib = useMapsLibrary('places');
  const [hqPosition, setHqPosition] = useState(BUSINESS_INFO.hqCoordinates);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>('IME-HQ');
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlaceItem[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [placesError, setPlacesError] = useState<string | null>(null);

  // Refine HQ anchor via Places API (New) when available
  useEffect(() => {
    if (!placesLib || !('Place' in placesLib)) return;
    let cancelled = false;

    const locateHq = async () => {
      try {
        const PlaceClass = (placesLib as any).Place;
        const { places } = await PlaceClass.searchByText({
          textQuery: 'Al Murtaza Commercial Lane 1 DHA Phase 8 Karachi',
          fields: ['location', 'displayName'],
          maxResultCount: 1,
        });
        if (!cancelled && places?.[0]?.location) {
          setHqPosition({
            lat: places[0].location.lat(),
            lng: places[0].location.lng(),
          });
        }
      } catch (err: any) {
        const msg = String(err?.message || err || '');
        if (msg.includes('OVER_QUERY_LIMIT') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('429')) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
      }
    };
    locateHq();

    return () => {
      cancelled = true;
    };
  }, [placesLib]);

  // Fetch live nearby DHA amenities via Places API (New) Place.searchByText
  useEffect(() => {
    if (!activeAmenity) {
      setNearbyPlaces([]);
      setPlacesError(null);
      return;
    }
    if (!placesLib || !('Place' in placesLib)) return;

    const match = AMENITY_FILTERS.find((a) => a.id === activeAmenity);
    if (!match) return;

    let cancelled = false;
    setLoadingPlaces(true);
    setPlacesError(null);

    const searchNearby = async () => {
      try {
        const PlaceClass = (placesLib as any).Place;
        const { places } = await PlaceClass.searchByText({
          textQuery: match.query,
          fields: ['id', 'displayName', 'formattedAddress', 'location', 'googleMapsURI'],
          maxResultCount: 6,
        });
        if (cancelled) return;
        const mapped: NearbyPlaceItem[] = (places ?? [])
          .filter((p: any) => p?.location)
          .map((p: any, idx: number) => ({
            id: p.id || `place-${idx}`,
            name: p.displayName || 'DHA Landmark',
            address: p.formattedAddress || 'DHA Karachi',
            position: {
              lat: p.location.lat(),
              lng: p.location.lng(),
            },
            mapsUri: p.googleMapsURI,
          }));
        setNearbyPlaces(mapped);
      } catch (err: any) {
        if (cancelled) return;
        const msg = String(err?.message || err || '');
        if (msg.includes('OVER_QUERY_LIMIT') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('429')) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
        setPlacesError('Unable to load nearby places right now. Try the Live Maps Grounding panel below.');
      } finally {
        if (!cancelled) setLoadingPlaces(false);
      }
    };

    searchNearby();
    return () => {
      cancelled = true;
    };
  }, [activeAmenity, placesLib]);

  const selectedProperty = listings.find((p) => p.id === selectedMarkerId) || null;
  const selectedNearby = nearbyPlaces.find((p) => p.id === selectedMarkerId) || null;

  return (
    <div className="relative w-full h-[460px] rounded-xl overflow-hidden border border-[#E2E8F0] bg-[#0F172A]">
      <GoogleMap
        mapId="DEMO_MAP_ID"
        defaultZoom={13}
        defaultCenter={hqPosition}
        gestureHandling="cooperative"
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        className="w-full h-full"
      >
        {/* Iqbal Memon Estate HQ Marker */}
        <AdvancedMarker
          position={hqPosition}
          title="Iqbal Memon Estate — DHA Phase 8 Headquarters"
          onClick={() => setSelectedMarkerId('IME-HQ')}
        >
          <Pin background="#C5A059" borderColor="#0F172A" glyphColor="#0F172A" scale={1.2} />
        </AdvancedMarker>

        {/* Active Listing Markers */}
        {listings.map((property) => {
          const pos = {
            lat: hqPosition.lat + property.mapOffset.latOffset,
            lng: hqPosition.lng + property.mapOffset.lngOffset,
          };
          const isSelected = selectedMarkerId === property.id;
          return (
            <AdvancedMarker
              key={property.id}
              position={pos}
              title={`${property.title} — ${property.priceDisplay}`}
              onClick={() => setSelectedMarkerId(property.id)}
            >
              <Pin
                background={isSelected ? '#C5A059' : '#0F172A'}
                borderColor="#FFFFFF"
                glyphColor={isSelected ? '#0F172A' : '#E2C68B'}
              />
            </AdvancedMarker>
          );
        })}

        {/* Live Nearby Amenities from Places API (New) */}
        {nearbyPlaces.map((place) => (
          <AdvancedMarker
            key={place.id}
            position={place.position}
            title={place.name}
            onClick={() => setSelectedMarkerId(place.id)}
          >
            <Pin background="#16A34A" borderColor="#FFFFFF" glyphColor="#FFFFFF" scale={0.9} />
          </AdvancedMarker>
        ))}

        {/* HQ InfoWindow */}
        {selectedMarkerId === 'IME-HQ' && (
          <InfoWindow position={hqPosition} onCloseClick={() => setSelectedMarkerId(null)}>
            <div className="max-w-[230px] p-1 text-[#0F172A]">
              <p className="text-xs font-semibold text-[#9A7835]">Headquarters</p>
              <p className="font-display text-sm font-semibold mt-0.5">
                {BUSINESS_INFO.brandName}
              </p>
              <p className="text-xs text-[#475569] mt-1 leading-snug">
                {BUSINESS_INFO.shortAddress}
              </p>
              <a
                href={BUSINESS_INFO.googleMapsQueryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#0F172A] underline hover:text-[#9A7835]"
              >
                <span>Open Directions</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </InfoWindow>
        )}

        {/* Property Listing InfoWindow */}
        {selectedProperty && (
          <InfoWindow
            position={{
              lat: hqPosition.lat + selectedProperty.mapOffset.latOffset,
              lng: hqPosition.lng + selectedProperty.mapOffset.lngOffset,
            }}
            onCloseClick={() => setSelectedMarkerId(null)}
          >
            <div className="max-w-[240px] p-1 text-[#0F172A]">
              <p className="text-[11px] font-medium text-[#9A7835]">
                {selectedProperty.statusLabel} &middot; {selectedProperty.id}
              </p>
              <p className="font-display text-sm font-semibold mt-0.5 leading-snug">
                {selectedProperty.title}
              </p>
              <p className="text-xs font-bold text-[#0F172A] tabular-nums mt-1">
                {selectedProperty.priceDisplay}
              </p>
              <p className="text-[11px] text-[#475569] mt-0.5">{selectedProperty.subLocation}</p>
              <button
                type="button"
                onClick={() => onSelectProperty(selectedProperty)}
                className="mt-2 w-full py-1.5 px-3 text-xs font-semibold text-white bg-[#0F172A] hover:bg-[#1E293B] rounded-md cursor-pointer"
              >
                Inspect Listing
              </button>
            </div>
          </InfoWindow>
        )}

        {/* Nearby Place InfoWindow */}
        {selectedNearby && (
          <InfoWindow position={selectedNearby.position} onCloseClick={() => setSelectedMarkerId(null)}>
            <div className="max-w-[230px] p-1 text-[#0F172A]">
              <p className="text-[11px] font-semibold text-[#16A34A]">Google Maps Place</p>
              <p className="text-sm font-semibold mt-0.5">{selectedNearby.name}</p>
              <p className="text-xs text-[#475569] mt-1">{selectedNearby.address}</p>
              {selectedNearby.mapsUri && (
                <a
                  href={selectedNearby.mapsUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#0F172A] underline"
                >
                  <span>View on Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Subtle Loading / Error Status Bar */}
      {(loadingPlaces || placesError) && (
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto bg-[#0F172A] text-white text-xs px-3.5 py-2 rounded-lg shadow-lg flex items-center gap-2">
          {loadingPlaces ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C5A059]" />
              <span>Searching live DHA Karachi places via Google Maps...</span>
            </>
          ) : (
            <>
              <span>{placesError}</span>
              <button
                type="button"
                onClick={onClearAmenity}
                className="underline text-[#E2C68B] ml-2 cursor-pointer"
              >
                Dismiss
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function InteractiveDhaMap({ listings, onSelectProperty }: InteractiveDhaMapProps) {
  const [apiKey, setApiKey] = useState<string>(
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  );
  const [keyResolved, setKeyResolved] = useState<boolean>(
    Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY),
  );
  const [activeAmenity, setActiveAmenity] = useState<string | null>(null);

  // Grounding Intelligence State (Google Search + Google Maps via Gemini 4 Hydrogen)
  const [groundingMode, setGroundingMode] = useState<'search' | 'maps'>('search');
  const [groundingQuery, setGroundingQuery] = useState('');
  const [groundingLoading, setGroundingLoading] = useState(false);
  const [groundingError, setGroundingError] = useState<string | null>(null);
  const [groundingResult, setGroundingResult] = useState<{
    answer: string;
    sources: GroundingSource[];
    mode: 'search' | 'maps';
    groundingNote?: string;
  } | null>(null);

  useEffect(() => {
    if (apiKey) return;
    let cancelled = false;
    fetch('/api/config/maps')
      .then((res) => (res.ok ? res.json() : { apiKey: '' }))
      .then((data) => {
        if (!cancelled) {
          if (data?.apiKey) setApiKey(data.apiKey);
          setKeyResolved(true);
        }
      })
      .catch(() => {
        if (!cancelled) setKeyResolved(true);
      });
    return () => {
      cancelled = true;
    };
  }, [apiKey]);

  const runGroundingQuery = useCallback(
    async (queryText: string, mode: 'search' | 'maps') => {
      const trimmed = queryText.trim();
      if (trimmed.length < 3) return;
      setGroundingMode(mode);
      setGroundingQuery(trimmed);
      setGroundingLoading(true);
      setGroundingError(null);

      try {
        const res = await fetch('/api/market-insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: trimmed,
            mode,
            location: BUSINESS_INFO.hqCoordinates,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || 'Could not retrieve live grounded insights.');
        }
        setGroundingResult({
          answer: data.answer || '',
          sources: Array.isArray(data.sources) ? data.sources : [],
          mode,
          groundingNote: typeof data.groundingNote === 'string' ? data.groundingNote : undefined,
        });
      } catch (err: any) {
        setGroundingError(
          err?.message || 'Unable to load live grounded data right now. Please try again.',
        );
      } finally {
        setGroundingLoading(false);
      }
    },
    [],
  );

  return (
    <section id="map-explorer" className="py-16 lg:py-24 bg-white border-y border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-8 border-b border-[#E2E8F0]">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-[#9A7835]">
              Interactive DHA Karachi Mapping &amp; Live Intelligence
            </p>
            <h2 className="mt-1 font-display text-3xl sm:text-4xl font-semibold text-[#0F172A] text-balance">
              Explore Listings &amp; Verified Neighborhood Insights
            </h2>
            <p className="mt-2 text-sm text-[#475569]">
              Inspect our DHA Phase 8 headquarters, click active listing pins, or search live
              schools, hospitals, mosques, and real-time Karachi property insights powered by
              Google Maps Platform and Gemini Search &amp; Maps Grounding.
            </p>
          </div>

          <a
            href={BUSINESS_INFO.googleMapsQueryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#0F172A] bg-[#F8FAFC] hover:bg-[#E2E8F0] border border-[#CBD5E1] rounded-lg transition-colors whitespace-nowrap shrink-0 self-start lg:self-auto"
          >
            <Navigation className="w-4 h-4 text-[#9A7835]" aria-hidden="true" />
            <span>Directions to Phase 8 Office</span>
          </a>
        </div>

        {/* Amenity Filter Buttons (Places API New) */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[#475569] mr-1">
            Nearby Places (Live Google Maps):
          </span>
          {AMENITY_FILTERS.map((item) => {
            const active = activeAmenity === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveAmenity(active ? null : item.id)}
                aria-pressed={active}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#0F172A] text-white border-[#0F172A]'
                    : 'bg-[#F8FAFC] text-[#475569] border-[#E2E8F0] hover:border-[#0F172A] hover:text-[#0F172A]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: Interactive Google Map (7 cols) */}
          <div className="lg:col-span-7 flex flex-col">
            {apiKey ? (
              <MapErrorBoundary
                fallback={
                  <div className="h-[460px] rounded-xl border border-[#E2E8F0] bg-[#0F172A] text-white p-8 flex flex-col items-center justify-center text-center">
                    <MapPin className="w-10 h-10 text-[#C5A059] mb-3" aria-hidden="true" />
                    <h3 className="font-display text-xl font-semibold">
                      DHA Phase 8 Interactive Map
                    </h3>
                    <p className="mt-2 text-sm text-slate-300 max-w-md">
                      {BUSINESS_INFO.officeAddress}
                    </p>
                    <a
                      href={BUSINESS_INFO.googleMapsQueryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#0F172A] bg-[#C5A059] hover:bg-[#B08D46] rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" aria-hidden="true" />
                      <span>Open Office Location in Google Maps</span>
                    </a>
                  </div>
                }
              >
                <APIProvider apiKey={apiKey} libraries={['marker', 'places']} language="en" region="PK">
                  <MapContent
                    listings={listings}
                    onSelectProperty={onSelectProperty}
                    activeAmenity={activeAmenity}
                    onClearAmenity={() => setActiveAmenity(null)}
                  />
                </APIProvider>
              </MapErrorBoundary>
            ) : (
              <div className="h-[460px] rounded-xl border border-[#E2E8F0] bg-[#0F172A] text-white p-8 flex flex-col items-center justify-center text-center">
                <MapPin className="w-10 h-10 text-[#C5A059] mb-3" aria-hidden="true" />
                <h3 className="font-display text-xl font-semibold">
                  {keyResolved
                    ? 'DHA Phase 8 Interactive Map Ready'
                    : 'Loading Google Maps Platform...'}
                </h3>
                <p className="mt-2 text-sm text-slate-300 max-w-md">
                  {BUSINESS_INFO.officeAddress}. Once your Google Maps API key is active in the
                  environment, interactive listing markers and live Places discovery load here
                  automatically.
                </p>
                <a
                  href={BUSINESS_INFO.googleMapsQueryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#0F172A] bg-[#C5A059] hover:bg-[#B08D46] rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                  <span>Open Office Location in Google Maps</span>
                </a>
              </div>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-[#475569]">
              <span>Gold Pin: Iqbal Memon Estate HQ (Murtaza Lane 1)</span>
              <span aria-hidden="true">&middot;</span>
              <span>Navy Pins: Active DHA Listings ({listings.length})</span>
              <span aria-hidden="true">&middot;</span>
              <span>Green Pins: Live Nearby Places</span>
            </div>
          </div>

          {/* Right: Live Google Search & Google Maps Grounding Panel (5 cols) */}
          <div className="lg:col-span-5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-5 flex flex-col">
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-[#E2E8F0]">
              <div>
                <h3 className="font-display text-lg font-semibold text-[#0F172A]">
                  Live Market &amp; Location Brief
                </h3>
                <p className="text-xs text-[#475569]">
                  Grounded in real-time Google Search &amp; Google Maps data
                </p>
              </div>
              <Sparkles className="w-4 h-4 text-[#C5A059] shrink-0" aria-hidden="true" />
            </div>

            {/* Mode Switcher */}
            <div
              role="group"
              aria-label="Grounding source"
              className="mt-4 grid grid-cols-2 p-1 bg-[#E2E8F0]/70 rounded-lg"
            >
              <button
                type="button"
                onClick={() => setGroundingMode('search')}
                aria-pressed={groundingMode === 'search'}
                className={`inline-flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  groundingMode === 'search'
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                <Globe className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Google Search Data</span>
              </button>
              <button
                type="button"
                onClick={() => setGroundingMode('maps')}
                aria-pressed={groundingMode === 'maps'}
                className={`inline-flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  groundingMode === 'maps'
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                <Compass className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Google Maps Data</span>
              </button>
            </div>

            {/* Custom Query Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                runGroundingQuery(groundingQuery, groundingMode);
              }}
              className="mt-3 flex gap-2"
            >
              <label htmlFor="grounding-input" className="sr-only">
                Ask about DHA Karachi market trends or nearby places
              </label>
              <input
                id="grounding-input"
                type="text"
                value={groundingQuery}
                onChange={(e) => setGroundingQuery(e.target.value)}
                placeholder={
                  groundingMode === 'search'
                    ? 'e.g. DHA Phase 8 plot rates & transfer rules...'
                    : 'e.g. Best schools & clinics near Murtaza Lane...'
                }
                className="flex-1 h-10 px-3 rounded-lg border border-[#CBD5E1] bg-white text-xs sm:text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
              />
              <button
                type="submit"
                disabled={groundingLoading || groundingQuery.trim().length < 3}
                className="h-10 px-4 text-xs font-semibold text-white bg-[#0F172A] hover:bg-[#1E293B] disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 cursor-pointer"
              >
                {groundingLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
                <span>Research</span>
              </button>
            </form>

            {/* Quick One-Click Research Prompts */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {GROUNDING_PROMPTS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  disabled={groundingLoading}
                  onClick={() => runGroundingQuery(preset.query, preset.mode)}
                  className="text-[11px] font-medium px-2.5 py-1.5 rounded-md bg-white border border-[#E2E8F0] text-[#475569] hover:border-[#C5A059] hover:text-[#0F172A] transition-colors cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Grounded Response Display */}
            <div className="mt-4 flex-1 overflow-y-auto max-h-[245px] bg-white rounded-lg border border-[#E2E8F0] p-4 text-sm text-[#0F172A]">
              {groundingLoading && (
                <div className="h-full flex flex-col items-center justify-center py-8 text-center text-[#475569]">
                  <Loader2 className="w-5 h-5 animate-spin text-[#C5A059] mb-2" />
                  <p className="text-xs font-medium">
                    Fetching live {groundingMode === 'maps' ? 'Google Maps' : 'Google Search'} data
                    for DHA Karachi...
                  </p>
                </div>
              )}

              {!groundingLoading && groundingError && (
                <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                  {groundingError}
                </div>
              )}

              {!groundingLoading && !groundingError && !groundingResult && (
                <div className="py-6 text-center text-xs text-[#475569] space-y-1.5">
                  <p className="font-medium text-[#0F172A]">
                    Live Verified DHA Karachi Intelligence
                  </p>
                  <p>
                    Select a quick brief above or enter any question to query up-to-date Google
                    Search market updates or Google Maps neighborhood places with verified source
                    links.
                  </p>
                </div>
              )}

              {!groundingLoading && !groundingError && groundingResult && (
                <div className="space-y-3">
                  <p className="text-xs sm:text-sm text-[#0F172A] leading-relaxed whitespace-pre-line">
                    {groundingResult.answer}
                  </p>

                  {groundingResult.sources.length > 0 && (
                    <div className="pt-3 border-t border-[#E2E8F0]">
                      <p className="text-[11px] font-semibold text-[#475569] mb-1.5">
                        Verified {groundingResult.mode === 'maps' ? 'Google Maps' : 'Web'} Sources
                      </p>
                      <ul className="space-y-1.5">
                        {groundingResult.sources.map((src) => (
                          <li key={src.uri} className="text-xs">
                            <a
                              href={src.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-[#0F172A] font-medium hover:text-[#9A7835] underline"
                            >
                              <ExternalLink className="w-3 h-3 shrink-0 text-[#C5A059]" />
                              <span>{src.title}</span>
                            </a>
                            {src.snippets && src.snippets.length > 0 && (
                              <p className="mt-0.5 pl-4 text-[11px] text-[#475569] italic">
                                &ldquo;{src.snippets[0]}&rdquo;
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {groundingResult.groundingNote && (
                    <p className="pt-2 border-t border-[#F1F5F9] text-[11px] text-[#64748B]">
                      {groundingResult.groundingNote}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
