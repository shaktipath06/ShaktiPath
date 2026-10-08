'use client';

import { usePathname } from 'next/navigation';
import SiteHeader from './SiteHeader';

/**
 * SiteHeader bound to the current route. usePathname() is request-time data, so app/layout.js renders this
 * inside <Suspense> with a plain SiteHeader as the fallback: static pages prerender the full header, and
 * dynamic routes (profiles, confirmations) stream the routed header in after the shell.
 */
export default function RoutedHeader(props) {
  const pathname = usePathname() || '/';
  return <SiteHeader pathname={pathname} {...props} />;
}
