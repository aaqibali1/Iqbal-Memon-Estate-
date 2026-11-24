export type PropertyPurpose = 'Buy' | 'Rent';

export type PropertyArea =
  | 'DHA Phase 8'
  | 'DHA Phase 7'
  | 'DHA Phase 6'
  | 'DHA Phase 5'
  | 'DHA Phase 4'
  | 'DHA Commercial Lanes';

export type PropertyType =
  | 'Bungalow'
  | 'Residential Plot'
  | 'Commercial Plot'
  | 'Apartment'
  | 'Portion / Floor';

export interface PropertyListing {
  id: string;
  title: string;
  purpose: PropertyPurpose;
  area: PropertyArea;
  subLocation: string;
  type: PropertyType;
  priceDisplay: string;
  /** Numeric price in PKR for sorting (full value for Buy, monthly rent for Rent) */
  pricePkr: number;
  sizeSqYds: number;
  sizeDisplay: string;
  bedrooms: number;
  bathrooms: number;
  featured?: boolean;
  statusLabel: 'For Sale' | 'For Rent';
  imageUrl: string;
  description: string;
  highlights: string[];
  /** Used to focus or query map area in DHA Karachi */
  mapQuery: string;
  mapOffset: {
    latOffset: number;
    lngOffset: number;
  };
}

export const HERO_IMAGE_URL =
  '/src/assets/images/hero_dha_bungalow_1795508067298.jpg';

export const PROPERTY_AREAS: PropertyArea[] = [
  'DHA Phase 8',
  'DHA Phase 7',
  'DHA Phase 6',
  'DHA Phase 5',
  'DHA Phase 4',
  'DHA Commercial Lanes',
];

export const PROPERTY_TYPES: PropertyType[] = [
  'Bungalow',
  'Residential Plot',
  'Commercial Plot',
  'Apartment',
  'Portion / Floor',
];

