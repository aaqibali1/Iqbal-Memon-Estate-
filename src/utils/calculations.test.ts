import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildWhatsAppUrl,
  calculateDealEstimate,
  convertArea,
  filterAndSortProperties,
  formatPkrCompact,
  validateInquiryForm,
} from './calculations';
import { PROPERTIES } from '../data/properties';

test('convertArea accurately converts 500 Sq. Yds (Gaz) to Sq. Ft, Marla, and Kanal', () => {
  const res = convertArea(500, 'sqYds');
  assert.equal(res.sqYds, 500);
  assert.equal(res.sqFt, 4500);
  assert.ok(Math.abs(res.marla - 4500 / 272.25) < 1e-6);
  assert.ok(Math.abs(res.kanal - 4500 / 5445) < 1e-6);
});

test('convertArea converts 1 Kanal cleanly to 20 Marlas and 605 Sq. Yds', () => {
  const res = convertArea(1, 'kanal');
  assert.equal(res.marla, 20);
  assert.equal(res.sqFt, 5445);
  assert.equal(res.sqYds, 605);
});

test('calculateDealEstimate computes 10% Bayana, adjustable commission, and total outlay', () => {
  const est = calculateDealEstimate(16.5, 'crore', 1.5);
  assert.equal(est.propertyValuePkr, 165_000_000);
  assert.equal(est.tokenBayanaPkr, 16_500_000);
  assert.equal(est.commissionPkr, 2_475_000);
  assert.equal(est.transferBufferPkr, 7_425_000);
  assert.equal(est.totalEstimatedOutlayPkr, 174_900_000);
  assert.equal(formatPkrCompact(est.tokenBayanaPkr), 'PKR 1.65 Crore');
});

test('filterAndSortProperties filters by purpose, area, keyword, shortlist and sorts correctly', () => {
  const rentals = filterAndSortProperties(
    PROPERTIES,
    {
      purpose: 'Rent',
      area: 'All',
      type: 'All',
      keyword: '',
      sortBy: 'price-asc',
      shortlistedOnly: false,
    },
    [],
  );
  assert.equal(rentals.length, 3);
  assert.ok(rentals[0].pricePkr <= rentals[1].pricePkr);

  const shortlistedOnly = filterAndSortProperties(
    PROPERTIES,
    {
      purpose: 'All',
      area: 'All',
      type: 'All',
      keyword: '',
      sortBy: 'featured',
      shortlistedOnly: true,
    },
    ['IME-801', 'IME-603'],
  );
  assert.equal(shortlistedOnly.length, 2);

  const murtazaSearch = filterAndSortProperties(
    PROPERTIES,
    {
      purpose: 'All',
      area: 'All',
      type: 'All',
      keyword: 'Murtaza',
      sortBy: 'featured',
      shortlistedOnly: false,
    },
    [],
  );
  assert.ok(murtazaSearch.some((p) => p.id === 'IME-802'));
});

test('validateInquiryForm catches missing fields and passes valid lead data', () => {
  const invalid = validateInquiryForm({
    fullName: 'A',
    phone: '123',
    intent: 'Buy',
    preferredArea: 'DHA Phase 8',
    propertyReference: '',
    message: 'Hi',
  });
  assert.ok(invalid.fullName);
  assert.ok(invalid.phone);
  assert.ok(invalid.message);

  const valid = validateInquiryForm({
    fullName: 'Bilal Siddiqui',
    phone: '+92 300 2234567',
    intent: 'Buy',
    preferredArea: 'DHA Phase 8',
    propertyReference: 'IME-801',
    message: 'Interested in scheduling a viewing for the 500 Sq. Yds bungalow.',
  });
  assert.deepEqual(valid, {});
});

test('buildWhatsAppUrl encodes property details cleanly', () => {
  const url = buildWhatsAppUrl('+92 321 8228626', 'Hello IME-801');
  assert.equal(url, 'https://wa.me/923218228626?text=Hello%20IME-801');
});
