import { defineConfig } from "vitest/config";

export default defineConfig({
  // Relative base so the build works under any GitHub Pages sub-path.
  base: "./",
  build: { target: "es2023" },
  test: { environment: "node" },
});
