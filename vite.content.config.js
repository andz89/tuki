import { defineConfig } from "vite";
import { resolve } from "path";

// For building content.js:
// Since content scripts are split into modules, Chrome extensions require a single bundled file.
// The build process bundles all modules into one content.js file before outputting to /dist.

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, "src/content/content.js"),
      name: "ContentScript",
      formats: ["iife"],
      fileName: () => "content.js",
    },
    rollupOptions: {
      output: {},
    },
  },
});
