/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/weather-:slug",
        destination: "/pogoda/:slug",
        permanent: true,
      },
      {
        source: "/weather-:slug/:path*",
        destination: "/pogoda/:slug/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
