# Upstream verification briefing

The BitcoinPIR project (`~/BitcoinPIR/`) wrapped a multi-session
leakage-verification effort on 2026-04-29. This file is a pointer so a
future website-session agent can find the consolidated briefing
without needing prior context.

## Read this first

[`~/BitcoinPIR/docs/VERIFICATION_OVERVIEW.md`](../../BitcoinPIR/docs/VERIFICATION_OVERVIEW.md)

It contains:

- **TL;DR** — what's verified in one paragraph + the four leakage axes.
- **Mechanized vs cited-by-hypothesis** — honest scope split. The
  wire-shape simulator-property is mechanized in EasyCrypt + Kani +
  empirical tests; the cryptographic primitive reductions (DPF / FHE /
  PRP indistinguishability) are cited from the underlying papers.
- **The four privacy invariants** — each with a `CLAUDE.md` section,
  Kani harnesses (where applicable), and integration tests.
- **Verification layers** — test pyramid: EasyCrypt (31 lemmas) →
  Kani (18+ harnesses) → Rust unit tests (151) → Rust integration
  (live Hetzner) → TS unit (138 vitest) → cross-language live diff.
- **Empirical witnesses** — the byte-identity claim. A table of
  found vs not-found round counts pre- and post-closure.
- **Pre-closure → post-closure deltas** — the empirical witness that
  the closures actually closed.
- **Key files & commits** — file map plus commit log for citations.
- **For the educational website** — last section, written
  specifically for this site's needs. Includes a suggested narrative
  shape for a "How we verify privacy" page.

## Style of this site

`CONTENT-AUDIT.md` requires every factual claim to cite `file:line`
in the upstream codebase. The verification overview already gives
you many citation-ready facts:

- `INDEX_CUCKOO_NUM_HASHES = 2` at `pir-core/src/params.rs:154`.
- `CHUNK_MERKLE_ITEMS_PER_QUERY = 16` at `pir-core/src/params.rs:165`.
- `K = 75` (INDEX) at `pir-core/src/params.rs:88`.
- `K_CHUNK = 80` (CHUNK) at `pir-core/src/params.rs:102`.
- "Found and not-found queries produce byte-identical leakage profiles":
  cite the test files at `pir-sdk-client/tests/leakage_integration_test.rs`,
  test names `dpf_found_vs_not_found_have_byte_identical_profiles` (DPF),
  `harmony_found_vs_not_found_have_byte_identical_profiles`,
  `onion_found_vs_not_found_have_byte_identical_profiles`.

## Don't oversell

The verification covers **wire-shape leakage**, not full cryptographic
indistinguishability. The bridge from "wire shape matches" to "wire
bytes indistinguishable" relies on the ideal-primitive hypothesis on
DPF / FHE / PRP, cited from the primitives' papers.

For Bitcoin PIR's actual threat model — "the server should not learn
which scripthash the user queried, nor whether it was found, nor how
many UTXOs it has, nor the cuckoo position it matched at" — the
verification is as tight as a non-research-project codebase can
reasonably get. But state it precisely; don't claim "fully verified"
or "zero leakage". The leakage record `L(q)` is allowed to leak
`query_db_id` (intentional public metadata) and HarmonyPIR's
`session_query_index` (function of session length, already public).

## Quick stats for site copy

If you need numbers for the verification page:

- 31 EasyCrypt lemmas mechanically closed (zero `admit` tactics).
- 18+ Kani harnesses across the three Rust backends.
- 151 Rust unit tests, ~30 live integration tests.
- 138 TypeScript vitest tests including the cross-language corpus
  diff harness.
- Cross-language equivalence verified byte-for-byte against the
  live Hetzner staging deployment.
- 415 EasyCrypt verification points in the spec (`make check`
  output).

## Updating this file

If the upstream verification layer evolves:
- Re-read `~/BitcoinPIR/docs/VERIFICATION_OVERVIEW.md` for the
  current canonical state.
- Update this file's stats / claims accordingly.
- Update site copy (likely under `src/content/` or `src/pages/`)
  with cross-references in `CONTENT-AUDIT.md`.

