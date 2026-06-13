import path from "node:path";
import { fileURLToPath } from "node:url";

const appDir = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.join(appDir, "..", "..");

/** @type {import('next').NextConfig} */
const nextConfig = {
    pageExtensions: ["page.tsx", "page.ts"],
    outputFileTracingRoot: monorepoRoot,
    transpilePackages: ["@logpose/contracts"],

    async rewrites() {
        if (process.env.NODE_ENV !== "development") return [];
        return [
            {
                source: "/api/:path*",
                destination: "http://localhost:4000/api/:path*",
            },
        ];
    },
};

export default nextConfig;
