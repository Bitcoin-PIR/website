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
