-- ============================================================================
-- ShaktiPath sample content. SAMPLE DATA ONLY: every name, photo, rating, price
-- and review below is placeholder content from the approved design, for layout
-- and development. Replace with real, consented records before launch.
-- Safe to re-run (INSERT IGNORE keyed on unique columns, or NOT EXISTS guards).
-- ============================================================================

SET NAMES utf8mb4;

-- ---------------------------------------------------------------- specialties
INSERT IGNORE INTO specialties (slug, name, icon, sort_order) VALUES
  ('kali-sadhana',          'Kali Sadhana',          'flame',        1),
  ('protection',            'Protection',            'shield-check', 2),
  ('energy-balancing',      'Energy Balancing',      'leaf',         3),
  ('shakti-sadhana',        'Shakti Sadhana',        'flame',        4),
  ('meditation',            'Meditation',            'flower-2',     5),
  ('business-wealth',       'Business & Wealth',     'briefcase',    6),
  ('lakshmi-sadhana',       'Lakshmi Sadhana',       'gem',          7),
  ('love-relationship',     'Love & Relationship',   'heart',        8),
  ('relationship-guidance', 'Relationship Guidance', 'sparkles',     9),
  ('business-growth',       'Business Growth',       'briefcase',   10),
  ('rituals-pujas',         'Rituals & Pujas',       'flame',       11),
  ('kamakhya-sadhana',      'Kamakhya Sadhana',      'flower-2',    12),
  ('grah-shanti',           'Grah Shanti',           'sun',         13),
  ('baglamukhi-sadhana',    'Baglamukhi Sadhana',    'flame',       14),
  ('kaal-bhairav-sadhana',  'Kaal Bhairav Sadhana',  'flame',       15),
  ('spiritual-guidance',    'Spiritual Guidance',    'flower-2',    16),
  ('chakra-balancing',      'Chakra Balancing',      'layers',      17),
  ('tantra-sadhana',        'Tantra Sadhana',        'flame',       18),
  ('kundalini',             'Kundalini',             'sparkles',    19),
  ('wellbeing-practices',   'Wellbeing Practices',   'hand-heart',  20),
  ('aura-cleansing',        'Aura Cleansing',        'layers',      21);

-- ------------------------------------------------------------------- tantrics
INSERT IGNORE INTO tantrics
  (slug, display_name, headline, bio, mission_quote, photo_url, profile_photo_url, city, state, years_experience, consultations_count, languages, session_modes, base_price, rating_avg, rating_count, is_verified, verified_at, is_featured, featured_order)
