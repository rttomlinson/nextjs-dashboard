/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.npr.org',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 's.gravatar.com',
        port: '',
        pathname: '/**'
      }
    ]
  }
};

module.exports = nextConfig;

// module.exports = {
//   poweredByHeader: false,
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: 'media.npr.org',
//         port: '',
//         pathname: '/**',
//       },
//     ],
//   },
// };
