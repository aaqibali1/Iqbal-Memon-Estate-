import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Youtube,
} from 'lucide-react';
import { BUSINESS_INFO } from '../data/businessInfo';
import { PROPERTY_AREAS } from '../data/properties';
import {
  buildWhatsAppUrl,
  validateInquiryForm,
  type InquiryFormInput,
  type InquiryValidationErrors,
} from '../utils/calculations';

interface SavedInquiry extends InquiryFormInput {
  id: string;
  submittedAt: string;
}

interface ContactSectionProps {
  prefillReference?: string;
  prefillArea?: string;
}

const INQUIRY_STORAGE_KEY = 'ime_submitted_inquiries';

export function ContactSection({ prefillReference = '', prefillArea = '' }: ContactSectionProps) {
  const [form, setForm] = useState<InquiryFormInput>({
    fullName: '',
    phone: '',
    intent: 'Buy',
    preferredArea: 'DHA Phase 8',
    propertyReference: '',
    message: '',
  });
  const [errors, setErrors] = useState<InquiryValidationErrors>({});
  const [submittedRecord, setSubmittedRecord] = useState<SavedInquiry | null>(null);
  const [savedCount, setSavedCount] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(INQUIRY_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      return 0;
    }
  });

  // Sync property reference when user clicks "Request Site Visit" inside PropertyModal
  useEffect(() => {
    if (!prefillReference) return;
    setSubmittedRecord(null);
    setForm((prev) => ({
      ...prev,
      propertyReference: prefillReference,
      preferredArea: prefillArea || prev.preferredArea,
      message:
        prev.message.trim().length > 0
          ? prev.message
          : `I would like to schedule a site visit and discuss pricing for ${prefillReference}.`,
    }));
  }, [prefillReference, prefillArea]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateInquiryForm(form);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }
    setErrors({});

    const record: SavedInquiry = {
      ...form,
      id: `INQ-${Date.now().toString().slice(-5)}`,
      submittedAt: new Date().toISOString(),
    };

    try {
      const existingRaw = localStorage.getItem(INQUIRY_STORAGE_KEY);
      const existing: SavedInquiry[] = existingRaw ? JSON.parse(existingRaw) : [];
      const nextList = [record, ...(Array.isArray(existing) ? existing : [])];
      localStorage.setItem(INQUIRY_STORAGE_KEY, JSON.stringify(nextList));
      setSavedCount(nextList.length);
    } catch {
      // Ignore storage quota errors in private browsing
    }

    setSubmittedRecord(record);
  };

  const buildLeadWhatsAppHref = (data: InquiryFormInput) => {
    const lines = [
      'Assalam-o-Alaikum Iqbal Memon Estate,',
      `Name: ${data.fullName || 'Prospective Client'}`,
      `Phone: ${data.phone || 'Not provided'}`,
      `Looking To: ${data.intent}`,
      `Preferred Area: ${data.preferredArea}`,
      data.propertyReference ? `Property Ref: ${data.propertyReference}` : null,
      `Message: ${data.message || 'Please share suitable DHA Karachi options.'}`,
    ].filter(Boolean);
    return buildWhatsAppUrl(BUSINESS_INFO.primaryWhatsAppDigits, lines.join('\n'));
  };

  return (
    <section id="contact" className="py-16 lg:py-24 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl pb-8 border-b border-[#E2E8F0]">
          <p className="text-sm font-medium text-[#9A7835]">Speak With Our Senior Desk</p>
          <h2 className="mt-1 font-display text-3xl sm:text-4xl font-semibold text-[#0F172A] text-balance">
            Contact Iqbal Memon Estate
          </h2>
          <p className="mt-2 text-sm text-[#475569]">
            Schedule a private bungalow viewing, request a DHA Phase 8 valuation, or share your
            investment criteria directly with our team.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Direct Contact Details */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-[#E2E8F0] p-6 sm:p-7 space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3.5">
                <MapPin className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-xs font-semibold text-[#475569]">DHA Phase 8 Office</p>
                  <p className="mt-1 text-sm font-medium text-[#0F172A] leading-relaxed">
                    {BUSINESS_INFO.officeAddress}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <Phone className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" aria-hidden="true" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-[#475569]">Phone &amp; WhatsApp</p>
                  <div className="flex flex-col gap-1 text-sm font-semibold text-[#0F172A] tabular-nums">
                    <a
                      href={BUSINESS_INFO.primaryPhoneTel}
                      className="hover:text-[#9A7835] transition-colors"
                    >
                      {BUSINESS_INFO.primaryPhoneDisplay}{' '}
                      <span className="text-xs font-normal text-[#475569]">(Primary)</span>
                    </a>
                    <a
                      href={BUSINESS_INFO.secondaryPhoneTel}
                      className="hover:text-[#9A7835] transition-colors"
                    >
                      {BUSINESS_INFO.secondaryPhoneDisplay}{' '}
                      <span className="text-xs font-normal text-[#475569]">(Secondary)</span>
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <Mail className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-xs font-semibold text-[#475569]">Email</p>
                  <a
                    href={`mailto:${BUSINESS_INFO.email}`}
                    className="mt-1 inline-block text-sm font-semibold text-[#0F172A] hover:text-[#9A7835] transition-colors break-all"
                  >
                    {BUSINESS_INFO.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <Clock className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-xs font-semibold text-[#475569]">Office Hours</p>
                  <p className="mt-1 text-sm text-[#0F172A]">{BUSINESS_INFO.officeHours}</p>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Buttons */}
            <div className="pt-5 border-t border-[#E2E8F0] space-y-2.5">
              <a
                href={BUSINESS_INFO.primaryWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#16A34A] hover:bg-[#15803D] rounded-lg transition-colors"
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                <span>WhatsApp {BUSINESS_INFO.primaryPhoneDisplay}</span>
              </a>
              <a
                href={BUSINESS_INFO.secondaryWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#0F172A] bg-[#F8FAFC] hover:bg-[#E2E8F0] border border-[#CBD5E1] rounded-lg transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-[#16A34A]" aria-hidden="true" />
                <span>WhatsApp {BUSINESS_INFO.secondaryPhoneDisplay}</span>
              </a>
            </div>

            {/* Social Channel Icon Links */}
            <div className="pt-5 border-t border-[#E2E8F0]">
              <p className="text-xs font-semibold text-[#475569] mb-3">Official Social Channels</p>
              <div className="flex items-center gap-2.5">
                <a
                  href={BUSINESS_INFO.socials.facebook.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Iqbal Memon Estate on Facebook"
                  className="w-10 h-10 rounded-lg border border-[#E2E8F0] flex items-center justify-center text-[#0F172A] hover:border-[#C5A059] hover:text-[#9A7835] transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href={BUSINESS_INFO.socials.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Iqbal Memon Estate on Instagram"
                  className="w-10 h-10 rounded-lg border border-[#E2E8F0] flex items-center justify-center text-[#0F172A] hover:border-[#C5A059] hover:text-[#9A7835] transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href={BUSINESS_INFO.socials.youtube.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Iqbal Memon Estate on YouTube"
                  className="w-10 h-10 rounded-lg border border-[#E2E8F0] flex items-center justify-center text-[#0F172A] hover:border-[#C5A059] hover:text-[#9A7835] transition-colors"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Lead Inquiry Form */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-[#E2E8F0] p-6 sm:p-8">
            {submittedRecord ? (
              <div className="py-6 space-y-5" data-testid="inquiry-confirmation">
                <div className="flex items-start gap-3.5">
                  <CheckCircle2 className="w-7 h-7 text-[#16A34A] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-display text-2xl font-semibold text-[#0F172A]">
                      Inquiry Received ({submittedRecord.id})
                    </h3>
                    <p className="mt-1 text-sm text-[#475569]">
                      Thank you, <span className="font-semibold text-[#0F172A]">{submittedRecord.fullName}</span>.
                      Your inquiry has been saved locally ({savedCount} saved on this device). For
                      immediate priority response from our Phase 8 consultants, tap below to send
                      your complete inquiry directly on WhatsApp.
                    </p>
                  </div>
                </div>

                <div className="bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] p-4 text-xs text-[#475569] space-y-1">
                  <p>
                    <strong className="text-[#0F172A]">Intent:</strong> {submittedRecord.intent} in{' '}
                    {submittedRecord.preferredArea}
                  </p>
                  {submittedRecord.propertyReference && (
                    <p>
                      <strong className="text-[#0F172A]">Property Reference:</strong>{' '}
                      {submittedRecord.propertyReference}
                    </p>
                  )}
                  <p>
                    <strong className="text-[#0F172A]">Phone / WhatsApp:</strong>{' '}
                    {submittedRecord.phone}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href={buildLeadWhatsAppHref(submittedRecord)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#16A34A] hover:bg-[#15803D] rounded-lg transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" aria-hidden="true" />
                    <span>Send Inquiry Directly on WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedRecord(null);
                      setForm({
                        fullName: '',
                        phone: '',
                        intent: 'Buy',
                        preferredArea: 'DHA Phase 8',
                        propertyReference: '',
                        message: '',
                      });
                    }}
                    className="px-4 py-3 text-sm font-semibold text-[#0F172A] bg-[#F8FAFC] hover:bg-[#E2E8F0] border border-[#CBD5E1] rounded-lg transition-colors cursor-pointer"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-xs font-semibold text-[#475569] mb-1.5"
                    >
                      Full Name *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      placeholder="e.g. Tariq Mahmood"
                      className={`w-full h-11 px-3.5 rounded-lg border text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#C5A059] ${
                        errors.fullName ? 'border-red-400 bg-red-50/40' : 'border-[#CBD5E1] bg-white'
                      }`}
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-phone"
                      className="block text-xs font-semibold text-[#475569] mb-1.5"
                    >
                      Phone / WhatsApp Number *
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="e.g. +92 300 1234567"
                      className={`w-full h-11 px-3.5 rounded-lg border text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#C5A059] ${
                        errors.phone ? 'border-red-400 bg-red-50/40' : 'border-[#CBD5E1] bg-white'
                      }`}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="contact-intent"
                      className="block text-xs font-semibold text-[#475569] mb-1.5"
                    >
                      Looking To
                    </label>
                    <select
                      id="contact-intent"
                      value={form.intent}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          intent: e.target.value as InquiryFormInput['intent'],
                        })
                      }
                      className="w-full h-11 px-3.5 rounded-lg border border-[#CBD5E1] bg-white text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                    >
                      <option value="Buy">Buy Property</option>
                      <option value="Sell">Sell Property</option>
                      <option value="Rent">Rent / Lease</option>
                      <option value="Invest">Investment Advisory</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="contact-area"
                      className="block text-xs font-semibold text-[#475569] mb-1.5"
                    >
                      Preferred DHA Area
                    </label>
                    <select
                      id="contact-area"
                      value={form.preferredArea}
                      onChange={(e) => setForm({ ...form, preferredArea: e.target.value })}
                      className="w-full h-11 px-3.5 rounded-lg border border-[#CBD5E1] bg-white text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                    >
                      {PROPERTY_AREAS.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-ref"
                    className="block text-xs font-semibold text-[#475569] mb-1.5"
                  >
                    Property Reference (Optional)
                  </label>
                  <input
                    id="contact-ref"
                    type="text"
                    value={form.propertyReference}
                    onChange={(e) => setForm({ ...form, propertyReference: e.target.value })}
                    placeholder="Auto-filled from listings or enter ID (e.g. IME-801)"
                    className="w-full h-11 px-3.5 rounded-lg border border-[#CBD5E1] bg-white text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-xs font-semibold text-[#475569] mb-1.5"
                  >
                    Your Requirement / Message *
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Share your budget range, preferred plot size (e.g. 500 Sq. Yds), or desired site visit timing..."
                    className={`w-full p-3.5 rounded-lg border text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#C5A059] ${
                      errors.message ? 'border-red-400 bg-red-50/40' : 'border-[#CBD5E1] bg-white'
                    }`}
                  />
                  {errors.message && (
                    <p className="mt-1 text-xs text-red-600">{errors.message}</p>
                  )}
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#0F172A] hover:bg-[#1E293B] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-[#C5A059]" aria-hidden="true" />
                    <span>Submit Inquiry</span>
                  </button>

                  <a
                    href={buildLeadWhatsAppHref(form)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-[#15803D] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors whitespace-nowrap"
                  >
                    <MessageCircle className="w-4 h-4" aria-hidden="true" />
                    <span>Send Inquiry Directly on WhatsApp</span>
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