VALUES
  ('acharya-rudranath', 'Acharya Rudranath', 'Kali Sadhana, Protection',
   'Acharya Rudranath is a Tantric practitioner with over 15 years of experience in Kali Sadhana, protection rituals and energy balancing practices. He has guided thousands of seekers through Vedic and Tantric practices, combining traditional methods with a compassionate understanding of modern life.',
   'My work is to help seekers find steadiness, awaken inner strength and connect with the energy of Maa Kali.',
   '/images/practitioners/tantric-rudranath-b.jpg', '/images/practitioners/tantric-rudranath.jpg', 'Varanasi', 'Uttar Pradesh', 15, 5000, '["Hindi","English","Sanskrit"]', 'online,offline', 2500.00, 4.90, 320, 1, NOW(), 1, 1),
  ('maa-tantrika-devi', 'Maa Tantrika Devi', 'Shakti Sadhana, Meditation', NULL, NULL,
   '/images/practitioners/tantric-tantrika-devi.jpg', NULL, 'Kolkata', 'West Bengal', 12, 3200, '["Hindi","Bengali","English"]', 'online,offline', 2200.00, 4.80, 280, 1, NOW(), 1, 2),
  ('pandit-agnivesh', 'Pandit Agnivesh', 'Business & Wealth', NULL, NULL,
   '/images/practitioners/tantric-agnivesh.jpg', NULL, 'Delhi NCR', 'Delhi', 13, 2600, '["Hindi","English"]', 'online', 2800.00, 4.90, 190, 1, NOW(), 1, 3),
  ('maa-kamakhya-sadhika', 'Maa Kamakhya Sadhika', 'Love & Relationship', NULL, NULL,
   '/images/practitioners/tantric-kamakhya-sadhika.jpg', NULL, 'Guwahati', 'Assam', 11, 2900, '["Hindi","Assamese","English"]', 'online,offline', 2500.00, 4.80, 250, 1, NOW(), 1, 4),
  ('swami-kauleshwar', 'Swami Kauleshwar', 'Relationship Guidance', NULL, NULL,
   '/images/practitioners/tantric-kauleshwar.jpg', NULL, 'Haridwar', 'Uttarakhand', 18, 4100, '["Hindi","English","Sanskrit"]', 'online,offline', 2000.00, 4.80, 220, 1, NOW(), 1, 5),
  ('acharya-vamdev', 'Acharya Vamdev', 'Business Growth, Rituals', NULL, NULL,
   '/images/practitioners/tantric-vamdev.jpg', NULL, 'Delhi NCR', 'Delhi', 14, 3000, '["Hindi","English"]', 'online,offline', 2000.00, 4.80, 267, 1, NOW(), 1, 6),
  ('maa-trinetra-sadhika', 'Maa Trinetra Sadhika', 'Kamakhya Sadhana, Energy Balancing', NULL, NULL,
   '/images/practitioners/tantric-trinetra.jpg', NULL, 'Guwahati', 'Assam', 12, 1800, '["Hindi","Assamese"]', 'online', 3000.00, 4.80, 189, 1, NOW(), 0, 0),
  ('tantra-guru-devnarayan', 'Tantra Guru Devnarayan', 'Relationship Guidance, Grah Shanti', NULL, NULL,
   '/images/practitioners/tantric-devnarayan.jpg', NULL, 'Ujjain', 'Madhya Pradesh', 15, 3500, '["Hindi","English"]', 'online,offline', 2200.00, 4.80, 320, 1, NOW(), 0, 0),
  ('sadhika-maheshwari', 'Sadhika Maheshwari', 'Baglamukhi Sadhana, Protection', NULL, NULL,
   '/images/practitioners/tantric-maheshwari.jpg', NULL, 'Haridwar', 'Uttarakhand', 10, 1400, '["Hindi","English"]', 'online', 2800.00, 4.70, 142, 1, NOW(), 0, 0),
  ('baba-kaal-bhairav', 'Baba Kaal Bhairav', 'Kaal Bhairav Sadhana, Grah Shanti', NULL, NULL,
   '/images/practitioners/tantric-kaal-bhairav.jpg', NULL, 'Varanasi', 'Uttar Pradesh', 20, 6100, '["Hindi","Sanskrit"]', 'offline,online', 3500.00, 4.90, 412, 1, NOW(), 0, 0),
  ('maa-adishakti', 'Maa Adishakti', 'Spiritual Guidance, Chakra Balancing', NULL, NULL,
   '/images/practitioners/tantric-adishakti.jpg', NULL, 'Rishikesh', 'Uttarakhand', 11, 1900, '["Hindi","English"]', 'online', 2800.00, 4.70, 193, 1, NOW(), 0, 0),
  ('guru-shaitannath', 'Guru Shaitannath', 'Tantra Sadhana, Meditation', NULL, NULL,
   '/images/practitioners/tantric-shaitannath.jpg', NULL, 'Kolkata', 'West Bengal', 16, 2700, '["Hindi","Bengali","English"]', 'online,offline', 2500.00, 4.80, 221, 1, NOW(), 0, 0),
  ('sadhika-nandini', 'Sadhika Nandini', 'Meditation & Kundalini', NULL, NULL,
   '/images/practitioners/tantric-nandini.jpg', NULL, 'Rishikesh', 'Uttarakhand', 9, 1200, '["Hindi","English"]', 'online', 1800.00, 4.70, 150, 1, NOW(), 0, 0),
  ('tantrik-mahesh', 'Tantrik Mahesh', 'Protection Rituals', NULL, NULL,
   '/images/practitioners/tantric-mahesh.jpg', NULL, 'Ujjain', 'Madhya Pradesh', 12, 2100, '["Hindi"]', 'offline,online', 2100.00, 4.80, 210, 1, NOW(), 0, 0);

