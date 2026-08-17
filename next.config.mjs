/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/pogoda/ekaterinburg",
        destination: "/weather-yekaterinburg",
        permanent: true,
      },
      {
        source: "/pogoda/ekaterinburg/:path*",
        destination: "/weather-yekaterinburg/:path*",
        permanent: true,
      },
      {
        source: "/pogoda/:slug",
        destination: "/weather-:slug",
        permanent: true,
      },
      {
        source: "/pogoda/:slug/:path*",
        destination: "/weather-:slug/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
