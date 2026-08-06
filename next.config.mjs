/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/pogoda/ekaterinburg",
        destination: "/pogoda/yekaterinburg",
        permanent: true,
      },
      {
        source: "/pogoda/ekaterinburg/:path*",
        destination: "/pogoda/yekaterinburg/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