INSERT IGNORE INTO tantric_specialties (tantric_id, specialty_id, sort_order)
SELECT t.id, s.id, m.ord FROM (
  SELECT 'acharya-rudranath' AS tslug, 'kali-sadhana' AS sslug, 1 AS ord
  UNION ALL SELECT 'acharya-rudranath', 'love-relationship', 2
  UNION ALL SELECT 'acharya-rudranath', 'business-wealth', 3
  UNION ALL SELECT 'acharya-rudranath', 'protection', 4
  UNION ALL SELECT 'acharya-rudranath', 'wellbeing-practices', 5
  UNION ALL SELECT 'acharya-rudranath', 'relationship-guidance', 6
  UNION ALL SELECT 'acharya-rudranath', 'grah-shanti', 7
  UNION ALL SELECT 'acharya-rudranath', 'energy-balancing', 8
  UNION ALL SELECT 'acharya-rudranath', 'aura-cleansing', 9
  UNION ALL SELECT 'acharya-rudranath', 'spiritual-guidance', 10
  UNION ALL SELECT 'maa-tantrika-devi', 'shakti-sadhana', 1
  UNION ALL SELECT 'maa-tantrika-devi', 'meditation', 2
  UNION ALL SELECT 'pandit-agnivesh', 'business-wealth', 1
  UNION ALL SELECT 'pandit-agnivesh', 'lakshmi-sadhana', 2
  UNION ALL SELECT 'maa-kamakhya-sadhika', 'love-relationship', 1
  UNION ALL SELECT 'maa-kamakhya-sadhika', 'kamakhya-sadhana', 2
  UNION ALL SELECT 'swami-kauleshwar', 'relationship-guidance', 1
  UNION ALL SELECT 'swami-kauleshwar', 'meditation', 2
  UNION ALL SELECT 'acharya-vamdev', 'business-growth', 1
  UNION ALL SELECT 'acharya-vamdev', 'rituals-pujas', 2
  UNION ALL SELECT 'maa-trinetra-sadhika', 'kamakhya-sadhana', 1
  UNION ALL SELECT 'maa-trinetra-sadhika', 'energy-balancing', 2
  UNION ALL SELECT 'tantra-guru-devnarayan', 'relationship-guidance', 1
  UNION ALL SELECT 'tantra-guru-devnarayan', 'grah-shanti', 2
  UNION ALL SELECT 'sadhika-maheshwari', 'baglamukhi-sadhana', 1
  UNION ALL SELECT 'sadhika-maheshwari', 'protection', 2
  UNION ALL SELECT 'baba-kaal-bhairav', 'kaal-bhairav-sadhana', 1
  UNION ALL SELECT 'baba-kaal-bhairav', 'grah-shanti', 2
  UNION ALL SELECT 'maa-adishakti', 'spiritual-guidance', 1
  UNION ALL SELECT 'maa-adishakti', 'chakra-balancing', 2
  UNION ALL SELECT 'guru-shaitannath', 'tantra-sadhana', 1
  UNION ALL SELECT 'guru-shaitannath', 'meditation', 2
  UNION ALL SELECT 'sadhika-nandini', 'meditation', 1
  UNION ALL SELECT 'sadhika-nandini', 'kundalini', 2
  UNION ALL SELECT 'tantrik-mahesh', 'protection', 1
  UNION ALL SELECT 'tantrik-mahesh', 'rituals-pujas', 2
) m JOIN tantrics t ON t.slug = m.tslug JOIN specialties s ON s.slug = m.sslug;

