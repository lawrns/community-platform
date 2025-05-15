/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for Netlify
  output: 'export',
  reactStrictMode: true,
  // For Netlify deployment
  trailingSlash: true,
  // Image configuration
  images: {
    domains: ['pemzriizvnhxwuyewyee.supabase.co'],
    unoptimized: true // Required for static export
  },
  // Experimental features
  experimental: {
    // This ensures that window/document references don't break the build
    appDocumentPreloading: false
  },
  // Disable type checking during build for faster builds
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // Disable ESLint during build for faster builds
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  }
}

module.exports = nextConfig