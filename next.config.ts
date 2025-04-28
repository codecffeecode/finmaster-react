import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  sassOptions: {
    includePaths: ['./src'],
    prependData: `
      @use "src/styles/_color" as *;
      @use "src/styles/_typography" as *;
    `
  }
};

export default nextConfig;
