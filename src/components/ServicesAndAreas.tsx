import { ArrowUpRight } from 'lucide-react';
import type { PropertyArea } from '../data/properties';

interface ServicesAndAreasProps {
  onSelectArea: (area: PropertyArea) => void;
}

const CORE_SERVICES = [
  {
    number: '01.',
    title: 'Residential Sale & Purchase',
    description:
      'Verified bungalows, residential plots, and sea-facing apartments across DHA Karachi with clear ownership verification and transparent pricing.',
    scope: '500 & 1,000 Sq. Yds Bungalows · Plots · Apartments',
  },
  {
    number: '02.',
    title: 'Commercial Properties',
    description:
      'Strategic acquisition and leasing across Murtaza Commercial, Bukhari, Ittehad, Shahbaz, Zulfiqar, and Phase 8 commercial lanes.',
    scope: 'Showrooms · Commercial Plots · Corporate Floors',
  },
  {
    number: '03.',
    title: 'Rental Solutions',
    description:
      'End-to-end corporate and family leasing connecting vetted tenants with luxury bungalows, executive portions, and prime retail spaces.',
    scope: 'Verified Tenants · Lease Drafting · Yield Management',
  },
  {
    number: '04.',
    title: 'Trusted Investment Advisory',
    description:
      'Honest market valuation, realistic ROI projections, DHA transfer & NDC documentation guidance, and overseas Pakistani portfolio support.',
    scope: 'Valuation · Market Timing · Documentation Support',
  },
];

const DHA_AREAS: Array<{
  title: string;
  filterArea: PropertyArea;
  subtitle: string;
  highlight: string;
  imageUrl: string;
}> = [
  {
    title: 'DHA Phase 8 (HQ)',
    filterArea: 'DHA Phase 8',
    subtitle: 'Zone A & B · Khayaban-e-Shaheen · Creek Corridor',
    highlight: 'Home to our Murtaza Lane 1 office — Karachi’s premier coastal luxury & growth zone.',
    imageUrl: '/src/assets/images/hero_dha_bungalow_1795508067298.jpg',
  },
  {
    title: 'DHA Phase 7',
    filterArea: 'DHA Phase 7',
    subtitle: 'Khayaban-e-Jami · Main Boulevard · Extension',
    highlight: 'Modern double-unit bungalows and high-demand family residences bordering Phase 8.',
    imageUrl: '/src/assets/images/listing_prime_plot_1795508059099.jpg',
  },
  {
    title: 'DHA Phase 6',
    filterArea: 'DHA Phase 6',
    subtitle: 'Khayaban-e-Muhafiz · Shahbaz · Bukhari',
    highlight: 'Established wide-boulevard estates, 500–1,000 Sq. Yds mansions, and mature amenities.',
    imageUrl: '/src/assets/images/listing_corner_estate_1795508087878.jpg',
  },
  {
    title: 'DHA Phase 5',
    filterArea: 'DHA Phase 5',
    subtitle: 'Saba Avenue · Khayaban-e-Tauheed · Badar',
    highlight: 'High-liquidity residential neighborhoods prized for executive rentals and steady value.',
    imageUrl: '/src/assets/images/listing_luxury_apartment_1795508056462.jpg',
  },
  {
    title: 'DHA Phase 4',
    filterArea: 'DHA Phase 4',
    subtitle: 'Sunset Boulevard · 9th Commercial · Gizri Link',
    highlight: 'Central tree-lined residential lanes with swift connectivity to Clifton and business hubs.',
    imageUrl: '/src/assets/images/hero_dha_bungalow_1795508067298.jpg',
  },
  {
    title: 'DHA Commercial Lanes',
    filterArea: 'DHA Commercial Lanes',
    subtitle: 'Murtaza · Zulfiqar · Ittehad · Bukhari',
    highlight: 'High-footfall retail showrooms, 100–200 Sq. Yds commercial plots, and corporate hubs.',
    imageUrl: '/src/assets/images/listing_commercial_plaza_1795508062408.jpg',
  },
];

export function ServicesAndAreas({ onSelectArea }: ServicesAndAreasProps) {
  return (
    <>
      {/* Core Services Section */}
      <section id="services" className="py-16 lg:py-24 bg-[#F8FAFC] border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl pb-8 border-b border-[#E2E8F0]">
            <p className="text-sm font-medium text-[#9A7835]">Full-Spectrum Consultancy</p>
            <h2 className="mt-1 font-display text-3xl sm:text-4xl font-semibold text-[#0F172A] text-balance">
              Specialized Real Estate Services in DHA Karachi
            </h2>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {CORE_SERVICES.map((service) => (
              <div
                key={service.number}
                className="bg-white rounded-xl border border-[#E2E8F0] p-6 sm:p-7 flex flex-col justify-between hover:border-[#CBD5E1] transition-colors"
              >
                <div>
                  <p className="text-sm font-semibold text-[#9A7835] tabular-nums">
                    {service.number}
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-semibold text-[#0F172A]">
                    {service.title}
                  </h3>
                  <p className="mt-3 text-sm text-[#475569] leading-relaxed">
                    {service.description}
                  </p>
                </div>
                <p className="mt-6 pt-4 border-t border-[#F1F5F9] text-xs font-medium text-[#0F172A]">
                  {service.scope}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clickable Key DHA Areas Section */}
      <section id="areas" className="py-16 lg:py-24 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-[#E2E8F0]">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-[#9A7835]">Key DHA Karachi Zones</p>
              <h2 className="mt-1 font-display text-3xl sm:text-4xl font-semibold text-[#0F172A] text-balance">
                Areas We Cover Across Defence Housing Authority
              </h2>
            </div>
            <p className="text-sm text-[#475569]">
              Select any area below to filter our active inventory immediately.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {DHA_AREAS.map((area) => (
              <button
                key={area.title}
                type="button"
                onClick={() => onSelectArea(area.filterArea)}
                className="group text-left bg-white rounded-xl border border-[#E2E8F0] overflow-hidden flex flex-col hover:shadow-lg hover:border-[#C5A059] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
              >
                <div className="relative aspect-[4/3] bg-[#0F172A] overflow-hidden">
                  <img
                    src={area.imageUrl}
                    alt={area.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/85 via-[#0F172A]/20 to-transparent"
                  />
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                    <span className="font-display text-xl font-semibold">{area.title}</span>
                    <ArrowUpRight
                      className="w-4 h-4 text-[#E2C68B] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden="true"
                    />
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <p className="text-xs font-medium text-[#9A7835]">{area.subtitle}</p>
                  <p className="mt-2 text-xs text-[#475569] leading-relaxed">{area.highlight}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
