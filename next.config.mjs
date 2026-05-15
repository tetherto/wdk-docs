import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

const isDev = process.env.NODE_ENV === 'development';

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  transpilePackages: [
    '@tetherto/docs-seo-schema',
    '@tetherto/docs-seo-core',
    '@tetherto/docs-seo-next',
    '@tetherto/docs-seo-og',
  ],
  ...(isDev ? {} : { output: 'export' }),
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  distDir: 'dist',
};

export default withMDX(config);
