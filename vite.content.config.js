import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: false, // keep files written by the other build
    lib: {
      entry: resolve(__dirname, "src/content/content.js"),
      name: "ContentScript",
      formats: ["iife"],
      fileName: () => "content.js",
    },
    rollupOptions: {
      output: {
        // avoid generating sourcemap/chunk files with hashes
      },
    },
  },
});
