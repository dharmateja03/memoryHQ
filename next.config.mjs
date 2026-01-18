/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/games/memory',
        destination: '/games/category/memory',
        permanent: true,
      },
      {
        source: '/games/attention',
        destination: '/games/category/attention',
        permanent: true,
      },
      {
        source: '/games/speed',
        destination: '/games/category/speed',
        permanent: true,
      },
      {
        source: '/games/problem-solving',
        destination: '/games/category/problem-solving',
        permanent: true,
      },
      {
        source: '/games/flexibility',
        destination: '/games/category/flexibility',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
