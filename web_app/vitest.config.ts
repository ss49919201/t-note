import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: ["node_modules", ".wangler"],
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
});
