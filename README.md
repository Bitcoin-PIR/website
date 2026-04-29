# BitcoinPIR — illustrated guide

An educational, static, animated companion to the [BitcoinPIR][upstream]
protocol. Twelve short sections, one animated SVG each, no tracking, no
third-party fonts, no runtime backend.

- **Toolchain:** Astro + MDX + Shiki
- **Animations:** inline SVG + CSS keyframes + tiny JS (no animation
  library — stays lightweight and framework-agnostic)
- **Deploy target:** GitHub Pages (workflow in
  `.github/workflows/deploy.yml`)
- **Source of truth:** every factual claim is cross-referenced in
  [`CONTENT-AUDIT.md`](./CONTENT-AUDIT.md).

[upstream]: https://github.com/BitcoinPIR/BitcoinPIR

## Local development

```bash
# Node 20 recommended (see .nvmrc)
npm install
npm run dev          # http://localhost:4321
npm run build        # produces dist/
npm run preview      # serve dist/ locally
```

## Deploying

The included workflow (`.github/workflows/deploy.yml`) builds on every push
to `main` and publishes to GitHub Pages. The workflow computes the correct
`base` path automatically:

- If the repo is `<owner>/<owner>.github.io` → base = `/`
- Otherwise → base = `/<repo-name>/`

To enable:

1. On GitHub, **Settings → Pages → Build and deployment → Source:
   GitHub Actions**.
2. Push to `main`. The workflow will build and publish.

To test a production build locally with a non-root base path:

```bash
SITE_BASE=/bitcoinpir-website/ npm run build
npm run preview
```

## Project layout

```
src/
  layouts/Main.astro           # shell + theme script + nav
  styles/global.css            # theme tokens, typography, components
  components/
    Section.astro              # numbered section wrapper
    Callout.astro              # inline note / warn / danger boxes
    Stage.astro                # animation canvas + IntersectionObserver hook
    sections/
      01-Problem.astro         # one .astro per section
      02-Primer.astro
      … 12 total
  pages/
    index.astro                # hero + TOC + all 12 sections
```

## Accessibility

- All animations respect `prefers-reduced-motion`. Diagrams degrade to
  static final-state SVG automatically.
- All SVGs have `role="img"` + `aria-label` describing what they depict.
- Dark / light themes both pass WCAG AA on body text. Toggle persists in
  `localStorage`.
- The nav is keyboard-navigable; skip-to-content is implicit via the
  anchor navigation and visible focus rings.

## Contributing

1. **Do not guess.** Every claim in a section must come from the upstream
   source. Open `pir-sdk-client/src/dpf.rs`,
   `pir-core/src/params.rs`, etc., and cite the exact `file:line` in
   [`CONTENT-AUDIT.md`](./CONTENT-AUDIT.md). If you edit a claim, update the
   audit in the same commit.
2. **Animations:** keep them programmatic (inline SVG + CSS keyframes).
   Any animation should work with `prefers-reduced-motion: reduce`.
3. **Writing style:** plain English, define terms on first use, short
   paragraphs, no marketing speak. Callouts for security-critical points.

## Adding a section

1. Create `src/components/sections/NN-Foo.astro`. Start from one of the
   existing sections — they all share the same structure (prose + `<Stage>`
   + CSS + small JS trigger).
2. Import and render it from `src/pages/index.astro` and append an entry
   to the `toc` array at the top of that file.
3. Add a row for every new factual claim in `CONTENT-AUDIT.md`.

## License

See upstream [BitcoinPIR][upstream] for the protocol. This documentation
site is provided under the same license as the upstream repo unless
otherwise noted.