export const PROPERTIES: PropertyListing[] = [
  {
    id: 'IME-801',
    title: '500 Sq. Yds Brand New Designer Bungalow',
    purpose: 'Buy',
    area: 'DHA Phase 8',
    subLocation: 'Zone A, Near Khayaban-e-Shaheen, DHA Phase 8',
    type: 'Bungalow',
    priceDisplay: 'PKR 16.5 Crore',
    pricePkr: 165_000_000,
    sizeSqYds: 500,
    sizeDisplay: '500 Sq. Yds',
    bedrooms: 5,
    bathrooms: 6,
    featured: true,
    statusLabel: 'For Sale',
    imageUrl: '/src/assets/images/hero_dha_bungalow_1795508067298.jpg',
    description:
      'Architectural contemporary 5-bedroom residence featuring double-height glazed lounge, full basement entertainment suite, Italian porcelain flooring, imported kitchen fittings, and landscaped lap-pool courtyard.',
    highlights: [
      'West Open',
      'Full Basement + Swimming Pool',
      'Near Murtaza Commercial',
      'Double-Height Glass Atrium',
      '4-Car Marble Porch',
      'Solar Ready Wiring',
    ],
    mapQuery: 'DHA Phase 8 Zone A Karachi',
    mapOffset: { latOffset: 0.0024, lngOffset: 0.0032 },
  },
  {
    id: 'IME-802',
    title: '200 Sq. Yds Prime Commercial Plot on Murtaza Lane',
    purpose: 'Buy',
    area: 'DHA Commercial Lanes',
    subLocation: 'Murtaza Commercial Lane 1, DHA Phase 8',
    type: 'Commercial Plot',
    priceDisplay: 'PKR 19.2 Crore',
    pricePkr: 192_000_000,
    sizeSqYds: 200,
    sizeDisplay: '200 Sq. Yds',
    bedrooms: 0,
    bathrooms: 0,
    featured: true,
    statusLabel: 'For Sale',
    imageUrl: '/src/assets/images/listing_commercial_plaza_1795508062408.jpg',
    description:
      'High-visibility 200 Sq. Yds commercial plot in the thriving Murtaza Commercial hub of DHA Phase 8, approved for Basement + Ground + Mezzanine + 4 Floors with strong retail and corporate rental yield.',
    highlights: [
      'Main Murtaza Commercial Hub',
      'Clear Title & Instant Possession',
      'High Footfall Retail Corridor',
      'Corner Approach Access',
      'Ideal for Flagship Showroom or Offices',
    ],
    mapQuery: 'Al Murtaza Commercial Lane DHA Phase 8 Karachi',
    mapOffset: { latOffset: 0.0002, lngOffset: -0.0005 },
  },
  {
    id: 'IME-603',
    title: '1000 Sq. Yds Corner Mansion with Private Pool',
    purpose: 'Buy',
    area: 'DHA Phase 6',
    subLocation: 'Off Khayaban-e-Muhafiz, DHA Phase 6',
    type: 'Bungalow',
    priceDisplay: 'PKR 34.0 Crore',
    pricePkr: 340_000_000,
    sizeSqYds: 1000,
    sizeDisplay: '1,000 Sq. Yds',
    bedrooms: 6,
    bathrooms: 7,
    featured: true,
    statusLabel: 'For Sale',
    imageUrl: '/src/assets/images/listing_corner_estate_1795508087878.jpg',
    description:
      'Grand 1,000 Sq. Yds neoclassical limestone corner estate offering dual entrances, lush private lawn, heated turquoise lap pool, home cinema in basement, and elevator servicing all levels.',
    highlights: [
      'Corner Plot',
      'Swimming Pool & Gazebo',
      'Private Elevator',
      'Full Basement Theatre',
      'Servant Quarter Block',
      'Peaceful Wide Street',
    ],
    mapQuery: 'DHA Phase 6 Karachi',
    mapOffset: { latOffset: 0.0155, lngOffset: -0.0102 },
  },
  {
    id: 'IME-804',
    title: 'Sea-Facing 3-Bed Luxury Apartment for Rent',
    purpose: 'Rent',
    area: 'DHA Phase 8',
    subLocation: 'Creek Vista / Emaar Crescent Corridor, DHA Phase 8',
    type: 'Apartment',
    priceDisplay: 'PKR 4.2 Lakh / month',
    pricePkr: 420_000,
    sizeSqYds: 295,
    sizeDisplay: '2,650 Sq. Ft',
    bedrooms: 3,
    bathrooms: 4,
    featured: true,
    statusLabel: 'For Rent',
    imageUrl: '/src/assets/images/listing_luxury_apartment_1795508056462.jpg',
    description:
      'High-floor panoramic sea-facing residence featuring Italian marble floors, floor-to-ceiling sunset balcony, fully equipped gourmet kitchen, standby power, and 24/7 gated concierge security.',
    highlights: [
      'Unobstructed Sea View',
      '2 Reserved Covered Parking Bays',
      '24/7 Backup Generator & Security',
      'Resident Gym & Pool Access',
      'Corporate Lease Friendly',
    ],
    mapQuery: 'DHA Phase 8 Sea View Karachi',
    mapOffset: { latOffset: -0.0082, lngOffset: 0.0045 },
  },
  {
    id: 'IME-805',
    title: '500 Sq. Yds Corner Residential Plot — Zone B',
    purpose: 'Buy',
    area: 'DHA Phase 8',
    subLocation: 'Zone B, Off Khayaban-e-Ghalib, DHA Phase 8',
    type: 'Residential Plot',
    priceDisplay: 'PKR 10.8 Crore',
    pricePkr: 108_000_000,
    sizeSqYds: 500,
    sizeDisplay: '500 Sq. Yds',
    bedrooms: 0,
    bathrooms: 0,
    statusLabel: 'For Sale',
    imageUrl: '/src/assets/images/listing_prime_plot_1795508059099.jpg',
    description:
      'Level, solidly developed 500 Sq. Yds corner plot surrounded by newly constructed executive bungalows in Phase 8 Zone B. Complete underground utilities and clean DHA transfer record.',
    highlights: [
      'Corner & West Open',
      'All Utilities Installed',
      'Surrounded by Built Bungalows',
      'Wide 60-Ft Road Frontage',
      'Direct Owner Transfer',
    ],
    mapQuery: 'DHA Phase 8 Zone B Karachi',
    mapOffset: { latOffset: 0.0048, lngOffset: 0.0086 },
  },
  {
    id: 'IME-506',
    title: '500 Sq. Yds Executive Upper Portion for Rent',
    purpose: 'Rent',
    area: 'DHA Phase 5',
    subLocation: 'Near Saba Avenue & Khayaban-e-Tauheed, DHA Phase 5',
    type: 'Portion / Floor',
    priceDisplay: 'PKR 2.85 Lakh / month',
    pricePkr: 285_000,
    sizeSqYds: 500,
    sizeDisplay: '500 Sq. Yds (Upper)',
    bedrooms: 3,
    bathrooms: 3,
    statusLabel: 'For Rent',
    imageUrl: '/src/assets/images/listing_luxury_apartment_1795508056462.jpg',
    description:
      'Newly renovated independent-entrance upper floor with expansive front terrace, sunlit drawing/dining hall, separate utility meters, and peaceful tree-lined residential street.',
    highlights: [
      'Independent Entrance',
      'Separate Electricity & Gas Meters',
      '2-Car Porch Space',
      'Near Parks & Schools',
      'Immediate Occupancy',
    ],
    mapQuery: 'DHA Phase 5 Karachi',
    mapOffset: { latOffset: 0.0172, lngOffset: -0.0255 },
  },
  {
    id: 'IME-707',
    title: '300 Sq. Yds Modern Double-Unit Bungalow',
    purpose: 'Buy',
    area: 'DHA Phase 7',
    subLocation: 'Near Khayaban-e-Jami & Main Boulevard, DHA Phase 7',
    type: 'Bungalow',
    priceDisplay: 'PKR 11.4 Crore',
    pricePkr: 114_000_000,
    sizeSqYds: 300,
    sizeDisplay: '300 Sq. Yds',
    bedrooms: 5,
    bathrooms: 5,
    statusLabel: 'For Sale',
    imageUrl: '/src/assets/images/listing_corner_estate_1795508087878.jpg',
    description:
      'Well-planned 300 Sq. Yds double-unit residence with contemporary elevation, solid ash-wood doors, modular kitchens on both floors, and effortless access to Main Korangi Road and Phase 8.',
    highlights: [
      'Double-Unit Layout',
      'Near Main Boulevard',
      'West Open Ventilation',
      'High Rental Demand Area',
      'Clean DHA Lease Papers',
    ],
    mapQuery: 'DHA Phase 7 Karachi',
    mapOffset: { latOffset: 0.0245, lngOffset: -0.0042 },
  },
  {
    id: 'IME-808',
    title: 'Ground Floor Corporate Showroom on Zulfiqar Lane',
    purpose: 'Rent',
    area: 'DHA Commercial Lanes',
    subLocation: 'Zulfiqar Commercial Street 3, DHA Phase 8',
    type: 'Commercial Plot',
    priceDisplay: 'PKR 6.5 Lakh / month',
    pricePkr: 650_000,
    sizeSqYds: 200,
    sizeDisplay: '2,400 Sq. Ft (G + Mezz)',
    bedrooms: 0,
    bathrooms: 2,
    statusLabel: 'For Rent',
    imageUrl: '/src/assets/images/listing_commercial_plaza_1795508062408.jpg',
    description:
      'Turnkey double-height glass frontage ground floor plus mezzanine commercial space on Zulfiqar Lane, DHA Phase 8. Ideal for luxury retail, banking, design studio, or corporate flagship office.',
    highlights: [
      'Ground + Mezzanine Double Height',
      'Dedicated Front Customer Parking',
      'Zulfiqar Commercial Prime Visibility',
      '3-Phase Commercial Power',
      'Long-Term Corporate Lease Available',
    ],
    mapQuery: 'Zulfiqar Commercial DHA Phase 8 Karachi',
    mapOffset: { latOffset: 0.0031, lngOffset: -0.0038 },
  },
  {
    id: 'IME-409',
    title: '500 Sq. Yds Renovated Family Bungalow',
    purpose: 'Buy',
    area: 'DHA Phase 4',
    subLocation: 'Off Sunset Boulevard & 9th Commercial, DHA Phase 4',
    type: 'Bungalow',
    priceDisplay: 'PKR 14.2 Crore',
    pricePkr: 142_000_000,
    sizeSqYds: 500,
    sizeDisplay: '500 Sq. Yds',
    bedrooms: 5,
    bathrooms: 5,
    statusLabel: 'For Sale',
    imageUrl: '/src/assets/images/hero_dha_bungalow_1795508067298.jpg',
    description:
      'Tastefully renovated 500 Sq. Yds family home in a serene tree-lined lane of DHA Phase 4, offering a spacious front lawn, updated wooden flooring, modern kitchen, and quick commute to Clifton and Gizri.',
    highlights: [
      'Renovated Contemporary Interiors',
      'Prime Central Phase 4 Location',
      'Lush Front Lawn & 3-Car Porch',
      'Minutes from Sunset Boulevard',
      'Clean DHA Transfer Record',
    ],
    mapQuery: 'DHA Phase 4 Karachi',
    mapOffset: { latOffset: 0.031, lngOffset: -0.022 },
  },
];
