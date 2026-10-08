// Find a Tantric page copy and filter definitions (canvas page "2. Find a Tantric").
// Practitioners, specialties and cities are records: they come from the API.

export const CONSULT = {
  title: 'Find a Tantric',
  subtitle: 'Connect with verified and experienced Tantric practitioners for guidance and spiritual practice.',
  image: '/images/scenes/banner-seeker.jpg',
  mantra: '॥ शक्ति ही मार्ग है ॥',
  aside: '“Find the right guide for your spiritual journey”',
  searchPlaceholder: 'Search by name, expertise or keyword',
  pageSize: 12,
  emptyTitle: 'No practitioners match these filters',
  emptyText: 'Try removing a filter or widening the price range.',
};

export const SORT_OPTIONS = [
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'experience', label: 'Most Experienced' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

// Experience ranges map to the API's minYears (inclusive) and maxYears (exclusive).
export const EXPERIENCE_OPTIONS = [
  { value: '0-5', label: '0 - 5 Years', min: 0, max: 5 },
  { value: '5-10', label: '5 - 10 Years', min: 5, max: 10 },
  { value: '10', label: '10+ Years', min: 10 },
];

export const LANGUAGE_OPTIONS = ['Hindi', 'English', 'Sanskrit', 'Bengali', 'Assamese'];

export const RATING_OPTIONS = [4.8, 4.5, 4];

export const PRICE_RANGE = { min: 0, max: 50000, step: 500 };

// How many expertise checkboxes show before "Show More".
export const EXPERTISE_VISIBLE = 6;
