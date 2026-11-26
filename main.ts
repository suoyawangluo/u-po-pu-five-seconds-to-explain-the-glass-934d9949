// Five Seconds to Explain the Glass — the cat's own defence.
// The line is assembled from named parts so the reasoning stays readable:
// the glass squatted in the cat's sunbeam, got two warnings, got evicted.
// One sentence, 133 characters, no apology, no confession.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

type GateReport = { characters: number; sentences: number; sha256: string };

const PARTS = {
  offence: "It parked itself in my sunbeam and stared at me all morning",
  ruling: "so after two warnings I evicted it",
  doctrine: "a cat's home is not a storage unit",
} as const;

function buildEntry(): string {
  return `${PARTS.offence}, ${PARTS.ruling} \u2014 ${PARTS.doctrine}.`;
}

function validateEntry(entry: string): GateReport {
  const characters = [...entry].length;
  if (entry.trim().length === 0) throw new Error("empty entry");
  if (characters > 200) throw new Error(`entry over 200 characters: ${characters}`);
  const sentences = (entry.match(/\./g) || []).length;
  if (sentences !== 1) throw new Error(`must be one sentence, found ${sentences} periods`);
  return {
    characters,
    sentences,
    sha256: createHash("sha256").update(entry, "utf8").digest("hex"),
  };
}

function verifyWritten(path: string, expectedSha: string): string {
  const written = readFileSync(path, "utf8");
  const actual = createHash("sha256").update(written, "utf8").digest("hex");
  if (actual !== expectedSha) throw new Error(`written file sha mismatch: ${actual}`);
  return written;
}

const ENTRY = buildEntry();
const report = validateEntry(ENTRY);
const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
mkdirSync(outDir, { recursive: true });
const outPath = `${outDir}/entry.txt`;
writeFileSync(outPath, ENTRY, "utf8");
const verified = verifyWritten(outPath, report.sha256);
console.log(
  `gate passes: ${report.characters} characters, ${report.sentences} sentence, sha256 ${report.sha256}`,
);
console.log(`verified: ${JSON.stringify(verified)}`);
