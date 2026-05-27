# Content audit

Every factual claim on the site, traced back to the upstream
[BitcoinPIR](https://github.com/BitcoinPIR/BitcoinPIR) source. If a claim
is modified, add or update its row here in the same change.

`file:line` references point at files in the BitcoinPIR repo unless
otherwise noted. Paths in this table are relative to the repo root.

## Constants

| Claim on site | Value | Source | Notes |
|---|---|---|---|
| INDEX level: K = 75 PBC groups | 75 | `pir-core/src/params.rs:88` | `INDEX_PARAMS.k` |
| CHUNK level: K_CHUNK = 80 PBC groups | 80 | `pir-core/src/params.rs:102` | `CHUNK_PARAMS.k` |
| Each item → 3 candidate PBC groups | 3 | `pir-core/src/params.rs:89, 103` | `num_hashes` on both INDEX and CHUNK |
| In-group cuckoo uses 2 hash functions | 2 | `pir-core/src/params.rs:92, 106`; `pir-sdk-client/src/dpf.rs:18` | `cuckoo_num_hashes` / `INDEX_CUCKOO_NUM_HASHES` |
| INDEX slots_per_bin = 4 | 4 | `pir-core/src/params.rs:91` | |
| CHUNK slots_per_bin = 3 | 3 | `pir-core/src/params.rs:105` | |
| INDEX slot layout: 8B tag + 4B start_chunk_id + 1B num_chunks = 13B | 13 | `pir-core/src/params.rs:78` | `INDEX_SLOT_SIZE = TAG_SIZE + 4 + 1`. The project's `GLOSSARY.md` lists 17B; the code says 13B — we use the code as source of truth. |
| CHUNK slot layout: 4B chunk_id + 40B data = 44B | 44 | `pir-core/src/params.rs:81` | |
| CHUNK data segment = 40B | 40 | `pir-core/src/params.rs:75` | |
| INDEX record (intermediate): 20B script_hash + 4B start + 1B num = 25B | 25 | `pir-core/src/params.rs:84` | |
| Tag size = 8B | 8 | `pir-core/src/params.rs:72` | |
| Delta chain cap = 5 steps | 5 | `pir-sdk/src/sync.rs:15` | `MAX_DELTA_CHAIN_LENGTH` |
| Merkle tree depth ≈ 25 levels at UTXO scale | not a constant | `pir-core/src/merkle.rs:165` | Depth is computed as `(num_leaves as f64).log2() as usize`. "25" is an approximation for the UTXO-set size — we explicitly describe it as `log₂(num_leaves)` on the site, not as a hardcoded 25. |

## Mechanisms

| Claim on site | Source | Notes |
|---|---|---|
| DPF: XOR of two server evaluations is 1 at α, 0 elsewhere | `pir-sdk-client/src/dpf.rs:193-216` (client generates 2 DPF keys per group and sends one to each server); `libdpf/` crate for the DPF primitive itself | Described in plain English in section 04. |
| DPF padding: every PBC group gets DPF keys, real query at `assigned_group`, random α for the rest | `pir-sdk-client/src/dpf.rs:199-216` | Snippet is quoted verbatim in section 08. |
| Assigned group = first of the three PBC candidates | `pir-sdk-client/src/dpf.rs:182-183` (`let assigned_group = my_groups[0];`) | Section 07 and 11 reflect this. |
| Scripthash → 3 candidate PBC groups via `derive_groups_3` | `pir-core/src/hash.rs` (`derive_groups_3`); called at `pir-sdk-client/src/dpf.rs:182` | |
| Tag derivation: `splitmix64` over `(sh_a ⊕ tag_seed) ⊕ sh_b ⊕ sh_c` | `pir-core/src/hash.rs:200-204` (`compute_tag`) | Section 11 shows the idea in plain form. |
| Cuckoo placement tries 3 candidate groups with eviction | `pir-core/src/pbc.rs:10-56` (`pbc_cuckoo_place`) | Section 07 summarizes. |
| "Not found" requires verifying BOTH in-group cuckoo bins (h=0, h=1) | `CLAUDE.md:28-32`; client-side enforcement tracked in Recent Work item #6 (`Merkle Verification for "Not Found" Results`, commit `60fe19c` in `CLAUDE.md`) | Client code for the full Merkle-audit path in the SDK clients was not fully read end-to-end; the claim rests on the project's own security notes. Flagged if a deeper audit changes this. |
| OnionPIR: encrypted selector vector, homomorphic inner product, returns Enc(target row) | `pir-sdk-client/src/onion.rs` (SDK placeholder); full implementation upstream in `OnionPIRv2/` (external dependency) | Section 05 describes the protocol. The SDK client in this repo is a placeholder per `pir-sdk-client/src/onion.rs`. |
| HarmonyPIR: single-server stateful PIR with √N online queries against a precomputed hint table | `pir-sdk-client/src/harmony.rs` (SDK client; HarmonyPIR was wired up replacing the earlier placeholder); full impl in `harmonypir/`, `harmonypir-wasm/`, `harmonypir-jni/`; paper ePrint 2026/437 | Section 06. |
| HarmonyPIR PRP backends: `PRP_HMR12 = 0`, `PRP_FASTPRP = 1` (FastPRP is the default; ALF was retired 2026-05-12) | Constants at `pir-sdk-client/src/harmony.rs` (`PRP_HMR12`, `PRP_FASTPRP`); ALF removal at commit `c394fe1e` (Rust runtime) and `34c2bb0b` (web frontend); v13 release notes embedded in `c394fe1e` commit message |
| BFS shortest delta chain, max 5 hops | `pir-sdk/src/sync.rs:181-227` (`find_delta_chain`), with `MAX_DELTA_CHAIN_LENGTH` from `pir-sdk/src/sync.rs:15` | Section 10. |
| Each delta has its own cuckoo tables and Merkle root, queried the same way as the base snapshot | Implied by `runtime/src/table.rs` (separate `merkle_root`, `merkle_siblings`, `tree_top` per DB) and the sync pipeline in `pir-sdk/src/sync.rs` | Section 10. Not a single-line citation — derived from the structure of `DatabaseInfo` and sync-step types. |
| Merkle sibling PIR: one padded query per tree level | `pir-core/src/merkle.rs:209-220` (`proof` returns siblings level by level); `runtime/src/protocol.rs:16` (`REQ_MERKLE_SIBLING_BATCH = 0x31`) | Section 09. |
| Merkle siblings table supports arities ≥ 2 (generalized A-ary trees) | `pir-core/src/merkle.rs:485` (`merkle_sibling_slot_size(arity)`); `PLAN_MERKLE_ARITY.md` | We describe the binary case on the site and note depth = `log₂`; A-ary changes depth to `log_A`. |

## Trade-offs (section 12)

| Claim on site | Source |
|---|---|
| Server cannot learn which scripthash was queried | `CLAUDE.md:36-38` |
| Server cannot learn which group contains the real query (padding hides this) | `CLAUDE.md:19-24, 36-38` |
| Server cannot learn whether the address was found (no found-vs-not-found leakage on the wire) | INDEX Merkle Group-Symmetry invariant `CLAUDE.md:144-194` + CHUNK Merkle Item-Count Symmetry invariant `CLAUDE.md:196-258`; byte-identity tests at `pir-sdk-client/tests/leakage_integration_test.rs:1349` (DPF), `:888` (Harmony), `:1549` (Onion) |
| Server cannot learn how many UTXOs the address has (every query contributes exactly M=16 chunk Merkle items) | `CHUNK_MERKLE_ITEMS_PER_QUERY = 16` at `pir-core/src/params.rs:165`; helper `pad_chunk_ids_to_m` at `pir-sdk-client/src/dpf.rs:2744`; CHUNK Merkle Item-Count Symmetry invariant `CLAUDE.md:196-258` |
| Server CAN observe `query_db_id` (intentional public metadata: which DB / delta epoch) | Field of `L(q)` declared in `proofs/easycrypt/Leakage.ec`; intentional-leakage discussion `docs/VERIFICATION_OVERVIEW.md` §"Leakage record" |
| Server CAN observe HarmonyPIR `session_query_index` (function of session length, already public) | Field of `L(q)` declared in `proofs/easycrypt/Leakage.ec`; sized hint-refresh schedule per `proofs/easycrypt/Protocol_Harmony.ec` |
| Timing side-channels remain visible | Implied by the verification scope: `L` covers wire shape, not timing. See `docs/VERIFICATION_OVERVIEW.md` §"Mechanized vs cited-by-hypothesis". |
| Cryptographic indistinguishability of bytes inside fixed-length envelopes is hypothesised, not mechanized | `proofs/easycrypt/Common.ec` (ideal-primitive abstraction); cited from `libdpf`, `OnionPIRv2-fork`, `harmonypir` papers; framing in `docs/VERIFICATION_OVERVIEW.md:90-95` |

## Verification (section 13)

| Claim on site | Source |
|---|---|
| The leakage record `L(q)` has four fields: `query_db_id`, `session_query_index`, `index_max_items_per_group_per_level`, `chunk_max_items_per_group_per_level` | `proofs/easycrypt/Leakage.ec`; per-axis discussion `docs/VERIFICATION_OVERVIEW.md` §"Leakage record" |
| `index_max_items_per_group_per_level = 2` is structurally constant | INDEX Merkle Group-Symmetry invariant: `CLAUDE.md:144-194`; helper `plan_index_pbc_rounds` / `pbc_plan_rounds` invocation at `pir-sdk-client/src/dpf.rs` (see grep `pbc_plan_rounds`) |
| `chunk_max_items_per_group_per_level = 1` (with M=16, K_CHUNK=80) is structurally constant | CHUNK Merkle Item-Count Symmetry invariant: `CLAUDE.md:196-258`; `M = CHUNK_MERKLE_ITEMS_PER_QUERY = 16` at `pir-core/src/params.rs:165`; `K_CHUNK = 80` at `pir-core/src/params.rs:102`; helper `pad_chunk_ids_to_m` at `pir-sdk-client/src/dpf.rs:2744` |
| Multi-query INDEX batches use `pbc_plan_rounds` over all 3 candidate PBC groups (not always `derive_groups_3[0]`) | INDEX Merkle Group-Symmetry section `CLAUDE.md:144-194`; closure commits `606fddb` (DPF), `632cfd2` (Harmony) |
| Every query — found, not-found, whale — contributes exactly 16 chunk Merkle items, with synthetic IDs filling the suffix | `pad_chunk_ids_to_m` at `pir-sdk-client/src/dpf.rs:2744`; closure commits `565ea47`, `08ec736`, `f915a65`, `eb5128c`; `CLAUDE.md:196-258` |
| Synthetic chunk-padding IDs are derived from `SHA-256("BPIR-CHUNK-PAD" \|\| scripthash \|\| query_index)` (per-query, not the literal `[0..M-1]` sequence) | Seed-derivation helper `derive_chunk_pad_seed` at `pir-sdk-client/src/dpf.rs:2586`; commit `08d4725a` (Rust), `ccf2033a` (TS onionpir client) |
| HarmonyPIR per-group query slots send exactly `T − 1` sorted distinct indices (EMPTY cells padded with random dummies; per-group count never leaks) | HarmonyPIR Per-Group Request-Count Symmetry invariant: `CLAUDE.md:121-143`; implementation `HarmonyGroup::build_request_inner` at `harmonypir-wasm/src/lib.rs:1160` with `build_request` wrapper at `:458`, dummy-only cover at `build_synthetic_dummy:537`, XOR cancellation in `process_response:576`; pair-mode at `build_request_pair` (line 616+); design `PLAN_HARMONY_COUNT_LEAK_FIX.md`. Surfaced on the site as section 06 page "Hiding the empty count". |
| Simulator-property theorem (per-query): `L_eq q1 q2 ⇒ Real(q1) ≡ Real(q2)` | `proofs/easycrypt/Theorem.ec:232` (`simulator_property_per_query`) |
| Simulator-property theorem (multi-query): `real_batch_transcript b qs1 = real_batch_transcript b qs2` under pointwise `L_eq` | `proofs/easycrypt/Theorem.ec:313` (`simulator_property_multi_query`); constructive equiv-form at `:403` |
| EasyCrypt proofs are mechanically closed with no `admit` tactics | Verified by grep: no bare `admit.` in any `.ec` file under `proofs/easycrypt/` |
| Kani harnesses live inline in the three SDK client files | `pir-sdk-client/src/dpf.rs::kani_harnesses` (and analogues for `harmony.rs`, `onion.rs`) |
| Live byte-identity tests assert `assert_profiles_equivalent` round by round | Comparator at `pir-sdk-client/tests/leakage_integration_test.rs:215`; per-backend tests `dpf_found_vs_not_found_have_byte_identical_profiles:1349`, `harmony_…:888`, `onion_…:1549` |
| Cross-language equivalence: standalone TypeScript client produces byte-equivalent traffic to the Rust reference | Cross-language test in `web/src/__tests__/onion_leakage_diff.test.ts`; framing in `docs/VERIFICATION_OVERVIEW.md` §"Cross-language" |
| The verification covers wire shape, not full cryptographic indistinguishability | Verbatim framing in `docs/VERIFICATION_OVERVIEW.md:90-95` ("Mechanized vs cited-by-hypothesis") |

## Open items / flagged for future verification

- [ ] **Exhaustive read of the Merkle audit path in all three SDK clients.**
  The "both in-group cuckoo bins are checked and Merkle-verified for 'not
  found'" claim currently rests on `CLAUDE.md` and the commit note for
  `60fe19c`. Reading the DPF / OnionPIR / HarmonyPIR client code end to
  end and linking exact lines would close this.
- [x] ~~**OnionPIR integration in the SDK.** The `pir-sdk-client/src/onion.rs`
  client is a placeholder today.~~ Closed: `pir-sdk-client/src/onion.rs` is a
  full implementation (3000+ lines) as of mid-2026, exercised by the
  byte-identity integration tests against the live deployment.
- [ ] **Rewrite `GLOSSARY.md` reference for INDEX_SLOT_SIZE.** The
  glossary says 17B; the code constant is 13B. We side with the code.
  Worth proposing an upstream glossary fix.
- [ ] **Track upstream verification mutability.** If `L(q)` gains or loses
  axes, the site's section 13 (and the corresponding rows here) need to
  follow. The `UPSTREAM_VERIFICATION.md` pointer file is the canonical
  signal — update it whenever upstream `docs/VERIFICATION_OVERVIEW.md`
  changes shape.
