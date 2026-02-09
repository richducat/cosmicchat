import fs from 'fs';
import path from 'path';

const inPath = process.argv[2];
const outPath = process.argv[3];
if (!inPath || !outPath) {
  console.error('Usage: node scripts/build_us_places.mjs <in.tsv> <out.json>');
  process.exit(1);
}

const text = fs.readFileSync(inPath, 'utf8');
const lines = text.split(/\r?\n/).filter(Boolean);
const header = lines[0].split('\t');
const idx = (name) => header.indexOf(name);

const I = {
  USPS: idx('USPS'),
  NAME: idx('NAME'),
  LSAD: idx('LSAD'),
};

const bad = Object.entries(I).filter(([,v]) => v < 0);
if (bad.length) {
  console.error('Missing columns', bad);
  process.exit(1);
}

// LSAD strings include "city", "town", "CDP", "borough", etc.
// We'll include all places; UI expects "<Name>, <ST>".
const out = [];
for (let i = 1; i < lines.length; i++) {
  const parts = lines[i].split('\t');
  const st = parts[I.USPS];
  const name = parts[I.NAME];
  const lsad = parts[I.LSAD];
  if (!st || !name) continue;

  // Make it human-friendly: strip common suffixes like " city" / " town" etc.
  // (We keep CDP names as-is but remove the LSAD label in the name field if present.)
  let clean = String(name).trim();
  clean = clean.replace(/\s+(city|town|village|borough|municipality|CDP)$/i, '').trim();

  const label = `${clean}, ${st}`;
  out.push({ label, st, name: clean, kind: lsad });
}

// De-dupe by label
const seen = new Set();
const deduped = [];
for (const r of out) {
  if (seen.has(r.label)) continue;
  seen.add(r.label);
  deduped.push(r);
}

// Sort for stable suggestions
// By label lexicographically (not ideal, but fine for prefix match)
deduped.sort((a,b) => a.label.localeCompare(b.label));

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify({ version: 'census-gaz-place-2023', count: deduped.length, rows: deduped }, null, 2));
console.log(`Wrote ${deduped.length} rows to ${outPath}`);