-- Profile gallery and certifications for the sample profile page (Acharya Rudranath).
INSERT INTO tantric_photos (tantric_id, image_url, alt_text, sort_order)
SELECT t.id, m.image_url, m.alt_text, m.sort_order FROM (
  SELECT '/images/practitioners/tantric-rudranath-ji.jpg' AS image_url, 'Acharya Rudranath in his practice room' AS alt_text, 1 AS sort_order
  UNION ALL SELECT '/images/scenes/service-kali-sadhana.jpg', 'Kali Sadhana initiation in progress', 2
  UNION ALL SELECT '/images/scenes/service-protection-ritual.jpg', 'A protection puja with lamps and offerings', 3
  UNION ALL SELECT '/images/scenes/service-grah-shanti.jpg', 'Grah Shanti pujan arrangement', 4
  UNION ALL SELECT '/images/practitioners/tantric-rudranath-portrait.jpg', 'Acharya Rudranath portrait', 5
) m JOIN tantrics t ON t.slug = 'acharya-rudranath'
WHERE NOT EXISTS (SELECT 1 FROM tantric_photos p WHERE p.tantric_id = t.id AND p.image_url = m.image_url);

INSERT INTO tantric_certifications (tantric_id, title, issuer, year, icon, sort_order)
SELECT t.id, m.title, m.issuer, m.year, m.icon, m.sort_order FROM (
  SELECT 'Vedic & Tantric Traditions' AS title, '[Issuer]' AS issuer, NULL AS year, 'book-open' AS icon, 1 AS sort_order
  UNION ALL SELECT 'Tantra Sadhana Certified', '[Issuer]', NULL, 'flower-2', 2
  UNION ALL SELECT 'Spiritual Mentor', '[Issuer]', NULL, 'sparkles', 3
  UNION ALL SELECT 'Featured in Spiritual Events', '[Event]', NULL, 'award', 4
  UNION ALL SELECT '5000+ Seekers Guided', 'From platform records', NULL, 'users', 5
) m JOIN tantrics t ON t.slug = 'acharya-rudranath'
WHERE NOT EXISTS (SELECT 1 FROM tantric_certifications c WHERE c.tantric_id = t.id AND c.title = m.title);

