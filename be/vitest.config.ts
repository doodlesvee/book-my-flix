import { defineConfig } from "vitest/config";
import swc from "unplugin-swc";

export default defineConfig({
  test: {
    globals: true,
    root: "./",
    include: ["src/**/*.spec.ts"],
    coverage: {
      exclude: [
        "src/generated/**",
        "src/**/dto/**",
        "src/prisma/**",
        "src/redis/**",
      ],
    },
  },
  plugins: [swc.vite()],
});
