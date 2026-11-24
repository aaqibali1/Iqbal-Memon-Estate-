import type {
  PropertyArea,
  PropertyListing,
  PropertyPurpose,
  PropertyType,
} from '../data/properties';

export type AreaUnit = 'sqYds' | 'sqFt' | 'marla' | 'kanal';

export interface AreaConversionResult {
  sqYds: number;
  sqFt: number;
  marla: number;
  kanal: number;
}

/** Standard Karachi / Pakistan survey constants:
 * 1 Sq. Yd (Gaz) = 9 Sq. Ft
 * 1 Marla = 272.25 Sq. Ft
 * 1 Kanal = 20 Marlas = 5445 Sq. Ft
 */
export const SQ_FT_PER_SQ_YD = 9;
export const SQ_FT_PER_MARLA = 272.25;
export const MARLAS_PER_KANAL = 20;
export const SQ_FT_PER_KANAL = SQ_FT_PER_MARLA * MARLAS_PER_KANAL; // 5445

export function convertArea(value: number, fromUnit: AreaUnit): AreaConversionResult {
  const safeValue = Number.isFinite(value) && value >= 0 ? value : 0;

  let sqFt = 0;
  switch (fromUnit) {
    case 'sqYds':
      sqFt = safeValue * SQ_FT_PER_SQ_YD;
      break;
    case 'sqFt':
      sqFt = safeValue;
      break;
    case 'marla':
      sqFt = safeValue * SQ_FT_PER_MARLA;
      break;
    case 'kanal':
      sqFt = safeValue * SQ_FT_PER_KANAL;
      break;
  }

  return {
    sqYds: sqFt / SQ_FT_PER_SQ_YD,
    sqFt,
    marla: sqFt / SQ_FT_PER_MARLA,
    kanal: sqFt / SQ_FT_PER_KANAL,
  };
}

export type PkrUnit = 'crore' | 'lakh';

export interface DealEstimateResult {
  propertyValuePkr: number;
  tokenBayanaPkr: number;
  commissionPct: number;
  commissionPkr: number;
  transferBufferPct: number;
  transferBufferPkr: number;
  remainingBalancePkr: number;
  totalEstimatedOutlayPkr: number;
}

export function calculateDealEstimate(
  amount: number,
  unit: PkrUnit,
  commissionPct: number,
  transferBufferPct = 4.5,
): DealEstimateResult {
  const safeAmount = Number.isFinite(amount) && amount >= 0 ? amount : 0;
  const clampedCommission = Math.min(2, Math.max(1, Number.isFinite(commissionPct) ? commissionPct : 1));
  const multiplier = unit === 'crore' ? 10_000_000 : 100_000;
  const propertyValuePkr = safeAmount * multiplier;
  const tokenBayanaPkr = propertyValuePkr * 0.1;
  const commissionPkr = propertyValuePkr * (clampedCommission / 100);
  const transferBufferPkr = propertyValuePkr * (transferBufferPct / 100);
  const remainingBalancePkr = propertyValuePkr - tokenBayanaPkr;
  const totalEstimatedOutlayPkr = propertyValuePkr + commissionPkr + transferBufferPkr;

  return {
    propertyValuePkr,
    tokenBayanaPkr,
    commissionPct: clampedCommission,
    commissionPkr,
    transferBufferPct,
    transferBufferPkr,
    remainingBalancePkr,
    totalEstimatedOutlayPkr,
  };
}

export function formatPkrCompact(pkr: number): string {
  if (!Number.isFinite(pkr) || pkr <= 0) return 'PKR 0';
  if (pkr >= 10_000_000) {
    const crores = pkr / 10_000_000;
    return `PKR ${crores.toFixed(crores >= 100 ? 1 : 2)} Crore`;
  }
  if (pkr >= 100_000) {
    const lakhs = pkr / 100_000;
    return `PKR ${lakhs.toFixed(lakhs >= 100 ? 1 : 2)} Lakh`;
  }
  return `PKR ${Math.round(pkr).toLocaleString('en-PK')}`;
}

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'size-desc';

export interface ListingFilters {
  purpose: 'All' | PropertyPurpose;
  area: 'All' | PropertyArea;
  type: 'All' | PropertyType;
  keyword: string;
  sortBy: SortOption;
  shortlistedOnly: boolean;
}

export function filterAndSortProperties(
  listings: PropertyListing[],
  filters: ListingFilters,
  shortlistedIds: string[],
): PropertyListing[] {
  const query = filters.keyword.trim().toLowerCase();
  const shortlistedSet = new Set(shortlistedIds);

  const filtered = listings.filter((item) => {
    if (filters.shortlistedOnly && !shortlistedSet.has(item.id)) return false;
    if (filters.purpose !== 'All' && item.purpose !== filters.purpose) return false;
    if (filters.area !== 'All' && item.area !== filters.area) return false;
    if (filters.type !== 'All' && item.type !== filters.type) return false;
    if (query) {
      const haystack = [
        item.id,
        item.title,
        item.area,
        item.subLocation,
        item.type,
        item.priceDisplay,
        item.description,
        ...item.highlights,
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  const sorted = [...filtered];
  switch (filters.sortBy) {
    case 'price-asc':
      sorted.sort((a, b) => a.pricePkr - b.pricePkr);
      break;
    case 'price-desc':
      sorted.sort((a, b) => b.pricePkr - a.pricePkr);
      break;
    case 'size-desc':
      sorted.sort((a, b) => b.sizeSqYds - a.sizeSqYds);
      break;
    case 'featured':
    default:
      sorted.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
      break;
  }

  return sorted;
}

export function buildWhatsAppUrl(phoneDigits: string, message: string): string {
  const cleanDigits = phoneDigits.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanDigits}?text=${encodeURIComponent(message)}`;
}

export interface InquiryFormInput {
  fullName: string;
  phone: string;
  intent: 'Buy' | 'Sell' | 'Rent' | 'Invest';
  preferredArea: string;
  propertyReference: string;
  message: string;
}

export interface InquiryValidationErrors {
  fullName?: string;
  phone?: string;
  message?: string;
}

export function validateInquiryForm(input: InquiryFormInput): InquiryValidationErrors {
  const errors: InquiryValidationErrors = {};
  if (input.fullName.trim().length < 2) {
    errors.fullName = 'Please enter your full name.';
  }
  const phoneDigits = input.phone.replace(/[^0-9]/g, '');
  if (phoneDigits.length < 10 || phoneDigits.length > 15) {
    errors.phone = 'Please enter a valid phone or WhatsApp number (10–15 digits).';
  }
  if (input.message.trim().length < 8) {
    errors.message = 'Please share a brief note about your requirement (at least 8 characters).';
  }
  return errors;
}
