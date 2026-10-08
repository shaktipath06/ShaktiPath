// Fallback content for the home page, used only when the API cannot be reached (for example when
// the backend is not running). It mirrors backend/db/seed.sql. SAMPLE DATA: placeholder names,
// photos and ratings for layout only.

const tantric = (slug, name, specialty, image, rating, reviews) => ({
  slug,
  name,
  specialty,
  image,
  rating,
  reviews,
  verified: true,
  href: `/tantrics/${slug}`,
});

export const SAMPLE_HOME = {
  tantrics: [
    tantric('acharya-rudranath', 'Acharya Rudranath', 'Kali Sadhana, Protection', '/images/practitioners/tantric-rudranath-b.jpg', 4.9, '320+'),
    tantric('maa-tantrika-devi', 'Maa Tantrika Devi', 'Shakti Sadhana, Meditation', '/images/practitioners/tantric-tantrika-devi.jpg', 4.8, '280+'),
    tantric('pandit-agnivesh', 'Pandit Agnivesh', 'Business & Wealth', '/images/practitioners/tantric-agnivesh.jpg', 4.9, '190+'),
    tantric('maa-kamakhya-sadhika', 'Maa Kamakhya Sadhika', 'Love & Relationship', '/images/practitioners/tantric-kamakhya-sadhika.jpg', 4.8, '250+'),
    tantric('swami-kauleshwar', 'Swami Kauleshwar', 'Relationship Guidance', '/images/practitioners/tantric-kauleshwar.jpg', 4.8, '220+'),
    tantric('acharya-vamdev', 'Acharya Vamdev', 'Business Growth, Rituals', '/images/practitioners/tantric-vamdev.jpg', 4.8, '260+'),
  ],
  serviceCategories: [
    { slug: 'online-consultation', name: 'Online Consultation', image: '/images/scenes/service-meditation.jpg', href: '/consult' },
    { slug: 'rituals-pujas', name: 'Rituals & Pujas', image: '/images/scenes/service-grah-shanti.jpg', href: '/consult?category=rituals-pujas' },
    { slug: 'sadhana-programs', name: 'Sadhana Programs', image: '/images/scenes/service-kali-sadhana.jpg', href: '/consult?category=sadhana-programs' },
    { slug: 'spiritual-books', name: 'Spiritual Books', image: '/images/products/category-books.jpg', href: '/shop?category=books' },
    { slug: 'mala-yantras', name: 'Mala & Yantras', image: '/images/products/category-mala.jpg', href: '/shop?category=mala' },
    { slug: 'courses-certification', name: 'Courses & Certification', image: '/images/products/course-tantra-basics.jpg', href: '/shop?category=courses' },
  ],
  reviews: [
    { name: 'Ananya S.', avatar: '/images/people/avatar-ananya.jpg', rating: 5, quote: 'Clear, kind guidance. I left the call feeling calm and sure of my next step.', verifiedBooking: true },
    { name: 'Rohit M.', avatar: '/images/people/avatar-rohit.jpg', rating: 5, quote: 'The puja was performed with so much devotion. Highly recommended.', verifiedBooking: true },
    { name: 'Meera K.', avatar: '/images/people/avatar-meera.jpg', rating: 5, quote: 'I found clarity and peace. Thank you, ShaktiPath.', verifiedBooking: true },
  ],
};
