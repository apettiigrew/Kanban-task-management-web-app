import type { NextConfig } from "next";
const path = require('path');


const nextConfig: NextConfig = {
  sassOptions: {
    includePaths: [path.resolve(__dirname, 'styles')],
  },
};

export default nextConfig;
