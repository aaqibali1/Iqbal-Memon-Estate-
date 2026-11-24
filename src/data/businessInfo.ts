export interface BusinessInfo {
  brandName: string;
  tagline: string;
  bio: string;
  logoUrl: string;
  officeAddress: string;
  shortAddress: string;
  primaryPhoneDisplay: string;
  primaryPhoneTel: string;
  primaryWhatsAppDigits: string;
  primaryWhatsAppUrl: string;
  secondaryPhoneDisplay: string;
  secondaryPhoneTel: string;
  secondaryWhatsAppDigits: string;
  secondaryWhatsAppUrl: string;
  email: string;
  officeHours: string;
  googleMapsQueryUrl: string;
  hqCoordinates: {
    lat: number;
    lng: number;
  };
  socials: {
    facebook: {
      name: string;
      handle: string;
      followers: string;
      url: string;
      description: string;
      cta: string;
    };
    instagram: {
      name: string;
      handle: string;
      url: string;
      description: string;
      cta: string;
    };
    youtube: {
      name: string;
      handle: string;
      url: string;
      description: string;
      cta: string;
    };
  };
}

export const BUSINESS_INFO: BusinessInfo = {
  brandName: 'Iqbal Memon Estate',
  tagline: 'Your Trusted Real Estate Partner in DHA Karachi',
  bio: 'Your trusted real estate partner in DHA Karachi. We deal in the sale, purchase & rental of residential and commercial properties. Honest advice, professional service & trusted investment solutions.',
  logoUrl: '/assets/aistudio/IME_logo_2007c853.JPG',
  officeAddress:
    'Plot No. 41-C/5, Murtaza Lane 1, Ground Floor, DHA Phase 8, Karachi, Pakistan, 75500',
  shortAddress: 'Plot No. 41-C/5, Murtaza Lane 1, DHA Phase 8, Karachi',
  primaryPhoneDisplay: '+92 321 8228626',
  primaryPhoneTel: 'tel:+923218228626',
  primaryWhatsAppDigits: '923218228626',
  primaryWhatsAppUrl: 'https://wa.me/923218228626',
  secondaryPhoneDisplay: '+92 315 2800010',
  secondaryPhoneTel: 'tel:+923152800010',
  secondaryWhatsAppDigits: '923152800010',
  secondaryWhatsAppUrl: 'https://wa.me/923152800010',
  email: 'iqbalmemonestate@hotmail.com',
  officeHours: 'Monday – Saturday: 10:30 AM – 8:00 PM (PKT) · Sunday by Appointment',
  googleMapsQueryUrl:
    'https://www.google.com/maps/search/?api=1&query=Plot+41C+5+Murtaza+Lane+1+DHA+Phase+8+Karachi',
  // Approximate bounding anchor for DHA Phase 8, Karachi (refined via live Places API when loaded)
  hqCoordinates: {
    lat: 24.7838,
    lng: 67.0748,
  },
  socials: {
    youtube: {
      name: 'YouTube',
      handle: '@IqbalMemonEstate',
      url: 'https://www.youtube.com/@IqbalMemonEstate',
      description:
        'Detailed bungalow walkthroughs, DHA Phase 8 street tours, commercial lane evaluations, and candid Karachi market briefings.',
      cta: 'Watch on YouTube',
    },
    facebook: {
      name: 'Facebook',
      handle: 'Iqbal Memon Estate',
      followers: '8K+ Followers',
      url: 'https://www.facebook.com/IqbalMemonEstate',
      description:
        'Daily direct-owner hot deals, verified plot pricing alerts, transfer updates, and active DHA community discussions.',
      cta: 'Follow on Facebook',
    },
    instagram: {
      name: 'Instagram',
      handle: '@iqbal_memon_estate',
      url: 'https://www.instagram.com/iqbal_memon_estate',
      description:
        'Architectural reels, luxury interior previews, twilight bungalow showcases, and curated DHA Phase 8 & 6 listings.',
      cta: 'Follow on Instagram',
    },
  },
};
