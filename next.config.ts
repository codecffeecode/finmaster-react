import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  sassOptions: {
    includePaths: ['./src/styles'],
    prependData: `@import "src/styles/_variables.scss";`
  }
};

export default nextConfig;
