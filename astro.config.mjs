import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

// The public site is served from docs.bitcoinpir.org, so links and assets
// should resolve from the domain root. Override these env vars only for
// temporary previews.
const base = process.env.SITE_BASE ?? "/";

export default defineConfig({
  site: process.env.SITE_URL ?? "http://docs.bitcoinpir.org",
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
