/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hellocomp.cz",
      },
    ],
  },
  serverExternalPackages: ['onnxruntime-node', '@imgly/background-removal-node', 'sharp'],
};

export default nextConfig;
