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
| HarmonyPIR: two non-colluding servers + offline hints + online queries keyed to a PRP | `pir-sdk-client/src/harmony.rs:7-55` (SDK placeholder with PRP key init); full impl in `harmonypir/`, `harmonypir-wasm/`, `harmonypir-jni/` | Section 06 explicitly notes the SDK client is a placeholder. |
| BFS shortest delta chain, max 5 hops | `pir-sdk/src/sync.rs:181-227` (`find_delta_chain`), with `MAX_DELTA_CHAIN_LENGTH` from `pir-sdk/src/sync.rs:15` | Section 10. |
| Each delta has its own cuckoo tables and Merkle root, queried the same way as the base snapshot | Implied by `runtime/src/table.rs` (separate `merkle_root`, `merkle_siblings`, `tree_top` per DB) and the sync pipeline in `pir-sdk/src/sync.rs` | Section 10. Not a single-line citation — derived from the structure of `DatabaseInfo` and sync-step types. |
| Merkle sibling PIR: one padded query per tree level | `pir-core/src/merkle.rs:209-220` (`proof` returns siblings level by level); `runtime/src/protocol.rs:16` (`REQ_MERKLE_SIBLING_BATCH = 0x31`) | Section 09. |
| Merkle siblings table supports arities ≥ 2 (generalized A-ary trees) | `pir-core/src/merkle.rs:485` (`merkle_sibling_slot_size(arity)`); `PLAN_MERKLE_ARITY.md` | We describe the binary case on the site and note depth = `log₂`; A-ary changes depth to `log_A`. |

## Trade-offs (section 12)

| Claim on site | Source |
|---|---|
| Server cannot learn which scripthash was queried | `CLAUDE.md:36-38` |
| Server cannot learn which group contains the real query (padding hides this) | `CLAUDE.md:19-24, 36-38` |
| Server CAN observe whether chunk/Merkle rounds occurred → reveals found vs not-found | `CLAUDE.md:41-44` |
| Server CAN observe approximate chunk-round count → reveals approx UTXO count | `CLAUDE.md:42` |
| Timing side-channels remain visible | `CLAUDE.md:43` |
| Dummy chunk/Merkle rounds would hide found-vs-not-found but cost bandwidth | `CLAUDE.md:44` |

## Open items / flagged for future verification

- [ ] **Exhaustive read of the Merkle audit path in all three SDK clients.**
  The "both in-group bins are checked and Merkle-verified for 'not found'"
  claim currently rests on `CLAUDE.md` and the commit note for
  `60fe19c`. Reading the DPF / OnionPIR / HarmonyPIR client code end to
  end and linking exact lines would close this.
- [ ] **Confirm that padding applies uniformly to MERKLE rounds, not just
  INDEX and CHUNK.** The site assumes it does (the privacy argument
  requires it); an explicit "pad merkle siblings to K" loop would be good
  to cite.
- [ ] **OnionPIR integration in the SDK.** The `pir-sdk-client/src/onion.rs`
  client is a placeholder today. The protocol description on the site is
  accurate for the OnionPIRv2 primitive, but users should not read the SDK
  OnionPIR client as production-ready.
- [ ] **Rewrite `GLOSSARY.md` reference for INDEX_SLOT_SIZE.** The
  glossary says 17B; the code constant is 13B. We side with the code.
  Worth proposing an upstream glossary fix.