-- Weekly availability for every practitioner: Monday to Saturday, 10:00-13:00 and 16:00-19:00 in
-- 60-minute slots (the design's 10 AM, 11 AM, 12 PM, 4 PM, 5 PM, 6 PM). Sunday off.
INSERT IGNORE INTO availability_rules (tantric_id, weekday, start_time, end_time, slot_minutes, mode)
SELECT t.id, d.weekday, w.start_time, w.end_time, 60, 'both'
FROM tantrics t
JOIN (SELECT 1 AS weekday UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6) d
JOIN (SELECT '10:00:00' AS start_time, '13:00:00' AS end_time UNION ALL SELECT '16:00:00', '19:00:00') w;

-- --------------------------------------------------------- service categories
INSERT IGNORE INTO service_categories (slug, name, description, image_url, link_path, sort_order, show_on_home) VALUES
  ('online-consultation',   'Online Consultation',     'Personal guidance over a secure video call.',            '/images/scenes/service-meditation.jpg',     '/consult',                  1, 1),
  ('rituals-pujas',         'Rituals & Pujas',         'Traditional pujas performed by verified practitioners.', '/images/scenes/service-grah-shanti.jpg',    '/consult?category=rituals-pujas', 2, 1),
  ('sadhana-programs',      'Sadhana Programs',        'Guided practice programs with a practitioner.',          '/images/scenes/service-kali-sadhana.jpg',   '/consult?category=sadhana-programs', 3, 1),
  ('spiritual-books',       'Spiritual Books',         'Scriptures, commentaries and practice guides.',          '/images/products/category-books.jpg',       '/shop?category=books',      4, 1),
  ('mala-yantras',          'Mala & Yantras',          'Energised malas and traditional yantras.',               '/images/products/category-mala.jpg',        '/shop?category=mala',       5, 1),
  ('courses-certification', 'Courses & Certification', 'Structured learning with certificates.',                 '/images/products/course-tantra-basics.jpg', '/shop?category=courses',    6, 1);

-- Services offered by Acharya Rudranath (profile page sample).
INSERT INTO services (tantric_id, category_id, title, description, price, unit, duration_minutes, mode, image_url, sort_order)
SELECT t.id, c.id, m.title, m.description, m.price, m.unit, m.duration_minutes, m.mode, m.image_url, m.sort_order FROM (
  SELECT 'online-consultation' AS cslug, 'Online Consultation (Video Call)' AS title, 'Personal guidance for life, career, relationships and spiritual path.' AS description, 2500.00 AS price, '30 mins' AS unit, 30 AS duration_minutes, 'video' AS mode, '/images/scenes/service-online-consultation.jpg' AS image_url, 1 AS sort_order
  UNION ALL SELECT 'sadhana-programs', 'Kali Sadhana Initiation', 'Guided initiation into Kali Sadhana practice.', 11000.00, NULL, 90, 'video', '/images/scenes/service-kali-sadhana.jpg', 2
  UNION ALL SELECT 'rituals-pujas', 'Protection Ritual (Puja)', 'A guided puja with protection mantras for you and your home.', 5500.00, NULL, 60, 'remote_ritual', '/images/scenes/service-protection-ritual.jpg', 3
  UNION ALL SELECT 'online-consultation', 'Relationship Guidance', 'Guidance for love, harmony and relationships, with mantra practice for your own steadiness.', 3500.00, NULL, 45, 'video', '/images/scenes/service-vashikaran.jpg', 4
  UNION ALL SELECT 'rituals-pujas', 'Grah Shanti Pujan', 'A traditional puja for planetary peace and stability.', 7500.00, NULL, 90, 'remote_ritual', '/images/scenes/service-grah-shanti.jpg', 5
  UNION ALL SELECT 'online-consultation', 'Energy Balancing Session', 'Aura cleansing and energy balancing practice (a spiritual practice, not medical treatment).', 4000.00, '30 mins', 30, 'video', '/images/scenes/service-energy-healing.jpg', 6
) m
JOIN tantrics t ON t.slug = 'acharya-rudranath'
LEFT JOIN service_categories c ON c.slug = m.cslug
WHERE NOT EXISTS (SELECT 1 FROM services s WHERE s.tantric_id = t.id AND s.title = m.title);

-- A standard online consultation for every other practitioner, priced at their base price.
INSERT INTO services (tantric_id, category_id, title, description, price, unit, duration_minutes, mode, image_url, sort_order)
SELECT t.id, c.id, 'Online Consultation (Video Call)', 'Personal guidance for life, career, relationships and spiritual path.', t.base_price, '30 mins', 30, 'video', '/images/scenes/service-online-consultation.jpg', 1
FROM tantrics t
LEFT JOIN service_categories c ON c.slug = 'online-consultation'
WHERE t.slug <> 'acharya-rudranath' AND t.base_price IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM services s WHERE s.tantric_id = t.id);

-- -------------------------------------------------------------------- coupons
INSERT IGNORE INTO coupons (code, description, discount_type, discount_value, max_discount, min_amount, applies_to, usage_limit, per_user_limit) VALUES
  ('WELCOME10', '10% off your first booking, up to Rs 500', 'percent', 10.00, 500.00, 1000.00, 'bookings', NULL, 1),
  ('SHAKTI500', 'Rs 500 off shop orders above Rs 2,999',    'flat',    500.00, NULL,   2999.00, 'orders',   500,  2);

