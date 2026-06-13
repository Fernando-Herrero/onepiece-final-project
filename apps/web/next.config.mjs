import path from "node:path";
import { fileURLToPath } from "node:url";

import nextI18nConfig from "./next-i18next.config.js";

const appDir = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.join(appDir, "..", "..");

/** @type {import('next').NextConfig} */
const nextConfig = {
    pageExtensions: ["page.tsx", "page.ts"],
    outputFileTracingRoot: monorepoRoot,
    outputFileTracingIncludes: {
        "/**/*": ["./next-i18next.config.js", "./public/locales/**/*"],
    },
    transpilePackages: ["@logpose/contracts"],
    i18n: nextI18nConfig.i18n,

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
