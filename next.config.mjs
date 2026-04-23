/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/demdem-admin',
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'randomuser.me' },
    ],
  },
};

export default nextConfig;
