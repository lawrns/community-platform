/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Configure for static export as recommended by Next.js 14
  output: 'export',
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
    domains: ['pemzriizvnhxwuyewyee.supabase.co']
  },
  
  // This ensures browser APIs aren't accessed during build
  experimental: {
    appDocumentPreloading: false
  },

  // Prevent server-side rendering for components that use browser APIs
  compiler: {
    // Enables the styled-components SWC transform
    styledComponents: true
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_IS_SERVER_BUILD: 'true'
  },
  
  // Configure the output directory for build
  distDir: '.next'
}

export default nextConfig;
