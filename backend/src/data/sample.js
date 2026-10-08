// Built-in sample content, served only when the database is unavailable in development.
// Mirrors db/seed.sql for the home page. SAMPLE DATA: placeholder names, photos and ratings.
import { reviewCountLabel } from '../lib/format.js';

const tantric = (slug, name, specialty, image, rating, reviewCount, extra = {}) => ({
  id: null,
  slug,
  name,
  specialty,
  image,
  rating,
  reviewCount,
  reviews: reviewCountLabel(reviewCount),
  verified: true,
  city: null,
  state: null,
  yearsExperience: null,
  price: null,
  href: `/tantrics/${slug}`,
  ...extra,
});

export const sample = {
  tantrics: [
    tantric('acharya-rudranath', 'Acharya Rudranath', 'Kali Sadhana, Protection', '/images/practitioners/tantric-rudranath-b.jpg', 4.9, 320, { city: 'Varanasi', state: 'Uttar Pradesh', yearsExperience: 15, price: 2500 }),
    tantric('maa-tantrika-devi', 'Maa Tantrika Devi', 'Shakti Sadhana, Meditation', '/images/practitioners/tantric-tantrika-devi.jpg', 4.8, 280, { city: 'Kolkata', state: 'West Bengal', yearsExperience: 12, price: 2200 }),
    tantric('pandit-agnivesh', 'Pandit Agnivesh', 'Business & Wealth', '/images/practitioners/tantric-agnivesh.jpg', 4.9, 190, { city: 'Delhi NCR', state: 'Delhi', yearsExperience: 13, price: 2800 }),
    tantric('maa-kamakhya-sadhika', 'Maa Kamakhya Sadhika', 'Love & Relationship', '/images/practitioners/tantric-kamakhya-sadhika.jpg', 4.8, 250, { city: 'Guwahati', state: 'Assam', yearsExperience: 11, price: 2500 }),
    tantric('swami-kauleshwar', 'Swami Kauleshwar', 'Relationship Guidance', '/images/practitioners/tantric-kauleshwar.jpg', 4.8, 220, { city: 'Haridwar', state: 'Uttarakhand', yearsExperience: 18, price: 2000 }),
    tantric('acharya-vamdev', 'Acharya Vamdev', 'Business Growth, Rituals', '/images/practitioners/tantric-vamdev.jpg', 4.8, 267, { city: 'Delhi NCR', state: 'Delhi', yearsExperience: 14, price: 2000 }),
  ],
  serviceCategories: [
    { id: null, slug: 'online-consultation', name: 'Online Consultation', description: 'Personal guidance over a secure video call.', image: '/images/scenes/service-meditation.jpg', href: '/consult' },
    { id: null, slug: 'rituals-pujas', name: 'Rituals & Pujas', description: 'Traditional pujas performed by verified practitioners.', image: '/images/scenes/service-grah-shanti.jpg', href: '/consult?category=rituals-pujas' },
    { id: null, slug: 'sadhana-programs', name: 'Sadhana Programs', description: 'Guided practice programs with a practitioner.', image: '/images/scenes/service-kali-sadhana.jpg', href: '/consult?category=sadhana-programs' },
    { id: null, slug: 'spiritual-books', name: 'Spiritual Books', description: 'Scriptures, commentaries and practice guides.', image: '/images/products/category-books.jpg', href: '/shop?category=books' },
    { id: null, slug: 'mala-yantras', name: 'Mala & Yantras', description: 'Energised malas and traditional yantras.', image: '/images/products/category-mala.jpg', href: '/shop?category=mala' },
    { id: null, slug: 'courses-certification', name: 'Courses & Certification', description: 'Structured learning with certificates.', image: '/images/products/course-tantra-basics.jpg', href: '/shop?category=courses' },
  ],
  reviews: [
    { id: null, name: 'Ananya S.', avatar: '/images/people/avatar-ananya.jpg', rating: 5, quote: 'Clear, kind guidance. I left the call feeling calm and sure of my next step.', verifiedBooking: true, date: '2026-09-20 10:00:00', tantric: { slug: 'acharya-rudranath', name: 'Acharya Rudranath' } },
    { id: null, name: 'Rohit M.', avatar: '/images/people/avatar-rohit.jpg', rating: 5, quote: 'The puja was performed with so much devotion. Highly recommended.', verifiedBooking: true, date: '2026-09-18 10:00:00', tantric: { slug: 'acharya-vamdev', name: 'Acharya Vamdev' } },
    { id: null, name: 'Meera K.', avatar: '/images/people/avatar-meera.jpg', rating: 5, quote: 'I found clarity and peace. Thank you, ShaktiPath.', verifiedBooking: true, date: '2026-09-15 10:00:00', tantric: { slug: 'maa-tantrika-devi', name: 'Maa Tantrika Devi' } },
  ],
};
