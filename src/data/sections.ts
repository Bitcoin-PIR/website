// Single source of truth for the guide's section/page structure.
// The landing page, the dynamic routes, and the pager all consume this.

import type { AstroComponentFactory } from "astro/runtime/server/index.js";

import Problem from "~/components/sections/01-Problem.astro";
import Primer from "~/components/sections/02-Primer.astro";
import Backends from "~/components/sections/03-Backends.astro";
import DPF from "~/components/sections/04-DPF.astro";
import OnionHypercube from "~/components/sections/05-OnionPIR-Hypercube.astro";
import OnionRGSW from "~/components/sections/05-OnionPIR-RGSW.astro";
import OnionPack from "~/components/sections/05-OnionPIR-QueryPack.astro";
import HarmonyOfflineOnline from "~/components/sections/06-HarmonyPIR-OfflineOnline.astro";
import HarmonyHintRow from "~/components/sections/06-HarmonyPIR-HintRow.astro";
import HarmonyPermutation from "~/components/sections/06-HarmonyPIR-Permutation.astro";
import HarmonyEmptyCount from "~/components/sections/06-HarmonyPIR-EmptyCount.astro";
import Cuckoo from "~/components/sections/07-Cuckoo.astro";
import Padding from "~/components/sections/08-Padding.astro";
import Merkle from "~/components/sections/09-Merkle.astro";
import Delta from "~/components/sections/10-Delta.astro";
import E2E from "~/components/sections/11-E2E.astro";
import TradeoffsWire from "~/components/sections/12-Tradeoffs-Wire.astro";
import TradeoffsBeyond from "~/components/sections/12-Tradeoffs-Beyond.astro";
import VerificationLeakage from "~/components/sections/13-Verification-Leakage.astro";
import VerificationEvidence from "~/components/sections/13-Verification-Evidence.astro";
import VerificationScope from "~/components/sections/13-Verification-Scope.astro";

export interface Page {
  slug: string;
  title: string;
  blurb?: string;
  component: AstroComponentFactory;
}

export interface Section {
  num: string;
  slug: string;
  title: string;
  blurb: string;
  pages: Page[];
}

