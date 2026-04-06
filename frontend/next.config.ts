import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: [
    '@photo-sphere-viewer/core',
    '@photo-sphere-viewer/markers-plugin',
    'three',
  ],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'media.istockphoto.com' },
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '127.0.0.1' },
    ],
  },
  turbopack: {
    resolveAlias: {
      // Fix "Can't resolve 'tailwindcss'" when Turbopack resolver context falls
      // back to the monorepo root which has no node_modules.
      'tailwindcss': path.resolve(process.cwd(), 'node_modules/tailwindcss'),
      '@tailwindcss/postcss': path.resolve(process.cwd(), 'node_modules/@tailwindcss/postcss'),
    },
  },
};

export default nextConfig;
