import type { NextConfig } from "next";
import os from "os";

// Auto-detect local network IPs
const networkIPs = Object.values(os.networkInterfaces())
  .flat()
  .filter((i) => i?.family === "IPv4" && !i.internal)
  .map((i) => i!.address);

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    qualities: [75, 100],
  },
  allowedDevOrigins: networkIPs,
};

export default nextConfig;