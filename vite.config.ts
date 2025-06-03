import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import istanbul from "vite-plugin-istanbul";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    sourcemap: true,
  },
  plugins: [
    react(),
    istanbul({
      include: ["src/**/*.js", "src/**/*.ts", "src/**/*.jsx", "src/**/*.tsx"],
      exclude: ["node_modules", "cypress", "test"],
      extension: [".js", ".ts", ".jsx", ".tsx"],
      requireEnv: true, // only instrument when environment variable is set
      cypress: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
