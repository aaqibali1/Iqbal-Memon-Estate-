import { useMemo, useState } from 'react';
import { Calculator, Ruler } from 'lucide-react';
import {
  calculateDealEstimate,
  convertArea,
  formatPkrCompact,
  type AreaUnit,
  type PkrUnit,
} from '../utils/calculations';

const QUICK_DHA_SIZES = [100, 200, 300, 500, 1000];

export function AreaCalculator() {
  const [activeTab, setActiveTab] = useState<'area' | 'budget'>('area');

  // Tab 1: Area Converter State
  const [areaValue, setAreaValue] = useState<string>('500');
  const [areaUnit, setAreaUnit] = useState<AreaUnit>('sqYds');

  // Tab 2: Deal & Budget Estimator State
  const [budgetAmount, setBudgetAmount] = useState<string>('16.5');
  const [budgetUnit, setBudgetUnit] = useState<PkrUnit>('crore');
  const [commissionPct, setCommissionPct] = useState<number>(1.0);

  const areaResult = useMemo(
    () => convertArea(parseFloat(areaValue) || 0, areaUnit),
    [areaValue, areaUnit],
  );

  const dealEstimate = useMemo(
    () => calculateDealEstimate(parseFloat(budgetAmount) || 0, budgetUnit, commissionPct),
    [budgetAmount, budgetUnit, commissionPct],
  );

  return (
    <section id="calculator" className="py-16 lg:py-24 bg-white border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-[#E2E8F0]">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-[#9A7835]">Buyer &amp; Investor Utility</p>
            <h2 className="mt-1 font-display text-3xl sm:text-4xl font-semibold text-[#0F172A] text-balance">
              Karachi Property Area &amp; Investment Calculator
            </h2>
            <p className="mt-2 text-sm text-[#475569]">
              Convert standard DHA Karachi plot sizes instantly or estimate your Bayana (10%),
              agency commission, and transfer buffer in PKR before committing to a deal.
            </p>
          </div>

          {/* 2-Tab Segmented Switch */}
          <div
            role="tablist"
            aria-label="Calculator modes"
            className="inline-flex p-1 bg-[#F1F5F9] rounded-lg self-start md:self-auto"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'area'}
              onClick={() => setActiveTab('area')}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'area'
                  ? 'bg-[#0F172A] text-white shadow-xs'
                  : 'text-[#475569] hover:text-[#0F172A]'
              }`}
            >
              <Ruler className="w-4 h-4" aria-hidden="true" />
              <span>Area Converter</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'budget'}
              onClick={() => setActiveTab('budget')}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'budget'
                  ? 'bg-[#0F172A] text-white shadow-xs'
                  : 'text-[#475569] hover:text-[#0F172A]'
              }`}
            >
              <Calculator className="w-4 h-4" aria-hidden="true" />
              <span>Deal &amp; Budget Estimator</span>
            </button>
          </div>
        </div>

        {activeTab === 'area' ? (
          <div
            role="tabpanel"
            aria-label="Area Converter"
            className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Input Panel */}
            <div className="lg:col-span-5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-6 space-y-5">
              <div>
                <label
                  htmlFor="calc-area-value"
                  className="block text-xs font-semibold text-[#475569] mb-1.5"
                >
                  Enter Plot / Covered Area
                </label>
                <div className="flex gap-3">
                  <input
                    id="calc-area-value"
                    type="number"
                    min={0}
                    step="any"
                    value={areaValue}
                    onChange={(e) => setAreaValue(e.target.value)}
                    className="flex-1 h-11 px-3.5 rounded-lg border border-[#CBD5E1] bg-white text-base font-semibold text-[#0F172A] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                  />
                  <label htmlFor="calc-area-unit" className="sr-only">
                    Select area unit
                  </label>
                  <select
                    id="calc-area-unit"
                    value={areaUnit}
                    onChange={(e) => setAreaUnit(e.target.value as AreaUnit)}
                    className="h-11 px-3 rounded-lg border border-[#CBD5E1] bg-white text-sm font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                  >
                    <option value="sqYds">Square Yards (Gaz)</option>
                    <option value="sqFt">Square Feet</option>
                    <option value="marla">Marla (272.25 sq. ft)</option>
                    <option value="kanal">Kanal</option>
                  </select>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-[#475569] mb-2">
                  Common DHA Karachi Plot Sizes (Sq. Yds):
                </p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_DHA_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setAreaUnit('sqYds');
                        setAreaValue(String(size));
                      }}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border tabular-nums transition-colors cursor-pointer ${
                        areaUnit === 'sqYds' && Number(areaValue) === size
                          ? 'bg-[#0F172A] text-white border-[#0F172A]'
                          : 'bg-white text-[#0F172A] border-[#CBD5E1] hover:border-[#C5A059]'
                      }`}
                    >
                      {size} Gaz
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-xs text-[#475569] pt-2 border-t border-[#E2E8F0]">
                Standard Pakistan Survey Formula: 1 Sq. Yd (Gaz) = 9 Sq. Ft &middot; 1 Marla =
                272.25 Sq. Ft &middot; 1 Kanal = 20 Marlas (5,445 Sq. Ft).
              </p>
            </div>

            {/* Live Converted Readout Grid */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
                <p className="text-xs font-semibold text-[#475569]">Square Yards (Gaz)</p>
                <p
                  data-testid="conv-sqyds"
                  className="mt-2 font-display text-3xl font-semibold text-[#0F172A] tabular-nums"
                >
                  {areaResult.sqYds.toLocaleString('en-PK', { maximumFractionDigits: 2 })}
                </p>
                <p className="mt-1 text-xs text-[#475569]">Primary DHA Karachi plot unit</p>
              </div>

              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
                <p className="text-xs font-semibold text-[#475569]">Square Feet (Sq. Ft)</p>
                <p
                  data-testid="conv-sqft"
                  className="mt-2 font-display text-3xl font-semibold text-[#0F172A] tabular-nums"
                >
                  {areaResult.sqFt.toLocaleString('en-PK', { maximumFractionDigits: 2 })}
                </p>
                <p className="mt-1 text-xs text-[#475569]">Standard apartment &amp; covered area</p>
              </div>

              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
                <p className="text-xs font-semibold text-[#475569]">Marla (272.25 Sq. Ft)</p>
                <p
                  data-testid="conv-marla"
                  className="mt-2 font-display text-3xl font-semibold text-[#0F172A] tabular-nums"
                >
                  {areaResult.marla.toLocaleString('en-PK', { maximumFractionDigits: 2 })}
                </p>
                <p className="mt-1 text-xs text-[#475569]">Standard Pakistan land survey Marla</p>
              </div>

              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
                <p className="text-xs font-semibold text-[#475569]">Kanal (20 Marlas)</p>
                <p
                  data-testid="conv-kanal"
                  className="mt-2 font-display text-3xl font-semibold text-[#0F172A] tabular-nums"
                >
                  {areaResult.kanal.toLocaleString('en-PK', { maximumFractionDigits: 3 })}
                </p>
                <p className="mt-1 text-xs text-[#475569]">605 Sq. Yds = 1 Standard Kanal</p>
              </div>
            </div>
          </div>
        ) : (
          <div
            role="tabpanel"
            aria-label="Deal and Budget Estimator"
            className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Budget Inputs */}
            <div className="lg:col-span-5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-6 space-y-6">
              <div>
                <label
                  htmlFor="calc-budget-amount"
                  className="block text-xs font-semibold text-[#475569] mb-1.5"
                >
                  Property Value (PKR)
                </label>
                <div className="flex gap-3">
                  <input
                    id="calc-budget-amount"
                    type="number"
                    min={0}
                    step="0.1"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    className="flex-1 h-11 px-3.5 rounded-lg border border-[#CBD5E1] bg-white text-base font-semibold text-[#0F172A] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                  />
                  <div
                    role="group"
                    aria-label="PKR denomination"
                    className="inline-flex p-1 bg-white border border-[#CBD5E1] rounded-lg"
                  >
                    {(['crore', 'lakh'] as const).map((unit) => (
                      <button
                        key={unit}
                        type="button"
                        onClick={() => setBudgetUnit(unit)}
                        aria-pressed={budgetUnit === unit}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-colors cursor-pointer ${
                          budgetUnit === unit
                            ? 'bg-[#0F172A] text-white'
                            : 'text-[#475569] hover:text-[#0F172A]'
                        }`}
                      >
                        {unit}s
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="calc-commission-slider"
                    className="text-xs font-semibold text-[#475569]"
                  >
                    Agency Commission Rate
                  </label>
                  <span className="text-sm font-bold text-[#0F172A] tabular-nums">
                    {commissionPct.toFixed(2)}%
                  </span>
                </div>
                <input
                  id="calc-commission-slider"
                  type="range"
                  min={1}
                  max={2}
                  step={0.25}
                  value={commissionPct}
                  onChange={(e) => setCommissionPct(Number(e.target.value))}
                  className="w-full accent-[#C5A059] cursor-pointer"
                />
                <div className="mt-1 flex justify-between text-[11px] text-[#475569] tabular-nums">
                  <span>1.0% Standard</span>
                  <span>1.5%</span>
                  <span>2.0% Commercial</span>
                </div>
              </div>

              <p className="text-xs text-[#475569] pt-3 border-t border-[#E2E8F0] leading-relaxed">
                Note: All figures are indicative planning estimates. Actual DHA Karachi transfer
                fees, stamp duty, CVT, and FBR filer/non-filer withholding taxes vary by plot
                category and tax status. Consult our Phase 8 desk for an exact written breakdown.
              </p>
            </div>

            {/* Budget Breakdown Card */}
            <div className="lg:col-span-7 bg-[#0F172A] text-white rounded-xl p-6 sm:p-8 space-y-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2 pb-4 border-b border-white/10">
                <div>
                  <p className="text-xs font-medium text-[#E2C68B]">
                    Estimated Total Capital Required
                  </p>
                  <p
                    data-testid="budget-total"
                    className="mt-1 font-display text-3xl sm:text-4xl font-semibold text-white tabular-nums"
                  >
                    {formatPkrCompact(dealEstimate.totalEstimatedOutlayPkr)}
                  </p>
                </div>
                <p className="text-xs text-slate-300 tabular-nums">
                  PKR {Math.round(dealEstimate.totalEstimatedOutlayPkr).toLocaleString('en-PK')}
                </p>
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <dt className="text-xs text-slate-300">Estimated Token / Bayana (10%)</dt>
                  <dd className="mt-1 text-lg font-bold text-[#E2C68B] tabular-nums">
                    {formatPkrCompact(dealEstimate.tokenBayanaPkr)}
                  </dd>
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <dt className="text-xs text-slate-300">Remaining Balance at Transfer (90%)</dt>
                  <dd className="mt-1 text-lg font-bold text-white tabular-nums">
                    {formatPkrCompact(dealEstimate.remainingBalancePkr)}
                  </dd>
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <dt className="text-xs text-slate-300">
                    Agency Commission ({dealEstimate.commissionPct.toFixed(2)}%)
                  </dt>
                  <dd
                    data-testid="budget-commission"
                    className="mt-1 text-lg font-bold text-white tabular-nums"
                  >
                    {formatPkrCompact(dealEstimate.commissionPkr)}
                  </dd>
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <dt className="text-xs text-slate-300">
                    Transfer, NDC &amp; Tax Buffer (~{dealEstimate.transferBufferPct}%)
                  </dt>
                  <dd className="mt-1 text-lg font-bold text-white tabular-nums">
                    {formatPkrCompact(dealEstimate.transferBufferPkr)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
