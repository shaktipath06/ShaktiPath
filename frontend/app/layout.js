import { Suspense } from 'react';
import localFont from 'next/font/local';
import '@/styles/shaktipath.css';
import './globals.css';
import RoutedHeader from '@/components/site/RoutedHeader';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';
import { CartProvider } from '@/components/shop/CartProvider';
import { SITE } from '@/content/site';

// Brand type: Tinos for headings (Times-metric serif, as in the client mockups), Inter for everything
// else, Tiro Devanagari Hindi for Sanskrit and Hindi lines. Files live in app/fonts.
const inter = localFont({
  src: [
    { path: './fonts/inter-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/inter-latin-400-italic.woff2', weight: '400', style: 'italic' },
    { path: './fonts/inter-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: './fonts/inter-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: './fonts/inter-latin-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-inter',
  display: 'swap',
});

const tinos = localFont({
  src: [
    { path: './fonts/tinos-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/tinos-latin-400-italic.woff2', weight: '400', style: 'italic' },
    { path: './fonts/tinos-latin-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-tinos',
  display: 'swap',
});

const tiro = localFont({
  src: [{ path: './fonts/tiro-devanagari-hindi-devanagari-400-normal.woff2', weight: '400', style: 'normal' }],
  variable: '--font-tiro',
  display: 'swap',
  preload: false,
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE.fullName}: Verified Tantric Guidance Across India`,
    template: `%s | ${SITE.fullName}`,
  },
  description: SITE.description,
  openGraph: {
    type: 'website',
    siteName: SITE.fullName,
    title: `${SITE.fullName}: Where Tradition Meets Transformation`,
    description: SITE.description,
    images: [{ url: '/images/scenes/hero-goddess.jpg', width: 816, height: 596, alt: SITE.fullName }],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${tinos.variable} ${tiro.variable}`}>
      <body>
        <CartProvider>
          <Suspense fallback={<SiteHeader />}>
            <RoutedHeader />
          </Suspense>
          {children}
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}