-- ----------------------------------------------------------------------- shop
INSERT IGNORE INTO product_categories (slug, name, image_url, icon, sort_order) VALUES
  ('mala',      'Mala & Yantras',    '/images/products/category-mala.jpg',         NULL,             1),
  ('samagri',   'Puja Samagri',      '/images/products/category-puja-samagri.jpg', NULL,             2),
  ('incense',   'Incense & Oils',    '/images/products/category-incense.jpg',      NULL,             3),
  ('rudraksha', 'Rudraksha',         '/images/products/category-rudraksha.jpg',    NULL,             4),
  ('crystals',  'Crystals & Stones', '/images/products/category-crystals.jpg',     NULL,             5),
  ('deities',   'Deities & Idols',   '/images/products/category-deities.jpg',      NULL,             6),
  ('kits',      'Sadhana Kits',      '/images/products/category-sadhana-kits.jpg', NULL,             7),
  ('books',     'Spiritual Books',   '/images/products/category-books.jpg',        NULL,             8),
  ('courses',   'Courses',           NULL,                                         'graduation-cap', 9);

INSERT IGNORE INTO products (category_id, sku, slug, name, subtitle, price, mrp, image_url, rating_avg, rating_count, stock_qty, is_featured, is_best_seller)
SELECT c.id, m.sku, m.slug, m.name, m.subtitle, m.price, m.mrp, m.image_url, m.rating_avg, m.rating_count, 50, m.is_featured, m.is_best_seller FROM (
  SELECT 'mala' AS cslug, 'SP-MALA-001' AS sku, 'rudraksha-mala-5-mukhi' AS slug, 'Rudraksha Mala' AS name, '(5 Mukhi)' AS subtitle, 1499.00 AS price, 1999.00 AS mrp, '/images/products/product-rudraksha-mala.jpg' AS image_url, 4.80 AS rating_avg, 320 AS rating_count, 1 AS is_featured, 0 AS is_best_seller
  UNION ALL SELECT 'mala', 'SP-YANT-001', 'kali-yantra-brass', 'Kali Yantra', '(Brass)', 2499.00, 2999.00, '/images/products/product-kali-yantra.jpg', 4.90, 190, 1, 0
  UNION ALL SELECT 'crystals', 'SP-CRYS-001', '7-chakra-crystal-set', '7 Chakra Crystal Set', NULL, 3499.00, 4999.00, '/images/products/product-chakra-crystals.jpg', 4.70, 280, 1, 0
  UNION ALL SELECT 'incense', 'SP-INCE-001', 'natural-dhoop-incense-set', 'Natural Dhoop & Incense Set', NULL, 399.00, 599.00, '/images/products/product-dhoop.jpg', 4.80, 210, 1, 0
  UNION ALL SELECT 'samagri', 'SP-SAMA-001', 'hawan-samagri-kit', 'Hawan Samagri Kit', NULL, 799.00, 999.00, '/images/products/product-hawan-samagri.jpg', 4.90, 150, 0, 1
  UNION ALL SELECT 'mala', 'SP-YANT-002', 'maa-kamakhya-yantra-brass', 'Maa Kamakhya Yantra', '(Brass)', 2999.00, 3999.00, '/images/products/product-kamakhya-yantra.jpg', 4.80, 220, 0, 1
  UNION ALL SELECT 'crystals', 'SP-CRYS-002', 'rose-quartz-bracelet', 'Rose Quartz Bracelet', '(8 mm beads)', 1199.00, 1699.00, '/images/products/product-rose-quartz.jpg', 4.70, 310, 0, 1
  UNION ALL SELECT 'crystals', 'SP-CRYS-003', 'black-obsidian-bracelet', 'Black Obsidian Bracelet', '(8 mm beads)', 1299.00, 1799.00, '/images/products/product-obsidian.jpg', 4.80, 260, 0, 1
) m LEFT JOIN product_categories c ON c.slug = m.cslug;