## Site implementation status (last touched 2026-05-27)

The verification/privacy material is now implemented on the site.
Map of what exists, so a future session can resume without re-deriving:

**Section 12 — "What the server learns"** (`tradeoffs`), 2 pages:
- `12-Tradeoffs-Wire.astro` (`/tradeoffs/`) — the CANNOT/CAN-learn
  grid, corrected so found-vs-not-found and UTXO-count are in the
  CANNOT column (the closures made the old "Server CAN observe"
  claims false). Forward-links to section 13.
- `12-Tradeoffs-Beyond.astro` (`/tradeoffs/beyond-the-server/`) —
  network observers, colluding DPF servers, compromised client state.

**Section 13 — "How we verify privacy"** (`verification`), 3 pages:
- `13-Verification-Leakage.astro` (`/verification/`) — the leakage
  record `L(q)` (4 fields) + the byte-identity demo SVG. This is the
  centerpiece; the animation shows two queries with equal `L`
  producing equal wire transcripts.
- `13-Verification-Evidence.astro` (`/verification/evidence/`) —
  three layers: EasyCrypt (verbatim per-query theorem), Kani, live
  byte-identity integration tests.
- `13-Verification-Scope.astro` (`/verification/scope/`) — honest
  scope split (wire shape mechanized; primitive indistinguishability
  cited from papers) + "verification is a process" mutability note.

**Section 06 (HarmonyPIR) gained a 4th page:**
- `06-HarmonyPIR-EmptyCount.astro` (`/harmonypir/empty-count/`) —
  Per-Group Request-Count Symmetry: why ⊥ slots are filled with
  random dummies (fixed `T−1` indices/request) and XOR-cancelled
  client-side. Impl cited at `harmonypir-wasm/src/lib.rs`
  (`build_request_inner:1160`, `process_response:576`,
  `build_synthetic_dummy:537`); design in
  `PLAN_HARMONY_COUNT_LEAK_FIX.md`.

**Upstream syncs already applied (BitcoinPIR commits):**
- `c394fe1e` / `34c2bb0b`: PRP_ALF retired. HarmonyPIR permutation
  page now lists only HMR12 + FastPRP (FastPRP default). ALF kept as
  a one-line historical note.
- `08d4725a` / `ccf2033a`: synthetic CHUNK padding is now
  scripthash-seeded (`SHA-256("BPIR-CHUNK-PAD" || sh || idx)`), not
  the literal `[0..M-1]`. Reflected in section 13.1's `L(q)` bullet.

**Citation line numbers verified this session** (drift fast — re-grep
before trusting): CLAUDE.md invariants — Per-Group Request-Count
`121-143`, INDEX Merkle Group-Symmetry `144-194`, CHUNK Merkle
Item-Count `196-258`. Byte-identity tests in
`pir-sdk-client/tests/leakage_integration_test.rs` — dpf `:1349`,
harmony `:888`, onion `:1549`; comparator `assert_profiles_equivalent:215`.
`pad_chunk_ids_to_m` at `pir-sdk-client/src/dpf.rs:2744`.
Note: `request_bytes`/`response_bytes` in the test framework are
u64 byte *counts*, not raw bytes — "byte-identical" means equal
lengths + equal structural item vectors, not equal ciphertext.

**Known follow-ups (not blocking):**
- Section 13 says "two [axes] are pinned to constants by closure
  invariants." There are actually 5 MANDATORY-for-Privacy invariants
  in CLAUDE.md now; the 4-field `L` is still the external claim, so
  this was intentionally left as-is (user confirmed "leave it").
- No animation on the empty-count page yet (worked example + callout
  only). A two-request "different composition, identical byte count"
  SVG could be added if it reads dense.
- HarmonyPIR pair-query API (`build_request_pair`/`process_response_pair`,
  1 RTT for h=0/h=1) is cited in the audit but has no site copy —
  it's a perf optimization, not privacy.
- Doc-only stats (415 EasyCrypt verification points, 151 Rust /
  138 vitest tests) were deliberately NOT surfaced on the site
  (uncorroborated outside the briefing; user wanted high-level only).
