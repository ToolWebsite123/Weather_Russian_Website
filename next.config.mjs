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
        source: "/weather-abbottabad-haiber-pahtunhva-:id",
        destination: "/weather-abbottabad-3569",
        permanent: true,
      },
      {
        source: "/weather-abbottabad-haiber-pahtunhva-:id/:path*",
        destination: "/weather-abbottabad-3569/:path*",
        permanent: true,
      },
      {
        source: "/weather-abbottabad-haiber-pahtunhva",
        destination: "/weather-abbottabad-3569",
        permanent: true,
      },
      {
        source: "/weather-abbottabad-haiber-pahtunhva/:path*",
        destination: "/weather-abbottabad-3569/:path*",
        permanent: true,
      },
      {
        source: "/weather-feisalabad-pendzhab-:id",
        destination: "/weather-faisalabad-5595",
        permanent: true,
      },
      {
        source: "/weather-feisalabad-pendzhab-:id/:path*",
        destination: "/weather-faisalabad-5595/:path*",
        permanent: true,
      },
      {
        source: "/weather-feisalabad-pendzhab",
        destination: "/weather-faisalabad-5595",
        permanent: true,
      },
      {
        source: "/weather-feisalabad-pendzhab/:path*",
        destination: "/weather-faisalabad-5595/:path*",
        permanent: true,
      },
      {
        source: "/weather-faisalabad-pendzhab",
        destination: "/weather-faisalabad-5595",
        permanent: true,
      },
      {
        source: "/weather-faisalabad-pendzhab/:path*",
        destination: "/weather-faisalabad-5595/:path*",
        permanent: true,
      },
      {
        source: "/weather-moskva",
        destination: "/weather-moscow-4368",
        permanent: true,
      },
      {
        source: "/weather-moskva/:path*",
        destination: "/weather-moscow-4368/:path*",
        permanent: true,
      },
      {
        source: "/weather-:slug--:id",
        destination: "/weather-:slug",
        permanent: true,
      },
      {
        source: "/weather-:slug--:id/:path*",
        destination: "/weather-:slug/:path*",
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
      {
        source: "/:slug/10-dney",
        destination: "/:slug/10-days",
        permanent: true,
      },
      {
        source: "/:slug/14-dney",
        destination: "/:slug/14-days",
        permanent: true,
      },
      {
        source: "/:slug/2-weeks",
        destination: "/:slug/14-days",
        permanent: true,
      },
      {
        source: "/:slug/3-dnya",
        destination: "/:slug/3-days",
        permanent: true,
      },
      {
        source: "/:slug/7-dney",
        destination: "/:slug/7-days",
        permanent: true,
      },
      {
        source: "/:slug/archiv",
        destination: "/:slug/archive",
        permanent: true,
      },
      {
        source: "/:slug/dorogi",
        destination: "/:slug/road",
        permanent: true,
      },
      {
        source: "/:slug/gm-aktivnost",
        destination: "/:slug/gm",
        permanent: true,
      },
      {
        source: "/:slug/mesyats",
        destination: "/:slug/month",
        permanent: true,
      },
      {
        source: "/:slug/pyltsa",
        destination: "/:slug/pollen",
        permanent: true,
      },
      {
        source: "/:slug/zavtra",
        destination: "/:slug/tomorrow",
        permanent: true,
      },
      {
        source: "/:slug/vchera",
        destination: "/:slug/yesterday",
        permanent: true,
      },
      {
        source: "/:slug/vykhodnye",
        destination: "/:slug/weekend",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
