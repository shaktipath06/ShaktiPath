// Home page copy and static sections, taken from the approved design (canvas page "1. Home").
// Practitioners, service tiles and reviews are records, not copy: they come from the API (lib/api.js).

export const HERO = {
  id: 'home-hero',
  title: 'Where\nTradition Meets',
  accent: 'Transformation',
  subtitle:
    'Connect with verified, experienced Tantric practitioners across India for guidance and spiritual practice.',
  ctaLabel: 'Find Your Tantric',
  ctaHref: '/consult',
  // Slideshow: slides in from the left every `interval` ms.
  images: ['/images/scenes/hero-goddess.jpg', '/images/scenes/banner-kali-idol.jpg', '/images/scenes/banner-seeker.jpg'],
  interval: 2000,
};

export const TRUST_STRIP = [
  { icon: 'badge-check', title: 'Verified Tantrics', description: 'Identity and experience checked' },
  { icon: 'flower-2', title: 'Authentic Practices', description: 'Rooted in traditional lineages' },
  { icon: 'lock', title: 'Secure Payments', description: 'Encrypted transactions' },
  { icon: 'map-pin', title: 'Pan India Access', description: 'Consult from anywhere' },
  { icon: 'users', title: 'Growing Community', description: 'Seekers across the country' },
];

export const WHY_CHOOSE = {
  title: 'Why Choose',
  accent: 'ShaktiPath?',
  lead: 'More than a platform, a spiritual companion',
  text: 'ShaktiPath makes authentic Tantra, Sadhana and spiritual guidance accessible to everyone, in a way that is safe, trusted and modern.',
  ctaLabel: 'Our Mission',
  ctaHref: '/about',
  features: [
    {
      image: '/images/scenes/feature-trishul.jpg',
      icon: 'shield-check',
      title: 'Verified & Trusted Tantrics',
      description: 'Practitioners with checked identity and experience',
    },
    {
      image: '/images/scenes/feature-scripture.jpg',
      icon: 'flower-2',
      title: 'Authentic Spiritual Guidance',
      description: 'Rooted in traditional lineages and practices',
    },
    {
      image: '/images/scenes/feature-lotus-lock.jpg',
      icon: 'lock',
      title: 'Safe & Secure Platform',
      description: 'Encrypted payments and protected personal data',
    },
    {
      image: '/images/scenes/feature-community.jpg',
      icon: 'heart',
      title: 'A Supportive Community',
      description: 'A growing family of seekers on the path',
    },
  ],
};

export const SECTIONS = {
  topTantrics: {
    title: 'Meet Our Top Tantrics',
    subtitle: 'Verified practitioners, rated by the seekers they have guided',
    href: '/consult',
  },
  services: { title: 'Explore Our Services', href: '/consult' },
  howItWorks: { title: 'How It Works' },
  reviews: { title: 'What Our Users Say', href: '/reviews' },
};

export const APP_BAND = {
  title: 'Download Our App',
  tagline: 'Your spiritual journey, now in your hands',
  points: [
    'Consult Tantrics on the go',
    'Easy booking and secure payments',
    'Exclusive content, offers and updates',
    'A more personal spiritual experience',
  ],
  qrNote: 'Scan the code to download. Official store badges replace these once the apps are published.',
  image: '/images/scenes/app-phones.jpg',
  imageAlt: 'The ShaktiPath app on two phones: the home screen and a practitioner profile',
  quote: { lead: 'Same ', accent: 'Divine Experience', tail: 'Now on Mobile' },
};
