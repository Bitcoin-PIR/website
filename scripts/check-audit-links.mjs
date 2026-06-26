import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const upstreamRoot = process.env.BITCOINPIR_PATH
  ? path.resolve(process.env.BITCOINPIR_PATH)
  : path.resolve(root, "../..", "BitcoinPIR");
const bhtmRoot = process.env.BHTM_PATH
  ? path.resolve(process.env.BHTM_PATH)
  : path.resolve(root, "..", "blockhash-to-muhash");

const docsToScan = ["CONTENT-AUDIT.md", "UPSTREAM_VERIFICATION.md"];
const pathWithLine =
  /(?<![A-Za-z0-9_./-])([A-Za-z0-9_./-]+\.(?:rs|md|ec|ts|tsx|js|mjs|toml|yml|yaml|json)):(\d+)(?:-(\d+))?/g;

if (!fs.existsSync(upstreamRoot)) {
  console.warn(
    `[audit:check] Skipping: upstream BitcoinPIR repo not found at ${upstreamRoot}. ` +
      "Set BITCOINPIR_PATH to enable source-reference checks.",
  );
  process.exit(0);
}

const lineCountCache = new Map();
const failures = [];
let checked = 0;
const checkedRoots = new Set();

function countLines(filePath) {
  const cached = lineCountCache.get(filePath);
  if (cached !== undefined) return cached;

  const text = fs.readFileSync(filePath, "utf8");
  const count = text === "" ? 0 : text.split(/\r?\n/).length;
  lineCountCache.set(filePath, count);
  return count;
}

function resolveSourcePath(relPath) {
  if (relPath.startsWith("blockhash-to-muhash/")) {
    checkedRoots.add(bhtmRoot);
    return path.join(bhtmRoot, relPath.slice("blockhash-to-muhash/".length));
  }

  checkedRoots.add(upstreamRoot);
  return path.join(upstreamRoot, relPath);
}

for (const doc of docsToScan) {
  const docPath = path.join(root, doc);
  const text = fs.readFileSync(docPath, "utf8");

  for (const match of text.matchAll(pathWithLine)) {
    const [, relPath, startText, endText] = match;
    const sourcePath = resolveSourcePath(relPath);
    const startLine = Number(startText);
    const endLine = Number(endText ?? startText);

    checked += 1;

    if (!fs.existsSync(sourcePath)) {
      failures.push(`${doc}: missing upstream file ${relPath}`);
      continue;
    }

    const lines = countLines(sourcePath);
    if (startLine < 1 || endLine < startLine || endLine > lines) {
      failures.push(
        `${doc}: ${relPath}:${startLine}${endText ? `-${endLine}` : ""} ` +
          `is outside file length (${lines} lines)`,
      );
    }
  }
}

if (failures.length > 0) {
  console.error("[audit:check] Broken upstream references:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `[audit:check] Checked ${checked} upstream source references against ` +
    `${Array.from(checkedRoots).join(" and ")}.`,
);
