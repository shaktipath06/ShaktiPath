-- ============================================================================
-- ShaktiPath by TantraTalk: MySQL 8 schema
--
-- Applied by `npm run db:setup` (backend/). Safe to re-run: every statement is
-- CREATE TABLE IF NOT EXISTS. Works on MySQL 8.0+, MariaDB 10.6+ and TiDB Cloud.
--
-- Conventions
--   * Money is DECIMAL(10,2) in INR. Times are stored in Asia/Kolkata (IST).
--   * Image columns hold a URL or a site-relative path such as /images/x.jpg.
--   * Aggregates (rating_avg, rating_count, used_count) are maintained by the
--     API from the underlying rows, never typed in by hand.
--   * Every table has created_at; tables that change have updated_at.
--
-- Groups: accounts, practitioners, availability, services and bookings, shop,
-- reviews and favourites, support and settings.
-- ============================================================================

SET NAMES utf8mb4;

-- ----------------------------------------------------------------------------
-- Accounts
-- ----------------------------------------------------------------------------

-- Seekers (customers), tantrics (practitioners) and admins share one table; `role` tells them apart.
CREATE TABLE IF NOT EXISTS users (
  id                 INT UNSIGNED NOT NULL AUTO_INCREMENT,
  role               ENUM('seeker','tantric','admin') NOT NULL DEFAULT 'seeker',
  full_name          VARCHAR(120) NOT NULL,
  email              VARCHAR(190) NOT NULL,
  phone              VARCHAR(20)  DEFAULT NULL,
  password_hash      VARCHAR(255) DEFAULT NULL,          -- bcrypt/argon2 hash; NULL for social sign-in
  avatar_url         VARCHAR(500) DEFAULT NULL,
  city               VARCHAR(80)  DEFAULT NULL,
  email_verified_at  DATETIME     DEFAULT NULL,
  phone_verified_at  DATETIME     DEFAULT NULL,
  marketing_opt_in   TINYINT(1)   NOT NULL DEFAULT 0,
  last_login_at      DATETIME     DEFAULT NULL,
  is_active          TINYINT(1)   NOT NULL DEFAULT 1,
  created_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY ix_users_role (role, is_active),
  KEY ix_users_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Refresh tokens, password resets, e-mail verification and phone OTPs. Only a SHA-256 hash is stored.
CREATE TABLE IF NOT EXISTS auth_tokens (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id     INT UNSIGNED NOT NULL,
  purpose     ENUM('refresh','password_reset','email_verify','phone_otp') NOT NULL,
  token_hash  CHAR(64)     NOT NULL,
  expires_at  DATETIME     NOT NULL,
  used_at     DATETIME     DEFAULT NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_auth_tokens_hash (token_hash),
  KEY ix_auth_tokens_user (user_id, purpose, expires_at),
  CONSTRAINT fk_auth_tokens_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Saved shipping addresses for shop orders.
CREATE TABLE IF NOT EXISTS user_addresses (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id         INT UNSIGNED NOT NULL,
  label           VARCHAR(40)  NOT NULL DEFAULT 'Home',
  recipient_name  VARCHAR(120) NOT NULL,
  phone           VARCHAR(20)  NOT NULL,
  line1           VARCHAR(200) NOT NULL,
  line2           VARCHAR(200) DEFAULT NULL,
  city            VARCHAR(80)  NOT NULL,
  state           VARCHAR(80)  NOT NULL,
  pincode         VARCHAR(10)  NOT NULL,
  country         VARCHAR(60)  NOT NULL DEFAULT 'India',
  is_default      TINYINT(1)   NOT NULL DEFAULT 0,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_user_addresses_user (user_id, is_default),
  CONSTRAINT fk_user_addresses_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Practitioners
-- ----------------------------------------------------------------------------

-- Areas of expertise: card tags, the "Expertise" filter and the profile's "Areas of Expertise" list.
CREATE TABLE IF NOT EXISTS specialties (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug        VARCHAR(80)  NOT NULL,
  name        VARCHAR(120) NOT NULL,
  icon        VARCHAR(40)  NOT NULL DEFAULT 'flower-2',    -- icon name from the design system
  sort_order  SMALLINT     NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_specialties_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Practitioner profiles.
CREATE TABLE IF NOT EXISTS tantrics (
  id                   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id              INT UNSIGNED DEFAULT NULL,          -- login account, once the practitioner signs up
  slug                 VARCHAR(120) NOT NULL,
  display_name         VARCHAR(120) NOT NULL,              -- with title: "Acharya Rudranath"
  headline             VARCHAR(160) DEFAULT NULL,          -- short specialty line shown on cards
  bio                  TEXT         DEFAULT NULL,
  mission_quote        VARCHAR(500) DEFAULT NULL,
  photo_url            VARCHAR(500) DEFAULT NULL,          -- card photo
  profile_photo_url    VARCHAR(500) DEFAULT NULL,          -- square profile photo; falls back to photo_url
  city                 VARCHAR(80)  DEFAULT NULL,
  state                VARCHAR(80)  DEFAULT NULL,
  years_experience     TINYINT UNSIGNED DEFAULT NULL,
  consultations_count  INT UNSIGNED NOT NULL DEFAULT 0,
  languages            JSON         DEFAULT NULL,          -- ["Hindi","English","Sanskrit"]
  session_modes        SET('online','offline') NOT NULL DEFAULT 'online',
  base_price           DECIMAL(10,2) DEFAULT NULL,         -- "From Rs 2,500 / session"
  rating_avg           DECIMAL(3,2) NOT NULL DEFAULT 0.00, -- maintained from reviews
  rating_count         INT UNSIGNED NOT NULL DEFAULT 0,    -- maintained from reviews
  is_verified          TINYINT(1)   NOT NULL DEFAULT 0,    -- set only by the platform's verification process
  verified_at          DATETIME     DEFAULT NULL,
  verified_by          INT UNSIGNED DEFAULT NULL,          -- admin user who verified
  is_featured          TINYINT(1)   NOT NULL DEFAULT 0,    -- shown in "Meet Our Top Tantrics"
  featured_order       SMALLINT     NOT NULL DEFAULT 0,
  is_active            TINYINT(1)   NOT NULL DEFAULT 1,
  created_at           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_tantrics_slug (slug),
  KEY ix_tantrics_featured (is_active, is_featured, featured_order),
  KEY ix_tantrics_city (city),
  KEY ix_tantrics_rating (is_active, rating_avg, rating_count),
  KEY ix_tantrics_price (is_active, base_price),
  FULLTEXT KEY ft_tantrics_search (display_name, headline, bio),
  CONSTRAINT fk_tantrics_user        FOREIGN KEY (user_id)     REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT fk_tantrics_verified_by FOREIGN KEY (verified_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tantric_specialties (
  tantric_id    INT UNSIGNED NOT NULL,
  specialty_id  INT UNSIGNED NOT NULL,
  sort_order    TINYINT      NOT NULL DEFAULT 0,
  PRIMARY KEY (tantric_id, specialty_id),
  KEY ix_tantric_specialties_specialty (specialty_id),
  CONSTRAINT fk_ts_tantric   FOREIGN KEY (tantric_id)   REFERENCES tantrics (id)    ON DELETE CASCADE,
  CONSTRAINT fk_ts_specialty FOREIGN KEY (specialty_id) REFERENCES specialties (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Profile gallery.
CREATE TABLE IF NOT EXISTS tantric_photos (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  tantric_id  INT UNSIGNED NOT NULL,
  image_url   VARCHAR(500) NOT NULL,
  alt_text    VARCHAR(200) DEFAULT NULL,
  sort_order  SMALLINT     NOT NULL DEFAULT 0,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_tantric_photos_tantric (tantric_id, sort_order),
  CONSTRAINT fk_tantric_photos_tantric FOREIGN KEY (tantric_id) REFERENCES tantrics (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- "Certifications & Achievements" on the profile page.
CREATE TABLE IF NOT EXISTS tantric_certifications (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  tantric_id  INT UNSIGNED NOT NULL,
  title       VARCHAR(160) NOT NULL,
  issuer      VARCHAR(160) DEFAULT NULL,
  year        SMALLINT UNSIGNED DEFAULT NULL,
  icon        VARCHAR(40)  NOT NULL DEFAULT 'award',
  sort_order  SMALLINT     NOT NULL DEFAULT 0,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_tantric_certifications_tantric (tantric_id, sort_order),
  CONSTRAINT fk_tantric_certifications_tantric FOREIGN KEY (tantric_id) REFERENCES tantrics (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Availability (drives the date picker, the time slots and "Available this week")
-- ----------------------------------------------------------------------------

-- Weekly working windows. Slots are generated every `slot_minutes` from start_time to end_time.
CREATE TABLE IF NOT EXISTS availability_rules (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  tantric_id    INT UNSIGNED NOT NULL,
  weekday       TINYINT UNSIGNED NOT NULL,                 -- 0 = Sunday ... 6 = Saturday
  start_time    TIME         NOT NULL,
  end_time      TIME         NOT NULL,
  slot_minutes  SMALLINT UNSIGNED NOT NULL DEFAULT 60,
  mode          ENUM('online','offline','both') NOT NULL DEFAULT 'both',
  is_active     TINYINT(1)   NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uq_availability_rules (tantric_id, weekday, start_time),
  CONSTRAINT ck_availability_rules_weekday CHECK (weekday BETWEEN 0 AND 6),
  CONSTRAINT ck_availability_rules_window  CHECK (end_time > start_time),
  CONSTRAINT fk_availability_rules_tantric FOREIGN KEY (tantric_id) REFERENCES tantrics (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Date-specific exceptions: a day off (is_available = 0) or different hours for one date.
CREATE TABLE IF NOT EXISTS availability_overrides (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  tantric_id    INT UNSIGNED NOT NULL,
  on_date       DATE         NOT NULL,
  is_available  TINYINT(1)   NOT NULL DEFAULT 0,
  start_time    TIME         DEFAULT NULL,
  end_time      TIME         DEFAULT NULL,
  slot_minutes  SMALLINT UNSIGNED DEFAULT NULL,
  note          VARCHAR(200) DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_availability_overrides (tantric_id, on_date),
  CONSTRAINT fk_availability_overrides_tantric FOREIGN KEY (tantric_id) REFERENCES tantrics (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Services and bookings
-- ----------------------------------------------------------------------------

-- Site-level service groups: the "Explore Our Services" tiles on the home page.
CREATE TABLE IF NOT EXISTS service_categories (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug          VARCHAR(80)  NOT NULL,
  name          VARCHAR(120) NOT NULL,
  description   VARCHAR(300) DEFAULT NULL,
  image_url     VARCHAR(500) DEFAULT NULL,
  link_path     VARCHAR(200) DEFAULT NULL,                 -- where the tile leads, e.g. /consult
  sort_order    SMALLINT     NOT NULL DEFAULT 0,
  show_on_home  TINYINT(1)   NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uq_service_categories_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- What a practitioner offers and charges for (profile page "Services Offered").
CREATE TABLE IF NOT EXISTS services (
  id                INT UNSIGNED NOT NULL AUTO_INCREMENT,
  tantric_id        INT UNSIGNED DEFAULT NULL,
  category_id       INT UNSIGNED DEFAULT NULL,
  title             VARCHAR(160) NOT NULL,
  description       VARCHAR(500) DEFAULT NULL,
  price             DECIMAL(10,2) NOT NULL,
  unit              VARCHAR(40)  DEFAULT NULL,             -- "30 mins", "session"
  duration_minutes  SMALLINT UNSIGNED NOT NULL DEFAULT 30,
  mode              ENUM('video','audio','in_person','remote_ritual') NOT NULL DEFAULT 'video',
  image_url         VARCHAR(500) DEFAULT NULL,
  is_active         TINYINT(1)   NOT NULL DEFAULT 1,
  sort_order        SMALLINT     NOT NULL DEFAULT 0,
  created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_services_tantric (tantric_id, is_active, sort_order),
  KEY ix_services_category (category_id),
  CONSTRAINT fk_services_tantric  FOREIGN KEY (tantric_id)  REFERENCES tantrics (id)           ON DELETE CASCADE,
  CONSTRAINT fk_services_category FOREIGN KEY (category_id) REFERENCES service_categories (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Discount codes for bookings and shop orders ("Apply Coupon").
CREATE TABLE IF NOT EXISTS coupons (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  code            VARCHAR(40)  NOT NULL,
  description     VARCHAR(200) DEFAULT NULL,
  discount_type   ENUM('percent','flat') NOT NULL,
  discount_value  DECIMAL(10,2) NOT NULL,
  max_discount    DECIMAL(10,2) DEFAULT NULL,              -- cap for percent coupons
  min_amount      DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  applies_to      ENUM('bookings','orders','both') NOT NULL DEFAULT 'both',
  starts_at       DATETIME     DEFAULT NULL,
  ends_at         DATETIME     DEFAULT NULL,
  usage_limit     INT UNSIGNED DEFAULT NULL,               -- total uses allowed; NULL = unlimited
  used_count      INT UNSIGNED NOT NULL DEFAULT 0,
  per_user_limit  TINYINT UNSIGNED NOT NULL DEFAULT 1,
  is_active       TINYINT(1)   NOT NULL DEFAULT 1,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_coupons_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Session bookings (Book Your Session flow). `slot_lock` is a generated column that stops two live
-- bookings from taking the same practitioner, date and time; cancelled ones release the slot.
CREATE TABLE IF NOT EXISTS bookings (
  id                INT UNSIGNED NOT NULL AUTO_INCREMENT,
  booking_ref       VARCHAR(20)  NOT NULL,                 -- public reference shown to the seeker
  user_id           INT UNSIGNED DEFAULT NULL,
  tantric_id        INT UNSIGNED NOT NULL,
  service_id        INT UNSIGNED DEFAULT NULL,
  service_title     VARCHAR(160) NOT NULL,                 -- copied at booking time
  booking_date      DATE         NOT NULL,
  start_time        TIME         NOT NULL,
  duration_minutes  SMALLINT UNSIGNED NOT NULL DEFAULT 30,
  timezone          VARCHAR(40)  NOT NULL DEFAULT 'Asia/Kolkata',
  mode              ENUM('video','audio','in_person','remote_ritual') NOT NULL DEFAULT 'video',
  customer_name     VARCHAR(120) NOT NULL,
  customer_email    VARCHAR(190) NOT NULL,
  customer_phone    VARCHAR(20)  NOT NULL,
  purpose           TEXT         DEFAULT NULL,
  fee               DECIMAL(10,2) NOT NULL,
  discount          DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  tax               DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total             DECIMAL(10,2) NOT NULL,
  coupon_id         INT UNSIGNED DEFAULT NULL,
  status            ENUM('pending','confirmed','completed','cancelled','refunded','no_show') NOT NULL DEFAULT 'pending',
  payment_method    ENUM('upi','card','netbanking','wallet','other') DEFAULT NULL,
  payment_ref       VARCHAR(100) DEFAULT NULL,
  meeting_link      VARCHAR(500) DEFAULT NULL,             -- sent before the session
  tantric_notes     TEXT         DEFAULT NULL,             -- follow-up notes after the session
  consent_terms     TINYINT(1)   NOT NULL DEFAULT 0,
  consent_age       TINYINT(1)   NOT NULL DEFAULT 0,
  marketing_opt_in  TINYINT(1)   NOT NULL DEFAULT 0,
  cancelled_at      DATETIME     DEFAULT NULL,
  cancel_reason     VARCHAR(300) DEFAULT NULL,
  slot_lock         VARCHAR(60)  GENERATED ALWAYS AS (
                      IF(status IN ('pending','confirmed','completed'),
                         CONCAT(tantric_id, '|', booking_date, '|', start_time), NULL)) STORED,
  created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_bookings_ref (booking_ref),
  UNIQUE KEY uq_bookings_slot_lock (slot_lock),
  KEY ix_bookings_slot (tantric_id, booking_date, start_time),
  KEY ix_bookings_user (user_id, booking_date),
  KEY ix_bookings_email (customer_email),
  KEY ix_bookings_status (status, booking_date),
  CONSTRAINT fk_bookings_user    FOREIGN KEY (user_id)    REFERENCES users (id)    ON DELETE SET NULL,
  CONSTRAINT fk_bookings_tantric FOREIGN KEY (tantric_id) REFERENCES tantrics (id) ON DELETE RESTRICT,
  CONSTRAINT fk_bookings_service FOREIGN KEY (service_id) REFERENCES services (id) ON DELETE SET NULL,
  CONSTRAINT fk_bookings_coupon  FOREIGN KEY (coupon_id)  REFERENCES coupons (id)  ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Shop
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS product_categories (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug        VARCHAR(80)  NOT NULL,
  name        VARCHAR(120) NOT NULL,
  image_url   VARCHAR(500) DEFAULT NULL,
  icon        VARCHAR(40)  DEFAULT NULL,                   -- used when there is no image (e.g. Courses)
  sort_order  SMALLINT     NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_product_categories_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_id     INT UNSIGNED DEFAULT NULL,
  sku             VARCHAR(40)  DEFAULT NULL,
  slug            VARCHAR(120) NOT NULL,
  name            VARCHAR(160) NOT NULL,
  subtitle        VARCHAR(120) DEFAULT NULL,               -- "(5 Mukhi)", "(Brass)"
  description     TEXT         DEFAULT NULL,
  price           DECIMAL(10,2) NOT NULL,
  mrp             DECIMAL(10,2) DEFAULT NULL,              -- previous price; the discount % is computed from it
  image_url       VARCHAR(500) DEFAULT NULL,
  gallery         JSON         DEFAULT NULL,               -- ["/images/...", ...]
  weight_grams    INT UNSIGNED DEFAULT NULL,               -- for shipping
  rating_avg      DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  rating_count    INT UNSIGNED NOT NULL DEFAULT 0,
  stock_qty       INT          NOT NULL DEFAULT 0,
  is_featured     TINYINT(1)   NOT NULL DEFAULT 0,
  is_best_seller  TINYINT(1)   NOT NULL DEFAULT 0,
  is_active       TINYINT(1)   NOT NULL DEFAULT 1,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_products_slug (slug),
  UNIQUE KEY uq_products_sku (sku),
  KEY ix_products_category (category_id, is_active),
  KEY ix_products_flags (is_active, is_featured, is_best_seller),
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES product_categories (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS courses (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug           VARCHAR(120) NOT NULL,
  title          VARCHAR(160) NOT NULL,
  description    TEXT         DEFAULT NULL,
  level          ENUM('beginner','intermediate','advanced') DEFAULT NULL,
  meta_label     VARCHAR(60)  DEFAULT NULL,                -- "6 Modules", "12 Weeks"
  meta_icon      VARCHAR(40)  NOT NULL DEFAULT 'circle-play',
  modules_count  SMALLINT UNSIGNED DEFAULT NULL,
  price          DECIMAL(10,2) NOT NULL,
  mrp            DECIMAL(10,2) DEFAULT NULL,
  image_url      VARCHAR(500) DEFAULT NULL,
  instructor_id  INT UNSIGNED DEFAULT NULL,                -- the practitioner who teaches it
  is_featured    TINYINT(1)   NOT NULL DEFAULT 0,
  is_active      TINYINT(1)   NOT NULL DEFAULT 1,
  sort_order     SMALLINT     NOT NULL DEFAULT 0,
  created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_courses_slug (slug),
  CONSTRAINT fk_courses_instructor FOREIGN KEY (instructor_id) REFERENCES tantrics (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Shopping cart lines, for a signed-in user or an anonymous cart token stored in a cookie.
CREATE TABLE IF NOT EXISTS cart_items (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id     INT UNSIGNED DEFAULT NULL,
  cart_token  CHAR(36)     DEFAULT NULL,
  product_id  INT UNSIGNED DEFAULT NULL,
  course_id   INT UNSIGNED DEFAULT NULL,
  quantity    SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_cart_items_user (user_id),
  KEY ix_cart_items_token (cart_token),
  CONSTRAINT ck_cart_items_item CHECK (product_id IS NOT NULL OR course_id IS NOT NULL),
  CONSTRAINT fk_cart_items_user    FOREIGN KEY (user_id)    REFERENCES users (id)    ON DELETE CASCADE,
  CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
  CONSTRAINT fk_cart_items_course  FOREIGN KEY (course_id)  REFERENCES courses (id)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_ref       VARCHAR(20)  NOT NULL,
  user_id         INT UNSIGNED DEFAULT NULL,
  customer_name   VARCHAR(120) NOT NULL,
  customer_email  VARCHAR(190) NOT NULL,
  customer_phone  VARCHAR(20)  DEFAULT NULL,
  -- shipping address copied at order time
  ship_name       VARCHAR(120) DEFAULT NULL,
  ship_phone      VARCHAR(20)  DEFAULT NULL,
  ship_line1      VARCHAR(200) DEFAULT NULL,
  ship_line2      VARCHAR(200) DEFAULT NULL,
  ship_city       VARCHAR(80)  DEFAULT NULL,
  ship_state      VARCHAR(80)  DEFAULT NULL,
  ship_pincode    VARCHAR(10)  DEFAULT NULL,
  ship_country    VARCHAR(60)  NOT NULL DEFAULT 'India',
  subtotal        DECIMAL(10,2) NOT NULL,
  discount        DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  shipping        DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  tax             DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total           DECIMAL(10,2) NOT NULL,
  coupon_id       INT UNSIGNED DEFAULT NULL,
  status          ENUM('pending','paid','packed','shipped','delivered','cancelled','refunded') NOT NULL DEFAULT 'pending',
  payment_method  ENUM('upi','card','netbanking','wallet','other') DEFAULT NULL,
  payment_ref     VARCHAR(100) DEFAULT NULL,
  tracking_number VARCHAR(100) DEFAULT NULL,
  notes           VARCHAR(500) DEFAULT NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_orders_ref (order_ref),
  KEY ix_orders_user (user_id, created_at),
  KEY ix_orders_status (status, created_at),
  CONSTRAINT fk_orders_user   FOREIGN KEY (user_id)   REFERENCES users (id)   ON DELETE SET NULL,
  CONSTRAINT fk_orders_coupon FOREIGN KEY (coupon_id) REFERENCES coupons (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_items (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id    INT UNSIGNED NOT NULL,
  product_id  INT UNSIGNED DEFAULT NULL,
  course_id   INT UNSIGNED DEFAULT NULL,
  item_name   VARCHAR(160) NOT NULL,                       -- copied at purchase time
  unit_price  DECIMAL(10,2) NOT NULL,
  quantity    SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  KEY ix_order_items_order (order_id),
  CONSTRAINT fk_order_items_order   FOREIGN KEY (order_id)   REFERENCES orders (id)   ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL,
  CONSTRAINT fk_order_items_course  FOREIGN KEY (course_id)  REFERENCES courses (id)  ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- One row per payment attempt at the gateway, for a booking or an order.
CREATE TABLE IF NOT EXISTS payments (
  id                   BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  booking_id           INT UNSIGNED DEFAULT NULL,
  order_id             INT UNSIGNED DEFAULT NULL,
  user_id              INT UNSIGNED DEFAULT NULL,
  provider             VARCHAR(40)  NOT NULL DEFAULT 'razorpay',
  provider_order_id    VARCHAR(100) DEFAULT NULL,
  provider_payment_id  VARCHAR(100) DEFAULT NULL,
  amount               DECIMAL(10,2) NOT NULL,
  currency             CHAR(3)      NOT NULL DEFAULT 'INR',
  method               ENUM('upi','card','netbanking','wallet','other') DEFAULT NULL,
  status               ENUM('created','authorized','captured','failed','refunded') NOT NULL DEFAULT 'created',
  failure_reason       VARCHAR(300) DEFAULT NULL,
  raw_response         JSON         DEFAULT NULL,
  created_at           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_payments_booking (booking_id),
  KEY ix_payments_order (order_id),
  KEY ix_payments_provider (provider, provider_payment_id),
  CONSTRAINT fk_payments_booking FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE SET NULL,
  CONSTRAINT fk_payments_order   FOREIGN KEY (order_id)   REFERENCES orders (id)   ON DELETE SET NULL,
  CONSTRAINT fk_payments_user    FOREIGN KEY (user_id)    REFERENCES users (id)    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Reviews and favourites
-- ----------------------------------------------------------------------------

-- Reviews for practitioners (tantric_id) or products (product_id); one of the two is set.
CREATE TABLE IF NOT EXISTS reviews (
  id                   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  tantric_id           INT UNSIGNED DEFAULT NULL,
  product_id           INT UNSIGNED DEFAULT NULL,
  booking_id           INT UNSIGNED DEFAULT NULL,
  order_id             INT UNSIGNED DEFAULT NULL,
  user_id              INT UNSIGNED DEFAULT NULL,
  author_name          VARCHAR(120) NOT NULL,              -- shown as "Ananya S."
  avatar_url           VARCHAR(500) DEFAULT NULL,
  rating               TINYINT UNSIGNED NOT NULL,
  quote                TEXT         NOT NULL,
  is_verified_booking  TINYINT(1)   NOT NULL DEFAULT 0,    -- true only when booking_id/order_id points at a completed one
  is_featured          TINYINT(1)   NOT NULL DEFAULT 0,    -- shown in "What Our Users Say"
  status               ENUM('pending','published','hidden') NOT NULL DEFAULT 'pending',
  reply_text           TEXT         DEFAULT NULL,          -- practitioner's or shop's reply
  replied_at           DATETIME     DEFAULT NULL,
  created_at           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_reviews_tantric (tantric_id, status, created_at),
  KEY ix_reviews_product (product_id, status, created_at),
  KEY ix_reviews_featured (status, is_featured, created_at),
  CONSTRAINT ck_reviews_rating  CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT ck_reviews_target  CHECK (tantric_id IS NOT NULL OR product_id IS NOT NULL),
  CONSTRAINT fk_reviews_tantric FOREIGN KEY (tantric_id) REFERENCES tantrics (id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_booking FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE SET NULL,
  CONSTRAINT fk_reviews_order   FOREIGN KEY (order_id)   REFERENCES orders (id)   ON DELETE SET NULL,
  CONSTRAINT fk_reviews_user    FOREIGN KEY (user_id)    REFERENCES users (id)    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Saved practitioners and products (the heart buttons).
CREATE TABLE IF NOT EXISTS favorites (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id     INT UNSIGNED NOT NULL,
  tantric_id  INT UNSIGNED DEFAULT NULL,
  product_id  INT UNSIGNED DEFAULT NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_favorites_tantric (user_id, tantric_id),
  UNIQUE KEY uq_favorites_product (user_id, product_id),
  CONSTRAINT ck_favorites_target CHECK (tantric_id IS NOT NULL OR product_id IS NOT NULL),
  CONSTRAINT fk_favorites_user    FOREIGN KEY (user_id)    REFERENCES users (id)    ON DELETE CASCADE,
  CONSTRAINT fk_favorites_tantric FOREIGN KEY (tantric_id) REFERENCES tantrics (id) ON DELETE CASCADE,
  CONSTRAINT fk_favorites_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Support and settings
-- ----------------------------------------------------------------------------

-- Messages from the Contact Us form and the "Chat with Us" card.
CREATE TABLE IF NOT EXISTS contact_messages (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id     INT UNSIGNED DEFAULT NULL,
  name        VARCHAR(120) NOT NULL,
  email       VARCHAR(190) NOT NULL,
  phone       VARCHAR(20)  DEFAULT NULL,
  subject     VARCHAR(160) DEFAULT NULL,
  message     TEXT         NOT NULL,
  status      ENUM('new','read','replied','closed') NOT NULL DEFAULT 'new',
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_contact_messages_status (status, created_at),
  CONSTRAINT fk_contact_messages_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Editable site text and numbers: footer legal lines, support hours, tax and shipping rules.
CREATE TABLE IF NOT EXISTS site_settings (
  setting_key    VARCHAR(80) NOT NULL,
  setting_value  TEXT        DEFAULT NULL,
  updated_at     TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
