/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['2ef1-2a02-6b6f-fe42-9700-40fc-c320-ec02-ef2.ngrok-free.app'],
  // Allow ngrok and other hostnames
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: "",
        pathname: "/images/**",
      },
    ],
  },
};

module.exports = nextConfig;
