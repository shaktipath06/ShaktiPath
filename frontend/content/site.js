// Site-wide content: navigation, footer, legal text. Edit copy here, not inside components.

export const SITE = {
  name: 'ShaktiPath',
  byline: 'by TantraTalk',
  fullName: 'ShaktiPath by TantraTalk',
  tagline: 'Ancient wisdom, authentic guidance, a better you.',
  description:
    'Connect with verified, experienced Tantric practitioners across India for consultations, rituals and pujas, sadhana programs, courses and spiritual products.',
};

// Routes the header links to. Consult (/consult), Book (/book) and Shop (/shop) are built; Learn and
// Transform open the branded "coming soon" page (app/not-found.js) until those pages exist.
export const NAV_LINKS = [
  { label: 'Consult', href: '/consult' },
  { label: 'Book', href: '/book' },
  { label: 'Shop', href: '/shop' },
  { label: 'Learn', href: '/learn' },
  { label: 'Transform', href: '/transform' },
];

export const FOOTER_COLUMNS = [
  {
    title: 'Quick Links',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Our Tantrics', href: '/consult' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contact Us', href: '/contact' },
    ],
  },
  {
    title: 'Customer Support',
    links: [
      { label: 'Help Center', href: '/help' },
      { label: 'How We Verify Practitioners', href: '/how-we-verify' },
      { label: 'Terms & Conditions', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Refund Policy', href: '/refund-policy' },
    ],
  },
];

export const SOCIAL_LINKS = {
  instagram: '#',
  youtube: '#',
  facebook: '#',
};

// Replace with the real store listings once the apps are published.
export const APP_STORE_LINKS = {
  playStore: '#',
  appStore: '#',
};

// Bracketed values must be supplied by the client before launch.
export const LEGAL = {
  disclaimer:
    'Spiritual guidance only. Not a substitute for medical, legal or financial advice. Outcomes are personal and are not guaranteed.',
  lines: [
    'Operated by [Legal entity name], [Registered address]. CIN [number] · GSTIN [number]',
    'Grievance Officer: [Name], [email], [phone] · Support 9 AM - 9 PM IST, every day',
  ],
  // Kept as a fixed string so the footer can be cached and prerendered; update it each January.
  copyright: '© 2026 ShaktiPath by TantraTalk. All Rights Reserved.',
};