INSERT IGNORE INTO courses (slug, title, level, meta_label, meta_icon, modules_count, price, image_url, is_featured, sort_order) VALUES
  ('tantra-basics-foundation',  'Tantra Basics Foundation Course', 'beginner',     '6 Modules', 'circle-play', 6,    5999.00,  '/images/products/course-tantra-basics.jpg',   1, 1),
  ('kali-sadhana-course',       'Kali Sadhana Course',             'intermediate', '9 Videos',  'circle-play', 9,    11999.00, '/images/products/course-kali-sadhana.jpg',    1, 2),
  ('crystal-practices-course',  'Crystal Practices Course',        'beginner',     '8 Videos',  'circle-play', 8,    7999.00,  '/images/products/course-crystal-healing.jpg', 1, 3),
  ('advanced-tantra-practices', 'Advanced Tantra Practices',       'advanced',     '12 Weeks',  'calendar',    NULL, 15999.00, '/images/products/course-advanced-tantra.jpg', 1, 4);

-- -------------------------------------------------------------------- reviews
INSERT INTO reviews (tantric_id, author_name, avatar_url, rating, quote, is_verified_booking, is_featured, status, created_at)
SELECT t.id, m.author_name, m.avatar_url, m.rating, m.quote, 1, m.is_featured, 'published', m.created_at FROM (
  SELECT 'acharya-rudranath' AS tslug, 'Ananya S.' AS author_name, '/images/people/avatar-ananya.jpg' AS avatar_url, 5 AS rating, 'Clear, kind guidance. I left the call feeling calm and sure of my next step.' AS quote, 1 AS is_featured, '2026-09-20 10:00:00' AS created_at
  UNION ALL SELECT 'acharya-vamdev', 'Rohit M.', '/images/people/avatar-rohit.jpg', 5, 'The puja was performed with so much devotion. Highly recommended.', 1, '2026-09-18 10:00:00'
  UNION ALL SELECT 'maa-tantrika-devi', 'Meera K.', '/images/people/avatar-meera.jpg', 5, 'I found clarity and peace. Thank you, ShaktiPath.', 1, '2026-09-15 10:00:00'
  UNION ALL SELECT 'acharya-rudranath', 'Ritika S.', '/images/people/avatar-ritika.jpg', 5, 'Acharya ji listened carefully and his guidance gave me clarity and peace. Highly recommended.', 0, '2026-09-22 10:00:00'
) m JOIN tantrics t ON t.slug = m.tslug
WHERE NOT EXISTS (SELECT 1 FROM reviews r WHERE r.tantric_id = t.id AND r.author_name = m.author_name AND r.quote = m.quote);

-- ---------------------------------------------------------------- settings
-- Bracketed values must be supplied by the client.
INSERT IGNORE INTO site_settings (setting_key, setting_value) VALUES
  ('footer.disclaimer',     'Spiritual guidance only. Not a substitute for medical, legal or financial advice. Outcomes are personal and are not guaranteed.'),
  ('footer.legal_entity',   'Operated by [Legal entity name], [Registered address]. CIN [number] · GSTIN [number]'),
  ('footer.grievance',      'Grievance Officer: [Name], [email], [phone] · Support 9 AM - 9 PM IST, every day'),
  ('support.hours',         '9 AM - 9 PM IST, every day'),
  ('support.email',         ''),
  ('support.phone',         ''),
  ('app.play_store_url',    ''),
  ('app.app_store_url',     ''),
  ('booking.tax_percent',   '0'),
  ('booking.cancel_hours',  '12'),
  ('shop.tax_percent',      '0'),
  ('shop.shipping_flat',    '99'),
  ('shop.free_shipping_min','999');

-- Keep the service tile links in step with the Find a Tantric page's `category` filter (service category slugs)
-- on databases seeded before this change. Safe to re-run.
UPDATE service_categories SET link_path = '/consult?category=rituals-pujas'    WHERE slug = 'rituals-pujas'    AND link_path <> '/consult?category=rituals-pujas';
UPDATE service_categories SET link_path = '/consult?category=sadhana-programs' WHERE slug = 'sadhana-programs' AND link_path <> '/consult?category=sadhana-programs';
