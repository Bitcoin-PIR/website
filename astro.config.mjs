import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

// Edit `base` if this repo is deployed at a non-root path on GitHub Pages.
// For `https://<user>.github.io/<repo>/`, set base: "/<repo>/".
// For a user/org page or custom domain, leave base: "/".
const base = process.env.SITE_BASE ?? "/";

export default defineConfig({
  site: process.env.SITE_URL ?? "https://bitcoinpir.github.io",
  base,
  integrations: [mdx()],
  markdown: {
    shikiConfig: {
      theme: "github-dark-dimmed",
      wrap: true,
    },
  },
  build: {
    assets: "_assets",
  },
  compressHTML: true,
});