export const sections: Section[] = [
  {
    num: "01",
    slug: "problem",
    title: "The problem",
    blurb: "Why a naive UTXO query leaks too much.",
    pages: [{ slug: "intro", title: "The problem", component: Problem }],
  },
  {
    num: "02",
    slug: "pir-primer",
    title: "PIR in one picture",
    blurb: "What PIR guarantees, and what it costs.",
    pages: [{ slug: "intro", title: "PIR in one picture", component: Primer }],
  },
  {
    num: "03",
    slug: "backends",
    title: "Three backends, same interface",
    blurb: "DPF · OnionPIR · HarmonyPIR — brief comparison.",
    pages: [{ slug: "intro", title: "Three backends, same interface", component: Backends }],
  },
  {
    num: "04",
    slug: "dpf",
    title: "DPF-PIR",
    blurb: "Two servers, one XOR, one private indicator.",
    pages: [{ slug: "intro", title: "DPF-PIR", component: DPF }],
  },
  {
    num: "05",
    slug: "onionpir",
    title: "OnionPIR",
    blurb: "One server, homomorphic encryption, lattice magic.",
    pages: [
      {
        slug: "hypercube",
        title: "The hypercube",
        blurb: "Reshape the database so the walk is one axis at a time.",
        component: OnionHypercube,
      },
      {
        slug: "rgsw",
        title: "BFV, RGSW, external product",
        blurb: "Two ciphertext flavors, additive-noise folds.",
        component: OnionRGSW,
      },
      {
        slug: "querypack",
        title: "QueryPack, one ciphertext",
        blurb: "Pack the whole query, unpack server-side, finish.",
        component: OnionPack,
      },
    ],
  },
  {
    num: "06",
    slug: "harmonypir",
    title: "HarmonyPIR",
    blurb: "One server, offline hints, cheap online queries.",
    pages: [
      {
        slug: "offline-online",
        title: "Stateful PIR, offline and online",
        blurb: "One streaming pass, then every query is √N.",
        component: HarmonyOfflineOnline,
      },
      {
        slug: "hint-row",
        title: "The hint row",
        blurb: "2N cells, segments, parities, one worked query.",
        component: HarmonyHintRow,
      },
      {
        slug: "permutation",
        title: "Relocation and the permutation",
        blurb: "Why segments move, and how the random permutation is chosen.",
        component: HarmonyPermutation,
      },
      {
        slug: "empty-count",
        title: "Hiding the empty count",
        blurb: "Why ⊥ slots are filled with random dummies, not sent as-is.",
        component: HarmonyEmptyCount,
      },
    ],
  },
  {
    num: "07",
    slug: "cuckoo",
    title: "Cuckoo hashing",
    blurb: "3 PBC groups × 2 in-group bins, and why.",
    pages: [{ slug: "intro", title: "Cuckoo hashing", component: Cuckoo }],
  },
  {
    num: "08",
    slug: "padding",
    title: "Query padding",
    blurb: "Why K=75 real-or-dummy queries is non-negotiable.",
    pages: [{ slug: "intro", title: "Query padding", component: Padding }],
  },
  {
    num: "09",
    slug: "merkle",
    title: "Merkle for inclusion AND exclusion",
    blurb: "Proving presence is easy. Proving absence needs 2 bins.",
    pages: [{ slug: "intro", title: "Merkle verification", component: Merkle }],
  },
  {
    num: "10",
    slug: "delta",
    title: "Delta synchronization",
    blurb: "Walk a BFS chain of deltas, capped at 5 steps.",
    pages: [{ slug: "intro", title: "Delta sync", component: Delta }],
  },
  {
    num: "11",
    slug: "end-to-end",
    title: "End-to-end, one scripthash",
    blurb: "Tag derivation → padded rounds → verified result.",
    pages: [{ slug: "intro", title: "End-to-end", component: E2E }],
  },
  {
    num: "12",
    slug: "tradeoffs",
    title: "What the server learns",
    blurb: "Honest list of what PIR hides and what it doesn't.",
    pages: [
      {
        slug: "wire",
        title: "On the wire",
        blurb: "What the server learns from the bytes themselves.",
        component: TradeoffsWire,
      },
      {
        slug: "beyond-the-server",
        title: "Beyond the server",
        blurb: "Adversaries PIR doesn't address on its own.",
        component: TradeoffsBeyond,
      },
    ],
  },
  {
    num: "13",
    slug: "verification",
    title: "How we verify privacy",
    blurb: "The leakage record L(q), and the three layers that confirm it.",
    pages: [
      {
        slug: "leakage",
        title: "The leakage record L(q)",
        blurb: "Four fields, two intentional, two pinned to constants.",
        component: VerificationLeakage,
      },
      {
        slug: "evidence",
        title: "Three layers of evidence",
        blurb: "EasyCrypt, Kani, and live byte-identity tests.",
        component: VerificationEvidence,
      },
      {
        slug: "scope",
        title: "What's not in scope",
        blurb: "Wire shape vs cryptographic indistinguishability.",
        component: VerificationScope,
      },
    ],
  },
];

// ---- Flat page index for linear navigation ----

export interface PageRef {
  section: Section;
  page: Page;
  sectionIndex: number;
  pageIndex: number;
  /** Path relative to base, e.g. "onionpir/" or "onionpir/rgsw/". */
  path: string;
}

export const allPages: PageRef[] = sections.flatMap((section, sectionIndex) =>
  section.pages.map((page, pageIndex) => ({
    section,
    page,
    sectionIndex,
    pageIndex,
    path:
      pageIndex === 0
        ? `${section.slug}/`
        : `${section.slug}/${page.slug}/`,
  })),
);

export function findSection(slug: string): Section | undefined {
  return sections.find((s) => s.slug === slug);
}

export function findPage(
  sectionSlug: string,
  pageSlug?: string,
): PageRef | undefined {
  return allPages.find(
    (p) =>
      p.section.slug === sectionSlug &&
      (pageSlug === undefined
        ? p.pageIndex === 0
        : p.page.slug === pageSlug),
  );
}

export function pageNeighbors(
  sectionSlug: string,
  pageSlug?: string,
): {
  prev: PageRef | null;
  next: PageRef | null;
  current: PageRef | undefined;
  index: number;
  total: number;
} {
  const index = allPages.findIndex(
    (p) =>
      p.section.slug === sectionSlug &&
      (pageSlug === undefined
        ? p.pageIndex === 0
        : p.page.slug === pageSlug),
  );
  return {
    prev: index > 0 ? allPages[index - 1]! : null,
    next: index < allPages.length - 1 ? allPages[index + 1]! : null,
    current: allPages[index],
    index,
    total: allPages.length,
  };
}
