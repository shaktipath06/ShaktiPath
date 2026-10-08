/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 16 defaults: cached data joins the static shell, uncached data streams under <Suspense>.
  cacheComponents: true,
  partialPrefetching: true,
  // This folder is the app root (the repository root has its own package-lock.json for the dev scripts).
  turbopack: {
    root: import.meta.dirname,
  },
  images: {
    // Photos are served from public/images today. When practitioner photos move to object storage or a
    // CDN, list the host here so next/image can optimise them, for example:
    // remotePatterns: [{ protocol: 'https', hostname: 'cdn.shaktipath.in' }],
    remotePatterns: [],
  },
};

export default nextConfig;
