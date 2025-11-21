import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import copy from "rollup-plugin-copy";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    copy({
      targets: [
        { src: "src/manifest.json", dest: "dist" },
        { src: "src/background/background.js", dest: "dist" },
        // { src: "src/content/content.js", dest: "dist" }, // for content script build, see vite.content.config

        { src: "src/icons/*", dest: "dist/icons" },
      ],
      hook: "writeBundle",
    }),
  ],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        sidepanel: resolve(__dirname, "src/sidepanel/sidepanel.html"),
      },
      output: {
        entryFileNames: "[name].js",
      },
    },
  },
});
