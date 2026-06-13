import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/travel-merge2-prototype/",
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true
  }
});
