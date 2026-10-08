// Shop page copy and filter definitions (canvas page "5. Shop"). Categories, products and courses are records
// from the API; the cart is kept in the browser until checkout exists (components/shop/CartProvider.js).

export const SHOP = {
  title: 'Shop',
  accent: 'Spiritual Products',
  subtitle: 'Authentic, energised and traditional products for your spiritual journey.',
  image: '/images/scenes/banner-kali-idol.jpg',
  trust: [
    { icon: 'gem', title: '100% Authentic & Energised' },
    { icon: 'flower-2', title: 'Vedic & Tantric Traditions' },
    { icon: 'user-check', title: 'Trusted by 5000+ Seekers' },
    { icon: 'lock', title: 'Secure Payments' },
    { icon: 'globe', title: 'Worldwide Shipping' },
  ],
  sections: {
    featured: 'Featured Products',
    bestSellers: 'Best Sellers',
    courses: 'Popular Spiritual Courses',
    results: 'Products',
    courseResults: 'Courses',
  },
  cartNote: 'Taxes and shipping are shown at checkout.',
  searchPlaceholder: 'Search products, rituals, books',
  pageSize: 12,
  emptyTitle: 'No products match these filters',
  emptyText: 'Try another category or widen the price range.',
};

export const PRODUCT_SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
];

export const SHOP_RATING_OPTIONS = [
  { value: 5, label: '5 stars' },
  { value: 4, label: '4 stars & above' },
  { value: 3, label: '3 stars & above' },
];

export const SHOP_PRICE_RANGE = { min: 0, max: 50000, step: 500 };
